<?php
declare(strict_types=1);

// Copy to config.php in this private directory, outside public_html.
// Enter credentials on the server only. Never put them in config.js.
return [
    'enabled' => false,
    'allowed_origins' => [
        'https://tempolegal.com',
        'https://pruebas.tempolegal.com',
    ],
    'recipient' => 'info@tempolegal.com',
    'sender_email' => 'info@tempolegal.com',
    'sender_name' => 'TempoLegal website',
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_encryption' => 'smtps',
    'smtp_username' => 'info@tempolegal.com',
    'smtp_password' => '',
    'app_secret' => '', // Generate at least 32 random bytes; see README.md.
    'state_directory' => __DIR__ . '/state',
    'rate_limit' => 5,
    'rate_window' => 900,
    'global_limit' => 100,
];
