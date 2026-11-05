#!/usr/bin/env python3
"""Tarea 1.6 · Ningún texto por debajo de 12 px.

Sube a 12 px cualquier font-size menor de 12 px en los CSS indicados:
  font-size:9px          -> font-size:12px
  font-size:clamp(10px,…) -> font-size:clamp(12px,…)   (el mínimo del clamp)
  font:600 9px/1.2 …     -> font:600 12px/1.2 …
Uso: python _tools/min-font.py            (CSS del sitio)
     python _tools/min-font.py archivo.css (solo ese)
También lo usa build-landings.py con el CSS de las maquetas.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIN = 12.0
FILES = ['styles.css', 'renewal.css', 'client-sections.css', 'presentation-refresh.css', 'practice-areas.css',
         'site-chrome.css', 'home-review.css', 'case-page.css', 'article-page.css', 'profile-page.css',
         'privacy.css', 'componentes.css', 'landing.css']

NUM = r'(\d+(?:\.\d+)?)px'


def bump(value: str) -> str:
    return '12px' if float(value) < MIN else value + 'px'


def fix_css(text: str) -> tuple[str, int]:
    count = 0

    def size(m: re.Match) -> str:
        nonlocal count
        prop, val = m.group(1), m.group(2)
        if float(val) < MIN:
            count += 1
            return f'{prop}12px'
        return m.group(0)
    text = re.sub(r'(font-size:\s*)' + NUM, size, text)

    def clamp(m: re.Match) -> str:
        nonlocal count
        if float(m.group(2)) < MIN:
            count += 1
            return f'{m.group(1)}12px'
        return m.group(0)
    text = re.sub(r'(font-size:\s*clamp\(\s*)' + NUM, clamp, text)
    text = re.sub(r'(font-size:\s*max\(\s*)' + NUM, clamp, text)

    def shorthand(m: re.Match) -> str:
        nonlocal count
        if float(m.group(2)) < MIN:
            count += 1
            return f'{m.group(1)}12px{m.group(3)}'
        return m.group(0)
    # font: [style] [weight] SIZE[/line-height] family
    text = re.sub(r'(font:\s*(?:(?:italic|normal|[1-9]00|bold)\s+)*)' + NUM + r'(\s*/|\s)', shorthand, text)
    text = re.sub(r'(font:\s*(?:(?:italic|normal|[1-9]00|bold)\s+)*clamp\(\s*)' + NUM + r'(,)', shorthand, text)
    return text, count


def main() -> int:
    targets = [Path(a) for a in sys.argv[1:]] or [ROOT / f for f in FILES]
    total = 0
    for path in targets:
        if not path.exists():
            continue
        raw = path.read_bytes().decode('utf-8')
        new, n = fix_css(raw)
        if n:
            path.write_bytes(new.encode('utf-8'))
        total += n
        print(f'  {n:>4}  {path.name}')
    print(f'Tamaños corregidos: {total}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
