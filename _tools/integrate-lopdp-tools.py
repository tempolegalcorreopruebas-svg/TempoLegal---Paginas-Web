#!/usr/bin/env python3
"""Integrate the approved standalone tools without importing site or Divi styles."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit, urlunsplit
import json
import posixpath
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '_tools/lopdp/source'
TOOLS = [
    ('multas', 'calculadora-multas-lopdp', '2026-10-30-CALCULADORA-MULTAS-LOPDP-V22.html', 'V22', 'Calculadora de multas LOPDP', 'Estime su exposición a multas LOPDP mediante las preguntas y los criterios de esta herramienta de orientación.'),
    ('dpd', 'calculadora-delegado-lopdp', '2026-10-30-CALCULADORA-DELEGADO-LOPDP-V3.html', 'V3', 'Calculadora de Delegado LOPDP', 'Explore si su organización necesita nombrar un Delegado de Protección de Datos y qué aspectos revisar con un abogado.'),
    ('diagnostico', 'diagnostico-lopdp', '2026-10-30-DIAGNOSTICO-LOPDP-TEMPOLEGAL-V3.html', 'V3', 'Diagnóstico LOPDP', 'Identifique prioridades de protección de datos personales para su organización mediante un diagnóstico orientativo.'),
]
WORDS = {
    'es': ['Calculadora de multas', 'Calculadora de Delegado', 'Diagnóstico gratuito', 'Herramientas LOPDP', 'Estimación referencial · no es asesoría legal'],
    'en': ['Fine calculator (Spanish)', 'DPO calculator (Spanish)', 'Free assessment (Spanish)', 'LOPDP tools · available in Spanish', 'Indicative assessment · not legal advice'],
    'pt': ['Calculadora de multas (espanhol)', 'Calculadora de DPD (espanhol)', 'Diagnóstico gratuito (espanhol)', 'Ferramentas LOPDP · disponíveis em espanhol', 'Estimativa indicativa · não é assessoria jurídica'],
    'fr': ['Calculateur des amendes (espagnol)', 'Calculateur DPD (espagnol)', 'Diagnostic gratuit (espagnol)', 'Outils LOPDP · disponibles en espagnol', 'Estimation indicative · ne constitue pas un conseil juridique'],
}
KEYS = ['menuFineCalculator', 'menuDpoCalculator', 'menuDiagnostic']
LOCAL_PREVIEW = '''<script>
// Resolve standalone file previews without changing production URLs or form logic.
(() => {
  if (location.protocol !== 'file:') return;
  const update = link => {
    const value = link.getAttribute('href');
    if (!value || value.startsWith('#')) return;
    try {
      const url = new window.URL(value, document.baseURI);
      if (url.protocol === 'file:' && url.pathname.endsWith('/')) {
        url.pathname += 'index.html';
        link.href = url.href;
      }
    } catch (_) {}
  };
  const scan = node => {
    if (node.nodeType !== 1 && node.nodeType !== 9) return;
    if (node.matches?.('a[href]')) update(node);
    node.querySelectorAll('a[href]').forEach(update);
  };
  scan(document);
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'childList') record.addedNodes.forEach(scan);
    else update(record.target);
  })).observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['href']});
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (link) update(link);
  }, true);
})();
</script>'''

def language(page):
    return page.parts[0] if page.parts[0] in ('en', 'pt', 'fr') else 'es'

def relative(page, destination):
    return posixpath.relpath(destination or '.', page.parent.as_posix()) + '/'

def target(slug):
    return 'herramientas/' + slug

def endpoint_from(text):
    found = re.search(r'(?:LEAD_ENDPOINT\s*:\s*|endpoint\s*:\s*)[\"\']([^\"\']*)', text)
    return found.group(1) if found else ''

def build_tools():
    endpoints = {endpoint_from((ROOT / target(t[1]) / 'index.html').read_text()) for t in TOOLS if (ROOT / target(t[1]) / 'index.html').exists()}
    endpoints.discard('')
    if len(endpoints) > 1:
        raise SystemExit('Conflicting tool endpoints. Resolve configuration before rebuilding.')
    endpoint = next(iter(endpoints), '')
    for _, slug, filename, version, title, description in TOOLS:
        page = Path(target(slug)) / 'index.html'
        html = (SOURCE / filename).read_text(encoding='utf-8')
        # Escaped closing tags keep live-preview injectors out of the HTML download template.
        # JavaScript evaluates these escapes to the same exported document bytes.
        html = html.replace('</body></html>`', '<\\/body><\\/html>`')
        # Approved algorithms, questions, prices, styling and result templates stay intact.
        # Route only same-domain destinations that actually exist in this project.
        def local_link(match):
            raw = match.group(0)
            parsed = urlsplit(raw)
            path = parsed.path.lstrip('/')
            exists = ROOT / path
            if not exists.suffix:
                exists /= 'index.html'
            if not exists.is_file() and path.rstrip('/') not in {target(t[1]) for t in TOOLS}:
                return raw
            local = relative(page, path.rstrip('/')) if not Path(path).suffix else posixpath.relpath(path, page.parent.as_posix())
            return urlunsplit(('', '', local, parsed.query, parsed.fragment))
        html = re.sub(r'https://tempolegal\.com(?:/[^\s\"\'<>`}]*)?', local_link, html)
        canonical = 'https://tempolegal.com/' + target(slug) + '/'
        metadata = '\n<link rel="canonical" href="' + canonical + '">\n<meta name="robots" content="noindex,follow,max-image-preview:large">\n'
        if not re.search(r'<meta\b[^>]*name="description"', html):
            metadata += '<meta name="description" content="' + escape(description, quote=True) + '">\n'
        html = html.replace('</head>', metadata + '</head>', 1)
        body_end = html.rfind('</body>')
        html = html[:body_end] + LOCAL_PREVIEW + '\n' + html[body_end:]
        # An unconfigured endpoint must not expose contact details through console diagnostics.
        html = html.replace('Este lead NO se guardó en ningún lado.",p);', 'Este lead NO se guardó en ningún lado.");')
        if endpoint:
            html = re.sub(r'(LEAD_ENDPOINT\s*:\s*|endpoint\s*:\s*)([\"\'])([\"\'])', lambda m:m[1]+m[2]+endpoint+m[3], html, count=1)
        output = ROOT / page
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(html, encoding='utf-8')
    return endpoint

def redirect_page(old, slug, lang):
    page = Path(old)
    href = relative(page, target(slug)) + 'index.html'
    title = 'Herramienta LOPDP actualizada' if lang == 'es' else 'Updated LOPDP tool · Spanish'
    html = f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | TempoLegal</title><meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://tempolegal.com/{target(slug)}/">
<meta http-equiv="refresh" content="0;url={href}">
<script>location.replace({json.dumps(href)} + location.search + location.hash);</script>
</head><body><p><a href="{href}">{title} →</a></p></body></html>
'''
    (ROOT / page).write_text(html, encoding='utf-8')

def menu_links(page, lang):
    links = []
    for index, (_, slug, *_rest) in enumerate(TOOLS):
        attrs = ' hreflang="es"' + (' lang="es"' if lang == 'es' else '')
        links.append(f'<a href="{relative(page, target(slug))}" data-i18n="{KEYS[index]}"{attrs}>{WORDS[lang][index]}</a>')
    return '\n'.join(links)

def update_pages():
    pages = []
    for path in sorted(ROOT.rglob('*.html')):
        page = path.relative_to(ROOT)
        if any(part in ('assets', '_tools', '_componentes', 'server') for part in page.parts):
            continue
        if 'herramientas' in page.parts or 'herramientas-lopdp' in page.parts or page.name.startswith('qa-'):
            continue
        html = path.read_text(encoding='utf-8')
        before = html
        lang = language(page)
        # Preserve surrounding menus; expand just the existing diagnostic entry.
        if 'data-i18n="menuFineCalculator"' not in html:
            html = re.sub(r'<a\b[^>]*data-i18n="menuDiagnostic"[^>]*>.*?</a>', lambda _:menu_links(page, lang), html, flags=re.S)
        def replace_old_link(match):
            tag = match[0]
            href = re.search(r'href="([^"]+)"', tag)
            if not href: return tag
            url = urlsplit(href[1])
            old = re.search(r'(?:^|/)herramientas-lopdp/(multas|dpd|diagnostico)(?:/|$)', url.path)
            if not old: return tag
            slug = next(t[1] for t in TOOLS if t[0] == old[1])
            updated = urlunsplit(('', '', relative(page, target(slug)), url.query, url.fragment))
            tag = tag.replace(href[0], 'href="'+updated+'"', 1)
            if lang != 'es' and 'hreflang=' not in tag:
                tag = tag[:-1] + ' hreflang="es" title="' + WORDS[lang][3] + '">'
            return tag
        html = re.sub(r'<a\b[^>]*>', replace_old_link, html)
        for old, slug, *_ in TOOLS:
            html = html.replace('https://tempolegal.com/herramientas-lopdp/'+old+'/', 'https://tempolegal.com/'+target(slug)+'/')
        html = html.replace('Ver las diez preguntas posteriores', 'Realizar el diagnóstico LOPDP')
        # Relevant articles gain a compact set of direct tools, without changing their prose.
        is_article = page.name in ('article-biometrics.html', 'article-data-breach.html', 'article-data-protection-officer.html') or 'dpd-obligatorio-ecuador-2026-criterios-spdp' in page.parts
        if is_article and '<main' in html and 'id="lopdp-tools"' not in html:
            links = ''.join('<li><a href="'+relative(page,target(t[1]))+'" hreflang="es">'+WORDS[lang][i]+' <span aria-hidden="true">↗</span></a></li>' for i,t in enumerate(TOOLS))
            section = '<section class="lopdp-tool-links" id="lopdp-tools" aria-labelledby="lopdp-tools-title"><div class="lopdp-tool-links-inner"><h2 id="lopdp-tools-title">'+WORDS[lang][3]+'</h2><ul>'+links+'</ul><p>'+WORDS[lang][4]+'</p></div></section>\n'
            html = html.replace('</main>',section+'</main>',1)
            root = '../' * (len(page.parts)-1)
            html = html.replace('</head>',f'<link rel="stylesheet" href="{root}lopdp-tool-links.css"></head>',1)
        if html != before:
            path.write_text(html, encoding='utf-8')
            pages.append(page.as_posix())
    return pages

def update_menu_source():
    path = ROOT / '_componentes/cabecera.html'
    text = path.read_text()
    if 'data-i18n="menuFineCalculator"' not in text:
        links = '\n'.join(f'<a href="{{root}}{target(t[1])}/" data-i18n="{KEYS[i]}" hreflang="es">{WORDS["es"][i]}</a>' for i,t in enumerate(TOOLS))
        text = re.sub(r'<a\b[^>]*data-i18n="menuDiagnostic"[^>]*>.*?</a>',lambda _:links,text,flags=re.S)
        path.write_text(text)
    path = ROOT / 'i18n.js'
    text = path.read_text()
    for lang, words in WORDS.items():
        # Override this existing entry in each dictionary, preserving all other keys/comments.
        start = text.index('"'+lang+'": {')
        next_language = re.search(r'\n  "(?:es|en|pt|fr)": \{', text[start+1:])
        section_end = start+1+next_language.start() if next_language else text.index('\n};', start)
        has_keys = '"menuFineCalculator":' in text[start:section_end]
        end = text.index('"menuDiagnostic":',start)
        end = text.index('\n',end)
        fragment = text[start:end]
        fragment = re.sub(r'"menuDiagnostic":\s*"[^"]*"', '"menuDiagnostic": '+json.dumps(words[2],ensure_ascii=False),fragment)
        if not has_keys:
            fragment += '\n    "menuFineCalculator": '+json.dumps(words[0],ensure_ascii=False)+',\n    "menuDpoCalculator": '+json.dumps(words[1],ensure_ascii=False)+','
        text = text[:start]+fragment+text[end:]
    path.write_text(text)

def update_metadata():
    manifest = ROOT / 'lopdp-tools-manifest.json'
    data = {'sourceDate':'2026-10-30','language':'es','standalone':True,'publicationStatus':'staging','tools':[]}
    for old, slug, filename, version, title, description in TOOLS:
        data['tools'].append({'sourceFile':filename,'version':version,'file':target(slug)+'/index.html','canonical':'https://tempolegal.com/'+target(slug)+'/','legacyRoutes':['/herramientas-lopdp/'+old+'/', '/en/herramientas-lopdp/'+old+'/']})
    manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    path = ROOT / 'redirect-map.json'
    redirects = json.loads(path.read_text())
    for old, slug, *_ in TOOLS:
        for prefix in ('','en/'):
            src = '/'+prefix+'herramientas-lopdp/'+old+'/'
            redirects = [r for r in redirects if r['source'] != src]
            redirects.append({'source':src,'destination':'/'+target(slug)+'/','status':301})
            redirect_page(prefix+'herramientas-lopdp/'+old+'/index.html',slug,'en' if prefix else 'es')
    path.write_text(json.dumps(redirects,ensure_ascii=False,indent=2)+'\n')
    path = ROOT / '.htaccess'
    text = path.read_text()
    rules = '\n'.join('RewriteRule ^'+re.escape(r['source'].strip('/'))+'/(?:index\\.html)?$ '+r['destination']+' [R=301,L,NE]' for r in redirects if '/herramientas-lopdp/' in r['source'])
    start, end = '# BEGIN approved LOPDP tool routes', '# END approved LOPDP tool routes'
    block = start+'\n'+rules+'\n'+end
    if start in text: text = re.sub(re.escape(start)+'.*?'+re.escape(end),lambda _:block,text,flags=re.S)
    else: text = text.replace('RewriteEngine On','RewriteEngine On\n'+block,1)
    path.write_text(text)
    path = ROOT / 'sitemap.xml'
    text = path.read_text()
    text = re.sub(r'\s*<url>\s*<loc>[^<]*/herramientas-lopdp/[^<]*</loc>.*?</url>', '', text, flags=re.S)
    for _,slug,*_ in TOOLS:
        url = 'https://tempolegal.com/'+target(slug)+'/'
        if '<loc>'+url+'</loc>' not in text: text=text.replace('</urlset>',f'  <url><loc>{url}</loc></url>\n</urlset>')
    path.write_text(text)
    path = ROOT / 'seo-inventory.json'
    inventory = json.loads(path.read_text())
    inventory = [i for i in inventory if 'herramientas-lopdp/' not in i['file'] and not i['file'].startswith('herramientas/')]
    for _,slug,_file,_version,title,description in TOOLS:
        html = (ROOT/target(slug)/'index.html').read_text()
        actual_title = re.search(r'<title>(.*?)</title>',html,re.S).group(1)
        actual_description = re.search(r'<meta name="description" content="([^"]*)"',html).group(1)
        inventory.append({'file':target(slug)+'/index.html','language':'es','canonical':'https://tempolegal.com/'+target(slug)+'/','title':actual_title,'description':actual_description,'robots':'noindex,follow,max-image-preview:large','alternates':{},'types':[]})
    path.write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n')

def main():
    endpoint = build_tools()
    update_menu_source()
    pages = update_pages()
    update_metadata()
    print(json.dumps({'updatedPages':pages,'leadEndpointConfigured':bool(endpoint),'tools':3},ensure_ascii=False,indent=2))

if __name__ == '__main__':
    main()
