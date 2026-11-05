'use strict';
/* Cabecera común (tarea 1.2): desplegable «Servicios» y menú móvil.
   - Desplegable: clic o Enter/Espacio; se cierra con Escape, al pulsar fuera o al salir con Tab.
   - Menú móvil (hasta 1100 px): en la Home lo gestiona script.js y en las landings su page.js;
     aquí solo se activa en las páginas que llevan [data-common-toggle]. */
(() => {
  const menus = [...document.querySelectorAll('[data-nav-menu]')];

  // Normalize file previews, hosted directory URLs and retained service aliases.
  function servicePath(value) {
    const url = new URL(value, document.baseURI);
    let path = decodeURIComponent(url.pathname).replace(/\/index\.html$/, '').replace(/\/$/, '');
    path = path.replace(/\/services\/legal-representation$/, '/representacion-legal-fiscal-ecuador');
    path = path.replace(/\/services\/corporate-amendments$/, '/tramites-notariales-y-societarios');
    path = path.replace(/\/services\/accounting-support$/, '/servicios-contabilidad');
    path = path.replace(/\/services\/sas-incorporation$/, '/constitucion-de-empresas-sas');
    return { path, origin: url.origin, hash: url.hash };
  }

  function markCurrentService() {
    const current = servicePath(location.href);
    menus.forEach(menu => {
      let hasCurrent = false;
      menu.querySelectorAll('.nav-menu-panel a[href]').forEach(link => {
        const target = servicePath(link.href);
        const active = !target.hash && target.path === current.path && target.origin === current.origin;
        link.classList.toggle('is-current-service', active);
        if (active) { link.setAttribute('aria-current', 'page'); hasCurrent = true; }
        else if (link.getAttribute('aria-current') === 'page') link.removeAttribute('aria-current');
      });
      menu.querySelector('.nav-menu-toggle')?.classList.toggle('has-current-service', hasCurrent);
    });
  }
  markCurrentService();
  document.addEventListener('DOMContentLoaded', markCurrentService);
  document.addEventListener('tempo:languagechange', () => requestAnimationFrame(markCurrentService));

  function setMenu(menu, open, focusButton) {
    const button = menu.querySelector('.nav-menu-toggle');
    const panel = menu.querySelector('.nav-menu-panel');
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    menu.classList.toggle('is-open', open);
    if (!open && focusButton) button.focus();
  }
  const closeAll = except => menus.forEach(menu => { if (menu !== except) setMenu(menu, false); });

  menus.forEach(menu => {
    const button = menu.querySelector('.nav-menu-toggle');
    if (!button) return;
    button.addEventListener('click', event => {
      event.stopPropagation();
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeAll(menu);
      setMenu(menu, open);
      if (open) menu.querySelector('.nav-menu-panel a')?.focus({ preventScroll: true });
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        event.stopPropagation();
        setMenu(menu, false, true);
      }
    });
    menu.addEventListener('focusout', event => {
      if (event.relatedTarget && !menu.contains(event.relatedTarget)) setMenu(menu, false);
    });
    menu.querySelectorAll('.nav-menu-panel a').forEach(link => link.addEventListener('click', () => setMenu(menu, false)));
  });
  document.addEventListener('click', event => { if (!event.target.closest('[data-nav-menu]')) closeAll(); });

  // Aviso de traducción pendiente (tarea 5.5): páginas marcadas con data-i18n-partial.
  if (document.documentElement.hasAttribute('data-i18n-partial')) {
    const notice = document.createElement('div');
    notice.className = 'translation-notice';
    notice.hidden = true;
    notice.setAttribute('role', 'status');
    notice.innerHTML = '<div class="translation-notice-inner"><p></p><button type="button" lang="es">Ver en español</button></div>';
    const anchor = document.querySelector('.tl-header, .tool-header, header');
    if (anchor) anchor.after(notice); else document.body.prepend(notice);
    const updateNotice = () => {
      const I = window.TempoI18n;
      if (!I) return;
      const pageLang = document.documentElement.dataset.pageLang || 'es';
      const show = I.language !== pageLang;
      notice.hidden = !show;
      if (!show) return;
      notice.querySelector('p').textContent = I.t('pendingTranslation') + (document.querySelector('[data-nav-menu]') ? ' ' + I.t('pendingTranslationMenu') : '');
      notice.querySelector('button').textContent = I.t('pendingTranslationBack', { language: I.names[pageLang] });
      notice.querySelector('button').lang = pageLang;
    };
    notice.querySelector('button').addEventListener('click', () => window.TempoI18n?.setLanguage(document.documentElement.dataset.pageLang || 'es'));
    document.addEventListener('tempo:languagechange', updateNotice);
    updateNotice();
  }

  // Menú móvil en páginas secundarias (servicios de Anthony, artículos, casos, perfiles y legales).
  const header = document.querySelector('[data-common-toggle]');
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('#main-nav');
  if (!toggle || !nav) return;
  const label = toggle.querySelector('.sr-only');
  const items = () => [...nav.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null);
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  function setNav(open, returnFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = window.TempoI18n ? window.TempoI18n.t(open ? 'menuClose' : 'menuOpen') : (open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) items()[0]?.focus();
    else { closeAll(); if (returnFocus) toggle.focus(); }
  }
  toggle.addEventListener('click', () => setNav(!isOpen(), false));
  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); setNav(false, true); return; }
    if (event.key !== 'Tab') return;
    const cycle = [...items(), toggle];
    const index = cycle.indexOf(document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    cycle[(index + (event.shiftKey ? -1 : 1) + cycle.length) % cycle.length].focus();
  });
  document.addEventListener('click', event => { if (isOpen() && !event.target.closest('[data-common-toggle]')) setNav(false); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) setNav(false); });
  matchMedia('(min-width: 1101px)').addEventListener('change', event => { if (event.matches && isOpen()) setNav(false); });
})();
