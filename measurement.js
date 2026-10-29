'use strict';
// Production-only measurement. The approved home revision does not display a preferences module.
(() => {
  const config = window.TEMPO_MEASUREMENT_CONFIG || {};
  const id = String(config.measurementId || '');
  let excluded = false;
  try { excluded = localStorage.getItem('tempo-measurement-excluded') === '1'; } catch (_) {}
  const eligible = config.enabled === true && config.environment === 'production' && /^G-[A-Z0-9]{5,20}$/.test(id)
    && Array.isArray(config.allowedHosts) && config.allowedHosts.includes(location.hostname)
    && location.protocol === 'https:' && !/noindex/i.test(document.querySelector('meta[name=robots]')?.content || '')
    && !new URL(location.href).searchParams.has('tempo_test') && !excluded;
  let allowed = eligible;
  let loaded = false;
  let loading = false;
  let tag = null;
  let pending = [];
  let pageSent = false;
  const accepted = new Set();
  let lastClick = 0;
  const canonical = document.querySelector('link[rel=canonical]')?.href || 'https://tempolegal.com/';
  const page = new URL(canonical);
  const safePage = page.origin === 'https://tempolegal.com' ? page.origin + page.pathname : 'https://tempolegal.com/';
  const language = () => ['es', 'en', 'pt', 'fr'].includes(document.documentElement.lang) ? document.documentElement.lang : 'es';
  const sources = new Set(['floating', 'footer', 'inquiry', 'content']);
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

  function command() { window.dataLayer.push(arguments); }
  function emit(name, source) {
    if (!eligible || !allowed) return false;
    if (!['page_view', 'clic_whatsapp', 'formulario_aceptado'].includes(name)) return false;
    const params = { send_to: id, page_location: safePage, page_referrer: '', page_title: document.title, language: language() };
    if (source && sources.has(source)) params.contact_source = source;
    if (!loaded) { pending.push([name, params]); return true; }
    command('event', name, params);
    return true;
  }

  function start() {
    if (!eligible || !allowed || loaded || loading) return;
    loading = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = [];
    window.gtag = command;
    command('consent', 'default', { ...denied, analytics_storage: 'granted' });
    command('set', { ads_data_redaction: true, url_passthrough: false });
    command('js', new Date());
    command('config', id, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: 60 * 60 * 24 * 730, cookie_update: false, cookie_path: '/',
      page_location: safePage, page_referrer: '', page_title: document.title
    });
    tag = document.createElement('script');
    tag.async = true;
    tag.dataset.tempoMeasurement = '';
    tag.referrerPolicy = 'no-referrer';
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    tag.onload = () => {
      loading = false;
      if (!allowed) return;
      loaded = true;
      if (!pageSent) { pageSent = true; emit('page_view'); }
      pending.splice(0).forEach(([name, params]) => { if (allowed) command('event', name, params); });
    };
    tag.onerror = () => { loading = false; pending = []; tag.remove(); tag = null; };
    document.head.append(tag);
  }

  function clearCookies() {
    const domains = ['', location.hostname, '.' + location.hostname, '.tempolegal.com', 'tempolegal.com'];
    document.cookie.split(';').map(part => part.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name)).forEach(name => {
      domains.forEach(domain => { document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=' + domain : ''); });
    });
  }

  function setConsent(next) {
    const wasActive = loaded || loading;
    allowed = eligible && next === true;
    if (allowed) { start(); return; }
    if (id) window['ga-disable-' + id] = true;
    pending = [];
    if (tag) { tag.onload = null; tag.onerror = null; tag.remove(); tag = null; }
    loaded = false;
    loading = false;
    if (eligible) clearCookies();
    // A reload unloads already executed vendor code; disabling precedes it and sends no denied ping.
    if (wasActive) location.reload();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || !allowed) return;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.hostname !== 'wa.me' && !(url.hostname === 'api.whatsapp.com' && url.pathname === '/send')) return;
    const now = Date.now();
    if (now - lastClick < 1500) return;
    lastClick = now;
    const source = link.closest('.whatsapp-float') ? 'floating' : link.closest('#contact-result') ? 'inquiry' : link.closest('footer') ? 'footer' : 'content';
    emit('clic_whatsapp', source);
  });
  document.addEventListener('tempo:formaccepted', event => {
    const key = event.detail?.requestId;
    if (!allowed || !/^[a-f0-9-]{36}$/i.test(key || '') || accepted.has(key)) return;
    accepted.add(key);
    emit('formulario_aceptado', 'inquiry');
  });
  window.TempoMeasurement = Object.freeze({ eligible, setConsent });
  start();
})();
