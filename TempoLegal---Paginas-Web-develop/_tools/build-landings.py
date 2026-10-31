#!/usr/bin/env python3
"""HISTÓRICO · NO EJECUTAR SOBRE LA VERSIÓN INTEGRADA (28/10/2026).

Este script generó la primera versión de las 8 landings de protección de datos
a partir de las maquetas (27/10/2026). Desde la integración con el trabajo de
Antony, las landings se mantienen editando su HTML; volver a generarlas borraría
local-navigation.js, el consentimiento de privacidad y otros ajustes integrados.
Para cabecera y pie usar _tools/build-header.py y _tools/build-footer.py.
Solo se ejecuta con --forzar.
"""
from __future__ import annotations
import sys as _sys
if __name__ == '__main__' and '--forzar' not in _sys.argv:
    print(__doc__)
    raise SystemExit(1)
if '--forzar' in _sys.argv:
    _sys.argv.remove('--forzar')

"""Construye las landings de protección de datos y las 3 herramientas LOPDP.

Uso (desde la raíz del repositorio):
    python _tools/build-landings.py "C:/ruta/a/ACTUALIZACION_DPD_DPO_HOME_2026-10-26"

Qué hace con cada maqueta (los TEXTOS no se tocan):
  - Crea la página en su URL definitiva, por ejemplo
    proteccion-de-datos-personales-ecuador/index.html
  - Sustituye la cabecera y el pie de la maqueta por los del sitio
    (pie: _componentes/pie.html).
  - Copia imágenes, CSS y JS a assets/landings/ (una sola copia compartida).
  - Cambia los enlaces entre maquetas por las URL reales (data-url-publicacion).
  - Prepara el hueco de la foto del equipo de informática (tarea 0.1).
  - Añade base.css, site-chrome.css y landing.css (capa visual común).
  - Mantiene noindex hasta la publicación (tarea 5.6).
Herramientas: una sola versión, desde 00_HERRAMIENTAS, en herramientas-lopdp/<nombre>/.
"""

import hashlib
import os
import posixpath
import re
import shutil
import sys
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://tempolegal.com/'

PAGES = [  # carpeta de la entrega, clave corta
    ('02_PROTECCION_DATOS', 'proteccion-datos'),
    ('03_DPD_EXTERNO', 'dpd-externo'),
    ('04_SALUD', 'salud'),
    ('05_EDUCACION', 'educacion'),
    ('06_IMPLEMENTACION', 'implementacion'),
    ('07_LOGISTICA_COMERCIO_EXTERIOR', 'logistica'),
    ('08_FINANCIERO_SEGUROS', 'financiero'),
    ('09_TECNOLOGIA', 'tecnologia'),
]
TOOLS = {'diagnostico': 'diagnostico.html', 'dpd': 'dpd.html', 'multas': 'multas.html'}
ASSETS_OUT = ROOT / 'assets' / 'landings'
DATA_HUB = 'proteccion-de-datos-personales-ecuador/'
# Destino provisional en la Home para páginas que todavía no existen en el repositorio (tarea 4.2).
PENDING_TARGETS = {
    'derecho-corporativo-societario-ecuador': 'servicio-corporate', 'constitucion-de-empresas-sas': 'servicio-incorporation',
    'holdings-estructuras-empresariales-ecuador': 'servicio-corporate', 'reformas-estatutos-cambios-societarios-ecuador': 'servicio-corporate',
    'asesoria-legal-mensual-empresas-ecuador': 'servicio-corporate', 'soft-landing-ecuador': 'servicio-foreign',
    'constituir-empresa-capital-extranjero-ecuador': 'servicio-foreign', 'sucursal-compania-extranjera-ecuador': 'servicio-foreign',
    'representacion-legal-fiscal-ecuador': 'servicio-foreign', 'servicios-contabilidad': 'servicio-accounting',
    'derecho-laboral-ecuador': 'servicio-employment', 'registro-de-marcas': 'servicio-ip',
    'tramites-notariales-y-societarios': 'servicio-notarial', 'sobre-nosotros': 'nosotros', 'contactanos': 'contacto',
}

warnings: list[str] = []

_spec = importlib.util.spec_from_file_location('min_font', Path(__file__).with_name('min-font.py'))
min_font = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(min_font)  # tarea 1.6: textos de al menos 12 px
_spec2 = importlib.util.spec_from_file_location('build_footer', Path(__file__).with_name('build-footer.py'))
build_footer = importlib.util.module_from_spec(_spec2)
_spec2.loader.exec_module(build_footer)


def rel(target: str, from_dir: str) -> str:
    """Ruta relativa limpia (con barra final para carpetas)."""
    frag = ''
    if '#' in target:
        target, frag = target.split('#', 1)
        frag = '#' + frag
    if target == '' and from_dir == '':
        return (frag or './')
    r = posixpath.relpath(target or '.', from_dir or '.')
    if target.endswith('/') or target == '':
        r = r.rstrip('/') + '/'
    if r in ('./', '.'):
        r = './'
    return r + frag


def prefix_for(page_dir: str) -> str:
    depth = len([p for p in page_dir.split('/') if p])
    return '../' * depth


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def copy_asset_tree(src: Path) -> None:
    for f in src.rglob('*'):
        if not f.is_file() or 'fonts' in f.relative_to(src).parts:
            continue  # las fuentes se usan desde assets/fonts del sitio
        dest = ASSETS_OUT / f.relative_to(src)
        if dest.exists():
            if file_hash(dest) != file_hash(f):
                warnings.append(f'Recurso con el mismo nombre y distinto contenido (se conserva el primero): {dest.relative_to(ROOT)}')
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, dest)


def copy_code(src: Path, kind: str) -> str:
    """Copia un CSS/JS de maqueta con nombre único por contenido. Devuelve ruta desde la raíz."""
    digest = file_hash(src)[:8]
    name = f'{src.stem}-{digest}{src.suffix}'
    dest = ASSETS_OUT / kind / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix == '.css':
        text = src.read_text(encoding='utf-8')
        text = re.sub(r"url\((['\"]?)assets/fonts/", r"url(\1../../fonts/", text)  # fuentes del sitio
        text = re.sub(r"url\((['\"]?)assets/", r"url(\1../", text)
        text = min_font.fix_css(text)[0]
        dest.write_text(text, encoding='utf-8')
    else:
        shutil.copy2(src, dest)
    return f'assets/landings/{kind}/{name}'


def header_html(p: str, page_dir: str) -> str:
    home = p or './'
    hub = rel(DATA_HUB, page_dir)
    dpd = rel(DATA_HUB + 'delegado-proteccion-datos-externo-ecuador/', page_dir)
    impl = rel(DATA_HUB + 'implementacion-lopdp/', page_dir)
    return f'''<header class="tl-header">
<div class="tl-header-inner">
<a class="tl-brand" href="{home}" aria-label="TempoLegal, inicio"><img src="{p}assets/site/tempo-legal-teal.svg" width="190" height="42" alt="TempoLegal"></a>
<nav id="navigation" class="tl-nav" aria-label="Navegación principal">
<a href="{home}#servicios">Servicios</a>
<a href="{hub}">Protección de datos</a>
<a href="{dpd}">Delegado DPD / DPO</a>
<a href="{impl}">Implementación LOPDP</a>
<a href="#equipo">Equipo</a>
<a class="tl-nav-cta" href="#contacto">Solicitar orientación</a>
</nav>
<button id="menu-button" class="menu menu-button tl-menu-toggle" type="button" aria-controls="navigation" aria-expanded="false"><span></span><span></span><span class="tl-sr">Abrir menú</span></button>
</div>
</header>'''


def footer_html(p: str, page_dir: str = '') -> str:
    text = (ROOT / '_componentes' / 'pie.html').read_text(encoding='utf-8')
    text = re.sub(r'^\s*<!--.*?-->\s*', '', text, count=1, flags=re.S)
    text = text.replace('{home}', p + 'index.html' if p else 'index.html')
    text = text.replace('src="assets/', f'src="{p}assets/')
    text = text.replace('href="politica-de-privacidad.html"', f'href="{p}politica-de-privacidad.html"')
    text = text.replace('href="terminos-y-condiciones.html"', f'href="{p}terminos-y-condiciones.html"')
    text = build_footer.resolve_published(text, page_dir)
    return '<!-- pie común: _componentes/pie.html -->\n' + text.strip()


IT_TEAM = '''<figure class="it-team-photo" data-it-team-photo>
<!-- FOTO DEL EQUIPO DE INFORMÁTICA (tarea 0.1): cuando llegue, guardarla en
     assets/team/equipo-informatica.webp y escribir en config.js
     technicalTeamPhoto: 'assets/team/equipo-informatica.webp' y technicalTeamNames.
     La página la carga sola; mientras tanto se ve este espacio reservado. -->
<div class="it-team-photo-frame" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><path d="M8 38c2-7 8-10 16-10s14 3 16 10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="17" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="21" r="5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="37" cy="21" r="5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></div>
<figcaption class="it-team-names" hidden></figcaption>
</figure>'''


def transform(html: str, page_dir: str, built: set[str], css_map: dict[str, str]) -> str:
    p = prefix_for(page_dir)
    html = re.sub(r'<div class="revision-date"[^>]*>.*?</div>', '', html, flags=re.S)
    html = re.sub(r'<div class="(?:review|reviewbar)">.*?</div>', '', html, flags=re.S)  # barras de "maqueta de revisión"
    # Cabecera y pie del sitio
    html, n = re.subn(r'<header\b[^>]*>.*?</header>', lambda _: header_html(p, page_dir), html, count=1, flags=re.S)
    if not n:
        warnings.append(f'{page_dir}: sin <header>')
    html, n = re.subn(r'<footer class="footer">.*?</footer>', lambda _: footer_html(p, page_dir), html, count=1, flags=re.S)
    if not n:
        warnings.append(f'{page_dir}: sin <footer class="footer">')
    # Equipo de informática: hueco preparado para la foto
    html = re.sub(r'<div class="portrait-pending group-photo">.*?</div>', IT_TEAM, html, flags=re.S)
    html = re.sub(r'<p class="pending-label">.*?</p>', '', html, flags=re.S)
    # Enlaces con destino de publicación
    def fix_link(m: re.Match) -> str:
        tag = m.group(0)
        url = re.search(r'data-url-publicacion="([^"]+)"', tag).group(1)
        if not url.startswith(SITE):
            return tag
        path = url[len(SITE):]
        target = path.split('#')[0]
        if target and not (ROOT / target / 'index.html').exists():
            # Página aún no construida (p. ej. las de Antony): se abre ese servicio en la Home.
            anchor = PENDING_TARGETS.get(target.strip('/'), 'servicios')
            new = (p or '') + 'index.html#' + anchor
        else:
            new = rel(path, page_dir) if target else (p or './') + ('#' + path.split('#', 1)[1] if '#' in path else '')
        return re.sub(r'href="[^"]*"', f'href="{new}"', tag, count=1)
    html = re.sub(r'<a\b[^>]*data-url-publicacion="[^"]+"[^>]*>', fix_link, html)
    # Enlaces sueltos a las herramientas de la maqueta (diagnostico.html, herramientas/dpd.html…)
    html = re.sub(r'href="(?:herramientas/)?(diagnostico|dpd|multas)\.html(#[^"]*)?"',
                  lambda m: f'href="{p}herramientas-lopdp/{m.group(1)}/index.html{m.group(2) or ""}"', html)
    # Enlaces absolutos del sitio que ya existen en el repositorio
    html = html.replace('href="https://tempolegal.com/politica-de-privacidad/"', f'href="{p}politica-de-privacidad.html"')
    # Recursos de la maqueta
    for old, new in css_map.items():
        html = re.sub(r'(href|src)="' + re.escape(old) + r'(\?[^"]*)?"', lambda m, new=new: f'{m.group(1)}="{p}{new}"', html)
    html = re.sub(r'(src|href|srcset|data-src|poster)="assets/', lambda m: f'{m.group(1)}="{p}assets/landings/', html)
    html = html.replace('url(assets/', f'url({p}assets/landings/').replace("url('assets/", f"url('{p}assets/landings/")
    # Capa común
    head_add = (f'<link rel="stylesheet" href="{p}site-chrome.css">'
                f'<link rel="stylesheet" href="{p}landing.css">'
                f'<script src="{p}config.js" defer></script><script src="{p}landing.js" defer></script>')
    html = html.replace('</head>', head_add + '</head>', 1)
    html = re.sub(r'(<meta name="viewport"[^>]*>)', lambda m: m.group(1) + f'<link rel="stylesheet" href="{p}base.css">', html, count=1)
    html = re.sub(r'<link rel="icon"[^>]*>', f'<link rel="icon" href="{p}assets/favicon.svg" type="image/svg+xml">', html, count=1)
    html = re.sub(r'<link rel="preload" href="assets/landings/fonts/([^"]+)"', lambda m: f'<link rel="preload" href="{p}assets/fonts/{m.group(1)}"', html)
    html = html.replace(f'href="{p}assets/landings/fonts/', f'href="{p}assets/fonts/')
    html = html.replace('<body>', '<body class="landing">', 1)
    # Restos de rutas de maqueta
    for leftover in re.findall(r'href="([^"]*maqueta/[^"]*)"', html):
        warnings.append(f'{page_dir}: enlace de maqueta sin URL de publicación → {leftover}')
    return html


def add_social_meta(html: str) -> str:
    """Tarea 4.3: Open Graph y Twitter a partir del title, description y canonical de la página."""
    has_og = 'property="og:title"' in html
    if has_og and 'name="twitter:card"' in html:
        return html
    import html as htmlmod
    title = re.search(r'<title>(.*?)</title>', html, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    canon = re.search(r'<link rel="canonical" href="([^"]+)"[^>]*>', html)
    if not (title and desc and canon):
        warnings.append('Sin title, description o canonical: no se añadieron etiquetas sociales')
        return html
    t = htmlmod.escape(htmlmod.unescape(title.group(1).strip()), quote=True)
    d = desc.group(1)
    image = SITE + 'assets/og/og-es.jpg'
    tags = (f'<meta property="og:type" content="website"><meta property="og:site_name" content="Tempo Legal">'
            f'<meta property="og:locale" content="es_EC"><meta property="og:title" content="{t}">'
            f'<meta property="og:description" content="{d}"><meta property="og:url" content="{canon.group(1)}">'
            f'<meta property="og:image" content="{image}"><meta property="og:image:width" content="1200">'
            f'<meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{d}">'
            f'<meta name="twitter:image" content="{image}">')
    if has_og:  # ya trae Open Graph: solo se añaden las de Twitter
        tags = tags[tags.index('<meta name="twitter:card"'):]
    return html.replace(canon.group(0), canon.group(0) + tags, 1)


def build_tools(src_root: Path) -> list[str]:
    tools_src = src_root / '00_HERRAMIENTAS'
    out = []
    shared = {}
    for name in ('herramientas.css', 'comun.js', 'motor.js', 'diagnostico.js', 'dpd-gran-escala.js', 'multas.js'):
        kind = 'css' if name.endswith('.css') else 'js'
        shared[name] = copy_code(tools_src / name, 'herramientas-' + kind)
    for slug, file in TOOLS.items():
        page_dir = f'herramientas-lopdp/{slug}/'
        p = prefix_for(page_dir)
        html = (tools_src / file).read_text(encoding='utf-8')
        for name, path in shared.items():
            html = re.sub(r'(href|src)="' + re.escape(name) + r'"', lambda m, path=path: f'{m.group(1)}="{p}{path}"', html)
        for other, other_file in TOOLS.items():
            html = html.replace(f'href="{other_file}"', f'href="{rel("herramientas-lopdp/" + other + "/", page_dir)}"')
        html = re.sub(r'href="\.\./02_PROTECCION_DATOS/[^"]*maqueta/index\.html(#[^"]*)?"', lambda m: f'href="{rel(DATA_HUB, page_dir)}{m.group(1) or ""}"', html)
        html = html.replace('href="https://tempolegal.com/politica-de-privacidad/"', f'href="{p}politica-de-privacidad.html"')
        html = re.sub(r'(src|href)="assets/', lambda m: f'{m.group(1)}="{p}assets/landings/', html)
        html = html.replace('</head>', f'<link rel="stylesheet" href="{p}base.css"><link rel="stylesheet" href="{p}landing.css"></head>', 1)
        html = html.replace('<body>', '<body class="landing tool-page">', 1)
        html = explicit_index(html)
        dest = ROOT / page_dir / 'index.html'
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding='utf-8')
        out.append(page_dir)
    if (tools_src / 'assets').exists():
        copy_asset_tree(tools_src / 'assets')
    return out


def prune_unused(page_dirs: list[str]) -> int:
    """Borra de assets/landings lo que ninguna página, CSS o JS generado usa."""
    texts = []
    for d in page_dirs:
        texts.append((ROOT / d / 'index.html').read_text(encoding='utf-8'))
    for f in ASSETS_OUT.rglob('*'):
        if f.suffix in ('.css', '.js'):
            texts.append(f.read_text(encoding='utf-8'))
    blob = '\n'.join(texts)
    removed = 0
    for f in sorted(ASSETS_OUT.rglob('*')):
        if f.is_file() and f.suffix not in ('.css', '.js') and f.name not in blob:
            f.unlink()
            removed += 1
    for d in sorted(ASSETS_OUT.rglob('*'), reverse=True):
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()
    return removed


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
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src_root = Path(sys.argv[1])
    sources = []
    for folder, key in PAGES:
        maq = next((src_root / folder).glob('*/maqueta/index.html'), None)
        if not maq:
            warnings.append(f'No encuentro la maqueta de {folder}')
            continue
        html = maq.read_text(encoding='utf-8')
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html).group(1)
        sources.append((key, maq.parent, canonical[len(SITE):], html))
    if ASSETS_OUT.exists():
        shutil.rmtree(ASSETS_OUT)  # se regenera completo en cada ejecución
    built = {page_dir for _, _, page_dir, _ in sources}
    for slug in TOOLS:
        (ROOT / 'herramientas-lopdp' / slug).mkdir(parents=True, exist_ok=True)
        (ROOT / 'herramientas-lopdp' / slug / 'index.html').touch()
    for _, _, page_dir, _ in sources:  # que existan todas antes de resolver los enlaces del pie
        (ROOT / page_dir).mkdir(parents=True, exist_ok=True)
        (ROOT / page_dir / 'index.html').touch()
    print('Landings →')
    for key, maq_dir, page_dir, html in sources:
        copy_asset_tree(maq_dir / 'assets')
        css_map = {}
        for f in sorted(maq_dir.glob('*.css')) + sorted(maq_dir.glob('*.js')):
            css_map[f.name] = copy_code(f, 'css' if f.suffix == '.css' else 'js')
        out = transform(html, page_dir, built, css_map)
        out = add_social_meta(out)
        out = explicit_index(out)
        out = out.replace('<body class="landing">', f'<body class="landing landing-{key}">', 1)
        dest = ROOT / page_dir / 'index.html'
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(out, encoding='utf-8')
        print(f'  {page_dir}index.html')
    print('Herramientas →')
    tool_dirs = build_tools(src_root)
    for page_dir in tool_dirs:
        print(f'  {page_dir}index.html')
    removed = prune_unused([d for _, _, d, _ in sources] + tool_dirs)
    print(f'Recursos sin uso eliminados de assets/landings: {removed}')
    if warnings:
        print('Avisos:')
        for w in dict.fromkeys(warnings):
            print('  - ' + w)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
