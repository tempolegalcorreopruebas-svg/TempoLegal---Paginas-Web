'use strict';
// Static legal text is enhanced only with navigation and printing.
(() => {
  const index = document.querySelector('.privacy-index');
  if (matchMedia('(max-width: 760px)').matches) index.open = false;
  const printButton = document.querySelector('[data-print-policy]');
  printButton.hidden = false;
  printButton.addEventListener('click', () => print());
  const sections = [...document.querySelectorAll('.privacy-section')];
  const links = [...document.querySelectorAll('.privacy-toc a')];
  let frame = 0;
  function update() {
    frame = 0;
    const offset = (document.querySelector('.site-header')?.offsetHeight || 80) + 70;
    const current = sections.filter(section => section.getBoundingClientRect().top <= offset).at(-1);
    links.forEach(link => {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate() { if (!frame && !document.hidden) frame = requestAnimationFrame(update); }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  document.fonts?.ready.then(requestUpdate);
  requestUpdate();
})();
