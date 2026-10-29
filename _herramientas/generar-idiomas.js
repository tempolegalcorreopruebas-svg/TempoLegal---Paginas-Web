'use strict';
/*
  Generador de páginas por idioma y metadatos SEO de TempoLegal.

  Qué hace:
  1. Toma las páginas en español de la raíz (index.html, politica-de-privacidad.html y los tres casos).
  2. Crea las versiones fijas en en/, pt/ y fr/ con todos los textos ya traducidos en el HTML.
  3. Escribe en cada página (también en las de español): título, descripción, canonical, hreflang,
     Open Graph, Twitter y datos estructurados (JSON-LD).
  4. Genera sitemap.xml, robots.txt y las imágenes para compartir en redes (assets/og/).

  Cuándo usarlo: cada vez que cambies textos en content.js, i18n.js, privacy-content.js o el HTML.

  Cómo usarlo (una sola vez: npm install playwright && npx playwright install chromium):
      node _herramientas/generar-idiomas.js
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) {
  console.error('Falta Playwright. Ejecuta: npm install playwright && npx playwright install chromium');
  process.exit(1);
}

const SITE = 'https://tempolegal.com';
const ROOT = path.resolve(__dirname, '..');
const LANGS = ['es', 'en', 'pt', 'fr'];
const DEFAULT_LANG = 'es';
const LOCALES = { es: 'es_EC', en: 'en_US', pt: 'pt_BR', fr: 'fr_FR' };
const PAGES = [
  { file: 'index.html', type: 'home' },
  { file: 'politica-de-privacidad.html', type: 'privacy' },
  { file: 'caso-solca.html', type: 'case' },
  { file: 'caso-pazmino-narvaez.html', type: 'case' },
  { file: 'caso-asistanet.html', type: 'case' }
];
// Contenedores que los scripts dibujan con los datos de cada idioma.
const RENDERED = {
  home: ['#services-grid', '#practice-panel', '#sector-tabs', '#sector-panel', '#team-grid', '#articles-grid', '#faq-list', '#cases-grid', '#client-review', '#review-stage', '#question-stage', '#service-detail-list'],
  privacy: [],
  case: ['#project-title', '#project-lead', '#project-tags', '#project-story', '#project-index', '#project-related', '.project-sector-label']
};
const ORG = {
  name: 'TempoLegal',
  email: 'jag@tempolegal.com',
  telephone: '+593978887392',
  street: 'Av. de los Shyris y Eloy Alfaro, Edificio Parque Central',
  city: 'Quito',
  region: 'Pichincha',
  country: 'EC',
  map: 'https://www.google.com/maps?cid=16124965664884056717',
  founder: 'Juan Alberto Gómez'
};

const pageUrl = (lang, file) => SITE + '/' + (lang === DEFAULT_LANG ? '' : lang + '/') + (file === 'index.html' ? '' : file);
const relativeUrl = (from, to, file) => from === to ? file : (from === DEFAULT_LANG ? '' : '../') + (to === DEFAULT_LANG ? '' : to + '/') + file;

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const clean = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(ROOT, clean.endsWith('/') ? clean + 'index.html' : clean);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    }).listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Se ejecuta dentro del navegador: arma el HTML final de una página en un idioma.
function buildInBrowser(options) {
  const { lang, source, selectors, seo, base, langUrls } = options;
  const I = window.TempoI18n;
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const html = doc.documentElement;
  html.lang = lang;
  html.dataset.pageLang = lang;
  html.dataset.langUrls = JSON.stringify(langUrls);
  if (base) html.dataset.base = base; else delete html.dataset.base;

  // 1. Textos traducidos (misma lógica que i18n.js).
  const setText = (element, value) => {
    const lines = String(value).split(/\n|<br\s*\/?>/gi);
    const nodes = [];
    lines.forEach((line, i) => {
      if (i > 0) nodes.push(doc.createElement('br'));
      if (element.dataset.i18n === 'heroTitle' && i === lines.length - 1) {
        const start = line.lastIndexOf(' ') + 1;
        const span = doc.createElement('span');
        span.className = 'hero-title-accent';
        if (start > 0) nodes.push(doc.createTextNode(line.slice(0, start)));
        span.textContent = line.slice(start);
        nodes.push(span);
      } else nodes.push(doc.createTextNode(line));
    });
    element.replaceChildren(...nodes);
  };
  doc.querySelectorAll('[data-i18n]').forEach(element => {
    const value = I.get(element.dataset.i18n);
    if (typeof value === 'string') setText(element, value);
  });
  ['aria-label', 'alt', 'placeholder', 'content', 'title'].forEach(attribute => {
    doc.querySelectorAll('[data-i18n-' + attribute + ']').forEach(element => {
      const value = I.get(element.getAttribute('data-i18n-' + attribute));
      if (typeof value === 'string') element.setAttribute(attribute, value);
    });
  });
  const select = doc.getElementById('language-select');
  if (select) [...select.options].forEach(option => { option.selected = option.value === lang; if (option.selected) option.setAttribute('selected', ''); else option.removeAttribute('selected'); });
  ['policy-title', 'texto-politica'].forEach(id => { const el = doc.getElementById(id); if (el) el.lang = lang; });

  // 2. Contenido dibujado por los scripts (servicios, equipo, preguntas, casos...).
  const runtimeClasses = ['is-revealed', 'is-visible', 'is-in-view', 'question-enter', 'is-scrambling'];
  selectors.forEach(selector => {
    const live = [...document.querySelectorAll(selector)];
    const target = [...doc.querySelectorAll(selector)];
    target.forEach((element, i) => {
      if (!live[i]) return;
      element.innerHTML = live[i].innerHTML;
      element.querySelectorAll('*').forEach(child => {
        runtimeClasses.forEach(name => child.classList.remove(name));
        if (child.getAttribute('class') === '') child.removeAttribute('class');
        if ((child.getAttribute('style') || '').includes('--light-')) child.removeAttribute('style');
      });
    });
  });

  // 3. Título, descripción y metadatos SEO.
  const head = doc.head;
  head.querySelectorAll('[data-seo]').forEach(el => el.remove());
  const title = head.querySelector('title');
  title.textContent = seo.title;
  let description = head.querySelector('meta[name="description"]');
  if (!description) { description = doc.createElement('meta'); description.name = 'description'; head.append(description); }
  description.setAttribute('content', seo.description);
  const add = (tag, attrs, text) => {
    const el = doc.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    el.setAttribute('data-seo', '');
    if (text) el.textContent = text;
    head.append(el);
  };
  add('meta', { name: 'robots', content: 'index, follow, max-image-preview:large' });
  add('link', { rel: 'canonical', href: seo.canonical });
  Object.entries(seo.alternates).forEach(([hreflang, href]) => add('link', { rel: 'alternate', hreflang, href }));
  add('meta', { property: 'og:type', content: seo.ogType });
  add('meta', { property: 'og:site_name', content: 'TempoLegal' });
  add('meta', { property: 'og:title', content: seo.title });
  add('meta', { property: 'og:description', content: seo.description });
  add('meta', { property: 'og:url', content: seo.canonical });
  add('meta', { property: 'og:image', content: seo.image });
  add('meta', { property: 'og:image:width', content: '1200' });
  add('meta', { property: 'og:image:height', content: '630' });
  add('meta', { property: 'og:image:alt', content: seo.imageAlt });
  add('meta', { property: 'og:locale', content: seo.locale });
  seo.localeAlternates.forEach(locale => add('meta', { property: 'og:locale:alternate', content: locale }));
  add('meta', { name: 'twitter:card', content: 'summary_large_image' });
  add('meta', { name: 'twitter:title', content: seo.title });
  add('meta', { name: 'twitter:description', content: seo.description });
  add('meta', { name: 'twitter:image', content: seo.image });
  add('script', { type: 'application/ld+json' }, JSON.stringify(seo.jsonld));

  // 4. Rutas: las páginas de en/, pt/ y fr/ buscan estilos, scripts e imágenes en la carpeta superior.
  if (base) {
    const local = value => value && !/^(#|[a-z]+:|\/\/|\/|\.\.\/)/i.test(value) && !/\.html(\?|#|$)/i.test(value);
    doc.querySelectorAll('[src],[href],[srcset],[poster]').forEach(el => {
      ['src', 'href', 'poster'].forEach(attr => { const v = el.getAttribute(attr); if (local(v)) el.setAttribute(attr, base + v); });
      const set = el.getAttribute('srcset');
      if (set) el.setAttribute('srcset', set.split(',').map(part => { const p = part.trim(); return local(p) ? base + p : p; }).join(', '));
    });
  }
  // Sin espacios acumulados al final del cuerpo (el generador se puede ejecutar varias veces).
  while (doc.body.lastChild && doc.body.lastChild.nodeType === 3 && !doc.body.lastChild.textContent.trim()) doc.body.lastChild.remove();
  doc.body.append(doc.createTextNode('\n'));
  return '<!doctype html>\n' + html.outerHTML + '\n';
}

function jsonLd(page, lang, seo, extra) {
  const org = {
    '@type': ['LegalService', 'Organization'],
    '@id': SITE + '/#organization',
    name: ORG.name,
    url: SITE + '/',
    logo: SITE + '/assets/site/tempo-legal-teal.svg',
    image: SITE + '/assets/og/og-es.jpg',
    email: ORG.email,
    telephone: ORG.telephone,
    priceRange: '$$',
    founder: { '@type': 'Person', name: ORG.founder },
    address: { '@type': 'PostalAddress', streetAddress: ORG.street, addressLocality: ORG.city, addressRegion: ORG.region, addressCountry: ORG.country },
    hasMap: ORG.map,
    areaServed: { '@type': 'Country', name: 'Ecuador' },
    knowsLanguage: ['es', 'en', 'pt', 'fr']
  };
  const website = { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: 'TempoLegal', publisher: { '@id': SITE + '/#organization' }, inLanguage: LANGS };
  const webpage = { '@type': 'WebPage', '@id': seo.canonical + '#webpage', url: seo.canonical, name: seo.title, description: seo.description, inLanguage: lang, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': SITE + '/#organization' }, primaryImageOfPage: seo.image };
  const graph = [org, website, webpage];
  if (page.type === 'home' && extra.faq?.length) {
    graph.push({ '@type': 'FAQPage', '@id': seo.canonical + '#faq', inLanguage: lang, mainEntity: extra.faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });
  }
  if (page.type !== 'home') {
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TempoLegal', item: pageUrl(lang, 'index.html') },
      { '@type': 'ListItem', position: 2, name: extra.crumb, item: seo.canonical }
    ] });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

async function main() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  fs.mkdirSync(path.join(ROOT, 'assets/og'), { recursive: true });
  LANGS.filter(l => l !== DEFAULT_LANG).forEach(l => fs.mkdirSync(path.join(ROOT, l), { recursive: true }));

  // Imagen para compartir en redes (1200 × 630), una por idioma, a partir de la portada.
  for (const lang of LANGS) {
    const shot = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
    await shot.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    await shot.goto(`http://127.0.0.1:${port}/index.html?lang=${lang}&render=1`, { waitUntil: 'networkidle' });
    await shot.addStyleTag({ content: '.site-header,.whatsapp-float,.skip-link{display:none!important}.hero{min-height:630px!important;padding-top:40px!important}' });
    await shot.waitForTimeout(500);
    await shot.screenshot({ path: path.join(ROOT, `assets/og/og-${lang}.jpg`), type: 'jpeg', quality: 86 });
    await shot.close();
  }

  const sitemap = [];
  for (const page of PAGES) {
    const source = fs.readFileSync(path.join(ROOT, page.file), 'utf8');
    const outputs = {};
    for (const lang of LANGS) {
      const tab = await context.newPage();
      const errors = [];
      tab.on('pageerror', error => errors.push(error.message));
      await tab.goto(`http://127.0.0.1:${port}/${page.file}?lang=${lang}&render=1`, { waitUntil: 'networkidle' });
      await tab.waitForTimeout(400);
      if (errors.length) console.warn(`  Aviso en ${page.file} (${lang}):`, errors.join(' | '));
      const info = await tab.evaluate(type => {
        const I = window.TempoI18n;
        return {
          title: document.title.trim(),
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          faq: type === 'home' ? (I.get('faqItems') || []).map(({ question, answer }) => ({ question, answer })) : [],
          crumb: document.querySelector('h1')?.textContent.trim() || document.title,
          imageAlt: I.get('pageTitle') || 'TempoLegal'
        };
      }, page.type);
      const alternates = {};
      LANGS.forEach(l => { alternates[l] = pageUrl(l, page.file); });
      alternates['x-default'] = pageUrl(DEFAULT_LANG, page.file);
      const langUrls = {};
      LANGS.forEach(l => { langUrls[l] = relativeUrl(lang, l, page.file); });
      const seo = {
        title: info.title,
        description: info.description,
        canonical: pageUrl(lang, page.file),
        alternates,
        ogType: page.type === 'case' ? 'article' : 'website',
        image: `${SITE}/assets/og/og-${lang}.jpg`,
        imageAlt: info.imageAlt,
        locale: LOCALES[lang],
        localeAlternates: LANGS.filter(l => l !== lang).map(l => LOCALES[l])
      };
      seo.jsonld = jsonLd(page, lang, seo, info);
      outputs[lang] = await tab.evaluate(buildInBrowser, {
        lang, source, selectors: RENDERED[page.type], seo,
        base: lang === DEFAULT_LANG ? '' : '../', langUrls
      });
      await tab.close();
      sitemap.push({ loc: seo.canonical, alternates });
    }
    for (const lang of LANGS) {
      const out = lang === DEFAULT_LANG ? path.join(ROOT, page.file) : path.join(ROOT, lang, page.file);
      fs.writeFileSync(out, outputs[lang]);
      console.log('✓', path.relative(ROOT, out));
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  sitemap.forEach(entry => {
    xml.push('  <url>', `    <loc>${entry.loc}</loc>`, `    <lastmod>${today}</lastmod>`);
    Object.entries(entry.alternates).forEach(([hreflang, href]) => xml.push(`    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`));
    xml.push('  </url>');
  });
  xml.push('</urlset>', '');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml.join('\n'));
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /_herramientas/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log('✓ sitemap.xml, robots.txt y assets/og/');
  await browser.close();
  server.close();
}

main().catch(error => { console.error(error); process.exit(1); });
