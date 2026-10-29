'use strict';
// Lightweight connection-map interaction and method progress for the compact section.
(() => {
  const section = document.querySelector('#empresas-extranjeras');
  const map = section?.querySelector('.coverage-map');
  const places = [...(map?.querySelectorAll('[data-country]') || [])];
  if (map) {
    const status = document.createElement('p');
    status.className = 'coverage-map-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    map.append(status);
    let selected = null;
    function highlight(place, announce = false) {
      places.forEach(item => {
        item.classList.toggle('is-active', item === place);
        item.setAttribute('aria-pressed', String(item === selected));
      });
      map.querySelectorAll('[data-route]').forEach(route => route.classList.toggle('is-active', route.dataset.route === place?.dataset.country));
      const label = place?.getAttribute('aria-label') || '';
      status.textContent = label;
    }
    places.forEach(place => {
      place.addEventListener('pointerenter', () => highlight(place));
      place.addEventListener('pointerleave', () => highlight(selected));
      place.addEventListener('focus', () => highlight(place));
      place.addEventListener('blur', () => highlight(selected));
      const select = () => { selected = selected === place ? null : place; highlight(selected, true); };
      place.addEventListener('click', select);
      place.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); }
        if (event.key === 'Escape') { selected = null; highlight(null, true); }
      });
    });
  }
})();
