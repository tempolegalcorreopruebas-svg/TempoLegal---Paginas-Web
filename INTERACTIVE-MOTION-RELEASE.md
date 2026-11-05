# Interactive motion release — 2026-11-05

Four requested interactions are implemented in a shared stylesheet and JavaScript module:
1. Cascading reveal by scroll in Approach, Cases, Method and selected headings.
2. Interactive glow for selected countries, linking labels and destination markers.
3. Cursor-following light effect on case cards (nonblocking).
4. Scroll-driven per-segment progress connecting method steps 1 to 4.

Applied to every HTML page containing the matching sections, including ES, EN, PT and FR homes. Original photos, logos, languages and LOPDP functionality are left unchanged. Reduced-motion preferences are respected.

Review locally through a web server (for example `python3 -m http.server 8000` at the site root), not through a file:// URL. Browser interaction tests have not been performed.
