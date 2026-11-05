# Current integration

Read `MERGE-REVIEW.md` for the current combined delivery and validation. This working tree preserves Ruben's latest visual base and integrates Anthony's additions. No remote branch or production site has been changed. Private server sources are under `server/tempo-private/`; install them outside the public document root as described there.

# TempoLegal website

The current legal and measurement scope is documented in `LEGAL-MEASUREMENT-REVIEW.md`; the prior navigation and SMTP scope is in `FUNCTIONALITY-SEO-REVIEW.md`.

## Package structure

`TempoLegal-Final/` contains the public HTML, CSS, JavaScript, images, fonts and PHP endpoint. `tempo-private/` contains the SMTP transport, bundled mail library and example server configuration. Keep the private directory beside the public document root, outside `public_html`.

For visual review, serve `TempoLegal-Final/` with a static web server. Directory URLs are used throughout the site. For direct email reception, use PHP 8.1+ over HTTPS and configure the private SMTP settings as described in `tempo-private/README.md`. No WordPress, Composer, database or queue is required by this form.

## Languages and routes

Spanish is at the root. English, Portuguese and French versions are under `en/`, `pt/` and `fr/`. The approved Spanish Terms document is preserved. Reference translations in English, Portuguese and French are integrated and labelled for legal review before publication. `URL-MAP.csv`, `seo-inventory.json`, `redirect-map.json` and `sitemap.xml` describe the current canonical routes and compatibility redirects.

The live WordPress site has not been replaced. Read `LEGACY-URL-REVIEW.csv` and complete the historical URL inventory before a production migration. Keep the draft noindex controls until the final publication checklist is approved.

## Editing

`content.js` supplies localized home content and dynamic links. Individual page bodies are prerendered HTML. `service-content.json` is an editorial snapshot, not a runtime page generator. Historical generation utilities are retained for reference; adapt them to the current route manifest before running them over this delivery.

Public contact channels are in `config.js`. SMTP credentials belong exclusively in the private server configuration. No real SMTP credentials are shipped. Without server configuration, the visitor can still prepare a request and continue in WhatsApp or their mail application; no successful direct submission is claimed.

The original presentation and team images are preserved. `CONTENT-PAGES-REVIEW.md` and `UPDATE-NOTES.md` describe earlier delivery scopes; this file and `LEGAL-MEASUREMENT-REVIEW.md` describe the current version.

## Privacy and measurement

Privacy preferences manage maps and optional Analytics independently. GA4 is disabled with no real ID in `measurement-config.js`, and production/noindex/test guards remain active. Read `MEASUREMENT-SETUP.md` before activation. Do not install a second Google/GTM snippet or remotely enable automatic personal-data/form capture. `technology-inventory.json` describes the actual source setup; reconcile it with the approved Privacy policy before publication. No analytics account or advertising campaign has been changed.

## Direct file preview navigation

Extract the current ZIP and open the main `index.html` once. `local-navigation.js` opens internal documents directly when using the `file:` protocol, including language changes and dynamically created links. A hosted preview retains canonical directory URLs. See `LOCAL-NAVIGATION-FIX.md`.
