#!/usr/bin/env python3
"""Lista los textos de las páginas de Rubén que faltan por traducir (tarea 5.5).

Uso:  python _tools/extraer-textos.py en      → _traducciones/pendiente-en.json
Las traducciones hechas se guardan en _traducciones/en.json ({"español": "traducción"}).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from traducir_comun import attr_values, norm, segments

ROOT = Path(__file__).resolve().parents[1]
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


def jsonld_strings(html: str):
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        def walk(v, key=''):
            if isinstance(v, dict):
                for k, x in v.items():
                    yield from walk(x, k)
            elif isinstance(v, list):
                for x in v:
                    yield from walk(x, key)
            elif isinstance(v, str) and key in ('name', 'description', 'text', 'serviceType', 'headline', 'alternateName', 'areaServed') and re.search(r'[a-záéíóúñ]{3}', v) and not v.startswith('http'):
                yield v
        yield from walk(json.loads(block))


def main() -> int:
    lang = sys.argv[1] if len(sys.argv) > 1 else 'en'
    done_path = ROOT / '_traducciones' / f'{lang}.json'
    done = json.loads(done_path.read_text(encoding='utf-8')) if done_path.exists() else {}
    pending, seen = [], set()
    for page in PAGES:
        html = (ROOT / page).read_text(encoding='utf-8').replace('\r\n', '\n')
        texts = [norm(html[s:e]) for s, e in segments(html)] + [html[s:e] for s, e in attr_values(html)] + list(jsonld_strings(html))
        for t in texts:
            if t not in done and t not in seen:
                seen.add(t)
                pending.append(t)
    out = ROOT / '_traducciones' / f'pendiente-{lang}.json'
    out.write_text(json.dumps(pending, ensure_ascii=False, indent=0), encoding='utf-8')
    print(f'{len(pending)} textos pendientes · {sum(len(t.split()) for t in pending)} palabras → {out.name}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
