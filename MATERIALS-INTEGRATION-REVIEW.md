# Approved materials integration 28 October 2026

This revision continues the previously delivered Ruben-based ZIP and retains the approved layout, animations, contact destinations and service conditions. The five new source archives were used locally. No deployment, Git push, message or email was performed.

## Delivered resources

- All 36 files from `HOME - CARRUSEL 36 LOGOS.zip` now occupy their exact numbered positions in two automatic rows. The six previous text placeholders are gone. Images preserve transparency and aspect ratio, have company-name alternative text and are optimized as lossless WebP. `home-clients.json` records the source mapping. The case strip also uses the delivered GMA, CCE and SOLCA logos.
- All eleven individual photographs from `CON FONDO DE CIUDAD.zip` are optimized as WebP under `assets/team/professional-2026/`. Their faces and backgrounds were not retouched. The five area leads remain on the home. The team page includes these five and the six other named people. Existing profile pages, colleague thumbnails, About and other pages referencing the same people use the new source photos. No new degree, position or personal biography was invented for the six additional members.
- All four supplied final testimonial WebP files are used for Francisco Mosquera, Ana Cecilia Andrade, Eleazar Becerra and Juan Pazmiño. Three company logos were updated from the delivered carousel files; Juan retains the existing Rectificadora logo. Pablo has no photo or logo. The supplied testimonial documents were read and the existing Spanish paragraphs were compared: no wording changes were necessary.
- `1 WEB.zip` contains the combined Privacy and Personal Data Protection Policy 4.4 and Terms of Use and Legal Notice 1.3, both dated 27 October 2026. They replace the old displayed versions. Their original DOCX bytes are included as downloads. Spanish HTML text, headings and all table cells match the extracted source wording. The new policy is already the combined privacy/data-protection document; no unprovided third legal document was fabricated.
- English, Portuguese and French reference translations were synchronized with the new controller/service-provider clauses and version dates. They remain clearly identified as reference translations pending legal review, with access to the Spanish original. Existing language navigation remains available.
- The reusable legal builder reads `privacy-policy.json` and `terms-content.json`. The existing `build-privacy.py` command delegates to it, avoiding regeneration of obsolete versions. Contact email evidence now names Privacy 4.4. Runtime mail configuration remains disabled/unconfigured as before.

## Verification

- All 8,138 local page references checked: no missing target files. JavaScript syntax checks pass.
- Spanish Privacy: 55 source blocks, including all six tables, matched in both flat and folder routes. Spanish Terms: 33 source blocks matched in both routes. Source documents were not rewritten.
- Approved testimonial paragraphs are unchanged from the previous ZIP. Pablo remains image-free. Eleazar's pre-existing wording was retained; the historical 20 October approval file still labels its added sentence for ratification, and this delivery makes no claim that publication authorization was newly obtained.
- Browser checks cover home, team page, four individual profile pages, and the folder routes of Privacy and Terms in all four languages, at 1440, 768, 390 and 360 pixels: 56 page/width checks. No horizontal overflow or broken loaded images was observed.
- Runtime home checks show 18 images in each client row, zero logo placeholders, five team portraits, four testimonial portraits, four company logos and zero images for Pablo. The full team page contains eleven portraits.
- Layouts and animations outside the supplied-material substitutions were retained. Noindex remains for testing. This does not certify the broader publication, accessibility, live-form or production measurement checklist as complete.

## Remaining source and configuration items

- A new retouched group-photo file was not included in these archives. The existing group image remains on the team page.
- The reference needed to match cumplidatos.com's floating WhatsApp button exactly is still unavailable. The existing functioning button and company greeting remain.
- Production activation and account configuration for measurement, SMTP and any external tags remain pending. Nothing was activated by importing the legal documents.
- The supplied Privacy 4.4 text states that optional analytics, tracking advertising and integrated maps require prior consent and refers to privacy controls. The earlier approved implementation explicitly removed those controls and loads the map directly. Both the literal supplied document and that prior implementation were preserved; this actual discrepancy must be resolved in the publication review. No legal wording was altered to hide it.
- Biographies, positions and degrees for additional people were not supplied with the photographs. Their team entries therefore show only their names and photos.

The archive remains a source handoff for review. Extract it before opening `index.html`, and integrate the files into the intended Git branch before committing.
