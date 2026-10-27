> Historical scope for version 8. The current implementation is documented in FUNCTIONALITY-SEO-REVIEW.md.

# Content and new pages — 27 October 2026

## Delivered in this package

- Soft landing pilot, with Juan Alberto's established portrait, confirmed practice information, firm figures, the CCE experience and links to the connected services.
- Nine further service pages, plus About and Contact.
- All twelve pages in Spanish, English, Portuguese and French: 48 complete, prerendered HTML documents.
- Links from the relevant existing service panels, mobile accordions, footer and Juan Alberto's profile. The existing service selection and consultation actions remain available.
- Native FAQ disclosures, an in-page index, reading progress, restrained entrance effects and reduced-motion support on the new pages.

## Spanish entry points

| Page | File |
| --- | --- |
| Soft Landing | services/soft-landing/index.html |
| Representation and tax address | services/legal-representation/index.html |
| Accounting and administrative support | services/accounting-support/index.html |
| Foreign branches | services/foreign-branches/index.html |
| Foreign capital | services/foreign-capital/index.html |
| SAS incorporation | services/sas-incorporation/index.html |
| Corporate and company law | services/corporate-law/index.html |
| Holding companies and structures | services/holding-structures/index.html |
| Monthly legal advice | services/monthly-legal-advice/index.html |
| Corporate amendments and acts | services/corporate-amendments/index.html |
| About | sobre-nosotros/index.html |
| Contact | contactanos/index.html |

Equivalent localized files are under en/, pt/ and fr/. Navigation uses explicit index.html files so the extracted package can also open these pages directly. A static server is recommended for the full site. Canonical and alternate URLs use directory routes.

## Preserved presentation

Every pre-existing CSS file and every file under assets/ is unchanged from version 7. The homepage section order, team portraits, automatic client marquee, Quito pulses, number scrambling and existing interaction logic are preserved. New styles are scoped to .service-page in service-pages.css. The existing scripts add service-detail links and validated consultation-entry handling. A focus guard prevents delayed hover selection from replacing the service panel while its action is being used; the original animation timing remains unchanged.

About contains all five confirmed names and roles. Juan Alberto, Emillie, Daniela and Gabriel retain their established photographs. Rolando's confirmed profession, role and Finance / Administration areas are presented as text; no replacement or generated portrait is introduced. Contact uses info@tempolegal.com and Oficina 508.

## Editorial basis

The approved Astra 3.2 master and structured text supply the core descriptions, figures, team facts, working process and CCE experience. New service-specific explanatory copy was developed from that scope for review; it is not represented as previously approved verbatim text. No fees, completion deadlines, guaranteed banking outcomes or additional academic credentials were invented. The firm should review the expanded service copy before publication.

Official background references consulted: the Superintendencia de Compañías SAS guide and foreign-company guidance, and the SRI society/RUC requirements. These are editorial background, not a claim of legal certification or a source of guaranteed results. No original-publication attribution links were added to the new service pages.

## Verification and remaining work

Browser review covered 48 pages at 320, 390, 768 and 1440 pixels: 192 width checks, with no horizontal overflow or broken loaded images after corrections. Functional checks covered the new-page language selector, section retention, FAQ expansion, company navigation and the Soft Landing enquiry preselection. Static checks cover page/asset references, metadata and preservation of existing assets and styles.

New pages remain noindex,follow pending final review. Their proposed service routes do not constitute an approved redirect plan, a migration of the live WordPress site or a deployed production environment. About and Contact retain the route names supplied in the master. Production URL mapping, redirects and indexability remain part of the later checklist.

The consultation action still opens the existing local draft/review flow. This delivery does not implement server reception, send a test enquiry or reserve an appointment. The real form, analytics/cookie setup, formal accessibility review and publication remain separate pending tasks.
