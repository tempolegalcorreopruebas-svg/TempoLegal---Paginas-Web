#!/usr/bin/env python3
"""Pie común (tareas 1.3, 4.2 y 5.5) en todas las páginas: español, en/, pt/ y fr/.

Uso (desde la raíz del repositorio):
    python _tools/build-footer.py                  # todas las páginas
    python _tools/build-footer.py services/soft-landing/index.html   # solo esas

- Fuente única: _componentes/pie.html. Por página se calculan {root} (recursos),
  {site} (enlaces del mismo idioma) y {home} (portada del idioma).
- En en/, pt/ y fr/ los textos con data-i18n se escriben ya traducidos (i18n.js).
- Sustituye lo que haya entre <!-- pie:inicio --> y <!-- pie:fin --> o, si la
  página aún no tiene marcadores, su <footer class="site-footer">.
- Respeta los saltos de línea de cada archivo (CRLF o LF).
- No toca las herramientas LOPDP (tienen su propio pie) ni 404.html.
- La navegación con doble clic la resuelve local-navigation.js.
"""
from __future__ import annotations

import re
import sys

from i18n_comun import ROOT, all_pages, fill

COMPONENT = ROOT / '_componentes' / 'pie.html'
START = '<!-- pie:inicio · generado por _tools/build-footer.py desde _componentes/pie.html; no editar aquí -->'
END = '<!-- pie:fin -->'
MARKED = re.compile(r'<!-- pie:inicio[^>]*-->.*?<!-- pie:fin -->', re.S)
LEGACY = re.compile(r'(?:<!-- pie común[^>]*-->\s*)?<footer class="site-footer"[^>]*>.*?</footer>', re.S)


def component_html() -> str:
    text = COMPONENT.read_text(encoding='utf-8')
    text = re.sub(r'^\s*<!--.*?-->\s*', '', text, count=1, flags=re.S)  # quita el comentario de cabecera
    return text.strip()


def build(page: str, footer: str) -> str:
    path = ROOT / page
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    block = (START + '\n' + fill(footer, page) + '\n' + END).replace('\r\n', '\n').replace('\n', newline)
    if MARKED.search(raw):
        result, count = MARKED.subn(lambda _: block, raw, count=1)
        how = 'actualizado'
    else:
        result, count = LEGACY.subn(lambda _: block, raw, count=1)
        how = 'sustituido'
    if not count:
        return f'  OMITIDO     {page}: no tiene <footer class="site-footer"> ni marcadores'
    if result != raw:
        path.write_bytes(result.encode('utf-8'))
        return f'  {how:<12}{page}'
    return f'  sin cambio  {page}'


def main() -> int:
    footer = component_html()
    pages = sys.argv[1:] or all_pages(include_tools=False)
    print(f'Pie común → {len(pages)} páginas')
    for page in pages:
        if not (ROOT / page).exists():
            print(f'  NO EXISTE   {page}')
            continue
        print(build(page, footer))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
