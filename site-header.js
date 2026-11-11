'use strict';
/* Cabecera común (tarea 1.2): desplegable «Servicios» y menú móvil.
   - Desplegable: clic o Enter/Espacio; se cierra con Escape, al pulsar fuera o al salir con Tab.
   - Menú móvil (hasta 1100 px): en la Home lo gestiona script.js y en las landings su page.js;
     aquí solo se activa en las páginas que llevan [data-common-toggle]. */
(() => {
  // Reuse the localized links from Servicios in a dedicated dropdown.
  document.querySelectorAll('[data-nav-menu]').forEach(services => {
    const title = services.querySelector('.nav-menu-title[data-i18n="menuDataTitle"]');
    const serviceToggle = services.querySelector('.nav-menu-toggle');
    const links = ['menuDataHub', 'menuDpo', 'menuLopdp'].map(key =>
      services.querySelector('a[data-i18n="' + key + '"][href]')
    );
    if (!title || !serviceToggle || links.some(link => !link)) return;

    const menu = document.createElement('div');
    menu.className = 'nav-menu nav-menu-data';
    menu.setAttribute('data-nav-menu', '');

    const toggle = serviceToggle.cloneNode(true);
    const label = toggle.querySelector('[data-i18n]');
    if (!label) return;
    label.dataset.i18n = title.dataset.i18n;
    label.textContent = title.textContent;
    toggle.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('div');
    panel.id = serviceToggle.getAttribute('aria-controls') + '-data-protection';
    panel.className = 'nav-menu-panel';
    panel.hidden = true;
    toggle.setAttribute('aria-controls', panel.id);

    const column = document.createElement('div');
    column.className = 'nav-menu-col';
    column.append(title.cloneNode(true), ...links.map(link => link.cloneNode(true)));
    panel.append(column);
    menu.append(toggle, panel);
    services.after(menu);
  });

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

  // Bubble-like menu reveal shared by all languages. Keep focus and hidden state
  // synchronized; cancel an outgoing animation if the user reopens immediately.
  const animations = new WeakMap();
  function setMenu(menu, open, focusButton) {
    const button = menu.querySelector('.nav-menu-toggle');
    const panel = menu.querySelector('.nav-menu-panel');
    if (!button || !panel) return;
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    if (wasOpen === open) return;
    animations.get(panel)?.cancel();
    animations.delete(panel);
    button.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (open) panel.hidden = false;
    if (!reduceMotion && typeof panel.animate === 'function') {
      // Animate the independent translate/scale properties, NOT transform:
      // CSS transform:translateX(-38%) is responsible for horizontal centering.
      // Overriding it in Web Animations caused the panel to jump in from the right.
      const frames = open ? [
        { opacity: 0, translate: '0 -12px', scale: '.97', filter: 'blur(5px)' },
        { opacity: 1, translate: '0 0', scale: '1', filter: 'blur(0)' }
      ] : [
        { opacity: 1, translate: '0 0', scale: '1', filter: 'blur(0)' },
        { opacity: 0, translate: '0 -8px', scale: '.985', filter: 'blur(3px)' }
      ];
      const animation = panel.animate(frames, {
        duration: open ? 390 : 220,
        easing: open ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.8,1)',
        fill: 'both'
      });
      animations.set(panel, animation);
      animation.finished.then(() => {
        if (animations.get(panel) !== animation) return;
        animations.delete(panel);
        if (!open) panel.hidden = true;
        animation.cancel();
      }).catch(() => {});
    } else if (!open) {
      panel.hidden = true;
    }
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
      // Only move focus when opened from the keyboard. Mouse clicks leave focus on the toggle.
      if (open && event.detail === 0) menu.querySelector('.nav-menu-panel a')?.focus({ preventScroll: true });
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
