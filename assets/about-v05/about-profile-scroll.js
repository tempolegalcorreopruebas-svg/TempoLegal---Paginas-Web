/* Progressive, one-time viewport reveal for the V05 individual team profiles. */
(() => {
  function setupProfileReveals() {
    const main = document.querySelector('main.about-v05.perfil-page, main#profile-main');
    if (!main || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isTech = main.id === 'profile-main';
    const selectors = isTech ? [
      '.profile-back', '.profile-copy > *', '.profile-photo',
      '.profile-story > *', '.profile-practice > *', '.profile-practice li',
      '.profile-career > *', '.profile-career dl > div',
      '.profile-contact-section .container > *',
      '.profile-other-team .container > .eyebrow',
      '.profile-other-team .container > h2',
      '.profile-colleague', '.profile-return'
    ] : [
      '.breadcrumb a',
      '.perfil-hero > img', '.perfil-hero > div > .credential',
      '.perfil-hero h1', '.perfil-hero > div > .role',
      '.perfil-hero > div > .areas', '.perfil-hero > div > .titular',
      '.perfil-hero .actions', '.perfil-hero .serv-rel',
      '.perfil-section > div:first-child',
      '.perfil-section .body > p', '.perfil-section .serv-grid article',
      '.perfil-section .formacion li', '.perfil-section .enfoque blockquote',
      '.contact-inner > div', '.otros .wrap > .eyebrow',
      '.otros .wrap > h2', '.otros-grid > a'
    ];
    const nodes = Array.from(new Set(selectors.flatMap(s =>
      Array.from(main.querySelectorAll(s)))));
    if (!nodes.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('profile-awaiting');
        entry.target.classList.add('profile-shown');
        io.unobserve(entry.target);
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -26px 0px'});
    main.classList.add('profile-scroll-enabled');
    nodes.forEach(el => {
      const siblings = el.parentElement ? [...el.parentElement.children] : [];
      const index = siblings.indexOf(el);
      el.style.setProperty('--profile-delay', `${Math.min(Math.max(index, 0), 4) * 62}ms`);
      el.setAttribute('data-profile-scroll', '');
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight + 24 || rect.bottom < 0) {
        el.classList.add('profile-awaiting');
      } else {
        el.classList.add('profile-shown');
      }
      io.observe(el);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProfileReveals, {once: true});
  } else setupProfileReveals();
})();
