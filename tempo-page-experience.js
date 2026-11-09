/* Shared progressive reveal and subtle cursor illumination. No content modifications. */
(()=>{'use strict';
  function init(){
    const dp=document.body.classList.contains('landing-proteccion-datos');
    const contact=document.body.classList.contains('service-page')&&!!document.querySelector('.contact-page-form');
    if(!dp&&!contact)return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealSelectors=dp?[
      '.hub-hero-copy > *','.hub-hero-contact','.sanctions-intro > *',
      '.sanctions-proof .sanctions-inner > p:not(.sanctions-source)',
      'main section:not(.hub-hero) :is(h2,.section-lead,.eyebrow)',
      '#servicios .route','#experiencia .case-grid > article','#sectores .sector',
      '#equipo article','#testimonio .trust-card','#sanciones article','#recursos article'
    ]:[
      '.service-hero-wide .container > *',
      '.service-section.service-reveal > :is(h2,p,.service-actions)',
      '.contact-details .contact-channel',
      '.contact-page-form > h2','.contact-page-form form'
    ];
    const elements=[...new Set(revealSelectors.flatMap(q=>[...document.querySelectorAll(q)]))]
      .filter(el=>!el.closest('header,footer,[hidden]'));
    const groups=new Map();
    elements.forEach(el=>{
      const group=el.closest('section')||el.parentElement;
      const n=groups.get(group)||0;groups.set(group,n+1);
      el.classList.add('tl-ux-reveal');
      el.style.setProperty('--tl-ux-delay',`${Math.min(n*75,320)}ms`);
    });
    if(reduce||!('IntersectionObserver' in window)){
      elements.forEach(el=>el.classList.add('tl-ux-visible'));
    }else{
      // Already-visible content remains on screen on initial paint.
      elements.filter(el=>el.getBoundingClientRect().top < window.innerHeight*.93).forEach(el=>el.classList.add('tl-ux-visible'));
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('tl-ux-visible');observer.unobserve(entry.target)}
      }),{threshold:.08,rootMargin:'0px 0px -7% 0px'});
      elements.filter(el=>!el.classList.contains('tl-ux-visible')).forEach(el=>observer.observe(el));
    }
    document.documentElement.classList.add('tl-ux-ready');
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
      document.querySelectorAll(dp?'.landing-proteccion-datos :is(.route,.sector,.case-grid > article,.trust-card,.resources article)':'.contact-channel,.contact-page-form form').forEach(card=>{
        card.addEventListener('pointermove',event=>{
          const box=card.getBoundingClientRect();
          card.style.setProperty('--tl-ux-x',`${event.clientX-box.left}px`);
          card.style.setProperty('--tl-ux-y',`${event.clientY-box.top}px`);
        },{passive:true});
      });
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
