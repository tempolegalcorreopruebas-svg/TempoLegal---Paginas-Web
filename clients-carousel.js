'use strict';
(() => {
  const section=document.getElementById('clientes'),container=document.getElementById('clients-marquee'),button=document.getElementById('clients-motion-toggle'),text=document.getElementById('clients-motion-text');
  if(!section||!container||!button||!text)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),tracks=[],wrap=(value,period)=>period?((value%period)+period)%period:0;
  let visible=false,manualPause=false,last=0,frame=0;
  container.querySelectorAll('.clients-marquee-row').forEach((viewport,index)=>{
    const lane=viewport.querySelector('.clients-marquee-lane'),original=lane.querySelector('.clients-marquee-set');
    if(!lane||!original)return;
    const clone=original.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('img').forEach(img=>{img.alt='';img.loading='lazy';});lane.appendChild(clone);
    const item={viewport,lane,original,index,offset:0,period:1,speed:index===0?39:33,direction:index===0?1:-1,hovered:false,dragging:false,dragX:0,manualUntil:0};tracks.push(item);
    viewport.addEventListener('pointerenter',()=>{item.hovered=true});viewport.addEventListener('pointerleave',()=>{item.hovered=false});
    viewport.addEventListener('pointerdown',event=>{if(reduced.matches||event.button!==0)return;item.dragging=true;item.dragX=event.clientX;item.manualUntil=performance.now()+2200;viewport.setPointerCapture?.(event.pointerId);});
    viewport.addEventListener('pointermove',event=>{const card=event.target.closest('.client-logo');if(card){const r=card.getBoundingClientRect();card.style.setProperty('--light-x',((event.clientX-r.left)/r.width*100).toFixed(1)+'%');card.style.setProperty('--light-y',((event.clientY-r.top)/r.height*100).toFixed(1)+'%');}if(!item.dragging)return;item.offset=wrap(item.offset-(event.clientX-item.dragX),item.period);item.dragX=event.clientX;item.lane.style.transform=`translate3d(${-item.offset}px,0,0)`;item.manualUntil=performance.now()+3200;});
    const stop=()=>{item.dragging=false;item.manualUntil=performance.now()+2600};viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
    viewport.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||reduced.matches)return;event.preventDefault();item.offset=wrap(item.offset+(event.key==='ArrowRight'?180:-180),item.period);item.lane.style.transform=`translate3d(${-item.offset}px,0,0)`;item.manualUntil=performance.now()+4200;});
    viewport.addEventListener('focusin',()=>{item.hovered=true});viewport.addEventListener('focusout',event=>{if(!viewport.contains(event.relatedTarget))item.hovered=false});
  });
  function measure(){tracks.forEach(item=>{const gap=Number.parseFloat(getComputedStyle(item.lane).columnGap)||0;const newPeriod=item.original.getBoundingClientRect().width+gap;if(newPeriod>0){item.offset=wrap(item.offset,newPeriod);item.period=newPeriod;item.lane.style.transform=`translate3d(${-item.offset}px,0,0)`;}});}
  const localText=key=>window.TempoI18n?.t(key)||({clientsPause:'Pausar movimiento',clientsPlay:'Reanudar movimiento'}[key]||key);
  function labels(){const key=manualPause?'clientsPlay':'clientsPause',value=localText(key);text.textContent=value;button.setAttribute('aria-label',value);button.setAttribute('data-i18n-aria-label',key);button.setAttribute('aria-pressed',String(manualPause));section.classList.toggle('clients-is-paused',manualPause);}
  button.addEventListener('click',()=>{manualPause=!manualPause;labels()});document.addEventListener('tempo:languagechange',labels);
  function tick(time){const dt=Math.min(48,time-last||16);last=time;if(visible&&!manualPause&&!document.hidden&&!reduced.matches){tracks.forEach(item=>{if(item.period<2||item.hovered||item.dragging||time<item.manualUntil)return;item.offset=wrap(item.offset+item.direction*item.speed*dt/1000,item.period);item.lane.style.transform=`translate3d(${-item.offset.toFixed(2)}px,0,0)`;});}frame=requestAnimationFrame(tick);}
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'120px 0px',threshold:0});observer.observe(section);}else visible=true;
  const resizeObserver='ResizeObserver' in window?new ResizeObserver(measure):null;tracks.forEach(item=>resizeObserver?.observe(item.original));window.addEventListener('resize',measure,{passive:true});
  const updateMotion=()=>{container.classList.toggle('clients-reduced-motion',reduced.matches);measure()};reduced.addEventListener?.('change',updateMotion);
  updateMotion();labels();frame=requestAnimationFrame(tick);
})();
