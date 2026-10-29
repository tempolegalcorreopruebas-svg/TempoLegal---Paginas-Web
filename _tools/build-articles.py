from pathlib import Path
from html import escape
from urllib.parse import quote
from xml.etree import ElementTree as ET
import json
import math
import re

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / 'content.js').read_text()
prefix = 'window.TEMPO_CONTENT = '
content = json.JSONDecoder().raw_decode(source.split(prefix, 1)[1])[0]
bodies = json.loads((ROOT / 'article-content.json').read_text())
pages = {'biometrics': 'article-biometrics.html', 'dpd': 'article-data-protection-officer.html', 'shareholders': 'article-shareholder-agreements.html', 'breach': 'article-data-breach.html'}
ui = {
    'es': {'articleBack': 'Volver a las lecturas', 'articleIndex': 'En esta lectura', 'articleReadingTime': '{minutes} min de lectura', 'articleEdition': 'Edición para empresas', 'articleReferences': 'Marco de referencia', 'articleRelated': 'Seguir leyendo', 'articleContactTitle': 'Conversemos sobre su empresa.', 'articleContactBody': 'Nuestro equipo puede ayudarle a revisar su situación y definir los siguientes pasos.', 'insightRead': 'Leer artículo', 'insightReadLabel': 'Leer artículo: {topic}'},
    'en': {'articleBack': 'Back to insights', 'articleIndex': 'In this reading', 'articleReadingTime': '{minutes} min read', 'articleEdition': 'Business edition', 'articleReferences': 'Reference framework', 'articleRelated': 'Continue reading', 'articleContactTitle': 'Let’s discuss your business.', 'articleContactBody': 'Our team can help you review your situation and define the next steps.', 'insightRead': 'Read article', 'insightReadLabel': 'Read article: {topic}'},
    'pt': {'articleBack': 'Voltar às leituras', 'articleIndex': 'Nesta leitura', 'articleReadingTime': '{minutes} min de leitura', 'articleEdition': 'Edição para empresas', 'articleReferences': 'Marco de referência', 'articleRelated': 'Continue lendo', 'articleContactTitle': 'Vamos conversar sobre sua empresa.', 'articleContactBody': 'Nossa equipe pode ajudar a analisar sua situação e definir os próximos passos.', 'insightRead': 'Ler artigo', 'insightReadLabel': 'Ler artigo: {topic}'},
    'fr': {'articleBack': 'Retour aux lectures', 'articleIndex': 'Dans cette lecture', 'articleReadingTime': '{minutes} min de lecture', 'articleEdition': 'Édition entreprises', 'articleReferences': 'Cadre de référence', 'articleRelated': 'Poursuivre la lecture', 'articleContactTitle': 'Parlons de votre entreprise.', 'articleContactBody': 'Notre équipe peut vous aider à examiner votre situation et à définir les prochaines étapes.', 'insightRead': 'Lire l’article', 'insightReadLabel': 'Lire l’article : {topic}'}
}
references = {
    'biometrics': ['Ley Orgánica de Protección de Datos Personales', 'Resolución SPDP-SPD-2026-0039-R'],
    'dpd': ['Ley Orgánica de Protección de Datos Personales, arts. 48–50', 'Reglamento General a la LOPDP, arts. 48–57', 'Resolución SPDP-SPD-2025-0028-R'],
    'shareholders': ['Ley de Compañías', 'Ley Orgánica de Emprendimiento e Innovación'],
    'breach': ['Ley Orgánica de Protección de Datos Personales, arts. 43 y 46', 'Reglamento General a la LOPDP, arts. 24–28', 'Resolución SPDP-SPD-2026-0040-R']
}
for language, data in content.items():
    data.update(ui[language])
    for item in data['articleItems']:
        item['page'] = pages[item['id']]
    for key in ['insightExplore', 'insightExploreLabel']:
        data.pop(key, None)
(ROOT / 'content.js').write_text(source.split(prefix, 1)[0] + prefix + json.dumps(content, ensure_ascii=False, indent=2) + ';\n')

# Home links are ordinary anchors and continue working without JavaScript.
for language in content:
    folder = '' if language == 'es' else language + '/'
    path = ROOT / folder / 'index.html'
    source = path.read_text()
    for item in content[language]['articleItems']:
        old_label = ui[language]['insightReadLabel'].replace('{topic}', item['title'])
        title = escape(old_label, quote=True)
        label = escape(ui[language]['insightRead'])
        pattern = r'(<article\b[^>]*aria-labelledby="insight-title-' + re.escape(item['id']) + r'"[^>]*>)(.*?)(</article>)'
        replacement = f'<a class="insight-action" href="{item["page"]}" aria-label="{title}"><span>{label}</span><span class="insight-arrow" aria-hidden="true">→</span></a>'
        def replace_action(match):
            body, count = re.subn(r'<(?:button|a) class="insight-action"[^>]*>.*?</(?:button|a)>', lambda _: replacement, match[2], count=1, flags=re.S)
            assert count == 1, (language, item['id'])
            return match[1] + body + match[3]
        source, count = re.subn(pattern, replace_action, source, count=1, flags=re.S)
        assert count == 1, (language, item['id'])
    path.write_text(source)

path = ROOT / 'enhancements.js'
source = path.read_text()
source = source.replace("const action=node('button','insight-action',null,{type:'button','data-service-detail':article.serviceId,'aria-label':t('insightExploreLabel',{topic:article.title})});", "const action=node('a','insight-action',null,{href:article.page+'?lang='+I.language,'aria-label':t('insightReadLabel',{topic:article.title})});")
source = source.replace("action.append(node('span','',t('insightExplore')),node('span','insight-arrow','↗',{'aria-hidden':'true'}));", "action.append(node('span','',t('insightRead')),node('span','insight-arrow','→',{'aria-hidden':'true'}));")
path.write_text(source)

for language, data in content.items():
    folder = '' if language == 'es' else language + '/'
    base = '' if language == 'es' else '../'
    template = (ROOT / folder / 'caso-solca.html').read_text()
    header = re.search(r'<header\b.*?</header>', template, re.S)[0]
    header = header.replace('project-header', 'article-header').replace('data-project-home', 'data-article-home')
    header = header.replace('index.html#casos', 'index.html#recursos').replace('data-i18n="projectBack"', 'data-i18n="articleBack"')
    header = header.replace(data['projectBack'], ui[language]['articleBack'])
    footer = re.search(r'<footer class="site-footer".*?</footer>', template, re.S)[0]
    footer = re.sub(r'<div class="footer-contact"[^>]*>', '<div class="footer-contact" id="contact">', footer, count=1)
    floating = re.search(r'<a class="whatsapp-float".*?</a>', template, re.S)[0]
    for item in data['articleItems']:
        article_id = item['id']
        sections = bodies[article_id][language]
        filename = pages[article_id]
        word_count = len(' '.join(part for section in sections for part in section).split())
        minutes = max(1, math.ceil(word_count / 200))
        reading_time = ui[language]['articleReadingTime'].replace('{minutes}', str(minutes))
        title = item['title']
        category = data[item['categoryKey']]
        routes = {code: ('../' if folder else '') + ('' if code == 'es' else code + '/') + filename for code in content}
        canonical = 'https://tempolegal.com/' + folder + filename
        alternate = {code: 'https://tempolegal.com/' + ('' if code == 'es' else code + '/') + filename for code in content}
        meta = '\n'.join(f'<link rel="alternate" hreflang="{code}" href="{url}">' for code, url in alternate.items())
        meta += f'\n<link rel="alternate" hreflang="x-default" href="{alternate["es"]}">'
        toc = ''.join(f'<li><a href="#article-section-{n}"><span aria-hidden="true">{n:02d}</span>{escape(section[0])}</a></li>' for n, section in enumerate(sections, 1))
        story = ''.join(f'<section class="article-section" id="article-section-{n}" aria-labelledby="article-heading-{n}"><p class="article-section-number" aria-hidden="true">{n:02d}</p><h2 id="article-heading-{n}">{escape(section[0])}</h2>' + ''.join(f'<p>{escape(paragraph)}</p>' for paragraph in section[1:]) + '</section>' for n, section in enumerate(sections, 1))
        related = ''.join(f'<a class="article-related-link" href="{other["page"]}"><span class="article-related-category">{escape(data[other["categoryKey"]])}</span><span class="article-related-title">{escape(other["title"])}</span><span aria-hidden="true">→</span></a>' for other in data['articleItems'] if other['id'] != article_id)
        structured = {'@context': 'https://schema.org', '@graph': [
            {'@type': 'Article', '@id': canonical + '#article', 'headline': title, 'description': item['body'], 'inLanguage': language, 'mainEntityOfPage': canonical, 'author': {'@type': 'Organization', 'name': 'TempoLegal'}, 'publisher': {'@type': 'Organization', 'name': 'TempoLegal'}, 'wordCount': word_count},
            {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'TempoLegal', 'item': 'https://tempolegal.com/' + folder}, {'@type': 'ListItem', 'position': 2, 'name': title, 'item': canonical}]}
        ]}
        page = f'''<!doctype html>
<html lang="{language}" data-page-lang="{language}" data-base="{base}" data-lang-urls="{escape(json.dumps(routes), quote=True)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#163c48">
<title>{escape(title)} | TempoLegal</title><meta name="description" content="{escape(item['body'], quote=True)}"><link rel="canonical" href="{canonical}">{meta}
<meta property="og:type" content="article"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(item['body'], quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:site_name" content="TempoLegal"><meta property="og:image" content="https://tempolegal.com/assets/og/og-{language}.jpg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(title, quote=True)}"><meta name="twitter:description" content="{escape(item['body'], quote=True)}"><meta name="twitter:image" content="https://tempolegal.com/assets/og/og-{language}.jpg">
<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="{base}assets/fonts/editorial.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="{base}styles.css"><link rel="stylesheet" href="{base}renewal.css"><link rel="stylesheet" href="{base}site-chrome.css"><link rel="stylesheet" href="{base}article-page.css">
<script src="{base}config.js" defer></script><script src="{base}content.js" defer></script><script src="{base}i18n.js" defer></script><script src="{base}site-chrome.js" defer></script><script src="{base}article-page.js" defer></script>
<script type="application/ld+json">{json.dumps(structured, ensure_ascii=False).replace('</', '<\\/')}</script></head>
<body class="article-page" id="top"><a class="skip-link" href="#article-story">{escape(data['skip']) if 'skip' in data else {'es':'Saltar al contenido','en':'Skip to content','pt':'Ir para o conteúdo','fr':'Aller au contenu'}[language]}</a>{header}
<main id="article-main">
<section class="article-hero" aria-labelledby="article-title"><div class="container article-hero-inner"><a class="article-breadcrumb" href="index.html#recursos"><span aria-hidden="true">←</span>{escape(ui[language]['articleBack'])}</a><p class="article-eyebrow">{escape(category)}</p><h1 id="article-title">{escape(title)}</h1><p class="article-lead">{escape(item['body'])}</p><div class="article-byline"><span>TempoLegal</span><span>{escape(ui[language]['articleEdition'])}</span><span>{escape(reading_time)}</span></div></div><div class="article-hero-art" aria-hidden="true"><i></i><i></i></div></section>
<div class="container article-reading-layout"><aside class="article-sidebar"><nav class="article-toc" aria-labelledby="article-index-title"><h2 id="article-index-title">{escape(ui[language]['articleIndex'])}</h2><ol>{toc}</ol></nav><a class="article-sidebar-back" href="index.html#recursos">← {escape(ui[language]['articleBack'])}</a></aside><article class="article-story" id="article-story" aria-labelledby="article-title" tabindex="-1">{story}<aside class="article-references" aria-labelledby="article-references-title"><h2 id="article-references-title">{escape(ui[language]['articleReferences'])}</h2><ul>{''.join('<li>'+escape(reference)+'</li>' for reference in references[article_id])}</ul></aside><div class="article-end"><span>TempoLegal</span><a href="index.html#recursos">{escape(ui[language]['articleBack'])} <span aria-hidden="true">↗</span></a></div></article></div>
<section class="article-enquiry" aria-labelledby="article-enquiry-title"><div class="container"><div><p class="eyebrow">TempoLegal</p><h2 id="article-enquiry-title">{escape(ui[language]['articleContactTitle'])}</h2><p>{escape(ui[language]['articleContactBody'])}</p></div><a class="button button-light" href="#contact">{escape(data.get('contact', {'es':'Contacto','en':'Contact','pt':'Contato','fr':'Contact'}[language]))} <span aria-hidden="true">↗</span></a></div></section>
<section class="article-related section-space" aria-labelledby="article-related-heading"><div class="container"><p class="eyebrow">{escape(data['resourcesEyebrow'])}</p><h2 id="article-related-heading">{escape(ui[language]['articleRelated'])}</h2><div class="article-related-grid">{related}</div></div></section>
</main>{footer}{floating}</body></html>'''
        (ROOT / folder / filename).write_text(page)

# Append the new URLs without changing any existing sitemap entries.
path = ROOT / 'sitemap.xml'
source = path.read_text()
source = re.sub(r'  <url><loc>https://tempolegal\.com/(?:en/|pt/|fr/)?article-[^<]+</loc>.*?</url>\n', '', source)
entries = []
for filename in pages.values():
    urls = {code: 'https://tempolegal.com/' + ('' if code == 'es' else code + '/') + filename for code in content}
    alternates = ''.join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{url}"/>' for code, url in urls.items()) + f'<xhtml:link rel="alternate" hreflang="x-default" href="{urls["es"]}"/>'
    for url in urls.values():
        entries.append(f'  <url><loc>{url}</loc>{alternates}</url>')
source = source.replace('</urlset>', '\n'.join(entries) + '\n</urlset>')
ET.fromstring(source)
path.write_text(source)

(ROOT / 'UPDATE-NOTES.md').write_text('''# Integrated article pages

The four homepage readings now open real HTML article pages inside this project. Each article is available in Spanish, English, Portuguese and French with its own URL, canonical metadata, language alternatives and sitemap entry. The new pages share the existing fonts, palette, header language menu, reading progress, footer and WhatsApp greeting.

Article bodies are an editorial adaptation of the identified topics, using original explanatory wording and the referenced Ecuadorian legal framework. They are not a verbatim transfer of the previous WordPress articles. The structured content is maintained in article-content.json; each page includes its full text in HTML without requiring a network fetch. No links to the old article pages are restored.

The new pages include a section index, related articles, back-to-insights navigation and contact access. Existing case pages, legal notices, testimonials, images and other homepage sections are unchanged in this update.

To update article copy, edit article-content.json and run `python3 _tools/build-articles.py` from this directory. The builder regenerates the 16 static article pages, refreshes the reading links and maintains the article sitemap entries without duplication.

All new code, filenames, identifiers and comments use English. Visible copy and metadata follow the language of each page.
''')
