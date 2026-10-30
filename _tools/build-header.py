#!/usr/bin/env python3
"""Menú común de la cabecera (tarea 1.2) y selector de idioma (tarea 5.5) en todas las
páginas: español, en/, pt/ y fr/.

Uso (desde la raíz del repositorio):
    python _tools/build-header.py                 # todas las páginas
    python _tools/build-header.py index.html      # solo esas

- Fuente única: _componentes/cabecera.html ({root}, {site}, {home} y {cta} por página).
  En en/, pt/ y fr/ los textos con data-i18n se escriben ya traducidos (i18n.js).
- Home: rellena su <nav id="main-nav"> (el menú móvil sigue en script.js).
- Landings de protección de datos: rellena <nav id="navigation"> de .tl-header.
- Resto (servicios, Nosotros, Contacto, artículos, casos, perfiles, legales):
  cambia el enlace «← Volver…» por el menú completo y añade el botón de menú móvil.
- Landings y herramientas LOPDP: añade el selector de idioma (_componentes/idioma.html),
  carga config.js, i18n.js y site-chrome.js y, mientras la página no tenga versiones en
  otros idiomas (sin data-lang-urls), la marca con data-i18n-partial para mostrar el aviso.
- Añade cabecera.css, contraste.css y site-header.js si faltan.
- Se puede ejecutar varias veces: usa los marcadores <!-- menu:… --> e <!-- idioma:… -->.
"""
from __future__ import annotations

import re
import sys
import posixpath
from urllib.parse import urlsplit

from i18n_comun import ROOT, all_pages, fill, prefixes, translate_static

COMPONENT = ROOT / '_componentes' / 'cabecera.html'
LANG_COMPONENT = ROOT / '_componentes' / 'idioma.html'
START = '<!-- menu:inicio · generado por _tools/build-header.py desde _componentes/cabecera.html; no editar aquí -->'
END = '<!-- menu:fin -->'
MARKED = re.compile(r'<!-- menu:inicio[^>]*-->.*?<!-- menu:fin -->', re.S)
LANG_START = '<!-- idioma:inicio · generado por _tools/build-header.py desde _componentes/idioma.html; no editar aquí -->'
LANG_END = '<!-- idioma:fin -->'
LANG_MARKED = re.compile(r'<!-- idioma:inicio[^>]*-->.*?<!-- idioma:fin -->', re.S)
TOGGLE = ('<button aria-controls="main-nav" aria-expanded="false" class="menu-toggle" type="button">'
          '<span></span><span></span><span class="sr-only" data-i18n="menuOpen">Abrir menú</span></button>')
CTA_TEXT = '<a class="{cls}" data-i18n="menuCta" href="{href}">Solicitar orientación</a>'


def strip_comment(path) -> str:
    text = path.read_text(encoding='utf-8')
    return re.sub(r'^\s*<!--.*?-->\s*', '', text, count=1, flags=re.S).strip()


def menu_block(page: str, cta: str) -> str:
    body = fill(strip_comment(COMPONENT), page).replace('{cta}', cta)
    return START + '\n' + resolve_menu_routes(body, page) + '\n' + END


def resolve_menu_routes(markup: str, page: str) -> str:
    """Use an existing Spanish destination when a translated landing is absent."""
    language = prefixes(page)[0]
    if language == 'es':
        return markup
    parent = (ROOT / page).parent
    messages = {'en': 'Available in Spanish', 'pt': 'Disponível em espanhol', 'fr': 'Disponible en espagnol'}
    def resolve(match):
        tag = match.group(0)
        href = re.search(r'href="([^"]+)"', tag)
        if not href:
            return tag
        url = urlsplit(href.group(1))
        if url.scheme or url.netloc or not url.path:
            return tag
        destination = (parent / url.path).resolve()
        if not destination.suffix:
            destination /= 'index.html'
        if destination.is_file():
            return tag
        try:
            parts = destination.relative_to(ROOT.resolve()).parts
        except ValueError:
            return tag
        if not parts or parts[0] != language:
            return tag
        fallback = ROOT.joinpath(*parts[1:])
        if not fallback.is_file():
            return tag
        target = posixpath.relpath(fallback, parent)
        if url.query: target += '?' + url.query
        if url.fragment: target += '#' + url.fragment
        tag = tag.replace(href.group(0), 'href="' + target + '"', 1)
        return tag[:-1] + ' hreflang="es" title="' + messages[language] + '">'
    return re.sub(r'<a\b[^>]*>', resolve, markup)


def language_block(page: str) -> str:
    lang = prefixes(page)[0]
    body = translate_static(strip_comment(LANG_COMPONENT), lang)
    body = body.replace('<option lang="es" selected="" value="es">', '<option lang="es" value="es">')
    body = body.replace(f'<option lang="{lang}" value="{lang}">', f'<option lang="{lang}" selected="" value="{lang}">')
    return LANG_START + '\n' + body + '\n' + LANG_END


def add_language(html: str, page: str, anchor: re.Pattern) -> str:
    """Selector de idioma + scripts de traducción (landings y herramientas)."""
    root = prefixes(page)[1]
    if LANG_MARKED.search(html):
        html = LANG_MARKED.sub(lambda _: language_block(page), html, count=1)
    else:
        m = anchor.search(html)
        if not m:
            return html
        html = html[:m.end()] + '\n' + language_block(page) + html[m.end():]
    tag = re.search(r'<html\b[^>]*>', html).group(0)
    new_tag = tag
    if 'data-page-lang' not in new_tag:
        new_tag = new_tag[:-1] + ' data-page-lang="es">'
    if 'data-lang-urls' not in new_tag and 'data-i18n-partial' not in new_tag:
        new_tag = new_tag[:-1] + ' data-i18n-partial="">'
    html = html.replace(tag, new_tag, 1)
    scripts = ''.join(f'<script defer="" src="{root}{name}"></script>'
                      for name in ('config.js', 'i18n.js', 'site-chrome.js') if f'{root}{name}"' not in html)
    if scripts:
        cfg = re.search(r'<script defer="" src="' + re.escape(root) + r'config\.js"></script>', html)
        if cfg:
            html = html[:cfg.end()] + scripts + html[cfg.end():]
        else:
            html = html.replace('</head>', scripts + '</head>', 1)
    if 'site-chrome.css' not in html:
        html = html.replace('</head>', f'<link href="{root}site-chrome.css" rel="stylesheet"/></head>', 1)
    return html


def tool_page(html: str, page: str) -> str:
    """Herramientas LOPDP: logo limpio (sin texto repetido) y selector de idioma."""
    lang, root, site, _ = prefixes(page)
    html = re.sub(r'<header><div class="wrap"><a href="([^"]*)">[^<]*(<img [^>]*/>)</a>',
                  lambda m: f'<header class="tool-header"><div class="wrap"><a aria-label="TempoLegal, inicio" class="tool-brand" data-i18n-aria-label="home" href="{site}index.html">{m.group(2)}</a>',
                  html, count=1)
    html = re.sub(r'(<header class="tool-header"><div class="wrap">.*?</a>\s*<a )(href="[^"]*">Volver a protección de datos ↗</a>)',
                  r'\1data-i18n="toolBack" \2', html, count=1, flags=re.S)
    html = re.sub(r'<header class="tool-header">.*?</header>', lambda m: translate_static(m.group(0), lang), html, count=1, flags=re.S)
    return add_language(html, page, re.compile(r'<header class="tool-header"><div class="wrap">.*?</a>\s*<a [^>]*>[^<]*</a>', re.S))


def ensure_assets(html: str, root: str) -> str:
    add = ''
    if 'cabecera.css' not in html:
        add += f'<link href="{root}cabecera.css" rel="stylesheet"/>'
    if 'contraste.css' not in html and 'class="tl-header"' not in html and 'id="main-nav"' in html and 'data-home-review' not in html:
        add += f'<link href="{root}contraste.css" rel="stylesheet"/>'
    if 'site-header.js' not in html:
        add += f'<script defer="" src="{root}site-header.js"></script>'
    return html.replace('</head>', add + '</head>', 1) if add else html


def build(page: str) -> str:
    path = ROOT / page
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    html = raw.replace('\r\n', '\n')
    lang, root, site, home = prefixes(page)
    contact = f'{site}contactanos/'

    if '/herramientas-lopdp/' in '/' + page:
        html = tool_page(html, page)
        how = 'herramienta'
    elif MARKED.search(html):
        # Ya tiene el menú común: se conserva el botón de contacto que tuviera.
        current = MARKED.search(html).group(0)
        cta = re.search(r'(<(?:a|button)\b[^>]*(?:nav-cta|tl-nav-cta)[^>]*>.*?</(?:a|button)>)', current, re.S)
        cta = cta.group(1) if cta else ''
        if cta.startswith('<a') and 'data-i18n' not in cta:
            cta = cta.replace('>', ' data-i18n="menuCta">', 1)
        cta = translate_static(cta, lang)
        html = MARKED.sub(lambda _: menu_block(page, cta), html, count=1)
        how = 'actualizado'
    elif page in ('index.html', f'{lang}/index.html') and re.search(r'<nav\b[^>]*id="main-nav"', html):
        m = re.search(r'(<nav\b[^>]*id="main-nav"[^>]*>)(.*?)(</nav>)', html, re.S)
        cta = re.search(r'(<button\b[^>]*nav-cta[^>]*>.*?</button>)', m.group(2), re.S)
        cta = cta.group(1) if cta else translate_static(CTA_TEXT.format(cls='button button-outline nav-cta', href=contact), lang)
        html = html[:m.start(2)] + '\n' + menu_block(page, cta) + '\n' + html[m.end(2):]
        how = 'home'
    elif 'class="tl-header"' in html:
        m = re.search(r'(<nav\b[^>]*id="navigation"[^>]*>)(.*?)(</nav>)', html, re.S)
        if not m:
            return f'  OMITIDO     {page}: landing sin <nav id="navigation">'
        href = '#contacto' if 'id="contacto"' in html else contact
        cta = translate_static(CTA_TEXT.format(cls='tl-nav-cta', href=href), lang)
        html = html[:m.start(2)] + '\n' + menu_block(page, cta) + '\n' + html[m.end(2):]
        how = 'landing'
    else:
        head = re.search(r'<header class="site-header[^"]*"[^>]*>.*?</header>', html, re.S)
        if not head:
            return f'  OMITIDO     {page}: sin cabecera reconocible'
        block = head.group(0)
        cta = translate_static(CTA_TEXT.format(cls='button button-outline nav-cta', href=contact), lang)
        nav = translate_static('<nav aria-label="Navegación principal" data-i18n-aria-label="mainNav" id="main-nav">', lang)
        nav = f'{nav}\n{menu_block(page, cta)}\n</nav>'
        toggle = translate_static(TOGGLE, lang)
        new = re.sub(r'\s*<a class="[a-z]+-header-back"[^>]*>.*?</a>', '', block, count=1, flags=re.S)
        new = re.sub(r'\s*<nav[^>]*class="service-header-nav"[^>]*>.*?</nav>', '', new, count=1, flags=re.S)
        new = re.sub(r'(<a\b[^>]*class="brand"[^>]*>.*?</a>)', lambda mm: mm.group(1) + nav, new, count=1, flags=re.S)
        new = re.sub(r'(<div class="header-tools">.*?)(</div>)(\s*</div>\s*<div aria-hidden="true" class="reading-progress")',
                     lambda mm: mm.group(1) + toggle + mm.group(2) + mm.group(3), new, count=1, flags=re.S)
        if toggle not in new:
            new = new.replace('<div class="header-tools">', '<div class="header-tools">' + toggle, 1)
        new = new.replace('<header class="site-header', '<header data-common-toggle="" class="site-header', 1)
        html = html.replace(block, new, 1)
        how = 'secundaria'
    if 'class="tl-header"' in html:
        html = add_language(html, page, re.compile(r'<nav\b[^>]*id="navigation"[^>]*>.*?</nav>', re.S))
    html = ensure_assets(html, root)
    result = html.replace('\n', newline)
    if result != raw:
        path.write_bytes(result.encode('utf-8'))
        return f'  {how:<12}{page}'
    return f'  sin cambio  {page}'


def main() -> int:
    pages = sys.argv[1:] or all_pages()
    print(f'Menú común → {len(pages)} páginas')
    for page in pages:
        if not (ROOT / page).exists():
            print(f'  NO EXISTE   {page}')
            continue
        print(build(page))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
