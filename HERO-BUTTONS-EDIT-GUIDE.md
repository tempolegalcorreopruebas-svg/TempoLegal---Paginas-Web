# TempoLegal — Premium hero buttons

## Files

- `hero-premium-buttons.css`: all new styles for the hero action buttons.
- `index.html`: includes `hero-premium-buttons.css` before `</head>`.
- `en/index.html`, `pt/index.html`, `fr/index.html`: include `../hero-premium-buttons.css` before `</head>`.

## Target HTML

In each homepage, search for `<div class="hero-actions intro-enter">`. Keep the two existing anchors; their translations and href attributes are already correct.

## Customize

Change `border-radius: 999px` to adjust pill roundness. Change `.button-primary` gradient colors to change the main CTA. Change `.text-link` background to adjust the secondary CTA. Change `gap: 14px` for spacing. The styles are scoped to `.hero .hero-actions` and will not affect navigation or calculator buttons.
