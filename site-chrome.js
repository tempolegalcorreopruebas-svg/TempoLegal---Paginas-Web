'use strict';
// Shared footer, contact channels and header reading progress.
(() => {
  const root = document.documentElement;
  const config = window.TEMPO_CONFIG || {};
  const language = window.TempoI18n;
  const whatsapp = String(config.whatsapp || '593978887392').replace(/\D/g, '');
  const email = config.email || 'jag@tempolegal.com';
  document.querySelectorAll('[data-company-phone]').forEach(link => {
    link.href = 'tel:+' + whatsapp;
  });
  document.querySelectorAll('[data-company-email]').forEach(link => {
    link.href = 'mailto:' + email;
  });

  const facebookLinks = [...document.querySelectorAll(".site-footer .footer-channels")].map(channels => {
    const existing = channels.querySelector("[data-footer-facebook]");
    if (existing) return existing;
    const link = document.createElement("a");
    link.dataset.footerFacebook = "";
    link.href = "https://www.facebook.com/tempolegalec/?locale=es_LA";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = "<svg aria-hidden=\"true\" focusable=\"false\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M14 21v-8h2.8l.4-3H14V8.2c0-.9.3-1.5 1.6-1.5h1.7V4.1A19 19 0 0 0 15 4c-2.5 0-4.2 1.5-4.2 4.1V10H8v3h2.8v8z\"></path></svg>";
    channels.append(link);
    return link;
  });

  function updateFooter() {
    facebookLinks.forEach(link => link.setAttribute("aria-label", language.t("footerFacebookLabel")));
    const whatsappLink = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(language.t('whatsappGreeting'));
    document.querySelectorAll('[data-company-whatsapp]').forEach(link => {
      link.href = whatsappLink;
    });
    document.querySelectorAll('[data-footer-route]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) return;
      if (href.includes('/')) return; // landings en carpetas: se deja la ruta completa (tarea 4.2)
      const url = new URL(href, location.href);
      url.searchParams.delete('lang');
      link.setAttribute('href', url.href);
    });
    const map = document.querySelector('.footer-map iframe');
    if (map) map.title = language.t('footerMapTitle');
    requestProgressUpdate();
  }

  let frame = 0;
  function updateProgress() {
    frame = 0;
    const distance = root.scrollHeight - innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
    root.style.setProperty('--reading-progress', progress.toFixed(5));
  }
  function requestProgressUpdate() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(updateProgress);
  }
  addEventListener('scroll', requestProgressUpdate, { passive: true });
  addEventListener('resize', requestProgressUpdate, { passive: true });
  addEventListener('pageshow', requestProgressUpdate);
  document.addEventListener('load', requestProgressUpdate, true);
  document.addEventListener('tempo:layoutchange', requestProgressUpdate);
  document.addEventListener('tempo:languagechange', updateFooter);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestProgressUpdate();
  });
  if ('ResizeObserver' in window) new ResizeObserver(requestProgressUpdate).observe(document.body);
  document.fonts?.ready.then(requestProgressUpdate);
  updateFooter();
})();

// Flag language selector: visually replaces the native select,
// which stays hidden so the existing i18n behavior remains available.
(() => {
  const select = document.getElementById('language-select');
  const control = select?.closest('.language-control');
  const I = window.TempoI18n;
  if (!select || !control || !I) return;
  const flags = {
    es: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/></svg>',
    en: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#fff"/><g fill="#B22234"><rect width="30" height="1.54"/><rect y="3.08" width="30" height="1.54"/><rect y="6.15" width="30" height="1.54"/><rect y="9.23" width="30" height="1.54"/><rect y="12.31" width="30" height="1.54"/><rect y="15.38" width="30" height="1.54"/><rect y="18.46" width="30" height="1.54"/></g><rect width="13" height="10.77" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.2" cy="2" r=".6"/><circle cx="5.4" cy="2" r=".6"/><circle cx="8.6" cy="2" r=".6"/><circle cx="11" cy="2" r=".6"/><circle cx="3.8" cy="4.2" r=".6"/><circle cx="7" cy="4.2" r=".6"/><circle cx="10.2" cy="4.2" r=".6"/><circle cx="2.2" cy="6.4" r=".6"/><circle cx="5.4" cy="6.4" r=".6"/><circle cx="8.6" cy="6.4" r=".6"/><circle cx="11" cy="6.4" r=".6"/><circle cx="3.8" cy="8.6" r=".6"/><circle cx="7" cy="8.6" r=".6"/><circle cx="10.2" cy="8.6" r=".6"/></g></svg>',
    pt: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#009C3B"/><path d="M15 2.2 27.6 10 15 17.8 2.4 10Z" fill="#FFDF00"/><circle cx="15" cy="10" r="4.6" fill="#002776"/><path d="M10.6 9.1a12 12 0 0 1 8.9 1.9" stroke="#fff" stroke-width=".8" fill="none"/></svg>',
    fr: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ED2939"/></svg>'
  };
  const codes = [...select.options].map(option => option.value).filter(code => flags[code]);
  control.classList.add('language-enhanced');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'language-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  const list = document.createElement('ul');
  list.className = 'language-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  list.id = 'language-list';
  button.setAttribute('aria-controls', list.id);
  codes.forEach(code => {
    const item = document.createElement('li');
    item.setAttribute('role', 'option');
    item.dataset.lang = code;
    item.tabIndex = -1;
    item.lang = code;
    item.innerHTML = '<span class="language-flag">' + flags[code] + '</span><span>' + I.names[code] + '</span>';
    list.append(item);
  });
  control.after(button, list);
  const wrap = document.createElement('div');
  wrap.className = 'language-menu';
  button.before(wrap);
  wrap.append(control, button, list);
  function render() {
    const code = I.language;
    button.innerHTML = '<span class="language-flag">' + flags[code] + '</span><span class="language-name">' + I.names[code] + '</span><span class="language-code" aria-hidden="true">' + code.toUpperCase() + '</span><svg class="language-chevron" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    button.setAttribute('aria-label', I.t('languageLabel') + ': ' + I.names[code]);
    list.setAttribute('aria-label', I.t('languageLabel'));
    list.querySelectorAll('[role="option"]').forEach(item => item.setAttribute('aria-selected', String(item.dataset.lang === code)));
  }
  function open(focusSelected = true) {
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    wrap.classList.add('is-open');
    if (focusSelected) (list.querySelector('[aria-selected="true"]') || list.firstElementChild).focus();
  }
  function close(returnFocus = false) {
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('is-open');
    if (returnFocus) button.focus();
  }
  function choose(code) {
    close(true);
    if (code === I.language) return;
    select.value = code;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  button.addEventListener('click', () => (list.hidden ? open() : close()));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
  });
  list.addEventListener('click', event => {
    const item = event.target.closest('[role="option"]');
    if (item) choose(item.dataset.lang);
  });
  list.addEventListener('keydown', event => {
    const items = [...list.children];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length].focus(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
    else if (event.key === 'Home') { event.preventDefault(); items[0].focus(); }
    else if (event.key === 'End') { event.preventDefault(); items[items.length - 1].focus(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (index >= 0) choose(items[index].dataset.lang); }
    else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close();
  });
  document.addEventListener('click', event => { if (!wrap.contains(event.target)) close(); });
  document.addEventListener('tempo:languagechange', render);
  render();
})();


// Pages without a local enquiry form open the shared Contact form in place.
(() => {
  const script = document.currentScript;
  if (!script?.src || document.getElementById('contact-form') ||
      typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const selector = 'a[data-i18n="menuCta"][href]';
  const triggers = document.querySelectorAll(selector);
  if (!triggers.length) return;

  const root = new URL('./', script.src);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('contact-form.css', root).href;
  document.head.append(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'shared-contact-dialog';
  dialog.className = 'contact-popout contact-frame-dialog';
  dialog.setAttribute('aria-labelledby', 'shared-contact-title');

  const title = document.createElement('h2');
  title.id = 'shared-contact-title';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close-dialog';
  close.autofocus = true;
  close.textContent = '×';
  close.addEventListener('click', () => dialog.close());

  const frame = document.createElement('iframe');
  dialog.append(title, close, frame);
  document.body.append(dialog);
  triggers.forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);
  });

  let opener;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const trigger = event.target.closest?.(selector);
    if (!trigger || dialog.open) return;
    event.preventDefault();

    const lang = window.TempoI18n?.language || document.documentElement.lang;
    const locale = ['en', 'pt', 'fr'].includes(lang) ? lang + '/' : '';
    const target = new URL(locale + 'contactanos/index.html', root);
    target.searchParams.set('formulario', 'modal');
    const labels = { es: 'Cerrar consulta', en: 'Close enquiry', pt: 'Fechar consulta', fr: 'Fermer la demande' };
    title.textContent = trigger.textContent.trim();
    frame.title = title.textContent;
    close.setAttribute('aria-label', labels[lang] || labels.es);
    if (frame.getAttribute('src') !== target.href) frame.src = target.href;
    opener = trigger;
    dialog.showModal();
  });
  window.addEventListener('message', event => {
    if (dialog.open && event.source === frame.contentWindow && event.origin === root.origin &&
        event.data === 'tempo:close-contact') dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
