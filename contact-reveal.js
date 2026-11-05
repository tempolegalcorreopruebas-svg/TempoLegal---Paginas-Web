/* Progressive reveal for contact section across all site languages. */
(() => {
  'use strict';
  const init = () => {
    const section = document.getElementById('contacto');
    if (!section || section.dataset.tlContactInitialized === 'true') return;
    section.dataset.tlContactInitialized = 'true';
    const left = section.querySelector('.container > div:first-child');
    const actions = section.querySelector('.home-contact-actions');
    if (!left || !actions) return;
    const targets = [...left.children, ...actions.children];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    targets.forEach((element, index) => {
      element.classList.add('tl-contact-reveal-item');
      element.style.setProperty('--tl-contact-delay', `${Math.min(index * 125, 800)}ms`);
    });
    section.classList.add('tl-contact-motion');
    let previousTop = section.getBoundingClientRect().top;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) section.classList.add('tl-contact-visible');
        else section.classList.remove('tl-contact-visible');
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -8% 0px'});
    observer.observe(section);
    // Avoid a blank section if the page is restored from bfcache or an anchor.
    window.addEventListener('pageshow', () => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) section.classList.add('tl-contact-visible');
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
