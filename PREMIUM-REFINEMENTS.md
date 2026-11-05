# Home and representation refinements

Prepared on 30 October 2026 against the preceding About-photo and Anthony-name delivery. Source archive only; no publication, Git push, campaign change or real contact submission.

## Original group photograph

All four About pages use `assets/team/team-group-original-2026-10-30.jpeg` immediately below their H1. This is a byte-for-byte copy of the newly supplied original, 2048 × 871 pixels. It has not been resized, recompressed, regenerated or cropped. Natural proportions and existing placement are preserved. Individual portraits are unchanged.

## Home

- Removed the service eyebrow and coverage eyebrow in Spanish, English, Portuguese and French.
- Removed the visible “Conversemos sobre su empresa” dialog heading and its translations. The dialog retains a visually hidden Contact label for accessibility, its description and its existing form behavior.
- Reused the available original transparent PNG logos: `gma.png`, `flp.png`, `cce.png` and `pazmino.png`. Existing PNG bytes, logo colors and shapes are unchanged. White CSS backgrounds and padding were removed from the logo styles. Static markup and translated dynamic testimonial data use the same PNG references.
- Testimonial wording, authors, portraits, expansion behavior and the approved 2 / 1 / 2 arrangement remain unchanged.

## Service navigation

The current service is highlighted in the shared Services menu and the Services toggle receives a subtle underline. The selected link carries `aria-current="page"`. Matching supports directory URLs, explicit index files, local file previews, language folders and retained representation, amendments, accounting and SAS aliases.

Twenty-eight Portuguese and French service documents still had the older header without a Services menu. They now use the existing shared translated header, with their main content and footer unchanged. Where a translated data-protection landing does not exist, the menu links directly to its existing Spanish destination and marks that destination with `hreflang="es"` and a translated availability title. No missing translated pages were invented. The shared header builder preserves this behavior on regeneration.

## Representation and registered address

The visual refinements apply to the updated Spanish representation landing and its retained `services/legal-representation/` alias. Existing English, Portuguese and French representation body copy remains the preceding version, as noted in the previous delivery; this update also gives their Services menu a current-page indicator.

The five professionals now span the complete content grid instead of being constrained to its left column. Tablet rows and the final mobile card are balanced. Existing individual photos, names, credentials, roles and profile destinations remain intact.

Service panels, conceptual papers, case articles and team surfaces have softer asymmetric corners and restrained transitions. All existing service copy and conditions remain unchanged.

The SVG map retains its client-origin context and its qualification that the points are not foreign offices. It includes two softly fading Quito pulses, staggered route reveals and traveling points. Country selection works with pointer, click, Enter, Space and keyboard focus; Escape clears the highlight. Larger country controls appear on small screens. Map motion pauses when offscreen or when the document is hidden, and respects reduced-motion preferences. A selected route remains visible while highlighted.

The canonical representation content model was updated as well as both generated pages. Running `_tools/build-approved-service-updates.py` retains the new SVG and controls. Existing page fonts, palette, header/footer design, home portrait, other sections and established animations remain in place.

## Validation

Original-photo byte comparison, unchanged prior image assets, complete representation-copy comparison, shared-footer preservation, H1/ID checks and transparent-PNG checks passed. JavaScript syntax checks passed. Newly introduced shared-menu destinations and resources resolve on all 28 updated Portuguese/French service pages.

Browser review covered the original photograph, home PNG backgrounds, full-width desktop team, country selection on desktop and mobile, current-service indication and responsive layout. Initial review found the missing Portuguese/French menu; the shared header was then integrated and those navigation cases were checked again. Internal QA files are excluded from the archive.

The existing noindex and server-delivery configuration are unchanged. Production publication and server reception tests are still release tasks.

Final browser results: 40 responsive layout checks passed at 1440, 768, 390 and 360 pixels. After correcting the two initially missing translated menus, 16 targeted navigation and mobile-menu checks passed with no failures. Country selection was also checked with keyboard Enter and mobile controls.
