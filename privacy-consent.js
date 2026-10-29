'use strict';
// Local preferences contain only category choices, notice version and expiry, never enquiry data.
(() => {
  const version = '4.4-web-1';
  const key = 'tempo-privacy-choices';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const text = {
    es: { title: 'Preferencias de privacidad', intro: 'Puede consultar el sitio y contactarnos sin aceptar tecnologías opcionales.', necessary: 'Necesarias', necessaryNote: 'Seguridad del formulario y preferencias que usted solicita. Siempre disponibles.', maps: 'Mapa de Google Maps', mapsNote: 'Permite cargar el mapa externo de la oficina. Google recibe datos de conexión al mostrarlo.', analytics: 'Analítica del sitio', analyticsNote: 'Permite medir visitas, clics en WhatsApp y formularios aceptados con Google Analytics. No enviamos el contenido de su consulta.', inactive: 'La analítica está desactivada en esta entrega.', ads: 'Publicidad de seguimiento', adsNote: 'No está instalada ni habilitada en esta entrega.', save: 'Guardar preferencias', reject: 'Rechazar opcionales', accept: 'Aceptar disponibles', close: 'Cerrar preferencias', policy: 'Política de privacidad', banner: 'Su privacidad, su elección', bannerNote: 'La analítica y el mapa externo son opcionales. Puede aceptar, rechazar o configurar sus preferencias con la misma facilidad.', settings: 'Configurar', withdraw: 'Retirar permisos opcionales', detail: 'Su elección se recuerda durante 180 días en este navegador. Puede cambiarla desde el pie de cualquier página. La retirada detiene nuevas cargas y mediciones; no elimina lo ya recibido por terceros.', storage: 'Su navegador no permite guardar esta elección. Se aplicará solo a esta página.', saved: 'Preferencias guardadas.', revision: 'Información técnica de esta entrega', inventory: 'El mapa externo requiere autorización. La analítica está preparada y desactivada; no se cargan Google Ads, Meta, reCAPTCHA ni Clixtell. Las fuentes e imágenes se sirven desde este sitio.' },
    en: { title: 'Privacy preferences', intro: 'You can browse the site and contact us without accepting optional technologies.', necessary: 'Necessary', necessaryNote: 'Form security and preferences you request. Always available.', maps: 'Google Maps', mapsNote: 'Allows the external office map to load. Google receives connection data when it is displayed.', analytics: 'Website analytics', analyticsNote: 'Allows Google Analytics to measure visits, WhatsApp clicks and accepted forms. We do not send your enquiry content.', inactive: 'Analytics is disabled in this delivery.', ads: 'Tracking advertising', adsNote: 'It is not installed or enabled in this delivery.', save: 'Save preferences', reject: 'Reject optional', accept: 'Accept available', close: 'Close preferences', policy: 'Privacy policy', banner: 'Your privacy, your choice', bannerNote: 'Analytics and the external map are optional. You can accept, reject or configure your preferences with equal ease.', settings: 'Configure', withdraw: 'Withdraw optional permissions', detail: 'Your choice is remembered for 180 days in this browser. You can change it in the footer of any page. Withdrawal stops new loads and measurements; it does not delete data already received by third parties.', storage: 'Your browser cannot save this choice. It applies only to this page.', saved: 'Preferences saved.', revision: 'Technical information for this delivery', inventory: 'The external map requires permission. Analytics is prepared and disabled; Google Ads, Meta, reCAPTCHA and Clixtell do not load. Fonts and images are served from this site.' },
    pt: { title: 'Preferências de privacidade', intro: 'Você pode navegar e entrar em contato sem aceitar tecnologias opcionais.', necessary: 'Necessárias', necessaryNote: 'Segurança do formulário e preferências solicitadas por você. Sempre disponíveis.', maps: 'Mapa do Google Maps', mapsNote: 'Permite carregar o mapa externo do escritório. O Google recebe dados de conexão quando ele é exibido.', analytics: 'Análise do site', analyticsNote: 'Permite ao Google Analytics medir visitas, cliques no WhatsApp e formulários aceitos. Não enviamos o conteúdo da consulta.', inactive: 'A análise está desativada nesta entrega.', ads: 'Publicidade de rastreamento', adsNote: 'Não está instalada nem habilitada nesta entrega.', save: 'Salvar preferências', reject: 'Rejeitar opcionais', accept: 'Aceitar disponíveis', close: 'Fechar preferências', policy: 'Política de privacidade', banner: 'Sua privacidade, sua escolha', bannerNote: 'A análise e o mapa externo são opcionais. Você pode aceitar, rejeitar ou configurar suas preferências com a mesma facilidade.', settings: 'Configurar', withdraw: 'Retirar permissões opcionais', detail: 'Sua escolha é lembrada durante 180 dias neste navegador. Você pode alterá-la no rodapé de qualquer página. A retirada interrompe novas cargas e medições; não elimina dados já recebidos por terceiros.', storage: 'Seu navegador não permite salvar esta escolha. Ela vale apenas para esta página.', saved: 'Preferências salvas.', revision: 'Informação técnica desta entrega', inventory: 'O mapa externo exige autorização. A análise está preparada e desativada; Google Ads, Meta, reCAPTCHA e Clixtell não são carregados. Fontes e imagens são servidas por este site.' },
    fr: { title: 'Préférences de confidentialité', intro: 'Vous pouvez consulter le site et nous contacter sans accepter les technologies facultatives.', necessary: 'Nécessaires', necessaryNote: 'Sécurité du formulaire et préférences que vous demandez. Toujours disponibles.', maps: 'Carte Google Maps', mapsNote: 'Permet de charger la carte externe du cabinet. Google reçoit des données de connexion lors de son affichage.', analytics: 'Analyse du site', analyticsNote: 'Permet à Google Analytics de mesurer les visites, clics WhatsApp et formulaires acceptés. Nous ne transmettons pas le contenu de votre demande.', inactive: 'L’analyse est désactivée dans cette livraison.', ads: 'Publicité de suivi', adsNote: 'Elle n’est ni installée ni activée dans cette livraison.', save: 'Enregistrer les préférences', reject: 'Refuser les options', accept: 'Accepter les options disponibles', close: 'Fermer les préférences', policy: 'Politique de confidentialité', banner: 'Votre confidentialité, votre choix', bannerNote: 'L’analyse et la carte externe sont facultatives. Vous pouvez accepter, refuser ou configurer vos préférences avec la même facilité.', settings: 'Configurer', withdraw: 'Retirer les autorisations facultatives', detail: 'Votre choix est mémorisé pendant 180 jours dans ce navigateur. Vous pouvez le modifier dans le pied de chaque page. Le retrait arrête les nouveaux chargements et mesures ; il ne supprime pas les données déjà reçues par des tiers.', storage: 'Votre navigateur ne peut pas enregistrer ce choix. Il vaut uniquement pour cette page.', saved: 'Préférences enregistrées.', revision: 'Informations techniques de cette livraison', inventory: 'La carte externe nécessite une autorisation. L’analyse est préparée et désactivée ; Google Ads, Meta, reCAPTCHA et Clixtell ne sont pas chargés. Les polices et images proviennent de ce site.' }
  };
  const language = () => ['es', 'en', 'pt', 'fr'].includes(document.documentElement.lang) ? document.documentElement.lang : 'es';
  const t = name => text[language()][name];
  const analyticsAvailable = window.TempoMeasurement?.eligible === true;
  let choice = { maps: false, analytics: false };
  let known = false;
  let opener = null;
  let stored = true;

  function read(value) {
    try {
      const saved = JSON.parse(value);
      const now = Date.now();
      if (saved?.version !== version || typeof saved.maps !== 'boolean' || typeof saved.analytics !== 'boolean'
        || !Number.isFinite(saved.updatedAt) || saved.updatedAt > now || now - saved.updatedAt >= lifetime) return null;
      return { maps: saved.maps, analytics: saved.analytics };
    } catch (_) { return null; }
  }
  try { const saved = read(localStorage.getItem(key)); if (saved) { choice = saved; known = true; } } catch (_) { stored = false; }

  const dialog = document.createElement('dialog');
  dialog.className = 'privacy-preferences-dialog consent-dialog';
  dialog.setAttribute('aria-labelledby', 'privacy-preferences-title');
  dialog.setAttribute('aria-describedby', 'privacy-preferences-intro');
  dialog.innerHTML = '<div class="privacy-preferences-heading"><h2 id="privacy-preferences-title" data-consent-text="title"></h2><button type="button" class="privacy-preferences-close" data-consent-close>×</button></div><p id="privacy-preferences-intro" data-consent-text="intro"></p><div class="consent-category"><h3 data-consent-text="necessary"></h3><p data-consent-text="necessaryNote"></p></div><div class="consent-category"><label><input type="checkbox" id="privacy-maps-choice" aria-describedby="consent-maps-note"><span data-consent-text="maps"></span></label><p id="consent-maps-note" data-consent-text="mapsNote"></p></div><div class="consent-category"><label><input type="checkbox" id="privacy-analytics-choice" aria-describedby="consent-analytics-note"><span data-consent-text="analytics"></span></label><p id="consent-analytics-note" data-consent-text="analyticsNote"></p><p data-consent-inactive data-consent-text="inactive"></p></div><div class="consent-category"><h3 data-consent-text="ads"></h3><p data-consent-text="adsNote"></p></div><p class="privacy-choice-note" data-consent-text="detail"></p><a data-consent-policy data-consent-text="policy"></a><p class="consent-storage-status" role="status" aria-live="polite"></p><div class="privacy-preferences-actions"><button type="button" data-consent-reject data-consent-text="reject"></button><button type="button" data-consent-accept data-consent-text="accept"></button><button type="button" data-consent-save data-consent-text="save"></button></div>';
  document.body.append(dialog);
  const mapsInput = dialog.querySelector('#privacy-maps-choice');
  const analyticsInput = dialog.querySelector('#privacy-analytics-choice');
  analyticsInput.disabled = !analyticsAvailable;
  dialog.querySelector('[data-consent-inactive]').hidden = analyticsAvailable;
  const banner = document.createElement('section');
  banner.className = 'consent-banner';
  banner.setAttribute('aria-labelledby', 'consent-banner-title');
  banner.innerHTML = '<div><h2 id="consent-banner-title" data-consent-text="banner"></h2><p data-consent-text="bannerNote"></p><a data-consent-policy data-consent-text="policy"></a></div><div class="consent-banner-actions"><button type="button" data-consent-reject data-consent-text="reject"></button><button type="button" data-consent-accept data-consent-text="accept"></button><button type="button" data-consent-settings data-consent-text="settings"></button></div>';
  banner.hidden = known || !analyticsAvailable;
  document.body.append(banner);
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  document.body.append(status);

  function translate() {
    [dialog, banner].forEach(container => container.querySelectorAll('[data-consent-text]').forEach(node => { node.textContent = t(node.dataset.consentText); }));
    dialog.querySelector('[data-consent-close]').setAttribute('aria-label', t('close'));
    const policy = document.querySelector('a[data-i18n=privacyLink]')?.href || new URL((language() === 'es' ? '/' : '/' + language() + '/') + 'politica-de-privacidad/', location.href).href;
    [dialog, banner].forEach(container => container.querySelectorAll('[data-consent-policy]').forEach(link => { link.href = policy; }));
    document.querySelectorAll('[data-privacy-preferences]').forEach(button => { button.textContent = t('title'); });
    document.querySelectorAll('[data-privacy-withdraw]').forEach(button => { button.textContent = t('withdraw'); });
    document.querySelectorAll('[data-technology-inventory]').forEach(note => {
      note.querySelector('h2').textContent = t('revision');
      note.querySelector('p').textContent = t('inventory');
      if (analyticsAvailable) note.querySelector('p').textContent = { es: 'Google Maps y Google Analytics requieren autorización independiente. No se cargan Google Ads, Meta, reCAPTCHA ni Clixtell. Las fuentes e imágenes se sirven desde este sitio.', en: 'Google Maps and Google Analytics require separate permission. Google Ads, Meta, reCAPTCHA and Clixtell do not load. Fonts and images are served from this site.', pt: 'Google Maps e Google Analytics exigem autorizações independentes. Google Ads, Meta, reCAPTCHA e Clixtell não são carregados. Fontes e imagens são servidas por este site.', fr: 'Google Maps et Google Analytics nécessitent des autorisations distinctes. Google Ads, Meta, reCAPTCHA et Clixtell ne sont pas chargés. Les polices et images proviennent de ce site.' }[language()];
      note.querySelector('button').textContent = t('title');
    });
  }

  function updateMaps() {
    document.querySelectorAll('.footer-map iframe[data-src]').forEach(frame => {
      if (choice.maps) {
        if (frame.getAttribute('src') !== frame.dataset.src) frame.src = frame.dataset.src;
        frame.hidden = false;
      } else { frame.removeAttribute('src'); frame.hidden = true; }
      const placeholder = frame.closest('.footer-map')?.querySelector('.footer-map-consent');
      if (placeholder) placeholder.hidden = choice.maps;
    });
  }

  function apply() {
    updateMaps();
    window.TempoMeasurement?.setConsent(choice.analytics);
  }

  function save(next) {
    choice = { maps: next.maps === true, analytics: analyticsAvailable && next.analytics === true };
    known = true;
    try { localStorage.setItem(key, JSON.stringify({ version, ...choice, advertising: false, updatedAt: Date.now() })); stored = true; } catch (_) { stored = false; }
    banner.hidden = true;
    dialog.querySelector('.consent-storage-status').textContent = stored ? '' : t('storage');
    status.textContent = t(stored ? 'saved' : 'storage');
    apply();
  }

  function open(button) {
    opener = button || document.activeElement;
    mapsInput.checked = choice.maps;
    analyticsInput.checked = analyticsAvailable && choice.analytics;
    dialog.querySelector('.consent-storage-status').textContent = stored ? '' : t('storage');
    dialog.showModal();
    document.body.classList.add('privacy-settings-open');
  }
  function close() { if (dialog.open) dialog.close(); }
  document.addEventListener('click', event => {
    const target = event.target.closest?.('button');
    if (!target) return;
    if (target.matches('[data-privacy-preferences],[data-consent-settings]')) open(target);
    else if (target.matches('[data-map-consent]')) save({ ...choice, maps: true });
    else if (target.matches('[data-consent-reject],[data-privacy-withdraw]')) { save({ maps: false, analytics: false }); close(); }
    else if (target.matches('[data-consent-accept]')) { save({ maps: true, analytics: analyticsAvailable }); close(); }
    else if (target.matches('[data-consent-save]')) { save({ maps: mapsInput.checked, analytics: analyticsInput.checked }); close(); }
    else if (target.matches('[data-consent-close]')) close();
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('privacy-settings-open'); opener?.focus({ preventScroll: true }); });
  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    const saved = read(event.newValue);
    known = !!saved;
    choice = saved || { maps: false, analytics: false };
    banner.hidden = known || !analyticsAvailable;
    if (dialog.open) { mapsInput.checked = choice.maps; analyticsInput.checked = analyticsAvailable && choice.analytics; }
    apply();
  });
  // Expire a choice on a long-open tab too; expired permissions must not remain active indefinitely.
  setInterval(() => {
    if (!known || !stored) return;
    let saved;
    try { saved = read(localStorage.getItem(key)); } catch (_) { return; }
    if (!saved) { known = false; choice = { maps: false, analytics: false }; banner.hidden = !analyticsAvailable; apply(); }
  }, 60000);
  document.querySelectorAll('[data-map-consent]').forEach(button => { button.disabled = false; });
  document.querySelectorAll('[data-privacy-preferences],[data-privacy-withdraw]').forEach(button => { button.hidden = false; });
  document.addEventListener('tempo:languagechange', translate);
  translate();
  apply();
})();
