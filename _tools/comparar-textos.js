'use strict';
/*
  Compara los textos escritos en el HTML de la Home (es, en, pt, fr) con los de content.js / i18n.js.
  Si no coinciden, al cargar la página el JavaScript reemplaza el texto del HTML (sección 6 de la
  revisión del 27 oct). Úselo después de cambiar textos:  node _tools/comparar-textos.js
  Con --corregir escribe en el HTML el texto de los diccionarios (en/pt/fr; el español se revisa a mano).
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
global.window = {};
global.document = { documentElement: { dataset: {} }, querySelectorAll: () => [], getElementById: () => ({ addEventListener() {}, value: '' }) };
global.location = { href: 'http://localhost/' };
global.localStorage = { getItem: () => null };
require(path.join(ROOT, 'content.js'));
const src = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const start = src.indexOf('const dictionaries = ') + 'const dictionaries = '.length;
const end = src.indexOf('\n};', start) + 2;
const dict = Function('return ' + src.slice(start, end).replace(/\r/g, ''))();
for (const m of src.matchAll(/Object\.assign\(dictionaries\.(\w+), (\{.*?\})\);/g)) Object.assign(dict[m[1]], JSON.parse(m[2]));
for (const lang of Object.keys(dict)) Object.assign(dict[lang], window.TEMPO_CONTENT?.[lang] || {});
const clean = s => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const fix = process.argv.includes('--corregir');
let total = 0;
for (const [lang, file] of [['es', 'index.html'], ['en', 'en/index.html'], ['pt', 'pt/index.html'], ['fr', 'fr/index.html']]) {
  let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  html = html.replace(/<(\w+)(\b[^>]*\bdata-i18n="(\w+)"[^>]*)>([^<]*)<\/\1>/g, (all, tag, attrs, key, text) => {
    const value = dict[lang][key] ?? dict.es[key];
    if (typeof value !== 'string' || !clean(text) || clean(text) === clean(value)) return all;
    total++;
    console.log(`${file} · ${key}\n   HTML: ${clean(text).slice(0, 110)}\n   JS:   ${clean(value).slice(0, 110)}`);
    if (!fix || lang === 'es') return all;
    return `<${tag}${attrs}>${value.replace(/&/g, '&amp;').replace(/\n/g, '<br/>')}</${tag}>`;
  });
  if (fix && lang !== 'es') fs.writeFileSync(path.join(ROOT, file), html);
}
console.log(total ? `\n${total} textos distintos.` : 'Sin diferencias: el HTML y los diccionarios coinciden.');
