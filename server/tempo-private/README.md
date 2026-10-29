# TempoLegal contact reception on Hostinger

The public website is HTML/CSS/JavaScript. The enquiry endpoint uses PHP 8.1 or later, OpenSSL and the bundled PHPMailer 7.1.1 source. It requires no WordPress installation, Composer installation, database or queue.

## Directory placement

Upload the contents of `TempoLegal-Final` to the site's `public_html` directory. Place this entire `tempo-private` directory beside `public_html`, not inside it. The public endpoint resolves `../tempo-private` relative to the public directory. Keep `config.php`, `state/` and the mail library outside the public document root. The included deny rule is additional protection if the private folder is accidentally exposed.

This package does not authorize replacing the live site before the migration inventory, final review and publication checklist are complete.

## Configure on the server

1. Copy `config.example.php` to `config.php` in this private directory.
2. Set the SMTP details shown by the actual mailbox provider. Hostinger Email defaults are included as examples; Hostinger hosting does not establish which email provider the firm uses.
3. Use an authenticated sender accepted by that provider. The configured recipient is `info@tempolegal.com`; the visitor's validated email is only Reply-To. Never accept a recipient, sender or SMTP host from a browser request.
4. Generate a private application secret using `php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'` and paste it into `app_secret` on the server. Do not put SMTP passwords or this secret in HTML, JavaScript, Git, public files or chat.
5. Give the PHP process write access to this private directory's `state/` folder. Suggested permissions: private configuration 0600, state directory 0700.
6. Set `enabled` to `true` only after the account is configured. Keep the explicit origin allowlist for the domain(s) that actually host the form.
7. Open the website through HTTPS. A same-origin GET to `/api/contact.php` returns `available: true` and a session token when configured. Without configuration, the site keeps WhatsApp/email alternatives and never reports an enquiry as sent.
8. Perform an authorized test submission on the hosting account and confirm arrival in the intended mailbox. Local tests in this delivery did not send external email or verify Hostinger inbox delivery.

## Delivery behavior

The visitor reviews the request and explicitly accepts processing for this enquiry before pressing the direct email button. Success is shown only after the SMTP server accepts the message. That acknowledgement is not a guarantee of inbox placement or an appointment reservation. The response supplies a reference number.

An uncertain transport response is not retried automatically. Idempotency prevents the same prepared request from being delivered repeatedly after an accepted response. No automatic acknowledgement is sent to the visitor.

## Data and abuse controls

The endpoint validates fields server-side, rejects invalid or missing consent, checks the origin and a session CSRF token, rejects an occupied honeypot, and applies per-IP and global request limits. IP addresses are HMAC-hashed for rate-limit keys. The state directory contains counters, request signatures and delivery references, not names, email addresses or enquiry messages. Old state files are periodically removed after 48 hours. Mailbox retention and access remain the firm's responsibility.

The session cookie is Secure, HttpOnly and SameSite=Lax, with a path restricted to `/api/`. SMTP certificate checks remain enabled. No analytics or advertising provider was added.

## Test scope

The PHP application was syntax-checked and exercised in PHP 8.5 WebAssembly. Core validation, duplicate handling, limits, failure handling and MIME generation were tested without sending network mail. The production PHP interpreter, HTTPS/session behavior, SMTP authentication, mail acceptance and final inbox receipt must still be verified in Hostinger.

## Privacy notice acknowledgement

The legacy JSON field `privacyAccepted` remains for compatibility and now means that the visitor confirmed reading Privacy 4.4. Enquiry handling follows the precontractual basis in the approved notice; this checkbox never subscribes anyone to marketing or grants Analytics consent. The generated email records this acknowledgement and policy version. No optional analytics consent is required to contact the firm. See the public `LEGAL-MEASUREMENT-REVIEW.md` and `MEASUREMENT-SETUP.md` for the current legal/measurement scope.
