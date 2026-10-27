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

  function updateFooter() {
    const whatsappLink = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(language.t('whatsappGreeting'));
    document.querySelectorAll('[data-company-whatsapp]').forEach(link => {
      link.href = whatsappLink;
    });
    document.querySelectorAll('[data-footer-route]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) return;
      const url = new URL(href, location.href);
      url.searchParams.set('lang', language.language);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
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

// Optional external maps load only after an affirmative choice, with withdrawal in the footer.
(() => {
  const I = window.TempoI18n;
  const storageKey = 'tempo-privacy-choices';
  let mapsAllowed = false;
  try { const saved = JSON.parse(localStorage.getItem(storageKey)); mapsAllowed = saved?.version === '4.3' && saved.maps === true; } catch {}
  const maps = [...document.querySelectorAll('.footer-map iframe[data-src]')];
  const buttons = [...document.querySelectorAll('[data-map-consent]')];
  const preferenceButtons = [...document.querySelectorAll('[data-privacy-preferences]')];
  function updateMaps() {
    maps.forEach(frame => {
      if (mapsAllowed) { frame.src = frame.dataset.src; frame.hidden = false; }
      else { frame.removeAttribute('src'); frame.hidden = true; }
      frame.closest('.footer-map').querySelector('.footer-map-consent').hidden = mapsAllowed;
    });
  }
  function saveChoice(allowed) {
    mapsAllowed = allowed;
    try { localStorage.setItem(storageKey, JSON.stringify({version:'4.3', maps:allowed})); } catch {}
    updateMaps();
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'privacy-preferences-dialog';
  dialog.setAttribute('aria-labelledby', 'privacy-preferences-title');
  // All markup is static. Localized labels are assigned through textContent.
  dialog.innerHTML = '<div class="privacy-preferences-heading"><h2 id="privacy-preferences-title"></h2><button type="button" class="privacy-preferences-close">×</button></div><h3></h3><label><input type="checkbox" id="privacy-maps-choice"><span></span></label><p class="privacy-choice-note"></p><div class="privacy-preferences-actions"><button type="button" data-privacy-save></button><button type="button" data-privacy-reject></button></div>';
  document.body.append(dialog);
  const checkbox = dialog.querySelector('input');
  function translate() {
    dialog.querySelector('h2').textContent = I.t('privacyPreferences');
    dialog.querySelector('h3').textContent = I.t('privacyExternalContent');
    dialog.querySelector('label span').textContent = I.t('privacyMapsChoice');
    dialog.querySelector('.privacy-choice-note').textContent = I.t('privacyChoiceNote');
    dialog.querySelector('[data-privacy-save]').textContent = I.t('privacySave');
    dialog.querySelector('[data-privacy-reject]').textContent = I.t('privacyReject');
    dialog.querySelector('.privacy-preferences-close').setAttribute('aria-label', I.t('privacyClose'));
  }
  function close() { dialog.close(); }
  buttons.forEach(button => { button.disabled = false; button.addEventListener('click', () => saveChoice(true)); });
  preferenceButtons.forEach(button => { button.hidden = false; button.addEventListener('click', () => {
    checkbox.checked = mapsAllowed;
    dialog.showModal();
    document.body.classList.add('privacy-settings-open');
  }); });
  dialog.querySelector('.privacy-preferences-close').addEventListener('click', close);
  dialog.querySelector('[data-privacy-save]').addEventListener('click', () => { saveChoice(checkbox.checked); close(); });
  dialog.querySelector('[data-privacy-reject]').addEventListener('click', () => { saveChoice(false); close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('privacy-settings-open'));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  document.addEventListener('tempo:languagechange', translate);
  translate(); updateMaps();
})();

// Selector de idioma con banderas: reemplaza visualmente el <select> nativo,
// que se conserva oculto para que i18n.js siga funcionando igual.
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
