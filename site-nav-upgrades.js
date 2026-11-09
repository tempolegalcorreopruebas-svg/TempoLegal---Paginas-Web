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
function ready(){update();
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