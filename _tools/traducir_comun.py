"""Segmentación de textos para traducir las landings de protección de datos y las
herramientas LOPDP (tarea 5.5). La usan _tools/extraer-textos.py y _tools/build-translations.py.

Un «segmento» es un tramo de texto con sus etiquetas en línea (a, strong, em, span, br…)
entre dos etiquetas de bloque. Se traduce entero, conservando las etiquetas.
"""
from __future__ import annotations

import re

TOKEN = re.compile(r'(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)', re.S)
INLINE = {'a', 'strong', 'em', 'b', 'i', 'span', 'br', 'small', 'sup', 'sub', 'abbr', 'code',
          'mark', 'u', 's', 'time', 'wbr', 'q', 'cite'}
SKIP_START = re.compile(r'<!-- (menu|pie|idioma):inicio')
ATTRS = ('alt', 'aria-label', 'title', 'placeholder')
META_NAMES = re.compile(r'(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"')
LETTERS = re.compile(r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}')


def norm(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def tag_name(tag: str) -> str:
    m = re.match(r'</?\s*([a-zA-Z0-9]+)', tag)
    return m.group(1).lower() if m else ''


def segments(html: str):
    """Devuelve una lista de (inicio, fin) de cada segmento traducible en html."""
    out, run_start, run_end, skip = [], None, None, None
    pos = 0
    tokens = []
    for m in TOKEN.finditer(html):
        if m.start() > pos:
            tokens.append(('text', pos, m.start()))
        tokens.append(('tag', m.start(), m.end()))
        pos = m.end()
    if pos < len(html):
        tokens.append(('text', pos, len(html)))

    def flush():
        nonlocal run_start, run_end
        if run_start is not None:
            chunk = html[run_start:run_end]
            if LETTERS.search(re.sub(r'<[^>]+>', ' ', chunk)):
                # recorta espacios y etiquetas sueltas de los bordes que no cierran dentro
                s, e = run_start, run_end
                while s < e and html[s].isspace():
                    s += 1
                while e > s and html[e - 1].isspace():
                    e -= 1
                out.append((s, e))
        run_start = run_end = None

    for kind, s, e in tokens:
        piece = html[s:e]
        if skip:
            if kind == 'tag' and piece.startswith(f'<!-- {skip}:fin'):
                skip = None
            continue
        if kind == 'tag':
            sm = SKIP_START.match(piece)
            if sm:
                flush()
                skip = sm.group(1)
                continue
            if piece.startswith('<!--') or piece.startswith('<script') or piece.startswith('<style'):
                flush()
                continue
            if tag_name(piece) in INLINE:
                if run_start is None:
                    run_start = s
                run_end = e
                continue
            flush()
        else:
            if run_start is None:
                if not piece.strip():
                    continue
                run_start = s
            run_end = e
    flush()
    fixed = []
    for s, e in out:
        s, e = trim(html, s, e)
        if s < e and balanced(html[s:e]) and LETTERS.search(re.sub(r'<[^>]+>', ' ', html[s:e])):
            fixed.append((s, e))
    return fixed


def trim(html: str, s: int, e: int) -> tuple[int, int]:
    """Quita de los bordes las etiquetas en línea que no abren o cierran dentro del tramo."""
    for _ in range(20):
        if balanced(html[s:e]):
            break
        chunk = html[s:e]
        open_tail = re.search(r'<(?!/)[^>]*[^/]>\s*$', chunk)
        close_head = re.match(r'\s*</[^>]+>', chunk)
        tail = re.search(r'</[a-zA-Z0-9]+>\s*$', chunk)
        head = re.match(r'\s*<(?!/)[^>]+>', chunk)
        if open_tail:
            e = s + open_tail.start()
        elif close_head:
            s = s + close_head.end()
        elif tail and _unmatched_close(chunk):
            e = s + tail.start()
        elif head:
            s = s + head.end()
        else:
            break
        while s < e and html[s].isspace():
            s += 1
        while e > s and html[e - 1].isspace():
            e -= 1
    return s, e


def _unmatched_close(chunk: str) -> bool:
    depth = 0
    for t in re.findall(r'<[^>]+>', chunk):
        name = tag_name(t)
        if name in ('br', 'wbr') or t.endswith('/>'):
            continue
        depth += -1 if t.startswith('</') else 1
        if depth < 0:
            return True
    return False


def balanced(chunk: str) -> bool:
    stack = []
    for t in re.findall(r'<[^>]+>', chunk):
        name = tag_name(t)
        if name in ('br', 'wbr') or t.endswith('/>'):
            continue
        if t.startswith('</'):
            if not stack or stack[-1] != name:
                return False
            stack.pop()
        else:
            stack.append(name)
    return not stack


def attr_values(html: str):
    """(inicio, fin) del valor de cada atributo de texto traducible."""
    out = []
    for m in re.finditer(r'<[a-zA-Z][^>]*>', html):
        tag = m.group(0)
        if tag.startswith('<script') or tag.startswith('<style'):
            continue
        names = ATTRS + (('content',) if tag.startswith('<meta') and META_NAMES.search(tag) else ())
        for name in names:
            for am in re.finditer(r'(?<![-\w])' + name + r'="([^"]*)"', tag):
                if LETTERS.search(am.group(1)):
                    out.append((m.start() + am.start(1), m.start() + am.end(1)))
    return out
