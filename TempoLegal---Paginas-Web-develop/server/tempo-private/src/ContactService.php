<?php
declare(strict_types=1);

namespace TempoLegal;

use RuntimeException;

final class ContactError extends RuntimeException
{
    public function __construct(public string $errorCode, public int $status, public array $fields = [])
    {
        parent::__construct($errorCode);
    }
}

final class ContactService
{
    private const SERVICES = [
        'general', 'data', 'corporate', 'incorporation', 'foreign', 'employment',
        'accounting', 'ip', 'disputes', 'notarial', 'radar',
    ];

    public function __construct(private array $config)
    {
    }

    public function isConfigured(): bool
    {
        foreach (['recipient', 'sender_email', 'smtp_username', 'smtp_password', 'smtp_host', 'app_secret'] as $key) {
            if (!is_string($this->config[$key] ?? null) || $this->config[$key] === '') {
                return false;
            }
        }
        return ($this->config['enabled'] ?? false) === true
            && strlen($this->config['app_secret']) >= 32
            && filter_var($this->config['recipient'], FILTER_VALIDATE_EMAIL) !== false
            && filter_var($this->config['sender_email'], FILTER_VALIDATE_EMAIL) !== false
            && in_array($this->config['smtp_encryption'] ?? '', ['smtps', 'starttls'], true)
            && in_array((int) ($this->config['smtp_port'] ?? 0), [465, 587], true);
    }

    private static function text(mixed $value, int $minimum, int $maximum, bool $singleLine = true): ?string
    {
        if (!is_string($value) || !preg_match('//u', $value)) {
            return null;
        }
        $value = trim($value);
        $length = preg_match_all('/./us', $value);
        if ($length === false || $length < $minimum || $length > $maximum) {
            return null;
        }
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
            return null;
        }
        if ($singleLine && preg_match('/[\r\n]/', $value)) {
            return null;
        }
        return $value;
    }

    public function validate(array $input): array
    {
        $errors = [];
        $result = [];
        foreach (['name' => [2, 120], 'company' => [0, 160], 'phone' => [0, 40], 'message' => [10, 3000], 'assessment' => [0, 3000]] as $field => $limits) {
            $value = self::text($input[$field] ?? '', $limits[0], $limits[1], !in_array($field, ['message', 'assessment'], true));
            if ($value === null) {
                $errors[] = $field;
            } else {
                $result[$field] = $value;
            }
        }
        $email = self::text($input['email'] ?? '', 3, 180);
        if ($email === null || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'email';
        }
        $result['email'] = $email;
        if (!is_string($input['service'] ?? null) || !in_array($input['service'], self::SERVICES, true)) {
            $errors[] = 'service';
        }
        if (!is_string($input['language'] ?? null) || !in_array($input['language'], ['es', 'en', 'pt', 'fr'], true)) {
            $errors[] = 'language';
        }
        if (($input['privacyAccepted'] ?? false) !== true) {
            $errors[] = 'privacyAccepted';
        }
        if (isset($input['website']) && $input['website'] !== '') {
            $errors[] = 'website';
        }
        if (!is_string($input['requestId'] ?? null) || !preg_match('/^[a-f0-9-]{36}$/D', $input['requestId'])) {
            $errors[] = 'requestId';
        }
        if ($errors !== []) {
            throw new ContactError('validation_failed', 422, array_values(array_unique($errors)));
        }
        return $result + [
            'service' => $input['service'],
            'language' => $input['language'],
            'privacyAccepted' => true,
            'requestId' => $input['requestId'],
        ];
    }

    private function directory(): string
    {
        $directory = $this->config['state_directory'] ?? '';
        if (!is_string($directory) || $directory === '') {
            throw new ContactError('service_unavailable', 503);
        }
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new ContactError('service_unavailable', 503);
        }
        return rtrim($directory, '/');
    }

    private function consume(string $key, int $limit, int $window): void
    {
        $file = $this->directory() . '/rate-' . hash_hmac('sha256', $key, $this->config['app_secret']) . '.json';
        $handle = fopen($file, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            throw new ContactError('service_unavailable', 503);
        }
        try {
            $state = json_decode(stream_get_contents($handle), true) ?: [];
            $now = time();
            if (($state['start'] ?? 0) + $window <= $now) {
                $state = ['start' => $now, 'count' => 0];
            }
            if (($state['count'] ?? 0) >= $limit) {
                throw new ContactError('rate_limited', 429);
            }
            $state['count'] = ($state['count'] ?? 0) + 1;
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode($state, JSON_THROW_ON_ERROR));
            fflush($handle);
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public function submit(array $input, string $remoteAddress, callable $send): array
    {
        $data = $this->validate($input);
        if (!$this->isConfigured()) {
            throw new ContactError('service_unavailable', 503);
        }
        $id = hash_hmac('sha256', $data['requestId'], $this->config['app_secret']);
        $signature = hash_hmac('sha256', json_encode($data, JSON_THROW_ON_ERROR), $this->config['app_secret']);
        $handle = fopen($this->directory() . '/request-' . $id . '.json', 'c+');
        if ($handle === false || !flock($handle, LOCK_EX | LOCK_NB)) {
            throw new ContactError('request_pending', 409);
        }
        try {
            $saved = json_decode(stream_get_contents($handle), true) ?: [];
            if (isset($saved['signature']) && !hash_equals($saved['signature'], $signature)) {
                throw new ContactError('request_conflict', 409);
            }
            if (($saved['status'] ?? '') === 'accepted') {
                return ['ok' => true, 'reference' => $saved['reference']];
            }
            if (($saved['status'] ?? '') === 'pending') {
                // Delivery may have been accepted before an interrupted response.
                throw new ContactError('request_pending', 409);
            }
            $this->consume('ip:' . $remoteAddress, (int) ($this->config['rate_limit'] ?? 5), (int) ($this->config['rate_window'] ?? 900));
            $this->consume('global', (int) ($this->config['global_limit'] ?? 100), 3600);
            $reference = 'TL-' . gmdate('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
            $state = ['status' => 'pending', 'signature' => $signature, 'reference' => $reference, 'updated' => time()];
            $save = static function (array $record) use ($handle): void {
                rewind($handle);
                ftruncate($handle, 0);
                fwrite($handle, json_encode($record, JSON_THROW_ON_ERROR));
                fflush($handle);
            };
            $save($state);
            try {
                $send($data, $reference);
            } catch (\Throwable $error) {
                // An uncertain transport result must not trigger an automatic resend.
                error_log('TempoLegal contact transport failed; reference ' . $reference);
                throw new ContactError('delivery_unconfirmed', 502);
            }
            $state['status'] = 'accepted';
            $save($state);
            return ['ok' => true, 'reference' => $reference];
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public function cleanup(): void
    {
        if (random_int(1, 20) !== 1) {
            return;
        }
        $count = 0;
        foreach (glob($this->directory() . '/*.json') ?: [] as $file) {
            if (++$count > 500) {
                break;
            }
            if (filemtime($file) < time() - 172800) {
                $handle = @fopen($file, 'r+');
                if ($handle && flock($handle, LOCK_EX | LOCK_NB)) {
                    @unlink($file);
                    flock($handle, LOCK_UN);
                }
                if ($handle) {
                    fclose($handle);
                }
            }
        }
    }
}
