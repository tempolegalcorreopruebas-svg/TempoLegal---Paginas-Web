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
      if (label) label.textContent = window.TempoI18n ? window.TempoI18n.t(open ? 'menuClose' : 'menuOpen') : (open ? 'Cerrar menú' : 'Abrir menú');
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

  const form = document.querySelector('#contacto form#consulta');
  const consultationTriggers = document.querySelectorAll('a[href="#contacto"], a[href="#consulta"], [data-consultation-dialog]');
  if (form && consultationTriggers.length && typeof HTMLDialogElement !== 'undefined' &&
      typeof HTMLDialogElement.prototype.showModal === 'function') {
    const dialog = document.createElement('dialog');
    dialog.id = 'consultation-dialog';
    dialog.className = 'consultation-dialog';
    dialog.setAttribute('aria-labelledby', 'consultation-dialog-title');

    const heading = document.createElement('h2');
    heading.id = 'consultation-dialog-title';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'consultation-dialog-close';
    close.autofocus = true;
    close.textContent = '×';
    const closeLabels = { es: 'Cerrar formulario', en: 'Close form', pt: 'Fechar formulário', fr: 'Fermer le formulaire' };
    close.setAttribute('aria-label', closeLabels[document.documentElement.dataset.pageLang || document.documentElement.lang.split('-')[0]] || closeLabels.es);
    close.addEventListener('click', () => dialog.close());

    dialog.append(heading, close);
    document.body.append(dialog);
    const formPanel = form.closest('.formbox') || form;
    const placeholder = document.createElement('div');
    placeholder.setAttribute('aria-hidden', 'true');
    let activeTrigger;
    consultationTriggers.forEach(trigger => {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', dialog.id);
      trigger.addEventListener('click', event => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (activeTrigger) return;
        activeTrigger = trigger;
        heading.textContent = trigger.textContent.trim().replace(/\s*[↗→↓]$/, '');
        placeholder.style.minHeight = formPanel.getBoundingClientRect().height + 'px';
        formPanel.replaceWith(placeholder);
        dialog.append(formPanel);
        dialog.showModal();
      });
    });
    dialog.addEventListener('close', () => {
      placeholder.replaceWith(formPanel);
      activeTrigger.focus({ preventScroll: true });
      activeTrigger = null;
    });
  }

  const whatsappTrigger = document.querySelector('[data-whatsapp-consultation]');
  const whatsappDialog = document.getElementById('whatsapp-consultation');
  if (whatsappTrigger && typeof whatsappDialog?.showModal === 'function') {
    const messageForm = whatsappDialog.querySelector('form');
    const message = messageForm.elements.text;
    const topics = [...whatsappDialog.querySelectorAll('[data-chat-topic]')];
    let selectedTopic;
    whatsappTrigger.hidden = false;
    topics.forEach(topic => topic.addEventListener('click', () => {
      selectedTopic = selectedTopic === topic ? null : topic;
      topics.forEach(option => option.setAttribute('aria-pressed', String(option === selectedTopic)));
    }));
    messageForm.addEventListener('formdata', event => {
      if (selectedTopic) {
        event.formData.set('text', whatsappDialog.dataset.topicLabel + ': ' + selectedTopic.textContent + '\n\n' + message.value);
      }
    });
    whatsappTrigger.setAttribute('aria-haspopup', 'dialog');
    whatsappTrigger.setAttribute('aria-controls', whatsappDialog.id);
    const openChat = event => {
      if (event.defaultPrevented) return;
      const phone = String(config.whatsapp || '').replace(/\D/g, '');
      if (phone) messageForm.action = 'https://wa.me/' + phone;
      whatsappDialog.showModal();
    };
    whatsappTrigger.addEventListener('click', openChat);
    const invitation = document.querySelector('.dpd-chat-invite');
    if (invitation) {
      const quote = invitation.querySelector('[data-chat-invite]');
      quote.setAttribute('aria-haspopup', 'dialog');
      quote.setAttribute('aria-controls', whatsappDialog.id);
      quote.addEventListener('click', openChat);
      invitation.querySelector('[data-chat-dismiss]').addEventListener('click', () => {
        invitation.hidden = true;
        whatsappTrigger.focus({ preventScroll: true });
      });
      invitation.hidden = false;
    }
    whatsappDialog.querySelector('[data-close-whatsapp-consultation]').addEventListener('click', () => whatsappDialog.close());
    whatsappDialog.addEventListener('close', () => whatsappTrigger.focus({ preventScroll: true }));
    messageForm.addEventListener('submit', event => {
      message.value = message.value.trim();
      if (!message.reportValidity()) event.preventDefault();
    });
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
    const names = figure.querySelector('.it-team-names');
    if (config.technicalTeamNames && names) { names.textContent = config.technicalTeamNames; names.hidden = false; }
    const src = config.technicalTeamPhoto;
    if (!src) return;
    const base = document.querySelector('link[href$="base.css"]')?.getAttribute('href').replace(/base\.css$/, '') || '';
    const img = new Image();
    img.src = /^https?:|^\//.test(src) ? src : base + src;
    img.alt = window.TempoI18n ? window.TempoI18n.t('itTeamAlt') : 'Equipo de informática de TempoLegal';
    img.loading = 'lazy';
    img.decoding = 'async';
    const frame = figure.querySelector('.it-team-photo-frame');
    frame.replaceChildren(img);
    frame.removeAttribute('aria-hidden');
    figure.classList.add('has-photo');
  });

  // External map consent is handled by privacy-consent.js.

  // Enlaces de WhatsApp, teléfono y correo con los datos de config.js.
  const phone = String(config.whatsapp || '').replace(/\D/g, '');
  if (phone) document.querySelectorAll('[data-company-phone]').forEach(a => { a.href = 'tel:+' + phone; });
  if (config.email) document.querySelectorAll('[data-company-email]').forEach(a => { a.href = 'mailto:' + config.email; });
})();
