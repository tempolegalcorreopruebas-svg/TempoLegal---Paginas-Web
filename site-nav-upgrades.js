/* TempoLegal · single current service & footer transitions. */
(()=>{'use strict';
const clean=(u)=>{try {const o=new URL(u,document.baseURI);let path=decodeURIComponent(o.pathname).replace(/\/index\.html$/,'').replace(/\/$/,'');return o.origin+path;}catch{return null}};
function update(){
 const now=clean(location.href);
 document.querySelectorAll('[data-nav-menu]').forEach(menu=>{
  const links=[...menu.querySelectorAll('.nav-menu-panel a[href]')];
  // Remove stale marker before determining the exact location.
  links.forEach(a=>{a.classList.remove('is-current-service');a.removeAttribute('aria-current');});
  const match=links.find(a=>!new URL(a.href,document.baseURI).hash && clean(a.href)===now);
  if(match){match.classList.add('is-current-service');match.setAttribute('aria-current','page');}
  menu.querySelector('.nav-menu-toggle')?.classList.toggle('has-current-service',!!match);
 });
}
// Animate the native <details> sector flyout on EVERY + / - activation.
// Keep the detail open until its closing transition finishes (otherwise it disappears instantly).
function initSectorDisclosures(){
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelectorAll('.nav-menu-panel .tl-sector-disclosure').forEach(details=>{
  if(details.dataset.sectorToggleAnimated==='1')return;
  details.dataset.sectorToggleAnimated='1';
  const trigger=details.querySelector(':scope > summary');
  const panel=details.querySelector(':scope > .tl-sector-disclosure-body');
  if(!trigger||!panel)return;
  trigger.setAttribute('aria-expanded',String(details.open));
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   if(details.open){
    // Immediate pop-off on close: never animate or wait for timers.
    panel.getAnimations().forEach(animation=>animation.cancel());
    details.classList.remove('tl-sector-is-closing');
    details.open=false;
    trigger.setAttribute('aria-expanded','false');
    return;
   }
   // Opening uses the existing CSS entrance animation on every click.
   details.open=true;
   trigger.setAttribute('aria-expanded','true');
   if(!reduced()){
    panel.getAnimations().forEach(animation=>animation.cancel());
    const side=window.matchMedia('(min-width: 1180px)').matches;
    panel.animate([
     {opacity:0,transform:side?'translate3d(-12px,4px,0) scale(.98)':'translate3d(0,-10px,0) scale(.98)',filter:'blur(4px)'},
     {opacity:1,transform:'translate3d(0,0,0) scale(1)',filter:'blur(0)'}
    ],{duration:390,easing:'cubic-bezier(.16,1,.3,1)'});
   }
  });
 });
}
function ready(){update();initSectorDisclosures();
 document.querySelectorAll('.footer-sectors').forEach(el=>{
  const summary=el.querySelector(':scope > summary');if(!summary)return;
  summary.addEventListener('click',e=>{
   if(!el.open||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   e.preventDefault();if(el.classList.contains('closing'))return;
   el.classList.add('closing');const content=el.querySelector(':scope > .footer-menu');
   const finish=()=>{el.open=false;el.classList.remove('closing')};
   if(!content){finish();return}
   const anim=content.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:220,easing:'ease-in'});
   anim.onfinish=finish;anim.oncancel=finish;
  });
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
window.addEventListener('pageshow',update);
document.addEventListener('tempo:languagechange',()=>requestAnimationFrame(update));
})();