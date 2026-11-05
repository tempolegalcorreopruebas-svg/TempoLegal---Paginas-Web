'use strict';
// Highlight the section currently being read without replacing static article text.
(() => {
  const sections = [...document.querySelectorAll('.article-section')];
  const links = [...document.querySelectorAll('.article-toc a')];
  let frame = 0;
  function updateSection() {
    frame = 0;
    const header = document.querySelector('.site-header');
    const threshold = (header?.getBoundingClientRect().height || 80) + 85;
    const current = sections.filter(section => section.getBoundingClientRect().top <= threshold).at(-1);
    links.forEach(link => {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(updateSection);
  }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestUpdate();
  });
  document.fonts?.ready.then(requestUpdate);
  requestUpdate();
})();
