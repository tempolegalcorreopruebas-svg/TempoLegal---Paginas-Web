#!/usr/bin/env python3
"""Versiones en inglés, portugués y francés de las páginas de Rubén (tarea 5.5):
las 8 landings de protección de datos y las 3 herramientas LOPDP.

Uso (desde la raíz del repositorio):
    python _tools/build-translations.py en          # genera en/… a partir del español
    python _tools/build-translations.py en pt fr

Cómo funciona:
- Los textos traducidos están en _traducciones/<idioma>.json ({"texto en español": "traducción"}).
  Si un texto cambia en español, ejecute _tools/extraer-textos.py <idioma> para ver qué falta.
- Copia cada página a <idioma>/<misma ruta>, traduce textos, atributos (alt, aria-label,
  title, placeholder, metadescripciones) y datos estructurados, y ajusta las rutas.
- Los enlaces apuntan a la versión del mismo idioma cuando existe.
- Pone canonical, hreflang, og:url, og:locale y data-lang-urls en todas las versiones y
  marca data-i18n-partial mientras falte algún idioma (aviso de traducción pendiente).
- Traduce los scripts de las landings y herramientas en assets/landings/*/<idioma>/.
- Actualiza sitemap.xml con las versiones de cada página y sus hreflang.
- Al final regenera menú, selector y pie de las páginas tocadas.
"""
from __future__ import annotations

import json
import posixpath
import re
import subprocess
import sys
from pathlib import Path

from traducir_comun import attr_values, norm, segments

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://tempolegal.com/'
LANGS = ('en', 'pt', 'fr')
LOCALES = {'es': 'es_EC', 'en': 'en_US', 'pt': 'pt_BR', 'fr': 'fr_FR'}
PAGES = ['proteccion-de-datos-personales-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/delegado-proteccion-datos-externo-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/implementacion-lopdp/index.html',
         'proteccion-de-datos-personales-ecuador/proteccion-datos-clinicas-salud-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/proteccion-datos-colegios-instituciones-educativas-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/proteccion-datos-logistica-transporte-comercio-exterior-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/proteccion-datos-sector-financiero-seguros-ecuador/index.html',
         'proteccion-de-datos-personales-ecuador/proteccion-datos-empresas-software-apps-ecuador/index.html',
         'herramientas-lopdp/diagnostico/index.html',
         'herramientas-lopdp/dpd/index.html',
         'herramientas-lopdp/multas/index.html']
PAGE_DIRS = {p[:-len('index.html')] for p in PAGES}
EXTERNAL = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|#|/)', re.I)


def load(lang: str) -> dict:
    return json.loads((ROOT / '_traducciones' / f'{lang}.json').read_text(encoding='utf-8'))


def translate_value(text: str, value):
    if isinstance(value, str):
        return value
    out = text
    for a, b in value:
        if b is not None:
            out = out.replace(a, b)
    return out


def translate_texts(html: str, words: dict, missing: set) -> str:
    for s, e in reversed(segments(html)):
        raw = html[s:e]
        key = norm(raw)
        if key in words:
            html = html[:s] + translate_value(key, words[key]) + html[e:]
        else:
            missing.add(key)
    for s, e in reversed(attr_values(html)):
        raw = html[s:e]
        if raw in words:
            html = html[:s] + translate_value(raw, words[raw]).replace('"', '&quot;') + html[e:]
        else:
            missing.add(raw)
    return html


def url_of(page: str, lang: str) -> str:
    path = page[:-len('index.html')] if page.endswith('index.html') else page
    return SITE + ('' if lang == 'es' else lang + '/') + path


def translated(target: str, lang: str) -> str | None:
    """Ruta de la versión en `lang` de un destino interno, si existe o se va a generar."""
    probe = target if not target.endswith('/') and not target == '' else target + 'index.html'
    if probe.endswith('/index.html') and probe[:-len('index.html')] in PAGE_DIRS:
        return lang + '/' + target
    if (ROOT / lang / probe).exists():
        return lang + '/' + target
    return None


def rewrite_urls(html: str, src: str, dest: str, lang: str) -> str:
    src_dir, dest_dir = posixpath.dirname(src), posixpath.dirname(dest)

    def fix(m: re.Match) -> str:
        attr, value = m.group(1), m.group(2)
        if not value or EXTERNAL.match(value):
            return m.group(0)
        path, sep, rest = split_query(value)
        target = posixpath.normpath(posixpath.join(src_dir, path))
        if target == '.':
            target = ''
        if path.endswith('/') and target:
            target += '/'
        new_target = target
        if attr == 'href':
            new_target = translated(target, lang) or target
        elif attr == 'src' and re.match(r'assets/landings/(?:js|herramientas-js)/[^/]+\.js$', target):
            copy = posixpath.join(posixpath.dirname(target), lang, posixpath.basename(target))
            if (ROOT / copy).exists():
                new_target = copy
        rel = posixpath.relpath(new_target.rstrip('/') or '.', dest_dir or '.')
        if new_target.endswith('/') and rel != '.':
            rel += '/'
        elif rel == '.':
            rel = './'
        return f'{attr}="{rel}{sep}{rest}"'

    return re.sub(r'\b(href|src)="([^"]*)"', fix, html)


def split_query(value: str):
    m = re.search(r'[?#]', value)
    return (value, '', '') if not m else (value[:m.start()], value[m.start()], value[m.start() + 1:])


def translate_jsonld(html: str, words: dict, lang: str) -> str:
    def walk(v, key=''):
        if isinstance(v, dict):
            return {k: walk(x, k) for k, x in v.items()}
        if isinstance(v, list):
            return [walk(x, key) for x in v]
        if isinstance(v, str):
            if v in words:
                return translate_value(v, words[v])
            if v.startswith(SITE):
                rest = v[len(SITE):]
                base = rest.split('#')[0]
                if base in PAGE_DIRS:
                    return SITE + lang + '/' + rest
            if key == 'inLanguage':
                return lang
        return v

    def block(m: re.Match) -> str:
        data = walk(json.loads(m.group(1)))
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'

    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', block, html, flags=re.S)


def lang_urls(page: str, current: str, langs: list[str]) -> dict:
    here = posixpath.dirname(page if current == 'es' else current + '/' + page)
    out = {}
    for lang in ['es', *langs]:
        target = posixpath.dirname(page if lang == 'es' else lang + '/' + page)
        rel = posixpath.relpath(target or '.', here or '.')
        out[lang] = './' if rel == '.' else rel + '/'
    return out


def set_head(html: str, page: str, lang: str, langs: list[str]) -> str:
    """Idioma, canonical, hreflang, Open Graph y data-lang-urls de una versión."""
    complete = set(langs) >= set(LANGS)
    tag = re.search(r'<html\b[^>]*>', html).group(0)
    attrs = re.sub(r'\s(?:lang|data-page-lang|data-lang-urls|data-i18n-partial)=("[^"]*"|\'[^\']*\')', '', tag[5:-1])
    urls = json.dumps(lang_urls(page, lang, langs), ensure_ascii=False)
    new_tag = f'<html{attrs} lang="{lang if lang != "es" else "es-EC"}" data-page-lang="{lang}" data-lang-urls=\'{urls}\'' + ('' if complete else ' data-i18n-partial=""') + '>'
    html = html.replace(tag, new_tag, 1)
    url = url_of(page, lang)
    html = re.sub(r'<link href="[^"]*" rel="canonical"/>', f'<link href="{url}" rel="canonical"/>', html, count=1)
    html = re.sub(r'<meta content="[^"]*" property="og:url"/>', f'<meta content="{url}" property="og:url"/>', html, count=1)
    html = re.sub(r'<meta content="[a-z]{2}_[A-Z]{2}" property="og:locale"/>', f'<meta content="{LOCALES[lang]}" property="og:locale"/>', html, count=1)
    html = re.sub(r'<meta content="[a-z]{2}_[A-Z]{2}" property="og:locale:alternate"/>', '', html)
    alt = ''.join(f'<meta content="{LOCALES[x]}" property="og:locale:alternate"/>' for x in ['es', *langs] if x != lang)
    html = html.replace(f'<meta content="{LOCALES[lang]}" property="og:locale"/>', f'<meta content="{LOCALES[lang]}" property="og:locale"/>' + alt, 1)
    if lang != 'es':
        html = html.replace('assets/og/og-es.jpg', f'assets/og/og-{lang}.jpg')
    html = re.sub(r'<link href="[^"]*" hreflang="[^"]*" rel="alternate"/>', '', html)
    links = ''.join(f'<link href="{url_of(page, x)}" hreflang="{x}" rel="alternate"/>' for x in ['es', *langs])
    links += f'<link href="{url_of(page, "es")}" hreflang="x-default" rel="alternate"/>'
    html = re.sub(r'(<link href="[^"]*" rel="canonical"/>)', lambda m: m.group(1) + links, html, count=1)
    return html


def translate_scripts(lang: str, js_pairs: list) -> None:
    files = set()
    for page in PAGES:
        html = (ROOT / page).read_text(encoding='utf-8')
        for src in re.findall(r'<script[^>]*src="([^"]*assets/landings/(?:js|herramientas-js)/[^"/]+\.js)"', html):
            files.add(posixpath.normpath(posixpath.join(posixpath.dirname(page), src)))
    for f in sorted(files):
        code = (ROOT / f).read_text(encoding='utf-8')
        out = code
        for a, b in js_pairs:
            out = out.replace(a, b)
        dest = ROOT / posixpath.dirname(f) / lang / posixpath.basename(f)
        if out != code:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(out, encoding='utf-8')
        elif dest.exists():
            dest.unlink()


def available_langs(page: str, extra: list[str]) -> list[str]:
    return [x for x in LANGS if x in extra or (ROOT / x / page).exists()]


def update_sitemap() -> None:
    path = ROOT / 'sitemap.xml'
    if not path.exists():
        return
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    xml = raw.replace('\r\n', '\n')
    for page in PAGES:
        langs = ['es', *[x for x in LANGS if (ROOT / x / page).exists()]]
        urls = {x: url_of(page, x) for x in langs}
        alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{x}" href="{u}"/>' for x, u in urls.items())
        alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{urls["es"]}"/>'
        for x, u in urls.items():
            block = f'  <url>\n    <loc>{u}</loc>{alts}\n  </url>'
            pattern = re.compile(r'  <url>\n    <loc>' + re.escape(u) + r'</loc>.*?</url>', re.S)
            if pattern.search(xml):
                xml = pattern.sub(lambda _: block, xml, count=1)
            else:
                xml = xml.replace('</urlset>', block + '\n</urlset>', 1)
    path.write_bytes(xml.replace('\n', newline).encode('utf-8'))


def main() -> int:
    targets = [x for x in sys.argv[1:] if x in LANGS] or ['en']
    touched = []
    for lang in targets:
        data = load(lang)
        words = {k: v for k, v in data.items() if not k.startswith('__')}
        translate_scripts(lang, data.get('__js__', []))
        missing: set = set()
        for page in PAGES:
            raw = (ROOT / page).read_bytes().decode('utf-8')
            newline = '\r\n' if '\r\n' in raw else '\n'
            html = raw.replace('\r\n', '\n')
            dest = f'{lang}/{page}'
            html = translate_texts(html, words, missing)
            html = translate_jsonld(html, words, lang)
            for a, b in data.get('__global__', []):
                html = html.replace(a, b)
            html = rewrite_urls(html, page, dest, lang)
            (ROOT / dest).parent.mkdir(parents=True, exist_ok=True)
            (ROOT / dest).write_bytes(html.replace('\n', newline).encode('utf-8'))
            touched.append(dest)
        print(f'{lang}: {len(PAGES)} páginas · textos sin traducción: {len(missing)}')
        for m in sorted(missing)[:40]:
            print('   ·', m[:110])
    # cabeceras de idioma en todas las versiones (español incluido)
    for page in PAGES:
        langs = available_langs(page, targets)
        for lang in ['es', *langs]:
            path = ROOT / (page if lang == 'es' else f'{lang}/{page}')
            raw = path.read_bytes().decode('utf-8')
            newline = '\r\n' if '\r\n' in raw else '\n'
            html = set_head(raw.replace('\r\n', '\n'), page, lang, langs)
            path.write_bytes(html.replace('\n', newline).encode('utf-8'))
            touched.append(path.relative_to(ROOT).as_posix())
    update_sitemap()
    pages = sorted(set(touched))
    tools = ROOT / '_tools'
    subprocess.run([sys.executable, str(tools / 'build-header.py'), *pages], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
    subprocess.run([sys.executable, str(tools / 'build-footer.py'), *[p for p in pages if 'herramientas-lopdp' not in p]], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
    print(f'Listo: {len(pages)} páginas actualizadas (menú, selector y pie regenerados).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
