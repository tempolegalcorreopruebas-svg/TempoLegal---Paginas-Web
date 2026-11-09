/* TempoLegal shared UX enhancements; no external dependencies. */
(()=>{'use strict';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function start(){
 // Light follows pointer without inserting any obstructing element.
 document.querySelectorAll(':is(#casos .case-card, :is(.landing-salud, .landing-educacion, .landing-sector) :is(.case-grid > article, .method-steps > li, .school-case, .school-obligations article, .landing-sector #servicios article), .landing-implementacion :is(.case-grid > article, .implementation-steps > li, .tool-primary, .start-columns > article), .landing-dpd-externo :is(#necesidad .services > article, #alcance .functions > article, #entregables .scope-grid > article, #proceso .steps > article, #experiencia .documented-cases > article, #recursos .tool-primary), .landing-proteccion-datos :is(.nav-menu-panel a, .hub-directory-group a, .route, .sector, .case-grid > article))').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect();card.style.setProperty('--tl-x',`${e.clientX-r.left}px`);card.style.setProperty('--tl-y',`${e.clientY-r.top}px`)},{passive:true});
 });
 const dataProtection=document.body.classList.contains('landing-proteccion-datos');
 const externalDpd=document.body.classList.contains('landing-dpd-externo');
 const implementation=document.body.classList.contains('landing-implementacion');
 const healthcare=document.body.classList.contains('landing-salud');
 const sector=document.body.matches('.landing-educacion, .landing-sector');
 const serviceLanding=dataProtection||externalDpd||implementation||healthcare||sector;
 const cascading=[];
 const selectors=sector?[
  ['#clientes h2,#clientes .firm-logo:not(details .firm-logo)',35],
  ['#experiencia .school-case,#metodo .method-steps > li,#obligaciones article,#servicios article',60],
  ['#obligaciones h2,#servicios h2,#continuidad h2,#situaciones h2,#alcance h2,#experiencia h2,#testimonio h2,#metodo h2,#cumplidatos h2,#equipo h2,#sanciones h2,#recursos h2,#preguntas h2,#contacto h2',0]
 ]:healthcare?[
  ['#clientes h2,#clientes .firm-logo:not(details .firm-logo)',35],
  ['#experiencia .case-grid > article,#metodo .method-steps > li',60],
  ['#situaciones h2,#alcance h2,#experiencia h2,#testimonio h2,#metodo h2,#cumplidatos h2,#equipo h2,#preguntas h2,#contacto h2',0]
 ]:implementation?[
  ['#clientes h2,#clientes .firm-logo:not(details .firm-logo)',35],
  ['#experiencia .case-grid > article,#metodo .implementation-steps > li,#punto-partida .start-columns > article',60],
  ['#alcance h2,#experiencia h2,#metodo h2,#cumplidatos h2,#equipo h2,#testimonio h2,#continuidad h2,#preguntas h2,#recursos h2,#contacto h2',0]
 ]:externalDpd?[
  ['#clientes h2,#clientes .firm-logo:not(details .firm-logo)',35],
  ['#necesidad .services > article,#alcance .functions > article,#entregables .scope-grid > article,#proceso .steps > article,#experiencia .documented-cases > article',60],
  ['#necesidad h2,#alcance h2,#entregables h2,#sanciones h2,#cumplidatos h2,#equipo h2,#proceso h2,#experiencia h2,#testimonio h2,#recursos h2,#preguntas h2,#contacto h2',0]
 ]:dataProtection?[
  ['#servicios h2,#servicios .route',65],
  ['#clientes h2,#clientes .firm-logo:not(details .firm-logo)',35],
  ['#experiencia h2,#experiencia .case-grid > article',65],
  ['#sectores h2,#sectores .sector',65],
  ['#metodo h2,#cumplidatos h2,#equipo h2,#testimonio h2,#preguntas h2,#recursos h2,#contacto h2',0]
 ]:[
  ['#enfoque .eyebrow,#enfoque h2,#enfoque .approach-copy>.lead,#enfoque .approach-copy dl>div',100],
  ['#casos .section-heading .eyebrow,#casos .section-heading h2,#casos .section-heading .section-intro,#casos .case-card',110],
  ['#nosotros .method-heading .eyebrow,#nosotros .method-heading h2,#nosotros .method-heading>p,#nosotros .step-copy',110],
  ['#testimonios .reference-eyebrow,#testimonios h2,#equipo .section-heading h2',110]
 ];
 selectors.forEach(([sel,interval])=>{
  const els=[...document.querySelectorAll(sel)];
  els.forEach((el,i)=>{if(serviceLanding&&el.getBoundingClientRect().top<=window.innerHeight)return;el.classList.add('tl-cascade');const caseIndex=el.closest('#casos')&&el.matches('.case-card')?[...el.parentElement.querySelectorAll('.case-card')].indexOf(el):null;el.style.setProperty('--tl-delay',`${caseIndex!==null?caseIndex*160:Math.min(i*interval,serviceLanding?220:660)}ms`);cascading.push(el)});
 });
 if(!reduce.matches&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tl-seen');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  cascading.forEach(el=>io.observe(el));document.documentElement.classList.add('motion-ready');
 }else cascading.forEach(el=>el.classList.add('tl-seen'));
 if(serviceLanding)return;
 // Pair the selected country label with its destination marker in SVG order.
 document.querySelectorAll('.world-coverage-svg').forEach(svg=>{
  const labels=[...svg.querySelectorAll('.world-country-label')],markers=[...svg.querySelectorAll('.world-destination')];
  labels.forEach((label,i)=>{
   const marker=markers[i];if(!marker)return;
   label.setAttribute('tabindex','0');label.setAttribute('role','group');
   const country=label.querySelector('text');if(country)label.setAttribute('aria-label',country.textContent.trim());
   const set=on=>{label.classList.toggle('tl-map-active',on);marker.classList.toggle('tl-map-active',on)};
   for(const el of [label,marker]){el.addEventListener('pointerenter',()=>set(true));el.addEventListener('pointerleave',()=>set(false));el.addEventListener('focus',()=>set(true));el.addEventListener('blur',()=>set(false))}
  });
 });
 // Fluid scroll-driven progression with a softly following playhead.
 const methods=[...document.querySelectorAll('.method')];
 if(methods.length){
  let raf=0;
  const state=methods.map(section=>({section,sticky:section.querySelector('.method-sticky'),current:0,target:0,nodes:[...section.querySelectorAll('.step')]}));
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  const measure=()=>{
   const vh=window.innerHeight;
   for(const item of state){
    if(reduce.matches){item.target=1;continue;}
    const stickyStyle=item.sticky&&getComputedStyle(item.sticky);
    if(stickyStyle?.position==='sticky'){
     const top=parseFloat(stickyStyle.top)||0;
     const section=item.section.getBoundingClientRect();
     // Leave the completed timeline on screen before the sticky section releases.
     const travel=section.height-item.sticky.getBoundingClientRect().height;
     item.target=clamp((top-section.top)/Math.max(1,travel*.9));
    }else{
     const first=item.nodes[0]?.querySelector('.step-node');
     const last=item.nodes.at(-1)?.querySelector('.step-node');
     if(!first||!last)continue;
     const firstTop=first.getBoundingClientRect().top;
     const lastTop=last.getBoundingClientRect().top;
     item.target=clamp((vh*.85-firstTop)/Math.max(1,lastTop-firstTop+vh*.15));
    }
   }
   if(!raf)raf=requestAnimationFrame(tick);
  };
  function tick(){
   raf=0;let moving=false;
   for(const item of state){
    const delta=item.target-item.current;
    if(item.target>0&&item.target<1&&Math.abs(delta)>.0005){item.current+=delta*.18;moving=true}
    else item.current=item.target;
    const playhead=item.current*item.nodes.length;
    item.nodes.forEach((step,index)=>{
     const value=clamp(playhead-index);
     step.style.setProperty('--step-progress',value.toFixed(4));
     step.classList.toggle('tl-step-reached',playhead>=index-.05);
     step.style.setProperty('--tl-node-intensity',clamp((playhead-index)+.4).toFixed(3));
    });
   }
   if(moving)raf=requestAnimationFrame(tick);
  }
  window.addEventListener('scroll',measure,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  reduce.addEventListener('change',measure);
  measure();
 }

}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
