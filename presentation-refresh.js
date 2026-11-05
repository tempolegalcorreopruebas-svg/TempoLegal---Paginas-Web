'use strict';
(() => {
  const I = window.TempoI18n;
  const dialog = document.querySelector('#client-directory');
  const search = document.querySelector('#client-search');
  let filter = 'all';
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function updateDirectory() {
    if (!dialog) return;
    const query = normalize(search.value);
    let count = 0;
    dialog.querySelectorAll('[data-client-name]').forEach(item => {
      const visible = normalize(item.dataset.clientName).includes(query) && (filter === 'all' || item.dataset.clientData === 'true');
      item.hidden = !visible;
      if (visible) count++;
    });
    dialog.querySelector('.directory-status').textContent = I.t('clientsFound', {count});
    dialog.querySelector('.directory-empty').hidden = count > 0;
  }
  if (dialog) {
    search.addEventListener('input', updateDirectory);
    dialog.querySelectorAll('[data-client-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.clientFilter;
      dialog.querySelectorAll('[data-client-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      updateDirectory();
    }));
    updateDirectory();
    document.addEventListener('tempo:languagechange', updateDirectory);
  }
  // Hash links reveal the additional approved experience before navigation.
  document.querySelectorAll('a[href="#testimonio-eleazar"]').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.client-experience').open = true;
  }));
  if (dialog) dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => dialog.close()));
  // Foto del equipo de informática (tarea 0.1): nombres y foto se activan desde config.js.
  const teamFigure = document.querySelector('[data-technical-team-figure]');
  if (teamFigure) {
    const groupPhoto = window.TEMPO_CONFIG?.technicalTeamPhoto;
    const teamNames = window.TEMPO_CONFIG?.technicalTeamNames;
    const caption = teamFigure.querySelector('.it-team-names');
    if (teamNames && caption) { caption.textContent = teamNames; caption.hidden = false; }
    if (groupPhoto) {
      const photo = new Image();
      photo.src = /^https?:|^\//.test(groupPhoto) ? groupPhoto : (document.documentElement.dataset.base || '') + groupPhoto;
      photo.alt = I.t('technicalTeamAlt');
      photo.loading = 'lazy';
      photo.decoding = 'async';
      const frame = teamFigure.querySelector('.it-team-photo-frame');
      frame.replaceChildren(photo);
      frame.removeAttribute('aria-hidden');
      teamFigure.classList.add('has-photo');
    }
  }
})();
