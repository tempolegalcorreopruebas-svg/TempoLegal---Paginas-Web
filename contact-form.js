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
  const translations = {
    es: { send: 'Enviar consulta por correo', sending: 'Enviando consulta...', consent: 'He leído la', policy: 'Política de privacidad', review: 'Revise los datos de su consulta', accepted: 'La consulta fue aceptada por el servidor de correo. Referencia: {reference}.', unavailable: 'El envío directo por correo no está disponible. Puede continuar por WhatsApp o abrir su correo.', invalid: 'Revise los datos de la consulta y vuelva a intentarlo.', privacy: 'Confirme que ha leído la información de privacidad antes de enviar.', limited: 'Ha realizado varias solicitudes. Espere unos minutos o utilice los otros canales de contacto.', uncertain: 'No pudimos confirmar el envío. Evite reenviar la misma solicitud y contáctenos por otro canal.', token: 'La sesión de envío expiró. Se ha renovado; vuelva a pulsar Enviar.', prepared: 'Consulta preparada', success: 'Consulta enviada', required: 'Complete este campo.', name: 'Nombre', email: 'Correo', company: 'Empresa', service: 'Servicio', message: 'Consulta', edit: 'Editar consulta', reviewButton: 'Revisar consulta' },
    en: { send: 'Send enquiry by email', sending: 'Sending enquiry...', consent: 'I have read the', policy: 'Privacy policy', review: 'Review your enquiry details', accepted: 'The mail server accepted the enquiry. Reference: {reference}.', unavailable: 'Direct email submission is unavailable. You can continue on WhatsApp or open your email app.', invalid: 'Review your enquiry details and try again.', privacy: 'Confirm that you have read the privacy information before sending.', limited: 'You have made several requests. Wait a few minutes or use another contact channel.', uncertain: 'We could not confirm delivery. Avoid resending the same request and contact us through another channel.', token: 'Your submission session expired and has been renewed. Press Send again.', prepared: 'Enquiry prepared', success: 'Enquiry sent', required: 'Complete this field.', name: 'Name', email: 'Email', company: 'Company', service: 'Service', message: 'Enquiry', edit: 'Edit enquiry', reviewButton: 'Review enquiry' },
    pt: { send: 'Enviar consulta por e-mail', sending: 'Enviando consulta...', consent: 'Li a', policy: 'Política de privacidade', review: 'Revise os dados da consulta', accepted: 'O servidor de e-mail aceitou a consulta. Referência: {reference}.', unavailable: 'O envio direto por e-mail está indisponível. Continue pelo WhatsApp ou abra seu aplicativo de e-mail.', invalid: 'Revise os dados da consulta e tente novamente.', privacy: 'Confirme que leu as informações de privacidade antes de enviar.', limited: 'Você fez várias solicitações. Aguarde alguns minutos ou use outro canal de contato.', uncertain: 'Não foi possível confirmar o envio. Evite reenviar a mesma solicitação e utilize outro canal.', token: 'Sua sessão expirou e foi renovada. Clique em Enviar novamente.', prepared: 'Consulta preparada', success: 'Consulta enviada', required: 'Preencha este campo.', name: 'Nome', email: 'E-mail', company: 'Empresa', service: 'Serviço', message: 'Consulta', edit: 'Editar consulta', reviewButton: 'Revisar consulta' },
    fr: { send: 'Envoyer la demande par courriel', sending: 'Envoi en cours...', consent: 'J’ai lu la', policy: 'Politique de confidentialité', review: 'Vérifiez les informations de votre demande', accepted: 'Le serveur de messagerie a accepté la demande. Référence : {reference}.', unavailable: 'L’envoi direct est indisponible. Vous pouvez utiliser WhatsApp ou votre messagerie.', invalid: 'Vérifiez les informations de votre demande et réessayez.', privacy: 'Confirmez avoir lu les informations de confidentialité avant l’envoi.', limited: 'Vous avez effectué plusieurs demandes. Patientez quelques minutes ou utilisez un autre moyen de contact.', uncertain: 'Nous n’avons pas pu confirmer l’envoi. Évitez de renvoyer la même demande et utilisez un autre canal.', token: 'Votre session d’envoi a expiré et a été renouvelée. Cliquez à nouveau sur Envoyer.', prepared: 'Demande préparée', success: 'Demande envoyée', required: 'Remplissez ce champ.', name: 'Nom', email: 'Courriel', company: 'Entreprise', service: 'Service', message: 'Demande', edit: 'Modifier la demande', reviewButton: 'Vérifier la demande' }
  };
  let prepared = null;
  let token = '';
  let available = false;
  let busy = false;
  let sent = false;
  let statusKey = '';
  let reference = '';
  const language = () => window.TempoI18n?.language || document.documentElement.lang || 'es';
  const text = key => (translations[language()] || translations.es)[key];
  const originalServices = () => window.TempoI18n?.get('serviceItems') || [];

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
    status.textContent = key ? text(key).replace('{reference}', reference) : '';
    status.hidden = !key;
  }

  function render() {
    sendButton.hidden = !available;
    sendButton.disabled = busy || sent;
    sendButton.textContent = text(busy ? 'sending' : 'send');
    consentBlock.hidden = !available || sent;
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
      const response = await fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!(response.headers.get('Content-Type') || '').includes('application/json')) {
        available = false;
        token = '';
        render();
        return false;
      }
      const data = await response.json();
      available = response.ok && data.available === true && typeof data.token === 'string';
      token = available ? data.token : '';
    } catch (_) { available = false; }
    render();
    return available;
  }

  function prepare(data, summary, assessment = '') {
    const selected = originalServices().find(item => item.formValue === data.servicio);
    const selectedOption = [...form.elements.servicio.options].find(option => option.value === data.servicio);
    prepared = {
      name: data.nombre.trim(), email: data.correo.trim(), company: (data.empresa || '').trim(),
      message: data.mensaje.trim(), language: language(), service: selected?.id || (data.servicio === 'Radar legal empresarial' ? 'radar' : 'general'),
      requestId: requestId(), website: form.elements.website?.value || '', assessment
    };
    sent = false;
    consent.checked = false;
    const preview = summary || [text('name') + ': ' + prepared.name, text('email') + ': ' + prepared.email, text('company') + ': ' + prepared.company, text('service') + ': ' + (selectedOption?.textContent || ''), '', prepared.message].join('\n');
    review.textContent = preview;
    showStatus(available ? '' : 'unavailable');
    render();
    refreshToken().then(ready => { if (ready && !sent && statusKey === 'unavailable') showStatus(''); });
    if (form.dataset.directInquiry !== undefined) {
      const whatsapp = document.getElementById('contact-send');
      whatsapp.href = 'https://wa.me/593978887392?text=' + encodeURIComponent(preview);
      whatsapp.textContent = window.TempoI18n.t('continueWhatsapp');
      whatsapp.hidden = false;
      const emailLink = document.getElementById('contact-send-email');
      emailLink.href = 'mailto:info@tempolegal.com?subject=' + encodeURIComponent('TempoLegal enquiry') + '&body=' + encodeURIComponent(preview);
      emailLink.textContent = window.TempoI18n.t('openEmail');
      emailLink.hidden = false;
      form.hidden = true;
      result.hidden = false;
      result.querySelector('h3').tabIndex = -1;
      result.querySelector('h3').focus({ preventScroll: true });
    }
  }

  document.addEventListener('tempo:requestprepared', event => prepare(event.detail.data, event.detail.summary, event.detail.assessment || ''));
  sendButton.addEventListener('click', async () => {
    if (!prepared || busy || sent) return;
    if (!consent.checked) { showStatus('privacy'); consent.focus(); return; }
    if (!available || !token) { showStatus('unavailable'); return; }
    busy = true;
    showStatus('');
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
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
        document.dispatchEvent(new CustomEvent('tempo:formaccepted', { detail: { requestId: prepared.requestId } }));
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
      [...form.querySelectorAll('input:not([name=website]),textarea')].forEach(field => { field.value = field.value.trim(); });
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      prepare(data);
    });
    document.getElementById('edit-request').addEventListener('click', () => {
      result.hidden = true; form.hidden = false; form.elements.nombre.focus();
    });
    document.getElementById('download-request').hidden = true;
  }
  form.addEventListener('focusin', () => { if (!token) refreshToken(); }, { once: true });
  document.addEventListener('tempo:languagechange', render);
  render();
})();
