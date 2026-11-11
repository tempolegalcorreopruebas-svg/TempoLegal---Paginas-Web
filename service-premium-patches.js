(()=>{'use strict';
  function pointerGlow(selector){
    if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.querySelectorAll(selector).forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const box=card.getBoundingClientRect();
        card.style.setProperty('--tl-ux-x',`${event.clientX-box.left}px`);
        card.style.setProperty('--tl-ux-y',`${event.clientY-box.top}px`);
      },{passive:true});
    });
  }
  function reveal(elements){
    const items=[...new Set(elements.filter(Boolean))];
    if(!items.length) return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    items.forEach((el,index)=>{
      el.classList.add('tl-ux-reveal');
      el.style.setProperty('--tl-ux-delay', `${Math.min((index%6)*80,320)}ms`);
    });
    document.documentElement.classList.add('tl-ux-ready');
    if(reduce||!('IntersectionObserver' in window)){
      items.forEach(el=>el.classList.add('tl-ux-visible'));
      return;
    }
    items.filter(el=>el.getBoundingClientRect().top < window.innerHeight*0.9).forEach(el=>el.classList.add('tl-ux-visible'));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('tl-ux-visible');observer.unobserve(entry.target)}
    }),{threshold:0.1,rootMargin:'0px 0px -8% 0px'});
    items.filter(el=>!el.classList.contains('tl-ux-visible')).forEach(el=>observer.observe(el));
  }
  function init(){
    if(!document.body.classList.contains('premium-service-patch')) return;
    const selectors=[
      '.breadcrumb',
      '.hero-grid-own > *', '.hero-signals > *',
      '.monthly-grid > *', '.monthly-foot > *',
      '.proof > *', '.section > *', '.documents > *', '.team-section > *', '.testimonials > *', '.related > *', '.faq > *', '.agreement > *', '.method > *', '.contact > *',
      '.tl-approved-hero .tl-container > *', '#tl-alcance > *', '.tl-approved-card', '.tl-approved-detail > *'
    ];
    const elements=selectors.flatMap(sel=>[...document.querySelectorAll(sel)]).filter(el=>!el.closest('header,footer'));
    reveal(elements);
    pointerGlow('.change-preview,.agenda,.proof,.section,.documents,.team-section,.testimonials,.related,.faq,.agreement,.method,.contact,#tl-alcance,.tl-approved-detail,.tl-approved-card,.tl-approved-detail article');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
