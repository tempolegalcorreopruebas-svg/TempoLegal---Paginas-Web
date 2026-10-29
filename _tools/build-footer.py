#!/usr/bin/env python3
"""Inserta el pie común (_componentes/pie.html) en las páginas en español.

Uso (desde la raíz del repositorio):
    python _tools/build-footer.py              # todas las páginas de la lista
    python _tools/build-footer.py caso-gma.html # solo las indicadas

- La primera vez sustituye el <footer class="site-footer"> que tenga la página.
- Después sustituye lo que haya entre los marcadores <!-- pie:inicio --> y <!-- pie:fin -->.
- {home} se cambia por "" en index.html y por "index.html" en el resto.
- Respeta los saltos de línea de cada archivo (CRLF o LF).

IMPORTANTE: build-articles.py, build-team-profiles.py y build-privacy.py
regeneran sus páginas con el pie antiguo. Si los ejecutáis, volved a
ejecutar este script después. Las versiones en/, fr/ y pt/ no se tocan
hasta decidir los idiomas (tarea 5.5).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / '_componentes' / 'pie.html'

PAGES = [
    'index.html',
    'article-biometrics.html',
    'article-data-breach.html',
    'article-data-protection-officer.html',
    'article-shareholder-agreements.html',
    'caso-asistanet.html',
    'caso-camara-comercio-exterior.html',
    'caso-gma.html',
    'caso-pazmino-narvaez.html',
    'caso-solca.html',
    'team-daniela-barahona.html',
    'team-emilie-donoso.html',
    'team-gabriel-calvopina.html',
    'team-juan-alberto-gomez.html',
    'politica-de-privacidad.html',
    'terminos-y-condiciones.html',
]

START = '<!-- pie:inicio · generado por _tools/build-footer.py desde _componentes/pie.html; no editar aquí -->'
END = '<!-- pie:fin -->'
MARKED = re.compile(r'<!-- pie:inicio[^>]*-->.*?<!-- pie:fin -->', re.S)
LEGACY = re.compile(r'<footer class="site-footer">.*?</footer>', re.S)


def component_html() -> str:
    text = COMPONENT.read_text(encoding='utf-8')
    text = re.sub(r'^\s*<!--.*?-->\s*', '', text, count=1, flags=re.S)  # quita el comentario de cabecera
    return text.strip()


def resolve_published(html: str, page_dir: str = '') -> str:
    """Tarea 4.2: si la página de destino ya existe en el repositorio, el enlace
    apunta a ella (ruta relativa) en lugar de a la sección de la Home."""
    import posixpath
    site = 'https://tempolegal.com/'

    def fix(m: re.Match) -> str:
        tag = m.group(0)
        url = re.search(r'data-url-publicacion="([^"]+)"', tag).group(1)
        if not url.startswith(site):
            return tag
        path, _, frag = url[len(site):].partition('#')
        if not path or not (ROOT / path / 'index.html').exists():
            return tag
        rel = posixpath.relpath(path, page_dir or '.').rstrip('/') + '/'
        return re.sub(r'href="[^"]*"', f'href="{rel}{"#" + frag if frag else ""}"', tag, count=1)
    return re.sub(r'<a\b[^>]*data-url-publicacion="[^"]+"[^>]*>', fix, html)


def build(page: str, footer: str) -> str:
    path = ROOT / page
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    home = '' if page == 'index.html' else 'index.html'
    block = START + '\n' + explicit_index(resolve_published(footer.replace('{home}', home))) + '\n' + END
    block = block.replace('\r\n', '\n').replace('\n', newline)
    if MARKED.search(raw):
        result, count = MARKED.subn(lambda _: block, raw, count=1)
        how = 'actualizado'
    else:
        result, count = LEGACY.subn(lambda _: block, raw, count=1)
        how = 'sustituido'
    if not count:
        return f'  OMITIDO  {page}: no tiene <footer class="site-footer"> ni marcadores'
    if result != raw:
        path.write_bytes(result.encode('utf-8'))
        return f'  {how:<12}{page}'
    return f'  sin cambio {page}'


def explicit_index(html: str) -> str:
    """Los enlaces internos a carpetas terminan en index.html para que funcionen
    también al abrir los archivos con doble clic (file://). En el servidor da igual."""
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r'(?:[a-z]+:|#|//)', url):
            return m.group(0)
        path, sep, frag = url.partition('#')
        if path == '' or not (path.endswith('/') or path in ('.', '..')):
            return m.group(0)
        path = (path.rstrip('/') + '/' if path not in ('./',) else '') + 'index.html'
        path = path.replace('./index.html', 'index.html') if path.startswith('./') else path
        return f'{attr}="{path}{sep}{frag}"'
    return re.sub(r'(href)="([^"]*)"', fix, html)


def main() -> int:
    footer = component_html()
    pages = sys.argv[1:] or PAGES
    print('Pie común →')
    for page in pages:
        if not (ROOT / page).exists():
            print(f'  NO EXISTE {page}')
            continue
        print(build(page, footer))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
