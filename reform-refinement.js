/* TempoLegal: progressive reading experience for the corporate amendments landing. */
(()=>{'use strict';
 const boot=()=>{
  if(!document.body.classList.contains('tl-reform-refined'))return;
  const targets=[];
  document.querySelectorAll('.reform-hero .hero-grid-own > *, .reform-hero .hero-signals > *, .tl-index-story .section-head > *, .tl-index-story .change-buttons > button, .tl-index-story .change-panel, .tl-index-story .editorial-grid > article, .tl-index-story .document-list > li, .tl-index-story .process-own > *, .tl-index-story .people > article, .tl-index-story .quote-grid > article, .tl-index-story .related-links > a, .tl-index-story .faq-list > details').forEach((el,i)=>{
   if(el.closest('header,footer,.tl-service-index'))return;
   el.style.setProperty('--reform-delay',`${(i%4)*65}ms`);
   el.classList.add('reform-entrance');targets.push(el);
  });
  if(!targets.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced||!('IntersectionObserver' in window)){targets.forEach(x=>x.classList.add('reform-visible'));return}
  document.body.classList.add('tl-reform-motion');
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reform-visible');observer.unobserve(entry.target)}})
  },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
  targets.forEach(x=>{if(x.getBoundingClientRect().top < innerHeight*.85)x.classList.add('reform-visible');else observer.observe(x)});
  // If content changes or a tab is selected, the visible text does not remain hidden.
  document.querySelectorAll('.change-buttons button').forEach(button=>button.addEventListener('click',()=>{
   document.querySelectorAll('.change-panel article').forEach(panel=>{panel.classList.add('reform-visible')})
  }));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
