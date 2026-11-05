/* TempoLegal — progressive enhancement only; content works without this file. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const home=['/','/index.html','/en/','/pt/','/fr/','/en/index.html','/pt/index.html','/fr/index.html'].includes(location.pathname) || document.documentElement.hasAttribute('data-home-review');
if(home && !reduce && document.visibilityState!=='hidden'){
 const loader=document.createElement('div');loader.className='tl-loader';loader.setAttribute('aria-hidden','true');
 const logo=document.querySelector('.site-header .brand img');const logoSrc=logo?.getAttribute('src');
 const inner=document.createElement('div');inner.className='tl-loader-inner';
 if(logoSrc){const img=document.createElement('img');img.src=logoSrc;img.alt='';inner.append(img)}
 const line=document.createElement('span');line.className='tl-loader-line';inner.append(line);loader.append(inner);document.body.prepend(loader);
 const start=performance.now();let finished=false;
 const finish=()=>{if(finished)return;finished=true;const remaining=Math.max(0,500-(performance.now()-start));setTimeout(()=>{loader.classList.add('tl-loader-hidden');setTimeout(()=>loader.remove(),650)},remaining)};
 if(document.readyState==='complete')finish();else addEventListener('load',finish,{once:true});
 setTimeout(finish,1800);
}
if(!reduce && 'IntersectionObserver' in window && !document.querySelector('.landing form#consulta')){
 const elements=[...document.querySelectorAll('main section, main article')].slice(0,24);
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('tl-visible');observer.unobserve(entry.target)}}},{rootMargin:'0px 0px 75px 0px',threshold:0.04});
 for(const element of elements){if(element.getBoundingClientRect().top<innerHeight*1.1)continue;element.classList.add('tl-entrance');observer.observe(element)}
}
})();
