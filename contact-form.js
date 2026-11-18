'use strict';

// The existing review step remains available; SMTP delivery is an explicit action.
(() => {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('contact-result');
  if (!form || !result) return;
  const endpoint = form.dataset.endpoint;
  const status = document.getElementById('contact-delivery-status');
  const sendButton = document.getElementById('contact-send-server');
  const consent = document.getElementById('contact-privacy-accepted');
  const consentBlock = document.getElementById('contact-server-consent');
  const review = document.getElementById('contact-review');
  const editButton = document.getElementById('edit-request');
  const translations = {
    es: { send: 'Enviar consulta por correo', sending: 'Enviando consulta...', consent: 'He leído la', policy: 'Política de privacidad', review: 'Revise los datos de su consulta', accepted: 'La consulta fue aceptada por el servidor de correo. Referencia: {reference}.', unavailable: 'El envío directo por correo no está disponible. Puede continuar por WhatsApp o abrir su correo.', invalid: 'Revise los datos de la consulta y vuelva a intentarlo.', privacy: 'Confirme que ha leído la información de privacidad antes de enviar.', limited: 'Ha realizado varias solicitudes. Espere unos minutos o utilice los otros canales de contacto.', uncertain: 'No pudimos confirmar el envío. Evite reenviar la misma solicitud y contáctenos por otro canal.', token: 'La sesión de envío expiró. Se ha renovado; vuelva a pulsar Enviar.', prepared: 'Consulta preparada', success: 'Consulta enviada', required: 'Complete este campo.', name: 'Nombre', email: 'Correo', company: 'Empresa', service: 'Servicio', message: 'Consulta', edit: 'Editar consulta', reviewButton: 'Revisar consulta' },
    en: { send: 'Send enquiry by email', sending: 'Sending enquiry...', consent: 'I have read the', policy: 'Privacy policy', review: 'Review your enquiry details', accepted: 'The mail server accepted the enquiry. Reference: {reference}.', unavailable: 'Direct email submission is unavailable. You can continue on WhatsApp or open your email app.', invalid: 'Review your enquiry details and try again.', privacy: 'Confirm that you have read the privacy information before sending.', limited: 'You have made several requests. Wait a few minutes or use another contact channel.', uncertain: 'We could not confirm delivery. Avoid resending the same request and contact us through another channel.', token: 'Your submission session expired and has been renewed. Press Send again.', prepared: 'Enquiry prepared', success: 'Enquiry sent', required: 'Complete this field.', name: 'Name', email: 'Email', company: 'Company', service: 'Service', message: 'Enquiry', edit: 'Edit enquiry', reviewButton: 'Review enquiry' },
    pt: { send: 'Enviar consulta por e-mail', sending: 'Enviando consulta...', consent: 'Li a', policy: 'Política de privacidade', review: 'Revise os dados da consulta', accepted: 'O servidor de e-mail aceitou a consulta. Referência: {reference}.', unavailable: 'O envio direto por e-mail está indisponível. Continue pelo WhatsApp ou abra seu aplicativo de e-mail.', invalid: 'Revise os dados da consulta e tente novamente.', privacy: 'Confirme que leu as informações de privacidade antes de enviar.', limited: 'Você fez várias solicitações. Aguarde alguns minutos ou use outro canal de contato.', uncertain: 'Não foi possível confirmar o envio. Evite reenviar a mesma solicitação e utilize outro canal.', token: 'Sua sessão expirou e foi renovada. Clique em Enviar novamente.', prepared: 'Consulta preparada', success: 'Consulta enviada', required: 'Preencha este campo.', name: 'Nome', email: 'E-mail', company: 'Empresa', service: 'Serviço', message: 'Consulta', edit: 'Editar consulta', reviewButton: 'Revisar consulta' },
    fr: { send: 'Envoyer la demande par courriel', sending: 'Envoi en cours...', consent: 'J’ai lu la', policy: 'Politique de confidentialité', review: 'Vérifiez les informations de votre demande', accepted: 'Le serveur de messagerie a accepté la demande. Référence : {reference}.', unavailable: 'L’envoi direct est indisponible. Vous pouvez utiliser WhatsApp ou votre messagerie.', invalid: 'Vérifiez les informations de votre demande et réessayez.', privacy: 'Confirmez avoir lu les informations de confidentialité avant l’envoi.', limited: 'Vous avez effectué plusieurs demandes. Patientez quelques minutes ou utilisez un autre moyen de contact.', uncertain: 'Nous n’avons pas pu confirmer l’envoi. Évitez de renvoyer la même demande et utilisez un autre canal.', token: 'Votre session d’envoi a expiré et a été renouvelée. Cliquez à nouveau sur Envoyer.', prepared: 'Demande préparée', success: 'Demande envoyée', required: 'Remplissez ce champ.', name: 'Nom', email: 'Courriel', company: 'Entreprise', service: 'Service', message: 'Demande', edit: 'Modifier la demande', reviewButton: 'Vérifier la demande' }
  };
  let prepared = null;
  const requestIds = new Map();
  const acceptedRequests = new Set();
  const localPreviewCopy = {
    es: 'El envío directo requiere abrir el sitio publicado con HTTPS. Desde este archivo local puede continuar por WhatsApp o abrir su aplicación de correo.',
    en: 'Direct submission requires the published HTTPS site. From this local file, you can continue on WhatsApp or open your email app.',
    pt: 'O envio direto exige o site publicado com HTTPS. Neste arquivo local, você pode continuar pelo WhatsApp ou abrir seu aplicativo de e-mail.',
    fr: 'L’envoi direct nécessite le site publié en HTTPS. Depuis ce fichier local, vous pouvez continuer sur WhatsApp ou ouvrir votre application de messagerie.'
  };
  const serviceNotice = () => location.protocol === 'file:' ? 'localPreview' : 'unavailable';
  let token = '';
  let available = false;
  let busy = false;
  let sent = false;
  let statusKey = '';
  let reference = '';
  const language = () => window.TempoI18n?.language || document.documentElement.lang || 'es';
  const text = key => (translations[language()] || translations.es)[key];
  const originalServices = () => window.TempoI18n?.get('serviceItems') || [];

  const dataServices = [
    { id: 'data', label: 'menuDataHub' },
    { id: 'data-dpo', label: 'menuDpo', route: 'delegado-proteccion-datos-externo-ecuador' },
    { id: 'data-lopdp', label: 'menuLopdp', route: 'implementacion-lopdp' }
  ];
  if (form.dataset.serviceContext === 'data') {
    const select = form.elements.servicio;
    const preferred = dataServices.find(service => service.route && location.pathname.split('/').includes(service.route)) || dataServices[0];
    const ordered = [preferred, ...dataServices.filter(service => service !== preferred)];
    function localizeDataOptions() {
      const selected = dataServices.some(service => service.id === select.value) ? select.value : preferred.id;
      select.replaceChildren(...ordered.map(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = window.TempoI18n.t(service.label);
        return option;
      }));
      select.value = selected;
    }
    localizeDataOptions();
    document.addEventListener('tempo:languagechange', localizeDataOptions);
  }

  const dialogLabels = {
    es: ['Solicitar orientación', 'Cerrar consulta'],
    en: ['Request guidance', 'Close enquiry'],
    pt: ['Solicitar orientação', 'Fechar consulta'],
    fr: ['Demander conseil', 'Fermer la demande']
  };
  const existingDialog = form.closest('dialog');
  if (existingDialog) existingDialog.classList.add('contact-popout', 'contact-page-form');

  function installPopout() {
    if (existingDialog || typeof HTMLDialogElement === 'undefined' ||
        typeof HTMLDialogElement.prototype.showModal !== 'function') return;

    const [title, closeLabel] = dialogLabels[language()] || dialogLabels.es;
    const anchors = new Set(['#contact-form', '#contacto', '#consulta', '#contact', '#solicitar-orientacion', '#direct-contact-title']);
    const inlineTrigger = document.createElement('button');
    inlineTrigger.type = 'button';
    inlineTrigger.className = 'button button-primary';
    inlineTrigger.textContent = title;

    const dialog = document.createElement('dialog');
    dialog.id = 'contact-dialog';
    dialog.className = 'site-dialog contact-popout contact-page-form';
    dialog.setAttribute('aria-labelledby', 'contact-popout-title');
    const heading = document.createElement('h2');
    heading.id = 'contact-popout-title';
    heading.textContent = title;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close-dialog';
    close.setAttribute('aria-label', closeLabel);
    close.textContent = '×';
    close.autofocus = true;
    close.addEventListener('click', () => dialog.close());

    function opensForm(link) {
      if (!link) return false;
      const target = new URL(link.href, document.baseURI);
      if (target.origin === location.origin && target.pathname === location.pathname && anchors.has(target.hash)) {
        // Section-index links still navigate between sections on the page.
        return !link.closest('.tl-service-index');
      }
      return link.matches('[data-i18n="menuCta"]') &&
        target.origin === location.origin && /\/contactanos\/(?:index\.html)?$/.test(target.pathname);
    }

    let opener;
    function open(trigger) {
      if (dialog.open) return;
      opener = trigger;
      dialog.showModal();
      dialog.scrollTop = 0;
    }

    inlineTrigger.setAttribute('aria-haspopup', 'dialog');
    inlineTrigger.setAttribute('aria-controls', dialog.id);
    inlineTrigger.addEventListener('click', () => open(inlineTrigger));
    document.querySelectorAll('a[href]').forEach(link => {
      if (!opensForm(link)) return;
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
    });
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const trigger = event.target.closest?.('a[href]');
      if (!opensForm(trigger)) return;
      event.preventDefault();
      open(trigger);
    });
    dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
    form.replaceWith(inlineTrigger);
    dialog.append(heading, close, form, result);
    document.body.append(dialog);
  }

  const standaloneForm = document.documentElement.classList?.contains('contact-embedded');
  const embedded = standaloneForm ||
    (window.parent !== window && new URLSearchParams(location.search).get('formulario') === 'modal');
  if (embedded) {
    const panel = form.closest('#solicitar-orientacion');
    if (panel) {
      if (standaloneForm) {
        const locale = ['en', 'pt', 'fr'].includes(language()) ? language() + '/' : '';
        panel.querySelectorAll('a[href*="politica-de-privacidad"]').forEach(link => {
          link.href = '../' + locale + 'politica-de-privacidad/index.html';
        });
      }
      panel.classList.add('contact-embedded-panel');
      document.body.append(panel);
      document.documentElement.classList.add('contact-embedded');
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && window.parent !== window) {
          window.parent.postMessage('tempo:close-contact', location.protocol === 'file:' ? '*' : location.origin);
        }
      });
    }
  } else {
    installPopout();
  }


  function requestId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const value = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return [value.slice(0, 8), value.slice(8, 12), value.slice(12, 16), value.slice(16, 20), value.slice(20)].join('-');
  }

  function showStatus(key) {
    statusKey = key;
    status.dataset.state = key;
    status.textContent = key === 'localPreview' ? localPreviewCopy[language()] || localPreviewCopy.es
      : key ? text(key).replace('{reference}', reference) : '';
    status.hidden = !key;
  }

  function render() {
    sendButton.hidden = !prepared || sent;
    sendButton.disabled = busy || sent;
    editButton.disabled = busy;
    consent.disabled = busy;
    result.setAttribute('aria-busy', String(busy));
    sendButton.textContent = text(busy ? 'sending' : 'send');
    consentBlock.hidden = !prepared || sent;
    consentBlock.querySelector('span').textContent = text('consent');
    consentBlock.querySelector('a').textContent = text('policy');
    document.getElementById('contact-review-label').textContent = text('review');
    if (form.dataset.directInquiry !== undefined) form.querySelector('#contact-submit span').textContent = text('reviewButton');
    if (sent) result.querySelector('.eyebrow').textContent = text('success');
    if (statusKey) showStatus(statusKey);
  }

  async function refreshToken() {
    if (!endpoint || location.protocol === 'file:') return false;
    try {
      const response = await fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!(response.headers.get('Content-Type') || '').includes('application/json')) {
        available = false;
        token = '';
        render();
        return false;
      }
      const data = await response.json();
      available = response.ok && data.available === true && typeof data.token === 'string';
      token = available ? data.token : '';
    } catch (_) {
      available = false;
      token = '';
    }
    render();
    return available;
  }

  function prepare(data, summary, assessment = '') {
    if (busy) return;
    const selected = originalServices().find(item => item.formValue === data.servicio);
    const selectedOption = [...form.elements.servicio.options].find(option => option.value === data.servicio);
    const payload = {
      name: data.nombre.trim(), email: data.correo.trim(), company: (data.empresa || '').trim(),
      phone: (data.telefono || '').trim(), message: data.mensaje.trim(), language: language(), service: (form.dataset.serviceContext === 'data' && dataServices.find(service => service.id === data.servicio)?.id) || selected?.id || (data.servicio === 'Radar legal empresarial' ? 'radar' : form.dataset.serviceContext === 'data' ? 'data' : 'general'),
      website: form.elements.website?.value || '', assessment
    };
    const fingerprint = JSON.stringify(payload);
    if (!requestIds.has(fingerprint)) requestIds.set(fingerprint, requestId());
    prepared = { ...payload, requestId: requestIds.get(fingerprint) };
    sent = false;
    consent.checked = false;
    const preview = summary || [text('name') + ': ' + prepared.name, text('email') + ': ' + prepared.email, text('company') + ': ' + prepared.company, text('service') + ': ' + (selectedOption?.textContent || ''), '', prepared.message].join('\n');
    const phoneLine = prepared.phone ? '\n' + (form.elements.telefono?.labels?.[0]?.querySelector('span')?.textContent || window.TempoI18n.t('phoneField')) + ': ' + prepared.phone : '';
    const completePreview = preview + (phoneLine && !preview.includes(prepared.phone) ? phoneLine : '');
    review.textContent = completePreview;
    showStatus(available ? '' : serviceNotice());
    render();
    refreshToken().then(ready => { if (ready && !sent && statusKey === 'unavailable') showStatus(''); });
    if (form.dataset.directInquiry !== undefined) {
      const whatsapp = document.getElementById('contact-send');
      whatsapp.href = 'https://wa.me/593978887392?text=' + encodeURIComponent(completePreview);
      whatsapp.textContent = window.TempoI18n.t('continueWhatsapp');
      whatsapp.hidden = false;
      const emailLink = document.getElementById('contact-send-email');
      emailLink.href = 'mailto:info@tempolegal.com,jag@tempolegal.com?subject=' + encodeURIComponent('TempoLegal enquiry') + '&body=' + encodeURIComponent(completePreview);
      emailLink.textContent = window.TempoI18n.t('openEmail');
      emailLink.hidden = false;
      form.hidden = true;
      result.hidden = false;
      result.querySelector('h3').tabIndex = -1;
      result.querySelector('h3').focus({ preventScroll: true });
      result.closest('dialog')?.scrollTo(0, 0);
    }
  }

  document.addEventListener('tempo:requestprepared', event => prepare(event.detail.data, event.detail.summary, event.detail.assessment || ''));
  sendButton.addEventListener('click', async () => {
    if (!prepared || busy || sent) return;
    if (!consent.checked) { showStatus('privacy'); consent.focus(); return; }
    if (location.protocol === 'file:') { showStatus('localPreview'); return; }
    busy = true;
    showStatus('');
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      if ((!available || !token) && !await refreshToken()) {
        showStatus(serviceNotice());
        return;
      }
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...prepared, token, privacyAccepted: consent.checked })
      });
      const data = await response.json();
      if (response.ok && data.ok === true && /^TL-[0-9]{8}-[A-F0-9]{8}$/.test(data.reference || '')) {
        sent = true;
        reference = data.reference;
        showStatus('accepted');
        if (!acceptedRequests.has(prepared.requestId)) {
        acceptedRequests.add(prepared.requestId);
        document.dispatchEvent(new CustomEvent('tempo:formaccepted', { detail: { requestId: prepared.requestId } }));
      }
        document.getElementById('contact-send').hidden = true;
        document.getElementById('contact-send-email').hidden = true;
      } else if (data.code === 'csrf_expired') {
        await refreshToken();
        showStatus(available ? 'token' : 'unavailable');
      } else if (response.status === 422) showStatus('invalid');
      else if (response.status === 429) showStatus('limited');
      else if (response.status === 503) showStatus('unavailable');
      else showStatus('uncertain');
    } catch (_) { showStatus('uncertain'); }
    finally { clearTimeout(timeout); busy = false; render(); }
  });

  if (form.dataset.directInquiry !== undefined) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy) return;
      [...form.querySelectorAll('input:not([name=website]),textarea')].forEach(field => { field.value = field.value.trim(); });
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      prepare(data);
    });
    editButton.addEventListener('click', () => {
      if (busy) return;
      result.hidden = true; form.hidden = false; form.elements.nombre.focus({ preventScroll: true });
      form.closest('dialog')?.scrollTo(0, 0);
    });
    document.getElementById('download-request').hidden = true;
  }
  form.addEventListener('focusin', () => { if (!token) refreshToken(); }, { once: true });
  document.addEventListener('tempo:languagechange', render);
  render();
})();
