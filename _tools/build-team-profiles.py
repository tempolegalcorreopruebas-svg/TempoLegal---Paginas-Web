from pathlib import Path
from html import escape
from xml.etree import ElementTree as ET
import json
import re

ROOT = Path(__file__).resolve().parent.parent
content_path = ROOT / 'content.js'
source = content_path.read_text()
prefix = 'window.TEMPO_CONTENT = '
content = json.JSONDecoder().raw_decode(source.split(prefix, 1)[1])[0]
pages = {
    'juan-gomez': 'team-juan-alberto-gomez.html',
    'emilie-donoso': 'team-emilie-donoso.html',
    'daniela-barahona': 'team-daniela-barahona.html',
    'gabriel-calvopina': 'team-gabriel-calvopina.html',
    'rolando-valencia': 'team-rolando-valencia.html'
}
labels = {
    'es': {'profileBack': 'Volver al equipo', 'profileEyebrow': 'Nuestro equipo', 'profileAbout': 'Semblanza profesional', 'profileCareer': 'Trayectoria y formación', 'profilePractice': 'Áreas de práctica', 'profileOthers': 'Conozca al resto del equipo', 'profileContactTitle': 'El respaldo de un equipo.', 'profileContactBody': 'Conversemos sobre lo que su empresa necesita y la especialidad que puede acompañarle.', 'profileContact': 'Contactar a Tempo Legal', 'profileOpenLabel': 'Ver el perfil de {name} (se abre en una pestaña nueva)'},
    'en': {'profileBack': 'Back to the team', 'profileEyebrow': 'Our team', 'profileAbout': 'Professional background', 'profileCareer': 'Experience and education', 'profilePractice': 'Practice areas', 'profileOthers': 'Meet the rest of the team', 'profileContactTitle': 'The support of a team.', 'profileContactBody': 'Let’s discuss what your business needs and the expertise that can support it.', 'profileContact': 'Contact Tempo Legal', 'profileOpenLabel': 'View {name}’s profile (opens in a new tab)'},
    'pt': {'profileBack': 'Voltar à equipe', 'profileEyebrow': 'Nossa equipe', 'profileAbout': 'Perfil profissional', 'profileCareer': 'Experiência e formação', 'profilePractice': 'Áreas de atuação', 'profileOthers': 'Conheça o restante da equipe', 'profileContactTitle': 'O apoio de uma equipe.', 'profileContactBody': 'Vamos conversar sobre as necessidades da sua empresa e a especialidade que pode acompanhá-la.', 'profileContact': 'Falar com a Tempo Legal', 'profileOpenLabel': 'Ver o perfil de {name} (abre em uma nova aba)'},
    'fr': {'profileBack': 'Retour à l’équipe', 'profileEyebrow': 'Notre équipe', 'profileAbout': 'Parcours professionnel', 'profileCareer': 'Expérience et formation', 'profilePractice': 'Domaines de pratique', 'profileOthers': 'Découvrez le reste de l’équipe', 'profileContactTitle': 'L’appui d’une équipe.', 'profileContactBody': 'Échangeons sur les besoins de votre entreprise et les compétences pour vous accompagner.', 'profileContact': 'Contacter Tempo Legal', 'profileOpenLabel': 'Voir le profil de {name} (ouvre un nouvel onglet)'}
}

# Profile copy uses the existing approved biographies. No private-life facts are inferred.
profile_copy = json.loads((ROOT / 'team-profiles.json').read_text())

for language, data in content.items():
    data.update(labels[language])
    for person in data['teamItems']:
        person['page'] = pages[person['id']]
content_path.write_text(source.split(prefix, 1)[0] + prefix + json.dumps(content, ensure_ascii=False, indent=2) + ';\n')

for language, data in content.items():
    folder = '' if language == 'es' else language + '/'
    base = '' if language == 'es' else '../'
    home = ROOT / folder / 'index.html'
    source = home.read_text()
    for person in data['teamItems']:
        pattern = r'<details class="team-profile"[^>]*data-member="' + re.escape(person['id']) + r'"[^>]*>.*?</details>'
        label = labels[language]['profileOpenLabel'].replace('{name}', person['name'])
        link = f'<a class="team-profile-link" href="{person["page"]}" target="_blank" rel="noopener noreferrer" aria-label="{escape(label, quote=True)}"><span>{escape(data["profileMore"])}</span><span aria-hidden="true">↗</span></a>'
        source, count = re.subn(pattern, lambda _: link, source, count=1, flags=re.S)
        if not count:
            pattern = r'<a class="team-profile-link" href="' + re.escape(person['page']) + r'"[^>]*>.*?</a>'
            source, count = re.subn(pattern, lambda _: link, source, count=1, flags=re.S)
        assert count == 1, (language, person['id'])
    home.write_text(source)

    template = (ROOT / folder / 'article-biometrics.html').read_text()
    header = re.search(r'<header\b.*?</header>', template, re.S)[0]
    header = header.replace('index.html#recursos', 'index.html#equipo').replace('data-i18n="articleBack"', 'data-i18n="profileBack"').replace(data['articleBack'], labels[language]['profileBack'])
    footer = re.search(r'<footer class="site-footer".*?</footer>', template, re.S)[0]
    floating = re.search(r'<a class="whatsapp-float".*?</a>', template, re.S)[0]
    for person in data['teamItems']:
        details = profile_copy[person['id']][language]
        career_title = details.get('careerTitle', labels[language]['profileCareer'])
        filename = person['page']
        routes = {code: ('../' if folder else '') + ('' if code == 'es' else code + '/') + filename for code in content}
        canonical = 'https://tempolegal.com/' + folder + filename
        urls = {code: 'https://tempolegal.com/' + ('' if code == 'es' else code + '/') + filename for code in content}
        alternatives = ''.join(f'<link rel="alternate" hreflang="{code}" href="{url}">' for code, url in urls.items()) + f'<link rel="alternate" hreflang="x-default" href="{urls["es"]}">'
        description = person['name'] + ' · ' + person['role'] + '. ' + details['intro']
        facts = ''.join(f'<div><dt>{escape(label)}</dt><dd>{escape(value)}</dd></div>' for label, value in details['facts'])
        areas = ''.join(f'<li>{escape(area)}</li>' for area in details['areas'])
        others = ''.join(f'<a class="profile-colleague" href="{other["page"]}"><img src="{base}{other["photo"]}" width="96" height="96" alt="" loading="lazy" decoding="async"><span><strong>{escape(other["name"])}</strong><span>{escape(other["role"])}</span></span><span class="profile-colleague-arrow" aria-hidden="true">→</span></a>' for other in data['teamItems'] if other['id'] != person['id'])
        schema = {'@context': 'https://schema.org', '@type': 'ProfilePage', '@id': canonical + '#profile', 'url': canonical, 'inLanguage': language, 'name': person['name'] + ' | Tempo Legal', 'mainEntity': {'@type': 'Person', '@id': canonical + '#person', 'name': person['name'], 'jobTitle': person['role'], 'image': 'https://tempolegal.com/' + person['photo'], 'description': person['bio'], 'worksFor': {'@type': 'Organization', 'name': 'Tempo Legal', 'url': 'https://tempolegal.com/'}, 'knowsAbout': details['areas']}}
        skip = {'es': 'Saltar al contenido', 'en': 'Skip to content', 'pt': 'Ir para o conteúdo', 'fr': 'Aller au contenu'}[language]
        page = f'''<!doctype html>
<html lang="{language}" data-page-lang="{language}" data-base="{base}" data-lang-urls="{escape(json.dumps(routes), quote=True)}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#163c48"><title>{escape(person['name'])} | Tempo Legal</title><meta name="description" content="{escape(description, quote=True)}"><link rel="canonical" href="{canonical}">{alternatives}
<meta property="og:type" content="profile"><meta property="og:title" content="{escape(person['name'], quote=True)} | Tempo Legal"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:site_name" content="Tempo Legal"><meta property="og:image" content="https://tempolegal.com/{person['photo']}"><meta property="og:image:width" content="{person['photoWidth']}"><meta property="og:image:height" content="{person['photoHeight']}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(person['name'], quote=True)} | Tempo Legal"><meta name="twitter:description" content="{escape(description, quote=True)}"><meta name="twitter:image" content="https://tempolegal.com/{person['photo']}">
<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="{base}assets/fonts/editorial.woff" as="font" type="font/woff" crossorigin><link rel="preload" href="{base}{person['photo']}" as="image"><link rel="stylesheet" href="{base}styles.css"><link rel="stylesheet" href="{base}renewal.css"><link rel="stylesheet" href="{base}site-chrome.css"><link rel="stylesheet" href="{base}article-page.css"><link rel="stylesheet" href="{base}profile-page.css">
<script src="{base}config.js" defer></script><script src="{base}content.js" defer></script><script src="{base}i18n.js" defer></script><script src="{base}site-chrome.js" defer></script><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head>
<body class="profile-page" id="top"><a class="skip-link" href="#profile-story" data-i18n="skip">{escape(skip)}</a>{header}
<main id="profile-main"><section class="profile-hero" aria-labelledby="profile-name"><div class="container"><a class="profile-back" href="index.html#equipo"><span aria-hidden="true">←</span>{escape(labels[language]['profileBack'])}</a><div class="profile-hero-grid"><div class="profile-copy"><p class="profile-eyebrow">{escape(labels[language]['profileEyebrow'])} · Tempo Legal</p><h1 id="profile-name">{escape(person['name'])}</h1><p class="profile-role">{escape(person['role'])}</p><p class="profile-intro">{escape(details['intro'])}</p><p class="profile-specialty">{escape(person['specialty'])}</p><a class="profile-hero-contact" href="#contact">{escape(labels[language]['profileContact'])} <span aria-hidden="true">↗</span></a></div><figure class="profile-photo"><img src="{base}{person['photo']}" width="{person['photoWidth']}" height="{person['photoHeight']}" alt="{escape(person['name'], quote=True)}" fetchpriority="high" decoding="async"><figcaption>{escape(person['name'])}<span>Tempo Legal</span></figcaption></figure></div></div></section>
<div class="container profile-body"><article class="profile-story" id="profile-story" aria-labelledby="profile-about-heading" tabindex="-1"><p class="eyebrow">{escape(labels[language]['profileAbout'])}</p><h2 id="profile-about-heading">{escape(person['name'])}</h2><p class="profile-bio">{escape(person['bio'])}</p><p>{escape(details['about'])}</p><section class="profile-practice" aria-labelledby="profile-practice-heading"><h3 id="profile-practice-heading">{escape(labels[language]['profilePractice'])}</h3><ul>{areas}</ul></section></article><aside class="profile-career" aria-labelledby="profile-career-heading"><p class="eyebrow">Tempo Legal</p><h2 id="profile-career-heading">{escape(career_title)}</h2><dl>{facts}</dl></aside></div>
<section class="profile-contact-section" aria-labelledby="profile-contact-heading"><div class="container"><div><p class="eyebrow">Tempo Legal</p><h2 id="profile-contact-heading">{escape(labels[language]['profileContactTitle'])}</h2><p>{escape(labels[language]['profileContactBody'])}</p></div><a class="button button-light" href="#contact">{escape(labels[language]['profileContact'])} <span aria-hidden="true">↗</span></a></div></section>
<section class="profile-other-team section-space" aria-labelledby="profile-other-heading"><div class="container"><p class="eyebrow">{escape(labels[language]['profileEyebrow'])}</p><h2 id="profile-other-heading">{escape(labels[language]['profileOthers'])}</h2><div class="profile-colleagues">{others}</div><a class="profile-return" href="index.html#equipo">← {escape(labels[language]['profileBack'])}</a></div></section></main>{footer}{floating}</body></html>'''
        (ROOT / folder / filename).write_text(page)

path = ROOT / 'enhancements.js'
source = path.read_text()
start = source.index('  function renderTeam() {')
end = source.index('  function reviewCard(', start)
source = source[:start] + '''  function renderTeam() {
    const grid=$('#team-grid');retire(grid);grid.replaceChildren();
    I.get('teamItems').forEach(person=>{
      const card=node('article','team-person reveal');
      const photo=node('div','team-person-photo');photo.append(node('img','',null,{src:BASE+person.photo,alt:person.name,width:String(person.photoWidth||800),height:String(person.photoHeight||800),loading:'lazy',decoding:'async'}));
      card.append(photo,node('h3','',person.name),node('p','team-person-role',person.role),node('p','team-person-specialty',person.specialty));
      const link=node('a','team-profile-link',null,{href:person.page+'?lang='+I.language,target:'_blank',rel:'noopener noreferrer','aria-label':t('profileOpenLabel',{name:person.name})});
      link.append(node('span','',t('profileMore')),node('span','','↗',{'aria-hidden':'true'}));
      card.append(link);grid.append(card);
    });reveal(grid);
  }
''' + source[end:]
path.write_text(source)

path = ROOT / 'sitemap.xml'
source = path.read_text()
source = re.sub(r'  <url><loc>https://tempolegal\.com/(?:en/|pt/|fr/)?team-[^<]+</loc>.*?</url>\n', '', source)
entries = []
for filename in pages.values():
    urls = {code: 'https://tempolegal.com/' + ('' if code == 'es' else code + '/') + filename for code in content}
    alternates = ''.join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{url}"/>' for code, url in urls.items()) + f'<xhtml:link rel="alternate" hreflang="x-default" href="{urls["es"]}"/>'
    entries += [f'  <url><loc>{url}</loc>{alternates}</url>' for url in urls.values()]
source = source.replace('</urlset>', '\n'.join(entries) + '\n</urlset>')
ET.fromstring(source)
path.write_text(source)
