<?php
declare(strict_types=1);

// This endpoint requires PHP 8.1+ and a private sibling directory.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

$privateDirectory = dirname(__DIR__, 2) . '/tempo-private';
if (!is_file($privateDirectory . '/src/ContactService.php')) {
    respond(503, ['ok' => false, 'code' => 'service_unavailable']);
}
require_once $privateDirectory . '/src/ContactService.php';
$config = is_file($privateDirectory . '/config.php') ? require $privateDirectory . '/config.php' : [];
if (!is_array($config)) {
    respond(503, ['ok' => false, 'code' => 'service_unavailable']);
}
$service = new \TempoLegal\ContactService($config);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    respond(405, ['ok' => false, 'code' => 'method_not_allowed']);
}
if (!$service->isConfigured()) {
    respond($method === 'GET' ? 200 : 503, ['ok' => false, 'available' => false, 'code' => 'configuration_required']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$origins = $config['allowed_origins'] ?? [];
if ($method === 'POST' && (!is_string($origin) || !in_array($origin, $origins, true))) {
    respond(403, ['ok' => false, 'code' => 'origin_rejected']);
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
    respond(403, ['ok' => false, 'code' => 'origin_rejected']);
}
$secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
if (!$secure) {
    respond(503, ['ok' => false, 'available' => false, 'code' => 'https_required']);
}
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_name('tempo_contact');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
session_start();
if ($method === 'GET') {
    if (!isset($_SESSION['csrf']) || ($_SESSION['csrf_created'] ?? 0) < time() - 1800) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_created'] = time();
    }
    respond(200, ['ok' => true, 'available' => true, 'token' => $_SESSION['csrf']]);
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    respond(415, ['ok' => false, 'code' => 'unsupported_content_type']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32000) {
    respond(413, ['ok' => false, 'code' => 'request_too_large']);
}
$raw = file_get_contents('php://input', false, null, 0, 32001);
if ($raw === false || strlen($raw) > 32000) {
    respond(413, ['ok' => false, 'code' => 'request_too_large']);
}
try {
    $input = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
} catch (\JsonException $error) {
    respond(400, ['ok' => false, 'code' => 'invalid_json']);
}
if (!is_array($input) || !is_string($input['token'] ?? null)
    || !hash_equals($_SESSION['csrf'] ?? '', $input['token'])
    || ($_SESSION['csrf_created'] ?? 0) < time() - 1800) {
    respond(403, ['ok' => false, 'code' => 'csrf_expired']);
}
session_write_close();
try {
    require_once $privateDirectory . '/src/EmailTransport.php';
    $result = $service->submit($input, $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        static function (array $data, string $reference) use ($config): void {
            \TempoLegal\EmailTransport::send($config, $data, $reference);
        }
    );
    $service->cleanup();
    respond(200, $result);
} catch (\TempoLegal\ContactError $error) {
    if ($error->status === 429) {
        header('Retry-After: 900');
    }
    respond($error->status, ['ok' => false, 'code' => $error->errorCode, 'fields' => $error->fields]);
} catch (\Throwable $error) {
    error_log('TempoLegal contact service error.');
    respond(503, ['ok' => false, 'code' => 'service_unavailable']);
}
