'use strict';
(() => {
 const body = document.body;
 if(!body || !body.classList.contains('tl-refined-service')) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const targets = document.querySelectorAll(
  '.service-section > h2,.service-section > p,.service-section > .service-question,.service-section > .service-process,'+
  '.service-related h2,.service-related-links a,.tl-approved-card,.tl-approved-detail h2,'+
  '.tl-approved-detail h3,.tl-approved-detail p,.section > h2,.section > p,.section .card,.related a,'+
  '.service-section .service-scope,.service-process li'
 );
 targets.forEach((el,i) => {
  el.classList.add('tl-scroll-appear');
  el.style.setProperty('--tl-delay',`${Math.min(i%4*85,255)}ms`);
 });
 const hero = document.querySelector('.service-hero,.tl-approved-hero');
 if(hero){
  const heroBits = hero.querySelectorAll('h1,.service-hero-copy > p,.service-hero-copy > .service-actions,.service-overview,.tl-approved-hero h1,.tl-approved-hero p,.tl-approved-hero a');
  heroBits.forEach((el,i)=>{el.classList.add('tl-hero-appear');el.style.setProperty('--tl-delay',`${Math.min(i*100,500)}ms`)});
 }
 // Keep the source text and actual hyperlinks unchanged.
 document.querySelectorAll('.service-related-links a').forEach(link => {
  if(link.querySelector('.tl-link-arrow')) return;
  if(!/[↗→]\s*$/.test(link.textContent||'')){
   const arrow=document.createElement('span');arrow.className='tl-link-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.appendChild(arrow);
  }
 });
 if(reduced){body.classList.add('tl-animate-ready','tl-hero-entered');targets.forEach(x=>x.classList.add('tl-appeared'));return}
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('tl-appeared');io.unobserve(entry.target)}
  }),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  targets.forEach(el=>io.observe(el));
  requestAnimationFrame(()=>body.classList.add('tl-animate-ready'));
 }else{targets.forEach(x=>x.classList.add('tl-appeared'))}
 requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('tl-hero-entered')));
})();
