/* Build a responsive Holdings-style index using the page's own section headings. */
(()=>{'use strict';
const translations={es:'En esta página',en:'On this page',pt:'Nesta página',fr:'Sur cette page'};
function init(){
 const main=document.querySelector('main');
 if(!main||!document.body.classList.contains('tl-index-candidate'))return;
 // Holdings and other pages with a handcrafted index keep their approved sidebar.
 if(main.querySelector('.service-sidebar nav, .tl-service-index'))return;
 const hero=[...main.children].find(el=>el.tagName==='SECTION'&&(/hero/.test(el.className)||!!el.querySelector('h1')));
 if(!hero)return;
 const following=[];let node=hero.nextElementSibling;
 while(node){following.push(node);node=node.nextElementSibling;}
 if(!following.length)return;
 const sections=[];
 const add=el=>{
   if(el.matches('.service-cta,.tl-approved-source,.tl-approved-note'))return;
   const heading=[...el.querySelectorAll('h2')].find(h=>!h.closest('article,aside,details,dialog,nav,footer'));
   if(!heading)return;
   const title=heading.textContent.replace(/\s+/g,' ').trim();
   if(!title||sections.some(s=>s.title===title))return;
   const id=el.id||`tl-index-section-${sections.length+1}`;
   if(!el.id)el.id=id;
   sections.push({el,id,title});
 };
 following.forEach(el=>{
   if(el.matches('section'))add(el);
   if(el.matches('.tl-approved-body'))el.querySelectorAll(':scope > .tl-container > section').forEach(add);
 });
 if(!sections.length)return;
 const lang=(document.documentElement.lang||'es').slice(0,2).toLowerCase();
 const label=translations[lang]||translations.es;
 const layout=document.createElement('div');layout.className='tl-index-layout';
 const aside=document.createElement('aside');aside.className='tl-service-index';
 const nav=document.createElement('nav');nav.setAttribute('aria-label',label);
 const kicker=document.createElement('p');kicker.className='tl-index-kicker';kicker.textContent=label;
 const list=document.createElement('ol');
 sections.forEach(({id,title})=>{
   const li=document.createElement('li');const a=document.createElement('a');
   a.href=`#${id}`;a.textContent=title;li.appendChild(a);list.appendChild(li);
 });
 nav.append(kicker,list);aside.append(nav);
 const story=document.createElement('article');story.className='tl-index-story';
 hero.insertAdjacentElement('afterend',layout);
 layout.append(aside,story);
 following.forEach(el=>story.appendChild(el));
 document.body.classList.add('tl-index-enabled');
 const links=[...list.querySelectorAll('a')];
 function active(n){links.forEach((el,i)=>i===n?el.setAttribute('aria-current','location'):el.removeAttribute('aria-current'));}
 active(0);
 const offset=()=>Math.max(100,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))||80)+50;
 let scheduled=false;
 function update(){
   scheduled=false;
   const boundary=window.scrollY+offset()+window.innerHeight*.12;
   let selected=0;
   for(let i=0;i<sections.length;i++){
     if(sections[i].el.getBoundingClientRect().top+window.scrollY<=boundary)selected=i;
   }
   active(selected);
 }
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
 addEventListener('resize',update,{passive:true});
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
