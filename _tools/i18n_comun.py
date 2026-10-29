"""Utilidades compartidas por build-header.py y build-footer.py (tareas 1.2, 1.3 y 5.5).

- all_pages(): páginas en español y sus versiones en/, pt/, fr/.
- prefixes(page): idioma de la página y rutas {root} (raíz, para recursos),
  {site} (raíz del idioma, para enlaces) y {home} (portada del idioma).
- translate_static(html, lang): escribe ya traducidos los textos marcados con
  data-i18n / data-i18n-aria-label, usando los diccionarios de i18n.js. Así el
  menú y el pie se ven en el idioma de la página aunque JavaScript no cargue.
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('en', 'pt', 'fr')
SKIP_DIRS = {'assets', 'server', 'api', 'services_en', '_componentes', '_tools', '_herramientas',
             '_traducciones', 'node_modules', '.git'}
SKIP_FILES = {'404.html'}


def all_pages(include_tools: bool = True) -> list[str]:
    pages = []
    for path in sorted(ROOT.rglob('*.html')):
        rel = path.relative_to(ROOT)
        parts = rel.parts[1:] if rel.parts[0] in LANGS else rel.parts
        if not parts or parts[0] in SKIP_DIRS or rel.name in SKIP_FILES or rel.name.startswith('qa-'):
            continue
        if not include_tools and parts[0] == 'herramientas-lopdp':
            continue
        pages.append(rel.as_posix())
    return pages


def page_lang(page: str) -> str:
    first = page.split('/', 1)[0]
    return first if first in LANGS else 'es'


def prefixes(page: str) -> tuple[str, str, str, str]:
    lang = page_lang(page)
    root = '../' * page.count('/')
    site = root + ('' if lang == 'es' else lang + '/')
    is_home = page == 'index.html' or page == f'{lang}/index.html'
    home = '' if is_home else site + 'index.html'
    return lang, root, site, home


def fill(template: str, page: str) -> str:
    lang, root, site, home = prefixes(page)
    text = template.replace('href="{root}', 'href="{site}')
    text = text.replace('{site}', site).replace('{root}', root).replace('{home}', home)
    return translate_static(text, lang)


@lru_cache(maxsize=1)
def dictionaries() -> dict:
    source = (ROOT / 'i18n.js').read_text(encoding='utf-8').replace('\r\n', '\n')
    start = source.index('const dictionaries = ') + len('const dictionaries = ')
    end = source.index('\n};', start) + 2
    body = '\n'.join(line for line in source[start:end].split('\n') if not line.strip().startswith('//'))
    words = json.loads(body)
    for lang, extra in re.findall(r'Object\.assign\(dictionaries\.(\w+), (\{.*?\})\);', source):
        words[lang].update(json.loads(extra))
    return words


def translate_static(html: str, lang: str) -> str:
    if lang == 'es':
        return html
    words = dictionaries()[lang]

    def text(m: re.Match) -> str:
        value = words.get(m.group(3))
        return m.group(1) + value + m.group(5) if value else m.group(0)

    html = re.sub(r'(<(\w+)\b[^>]*\bdata-i18n="(\w+)"[^>]*>)([^<]*)(</\2>)', text, html)

    def attr(m: re.Match) -> str:
        tag, key = m.group(0), m.group(1)
        value = words.get(key)
        if not value:
            return tag
        return re.sub(r'(?<![-\w])aria-label="[^"]*"', 'aria-label="' + value.replace('"', '&quot;') + '"', tag, count=1)

    return re.sub(r'<[^>]*\bdata-i18n-aria-label="(\w+)"[^>]*>', attr, html)
