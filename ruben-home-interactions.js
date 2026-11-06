/* TempoLegal interaction: progressive local-team copy and case-card cursor halo.
   Never blocks navigation; honors user reduced-motion preference. */
(()=>{'use strict';
const ready=()=>{
 const section=document.getElementById('empresas-extranjeras');
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(section){
  const copy=section.querySelector('.coverage-copy');
  const elements=copy?[...copy.querySelectorAll('h2,.coverage-description,.international-proof,.coverage-sectors')]:[];
  if(elements.length&&'IntersectionObserver' in window&&!reduced){
   const obs=new IntersectionObserver((entries)=>entries.forEach(e=>{
     if(e.isIntersecting){e.target.classList.add('tl-enter-visible');obs.unobserve(e.target)}
   }),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
   elements.forEach((el,i)=>{el.style.setProperty('--tl-delay',`${i*145}ms`);el.classList.add('tl-coverage-enter');obs.observe(el)});
   document.documentElement.classList.add('tl-motion-ready');
  }
 }
 document.querySelectorAll('#casos .case-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const box=card.getBoundingClientRect();
    card.style.setProperty('--tl-pointer-x',`${e.clientX-box.left}px`);
    card.style.setProperty('--tl-pointer-y',`${e.clientY-box.top}px`);
  },{passive:true});
 });
 // Home showcases only three editorial entries, and one view-all link.
 const res=document.getElementById('recursos');
 if(res){
  const trim=()=>{
   const grid=res.querySelector('#articles-grid');
   if(grid){const cards=[...grid.querySelectorAll(':scope > article')];cards.slice(3).forEach(el=>el.remove())}
   const candidates=[...res.querySelectorAll('.tl-posts-more a')];
   candidates.slice(1).forEach(a=>a.closest('.tl-posts-more')?.remove());
  };
  trim();
  // Late page scripts may repopulate the article grid after DOMContentLoaded.
  const grid=res.querySelector('#articles-grid');
  if(grid){const observer=new MutationObserver(()=>{if(grid.children.length>3)trim()});observer.observe(grid,{childList:true})}
 }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
