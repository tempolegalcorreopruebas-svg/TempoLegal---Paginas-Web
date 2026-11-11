/* TempoLegal V05 about scroll reveals, language-neutral and progressively enhanced. */
(() => {
  function setup() {
    const main = document.querySelector('main.about-v05:not(.perfil-page)');
    if (!main || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const selectors = [
      '.intro > .eyebrow', '.intro h2', '.intro p:not(.eyebrow)',
      '.team-section .section-heading > div', '.team-section .section-heading > p',
      '.team-block .block-heading', '.team-block .profile',
      '.team-block .support-grid article', '.team-block .consultant-card',
      '.team-block .tech-grid > *',
      '.working .section-heading', '.working-rows article',
      '.services-strip > .eyebrow', '.services-strip > div > a',
      '.contact-inner > div',
    ];
    const nodes = Array.from(new Set(selectors.flatMap(s =>
      Array.from(main.querySelectorAll(s)))));
    if (!nodes.length) return;
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('about-awaiting');
        entry.target.classList.add('about-shown');
        io.unobserve(entry.target);
      }
    }, {threshold:0.09,rootMargin:'0px 0px -28px 0px'});
    main.classList.add('about-scroll-enabled');
    nodes.forEach((el,i) => {
      const siblings=el.parentElement?.children || [];
      const index=Array.prototype.indexOf.call(siblings,el);
      el.style.setProperty('--about-delay', `${Math.min(Math.max(index,0),5)*70}ms`);
      el.setAttribute('data-about-scroll','');
      const rect=el.getBoundingClientRect();
      if (rect.bottom<0 || rect.top>innerHeight+25) el.classList.add('about-awaiting');
      else el.classList.add('about-shown');
      io.observe(el);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
})();
