# Service content integration

The existing develop project, including the previous corporate-law content update, remains the implementation base. The six supplied HTML files are content references, not replacement templates.

| Reference | Existing destination |
| --- | --- |
| Accounting and administrative support | servicios-contabilidad/index.html |
| Soft Landing | services/soft-landing/index.html |
| Holdings and business structures | services/holding-structures/index.html |
| SAS incorporation | constitucion-de-empresas-sas/index.html |
| Personal data protection | proteccion-de-datos-personales-ecuador/index.html |
| External DPO | proteccion-de-datos-personales-ecuador/delegado-proteccion-datos-externo-ecuador/index.html |

## Content

The four business-service pages now include the reference scope, process, conditions, experiences, team and full testimonials. They contain 12, 9, 12 and 12 FAQs respectively. SAS prices, VAT, signature costs, timetable qualifications, discounts and fee validity are retained. Prices are shown directly as a list; the reference prototype selector and demonstration forms are not imported.

Existing English, Portuguese and French versions of these four services contain localized copy. Approved translated testimonials are reused. Their translated explanatory prose is adapted from the Spanish reference rather than presented as a verbatim Spanish quotation.

The data-protection and DPO pages already contained most of the reference information. Their headings, service description, CumpliDatos explanation, resources and relevant FAQ are updated in the existing Spanish and English pages. Portuguese and French landings for these two destinations are not present in the supplied base and were not invented. The DPO correction now follows the supplied reference fully: earlier extra sanction and delegate-benefit blocks, the extra DPD/DPO definition, the response promise and the extra definition FAQ are removed from this page. The resulting DPO page has the reference's 13 FAQs. Existing page controls, form behavior and approved team images are retained. Prototype photo placeholders are not imported. The obsolete planned-feature paragraph is removed from the updated CumpliDatos blocks.

## Design and preservation

The shared service grid now uses the available content column and a bounded gap, removing the excessive empty space seen beside the corporate-law navigation. This also benefits the other service pages using that grid. No duplicate grid override was added.

Existing header and footer markup, images, fonts and JavaScript files are unchanged. Existing reveal and disclosure animation components are reused. New references use actual project routes; prototype paths and forms are excluded. No stock or team images are replaced.

## Validation

Local references and fragment destinations in the updated main content resolve. All pages have unique IDs and consistent FAQ content. Header/footer and script/stylesheet references were compared with the previous archive. The builders are idempotent.

Browser checks covered 24 available page/language combinations at 360, 390, 768, 1440 and 1920 pixels. They found no horizontal overflow or broken main-content images; FAQ disclosures opened and existing service-motion behavior remained active. At desktop widths, the sidebar/content gap is at most 80 pixels. Spanish corporate-law and SAS layouts were visually reviewed.

No remote Git operation or publication was performed. Existing robots and canonical settings are preserved.

## Rebuilding

Copy is stored in service-reference-content.json, service-reference-translations.json and data-service-copy.json. Run _tools/build-service-reference-content.py followed by _tools/update-data-service-copy.py after any earlier broad page generator. The original corporate builder remains available for its existing page.
