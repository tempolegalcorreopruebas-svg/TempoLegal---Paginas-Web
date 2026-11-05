# Individual team profiles

Each of the four team members has a dedicated profile in Spanish, English, Portuguese and French. The homepage profile controls are ordinary links with target="_blank" and rel="noopener noreferrer". Accessible labels announce the new tab. Profile pages include the existing portrait, professional biography, practice areas, career and education information, links to colleagues, language selection, reading progress, footer and the agreed WhatsApp greeting.

Existing team names, roles, portraits and biographies come from content.js. Additional profile copy is in team-profiles.json. Emilie Donoso’s CEUPE master’s and supplementary cybersecurity studies were checked against the firm’s official published biography on 24 October 2026. No private-life details, hobbies, unverified dates, institutions or credentials were invented. Juan Alberto Gómez’s debt-recovery figure describes proceedings in which he participated; it is not presented as money recovered.

Edit team-profiles.json or the teamItems records in content.js, then run python3 _tools/build-team-profiles.py from this directory to regenerate the profile pages. The generator maintains the profile links and sitemap entries without duplication. New code, filenames, identifiers and comments use English; visible text follows the page language.

The article pages, other homepage sections, photographs, legal notices, testimonials and contact form remain unchanged in this update.
