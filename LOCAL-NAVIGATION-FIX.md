# Direct page navigation

Updated 27 October 2026.

The previous extracted-file preview could open a folder listing because its links used hosted directory URLs such as `terminos-y-condiciones/`. A local `file:` browser does not apply Apache's `DirectoryIndex` setting.

`local-navigation.js` now runs before the other deferred scripts on all 146 HTML documents. Only in a direct file preview, it resolves internal directory links to their `index.html` document inside the extracted project. It handles the language selector before i18n reads its routes, links produced later by JavaScript, and immediate link activations. Queries and section fragments are retained. Legal downloads, external sites, email and WhatsApp links remain their original destinations.

On HTTP/HTTPS the adapter exits immediately: hosted links, canonical metadata, hreflang, sitemap and redirects retain their existing clean directory URLs. The layout, approved text, images, fonts, CSS and animation code are unchanged. SMTP still requires the PHP hosting configuration; direct file preview cannot execute PHP.

Extract this updated ZIP into a new folder, then open the main `TempoLegal-Final/index.html` once. Navigate through the site's controls; no repeated choice of an index file is needed. Opening a folder itself through the computer's address bar can still show the browser's folder listing; the site fixes its own navigation links.

Validation: all 120 canonical pages were loaded into a local DOM with two simulated extracted-file roots, including a Windows path containing spaces. Verified 7,476 local link destinations and 960 language-route destinations. Hosted links and language maps were compared with their initial HTML and remain unchanged. The hosted Terms page was also reviewed in the browser. These checks do not claim a native Windows browser session on the user's computer.
