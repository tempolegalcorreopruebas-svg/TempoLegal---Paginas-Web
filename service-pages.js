'use strict';

// Progressive enhancement leaves the complete translated content in the HTML.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('.service-section[id]')];
  const indexLinks = [...document.querySelectorAll('.service-sidebar a[href^="#"]')];
  let observer;
  let frame = 0;

  function reveal() {
    observer?.disconnect();
    const elements = [...document.querySelectorAll('.service-reveal')];
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      document.body.classList.remove('service-motion');
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    document.body.classList.add('service-motion');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -15px 0px' });
    elements.forEach(element => observer.observe(element));
  }

  function updateIndex() {
    frame = 0;
    const header = document.querySelector('.site-header');
    const offset = (header?.getBoundingClientRect().height || 80) + 90;
    const current = sections.filter(section => section.getBoundingClientRect().top <= offset).at(-1);
    indexLinks.forEach(link => {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function requestUpdate() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(updateIndex);
  }

  document.querySelectorAll('.service-question').forEach(element => element.addEventListener('toggle', requestUpdate));
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  reducedMotion.addEventListener('change', reveal);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestUpdate();
  });
  reveal();
  requestUpdate();
})();
