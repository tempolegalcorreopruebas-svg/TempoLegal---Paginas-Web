'use strict';
/* Landings · comportamiento común (cabecera, foto del equipo de informática y mapa del pie).
   El menú móvil lo abren los scripts propios de cada página (#menu-button / #navigation);
   aquí se completa: texto accesible, cierre al pulsar fuera y cabecera compacta al hacer scroll. */
(() => {
  const config = window.TEMPO_CONFIG || {};
  const header = document.querySelector('.tl-header');
  const button = document.getElementById('menu-button');
  const nav = document.getElementById('navigation');
  const label = button && button.querySelector('.tl-sr');
  const isOpen = () => button && button.getAttribute('aria-expanded') === 'true';

  if (button && nav) {
    new MutationObserver(() => {
      const open = isOpen();
      if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
      nav.classList.toggle('is-open', open);
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    }).observe(button, { attributes: true, attributeFilter: ['aria-expanded'] });
    document.addEventListener('click', event => {
      if (isOpen() && !event.target.closest('.tl-header')) button.click();
    });
  }
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hero oscuro: las tarjetas laterales claras (o sin fondo) recuperan texto oscuro.
  const hero = document.querySelector('main > section');
  if (hero) hero.querySelectorAll('aside').forEach(card => {
    const bg = getComputedStyle(card).backgroundColor;
    const m = bg.match(/\d+(\.\d+)?/g) || ['0', '0', '0', '0'];
    const alpha = m.length > 3 ? parseFloat(m[3]) : 1;
    const light = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) > 150;
    if (alpha < 0.1) card.classList.add('tl-light-card', 'tl-was-transparent');
    else if (light) card.classList.add('tl-light-card');
  });

  // Foto conjunta del equipo de informática (tarea 0.1): se activa desde config.js.
  document.querySelectorAll('[data-it-team-photo]').forEach(figure => {
    const src = config.technicalTeamPhoto;
    if (!src) return;
    const base = document.querySelector('link[href$="base.css"]')?.getAttribute('href').replace(/base\.css$/, '') || '';
    const img = new Image();
    img.src = /^https?:|^\//.test(src) ? src : base + src;
    img.alt = 'Equipo de informática de TempoLegal';
    img.loading = 'lazy';
    img.decoding = 'async';
    const frame = figure.querySelector('.it-team-photo-frame');
    frame.replaceChildren(img);
    frame.removeAttribute('aria-hidden');
    figure.classList.add('has-photo');
    const names = figure.querySelector('.it-team-names');
    if (config.technicalTeamNames && names) { names.textContent = config.technicalTeamNames; names.hidden = false; }
  });

  // External map consent is handled by privacy-consent.js.

  // Enlaces de WhatsApp, teléfono y correo con los datos de config.js.
  const phone = String(config.whatsapp || '').replace(/\D/g, '');
  if (phone) document.querySelectorAll('[data-company-phone]').forEach(a => { a.href = 'tel:+' + phone; });
  if (config.email) document.querySelectorAll('[data-company-email]').forEach(a => { a.href = 'mailto:' + config.email; });
})();
