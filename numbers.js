'use strict';
(() => {
  // El valor real permanece en el DOM y accesible durante todo el efecto.
  // Servicios, sectores, pasos del método, preguntas y testimonios conservan sus números fijos.
  const selector='.hero-proof strong,.experience-item strong,.international-proof strong,.member-bio,.legal-section-count';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const active=new Map(), observed=new Set();
  let frame=0,scanFrame=0,sequence=0;
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);observed.delete(entry.target);start(entry.target);
    });
  },{threshold:.15,rootMargin:'0px 0px -15px 0px'}):null;
  function finish(element,state){
    clearTimeout(state.timeout);
    element.classList.remove('is-scrambling');state.overlay.remove();active.delete(element);
  }
  function tick(now){
    frame=0;
    active.forEach((state,element)=>{
      if(!element.isConnected||document.hidden||reduced.matches){finish(element,state);return;}
      const elapsed=now-state.start;
      if(elapsed>=state.duration){finish(element,state);return;}
      if(elapsed<0||now-state.last<40)return;
      state.last=now;
      const progress=elapsed/state.duration;
      const fixed=Math.max(0,Math.floor(((progress-.28)/.72)*state.digits));
      let digit=0;
      state.overlay.textContent=state.value.replace(/\d/g,real=>digit++<fixed?real:String(Math.floor(Math.random()*10)));
    });
    if(active.size)frame=requestAnimationFrame(tick);
  }
  function start(element){
    if(reduced.matches||document.hidden||!element.isConnected)return;
    const value=element.textContent,overlay=document.createElement('span');
    overlay.className='number-random';overlay.setAttribute('aria-hidden','true');overlay.textContent=value;
    element.append(overlay);element.classList.add('is-scrambling');
    const delay=((sequence++)%5)*28;
    const state={value,overlay,digits:(value.match(/\d/g)||[]).length,start:performance.now()+delay,duration:760,last:0,timeout:0};
    // Cierre exacto también cuando el navegador ralentiza requestAnimationFrame.
    state.timeout=setTimeout(()=>finish(element,state),760+delay+30);
    active.set(element,state);
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function wrap(parent){
    const walker=document.createTreeWalker(parent,NodeFilter.SHOW_TEXT,{acceptNode:node=>
      !node.parentElement.closest('.number-scramble')&&/\d/.test(node.textContent)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT
    });
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(text=>{
      const fragment=document.createDocumentFragment();let last=0;
      for(const match of text.textContent.matchAll(/[+-]?\d+(?:[.,]\d+)*(?:\+|%)?/g)){
        fragment.append(document.createTextNode(text.textContent.slice(last,match.index)));
        const element=document.createElement('span'),value=document.createElement('span');
        element.className='number-scramble';value.className='number-value';value.textContent=match[0];element.append(value);fragment.append(element);
        if(observer&&!reduced.matches){observed.add(element);observer.observe(element);}
        last=match.index+match[0].length;
      }
      fragment.append(document.createTextNode(text.textContent.slice(last)));text.replaceWith(fragment);
    });
  }
  function scan(){
    scanFrame=0;
    observed.forEach(element=>{if(!element.isConnected){observer.unobserve(element);observed.delete(element);}});
    document.querySelectorAll(selector).forEach(wrap);
  }
  const mutations=new MutationObserver(records=>{
    if(scanFrame||document.hidden)return;
    if(records.some(record=>!(record.target.nodeType===1?record.target:record.target.parentElement)?.closest('.number-scramble')))scanFrame=requestAnimationFrame(scan);
  });
  scan();mutations.observe(document.body,{childList:true,characterData:true,subtree:true});
  function settle(){cancelAnimationFrame(frame);frame=0;active.forEach((state,element)=>finish(element,state));}
  reduced.addEventListener('change',()=>{if(reduced.matches){settle();observed.forEach(element=>observer?.unobserve(element));observed.clear();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){settle();cancelAnimationFrame(scanFrame);scanFrame=0;}else scan();});
  addEventListener('pagehide',settle);
})();
