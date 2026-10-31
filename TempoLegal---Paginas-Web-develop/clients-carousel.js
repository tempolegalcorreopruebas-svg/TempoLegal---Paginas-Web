'use strict';
/* Componente · Logos de clientes en movimiento (tarea 1.4).
   Marcado: _componentes/logos.html. Funciona con uno o varios bloques
   .clients-marquee por página. Cada bloque busca, dentro de su sección,
   el botón .clients-motion-toggle para pausar y reanudar. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = (value, period) => period ? ((value % period) + period) % period : 0;
  const localText = key => window.TempoI18n?.t(key) || ({ clientsPause: 'Pausar movimiento', clientsPlay: 'Reanudar movimiento' }[key] || key);

  function initCarousel(container) {
    if (container.dataset.carouselReady) return;
    container.dataset.carouselReady = 'true';
    const section = container.closest('section') || container.parentElement;
    const button = section.querySelector('.clients-motion-toggle');
    const text = button ? (button.querySelector('[data-i18n]') || button.lastElementChild) : null;
    const tracks = [];
    let visible = false, manualPause = false, last = 0;

    container.querySelectorAll('.clients-marquee-row').forEach((viewport, index) => {
      const lane = viewport.querySelector('.clients-marquee-lane');
      const original = lane && lane.querySelector('.clients-marquee-set');
      if (!lane || !original) return;
      const clone = original.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(img => { img.alt = ''; img.loading = 'lazy'; });
      lane.appendChild(clone);
      const item = { viewport, lane, original, offset: 0, period: 1, speed: index === 0 ? 39 : 33, direction: index % 2 === 0 ? 1 : -1, hovered: false, dragging: false, dragX: 0, manualUntil: 0 };
      tracks.push(item);
      const move = () => { item.lane.style.transform = `translate3d(${-item.offset}px,0,0)`; };
      viewport.addEventListener('pointerenter', () => { item.hovered = true; });
      viewport.addEventListener('pointerleave', () => { item.hovered = false; });
      viewport.addEventListener('pointerdown', event => {
        if (reduced.matches || event.button !== 0) return;
        item.dragging = true; item.dragX = event.clientX; item.manualUntil = performance.now() + 2200;
        viewport.setPointerCapture?.(event.pointerId);
      });
      viewport.addEventListener('pointermove', event => {
        const card = event.target.closest('.client-logo');
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--light-x', ((event.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          card.style.setProperty('--light-y', ((event.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }
        if (!item.dragging) return;
        item.offset = wrap(item.offset - (event.clientX - item.dragX), item.period);
        item.dragX = event.clientX; move(); item.manualUntil = performance.now() + 3200;
      });
      const stop = () => { item.dragging = false; item.manualUntil = performance.now() + 2600; };
      viewport.addEventListener('pointerup', stop);
      viewport.addEventListener('pointercancel', stop);
      viewport.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || reduced.matches) return;
        event.preventDefault();
        item.offset = wrap(item.offset + (event.key === 'ArrowRight' ? 180 : -180), item.period);
        move(); item.manualUntil = performance.now() + 4200;
      });
      viewport.addEventListener('focusin', () => { item.hovered = true; });
      viewport.addEventListener('focusout', event => { if (!viewport.contains(event.relatedTarget)) item.hovered = false; });
    });

    function measure() {
      tracks.forEach(item => {
        const gap = Number.parseFloat(getComputedStyle(item.lane).columnGap) || 0;
        const period = item.original.getBoundingClientRect().width + gap;
        if (period > 0) { item.offset = wrap(item.offset, period); item.period = period; item.lane.style.transform = `translate3d(${-item.offset}px,0,0)`; }
      });
    }
    function labels() {
      if (!button) return;
      const key = manualPause ? 'clientsPlay' : 'clientsPause', value = localText(key);
      if (text) text.textContent = value;
      button.setAttribute('aria-label', value);
      button.setAttribute('data-i18n-aria-label', key);
      button.setAttribute('aria-pressed', String(manualPause));
      section.classList.toggle('clients-is-paused', manualPause);
    }
    button?.addEventListener('click', () => { manualPause = !manualPause; labels(); });
    document.addEventListener('tempo:languagechange', labels);

    function tick(time) {
      const dt = Math.min(48, time - last || 16); last = time;
      if (visible && !manualPause && !document.hidden && !reduced.matches) {
        tracks.forEach(item => {
          if (item.period < 2 || item.hovered || item.dragging || time < item.manualUntil) return;
          item.offset = wrap(item.offset + item.direction * item.speed * dt / 1000, item.period);
          item.lane.style.transform = `translate3d(${-item.offset.toFixed(2)}px,0,0)`;
        });
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: '120px 0px', threshold: 0 }).observe(section);
    else visible = true;
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    tracks.forEach(item => resizeObserver?.observe(item.original));
    window.addEventListener('resize', measure, { passive: true });
    const updateMotion = () => { container.classList.toggle('clients-reduced-motion', reduced.matches); measure(); };
    reduced.addEventListener?.('change', updateMotion);
    updateMotion(); labels(); requestAnimationFrame(tick);
  }

  document.querySelectorAll('.clients-marquee').forEach(initCarousel);
})();
