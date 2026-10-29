<?php
declare(strict_types=1);

namespace TempoLegal;

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';

final class EmailTransport
{
    public static function create(array $config, array $data, string $reference): PHPMailer
    {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = $config['smtp_host'];
        $mailer->Port = (int) $config['smtp_port'];
        $mailer->SMTPSecure = $config['smtp_encryption'] === 'smtps'
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->SMTPAuth = true;
        $mailer->Username = $config['smtp_username'];
        $mailer->Password = $config['smtp_password'];
        $mailer->Timeout = 10;
        $mailer->getSMTPInstance()->Timelimit = 20;
        $mailer->SMTPDebug = 0;
        $mailer->SMTPOptions = ['ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ]];
        $mailer->CharSet = PHPMailer::CHARSET_UTF8;
        $mailer->Encoding = PHPMailer::ENCODING_BASE64;
        $mailer->setFrom($config['sender_email'], $config['sender_name'] ?? 'TempoLegal website');
        $mailer->addAddress($config['recipient']);
        $mailer->addReplyTo($data['email'], $data['name']);
        $mailer->Subject = 'Website enquiry ' . $reference;
        $mailer->Body = implode("\n", [
            'Reference: ' . $reference,
            'Date (UTC): ' . gmdate('c'),
            'Name: ' . $data['name'],
            'Email: ' . $data['email'],
            'Phone: ' . ($data['phone'] ?? '-'),
            'Company: ' . ($data['company'] ?: '-'),
            'Service: ' . $data['service'],
            'Language: ' . $data['language'],
            'Privacy notice acknowledged: yes',
            'Privacy policy: V4.4, 2026-10-27',
            '',
            $data['message'],
            '',
            $data['service'] === 'radar' ? ($data['assessment'] ?? '') : '',
        ]);
        return $mailer;
    }

    public static function send(array $config, array $data, string $reference): void
    {
        self::create($config, $data, $reference)->send();
    }
}
