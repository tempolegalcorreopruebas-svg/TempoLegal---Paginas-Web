'use strict';

// Manual selectors enhance complete HTML; every panel remains readable without JavaScript.
(() => {
  const main = document.querySelector('[data-service-update]');
  if (!main) return;
  const contact = document.getElementById('contact-form');
  let selectedContext = '';
  const syncContext = () => {
    if (!contact) return;
    contact.dataset.selectedContext = selectedContext;
    const message = contact.elements.mensaje;
    if (message && (!message.value || message.value === message.dataset.suggestedMessage)) {
      const suggestion = selectedContext ? selectedContext + '. ' : '';
      message.value = suggestion;
      message.dataset.suggestedMessage = suggestion;
    }
  };

  function installSelector(selector, attribute) {
    const container = main.querySelector(selector);
    if (!container) return;
    const controls = [...container.querySelectorAll('[' + attribute + ']')];
    const panels = [...container.querySelectorAll('[data-panel]')];
    const choose = (control, focus = false) => {
      controls.forEach(button => {
        const active = button === control;
        button.setAttribute('aria-pressed', String(active));
        if (button.tagName === 'A') {
          if (active) button.setAttribute('aria-current', 'true');
          else button.removeAttribute('aria-current');
        }
      });
      panels.forEach(panel => {
        panel.hidden = panel.dataset.panel !== control.getAttribute(attribute);
      });
      selectedContext = control.textContent.replace('↗', '').trim();
      syncContext();
      if (focus) control.focus();
    };
    controls.forEach((control, index) => {
      const panel = panels.find(item => item.dataset.panel === control.getAttribute(attribute));
      if (!panel) return;
      if (!panel.id) panel.id = 'service-panel-' + index;
      control.setAttribute('aria-controls', panel.id);
      control.addEventListener('click', event => { event.preventDefault(); choose(control); });
      control.addEventListener('keydown', event => {
        const directions = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let next;
        if (event.key in directions) next = (index + directions[event.key] + controls.length) % controls.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = controls.length - 1;
        else return;
        event.preventDefault(); choose(controls[next], true);
      });
    });
    if (controls.length) choose(controls[0]);
  }

  installSelector('.change-selector', 'data-change');
  installSelector('.route-grid', 'data-route');
  main.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    selectedContext = link.dataset.service;
    syncContext();
  }));
  document.addEventListener('tempo:languagechange', syncContext);

  // The SVG keeps its complete labels and a static fallback without JavaScript.
  const map = main.querySelector('.representation-map');
  if (map) {
    const svg = map.querySelector('svg');
    const places = [...map.querySelectorAll('[data-map-place]')];
    const routes = [...map.querySelectorAll('[data-map-route]')];
    const signals = [...map.querySelectorAll('[data-map-signal]')];
    const status = map.querySelector('[data-map-status]');
    const initialStatus = status.textContent;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    function highlight(place) {
      const selected = place?.dataset.mapPlace;
      places.forEach(item => item.setAttribute('aria-pressed', String(selected !== undefined && item.dataset.mapPlace === selected)));
      routes.forEach(item => item.classList.toggle('is-highlighted', item.dataset.mapRoute === selected));
      signals.forEach(item => item.classList.toggle('is-highlighted', item.dataset.mapSignal === selected));
      status.textContent = place ? 'Quito, Ecuador · ' + place.getAttribute('aria-label') : initialStatus;
    }
    places.forEach(place => {
      place.addEventListener('pointerenter', () => highlight(place));
      place.addEventListener('focus', () => highlight(place));
      place.addEventListener('click', () => highlight(place));
      place.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); highlight(place); }
        if (event.key === 'Escape') highlight(null);
      });
    });
    svg.addEventListener('pointerleave', () => { if (!svg.contains(document.activeElement)) highlight(null); });
    svg.addEventListener('focusout', event => { if (!svg.contains(event.relatedTarget)) highlight(null); });
    function updatePlayback() {
      const play = visible && !document.hidden && !reduced.matches;
      map.classList.toggle('is-map-paused', !play);
      if (play) svg.unpauseAnimations?.();
      else svg.pauseAnimations?.();
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting; updatePlayback();
      }, { threshold: 0.05 });
      observer.observe(map);
    }
    reduced.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    updatePlayback();
  }
})();
