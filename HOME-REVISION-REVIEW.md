# Home revision 28 October 2026

Base: the user-supplied `TempoLegal---Paginas-Web-ruben.zip`. Scope: sections 1, 2 and 3 of `2026-10-27-REVISION-HOME-TEMPOLEGAL-SISTEMAS.docx`. This source package has not been published or pushed to GitHub.

This report supersedes the older consent-module descriptions in the historical review files. Changes to account configuration, live hosting, SMTP and the broader technical/SEO checklist are outside this delivery.

## Implemented

- Navigation contact label: “Contáctenos”. The primary hero action is “Solicitar un diagnóstico inicial”, a direct WhatsApp link with the established company greeting. The separate hero WhatsApp link was removed.
- Exact Spanish hero description, business-day response commitment, DPD wording, 20+ foreign-capital metric, sectors and soft-landing action. Both static HTML and runtime dictionaries were updated.
- Clients: the five highlighted logos, their label, the client directory, launch button and motion caption were removed. Two automatic rows follow the requested order of 18 names each. Pause, keyboard navigation and reduced-motion support remain. All 36 supplied image files are now present, with two rows of 18 and no text-only placeholders.
- MSD and PUCE Salud were removed from client markup and the client registry. Their unreferenced original image files are retained as source assets, but are not displayed by the website.
- Services: four primary items and five under “Ver más servicios”; category filters removed. Existing service content and prices retained.
- Connection map: all nine confirmed countries retained, Quito pulse retained, lightweight animated route overlays added, with pointer, touch and keyboard selection. Selected country and city are displayed below the map. Animation pauses when the section is out of view or the document is hidden; reduced-motion preferences are respected.
- Cases: compact three-column desktop band, stacked on mobile, in GMA → Cámara de Comercio Exterior → Unidad Oncológica de SOLCA Zamora Chinchipe order. Logo, title and internal case link retained. No external original-publication links added.
- Testimonials: centered, compact wrapping layout, full-text disclosures retained and four company logos displayed. Approved testimonial paragraphs remain verbatim. Pablo retains initials, professional identification and no photo or logo. Eleazar now uses the supplied final portrait, alongside the final portraits supplied for Francisco, Ana and Juan.
- Team: all five named area leads retained. Rolando uses his existing supplied image, with no RV or “Fotografía pendiente” placeholder. The newly supplied CON FONDO DE CIUDAD photographs are used and optimized to WebP without retouching faces or backgrounds.
- The existing group photo was moved from the home to `nuestro-equipo/index.html`; “Conozca nuestro equipo” opens that page. The five area leads are followed by the other six named members supplied in the professional-photo archive; no unprovided biographies or qualifications were invented.
- Method and publications sections have shorter layouts. Method progress, existing hero effects, reading progress, client movement, number animations and reveal effects are retained. “Ver todas las publicaciones” opens `publicaciones/index.html`, which links to the project's articles.
- NextSearch credit removed from `_componentes/pie.html`, generated pages and templates. Copyright uses “© 2026 TempoLegal. Todos los derechos reservados.” The legal identification statement is unchanged.
- Privacy banner, preferences, withdrawal controls and map permission prompts removed. The unused preferences module was removed. Google Maps uses its existing direct iframe URL with lazy loading.
- Existing measurement configuration retained. GA4 can start directly when its existing production/host/HTTPS/indexability gates and a real ID are configured; it remains disabled in this staging package. No enquiry text is added to tracking events.
- Brand spelling normalized in presentation text and metadata. Approved quotations and legal document bodies were not rewritten for brand spelling.

## Current materials status

The five archives supplied on 28 October have been integrated. All 36 client logos, eleven individual team photos, four final testimonial portraits, Privacy 4.4 and Terms 1.3 are now included. See `MATERIALS-INTEGRATION-REVIEW.md` for the current validation and remaining items. The approved testimonial paragraphs remain unchanged.

The retouched group photograph specifically named in the instructions was not part of these five archives; the existing group image remains on the team page. The exact cumplidatos.com WhatsApp-button reference and live provider configuration remain pending. No publication was performed.

## Validation

- Browser checks for home, team directory and publications directory at 1440, 768, 390 and 360 CSS pixels: no horizontal overflow, no broken loaded images, no preferences UI or developer credit.
- Home runtime checks at each width: two rows of 18 client entries; four primary and five additional services; three cases in the approved order; five team images; five testimonials and four company logos; no image/logo for Pablo; nine map targets; service/testimonial disclosures, map selection and contact dialog work.
- Visual inspection of desktop hero and mobile hero/case band. No application JavaScript errors were observed; browser extension metadata warnings are unrelated to the site.
- 8,125 local source references checked across the pages before the final report was added: no missing targets. Template fragments are checked relative to their insertion root, not opened as standalone pages.
- JavaScript syntax checked. Existing source image/font assets were retained. The newly supplied legal DOCX files are included byte for byte, and their Spanish HTML wording was verified against the extracted source blocks. Approved Spanish testimonial paragraphs were compared against the original ZIP and remain unchanged.
- New directory routes included in the sitemap and URL/SEO inventories. They retain noindex for testing. The user-requested broader technical and SEO section 6 has not been treated as complete.
- WhatsApp destination and message verified without sending a message. No real form submission, email, analytics activation, deployment or Git push was performed.

## Main source files

`index.html`, `content.js`, `i18n.js`, `enhancements.js`, `script.js`, `home-revision.css`, `home-revision.js`, `clients-registry.json`, `_componentes/logos.html`, `_componentes/pie.html`, `measurement.js`, `technology-inventory.json`, the shared footer copies/templates, `nuestro-equipo/index.html`, `publicaciones/index.html`, `sitemap.xml`, `URL-MAP.csv` and `seo-inventory.json`.

Open the root `index.html` after extracting the archive. Folder links include `index.html` where required for local-file navigation. Review and integrate the changes into the current Git working copy before committing; the archive contains no Git history or private runtime credentials.
