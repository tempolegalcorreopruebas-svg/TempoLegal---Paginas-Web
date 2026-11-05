'use strict';
// Direct file previews need explicit documents; hosted canonical directory URLs stay unchanged.
(() => {
  if (location.protocol !== 'file:') return;
  const source = document.currentScript;
  if (!source?.src) return;
  const projectRoot = new URL('./', source.src);

  function documentUrl(value) {
    if (!value || value.startsWith('#')) return value;
    let url;
    try {
      url = value.startsWith('/') && !value.startsWith('//')
        ? new URL(value.slice(1), projectRoot)
        : new URL(value, document.baseURI);
    } catch (_) { return value; }
    if (url.protocol !== 'file:' || url.host !== projectRoot.host || !url.pathname.startsWith(projectRoot.pathname)) return value;
    if (url.pathname.endsWith('/')) url.pathname += 'index.html';
    return url.href;
  }

  function updateLink(link) {
    const value = link.getAttribute('href');
    const target = documentUrl(value);
    if (target !== value) link.setAttribute('href', target);
  }

  function updateLanguageRoutes() {
    const root = document.documentElement;
    try {
      const value = root.dataset.langUrls;
      if (!value) return;
      const routes = JSON.parse(value);
      const updated = JSON.stringify(Object.fromEntries(Object.entries(routes).map(([language, route]) => [language, documentUrl(route)])));
      if (value !== updated) root.dataset.langUrls = updated;
    } catch (_) {}
  }

  function updateTree(node) {
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
    if (node.matches?.('a[href],area[href]')) updateLink(node);
    node.querySelectorAll('a[href],area[href]').forEach(updateLink);
  }

  updateLanguageRoutes();
  updateTree(document);
  // Root-relative assets on the fallback page also need the extracted project's root.
  document.querySelectorAll('link[href^="/"],img[src^="/"]').forEach(element => {
    const attribute = element.tagName === 'LINK' ? 'href' : 'src';
    const value = element.getAttribute(attribute);
    if (!value.startsWith('//')) element.setAttribute(attribute, new URL(value.slice(1), projectRoot).href);
  });
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'childList') record.addedNodes.forEach(updateTree);
      else if (record.attributeName === 'data-lang-urls') updateLanguageRoutes();
      else if (record.target.matches('a[href],area[href]')) updateLink(record.target);
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'data-lang-urls'] });
  // Cover links created and activated in the same event before the observer's next microtask.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href],area[href]');
    if (link) updateLink(link);
  }, true);
})();
