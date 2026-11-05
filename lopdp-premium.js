/* Nonintrusive presentation controls for LOPDP tools. */
(()=>{'use strict';
 const init=()=>{
  const top=document.createElement('div');top.className='tl-tool-progress';top.setAttribute('aria-hidden','true');top.innerHTML='<span></span>';document.body.prepend(top);
  const labels={es:'Volver a servicios',en:'Back to services',pt:'Voltar aos serviços',fr:'Retour aux services'};
  const l=document.documentElement.dataset.pageLang||'es';
  const link=document.createElement('a');link.className='tl-tool-back';
  link.textContent='←  '+(labels[l]||labels.es);link.href=new URL((l==='es'?'':'./'+l+'/')+'index.html',document.querySelector('link[href$="lopdp-premium.css"]').href.replace(/lopdp-premium\.css$/, '')).href+'#servicios';document.body.append(link);
  const hero=document.querySelector('.hero');if(hero)hero.classList.add('tl-tool-enter');
  let busy=false;function progress(){busy=false;const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);document.documentElement.style.setProperty('--tl-tool-progress',Math.min(1,scrollY/total).toFixed(4))}
  function request(){if(!busy){busy=true;requestAnimationFrame(progress)}}
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});request();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
