'use strict';
/* Landings de servicio ya construidas (tarea 4.2). Solo en español; en/pt/fr no tienen todavía estas páginas. */
const SERVICE_PAGES=/\/(en|pt|fr)\//.test(location.pathname)?{}:{data:'proteccion-de-datos-personales-ecuador/index.html'};
(() => {
  // Prefijo de rutas para las páginas de otros idiomas (carpetas en/, pt/, fr/).
  const BASE=document.documentElement.dataset.base||'';
  const HOME_REVIEW=document.documentElement.hasAttribute('data-home-review');
  const $ = (q, parent=document) => parent.querySelector(q);
  const $$ = (q, parent=document) => [...parent.querySelectorAll(q)];
  const I = window.TempoI18n, t = I.t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  const node = (tag, className, text, attrs={}) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));return el;
  };
  const paths = {
    data:'M24 4 40 11v13c0 11-16 20-16 20S8 35 8 24V11Z M16 24l6 6 12-15',
    corporate:'M7 43V14h22v29 M29 23h12v20 M13 21h3m5 0h3m-11 7h3m5 0h3m-11 7h3m5 0h3 M3 43h42',
    incorporation:'M24 5 43 16v23H5V16Z M16 39V24h16v15 M16 16h16 M24 12v8',
    foreign:'M4 24h40 M24 4a20 20 0 1 0 0 40 20 20 0 0 0 0-40Z M24 4c12 10 12 30 0 40 M24 4c-12 10-12 30 0 40',
    employment:'M16 16a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M2 38v-6c0-8 28-8 28 0v6 M34 12a7 7 0 0 1 0 14 M36 31c7 0 10 3 10 7',
    accounting:'M9 5h30v38H9Z M15 12h18v8H15Z M15 27h3m6 0h3m6 0h1m-19 7h3m6 0h3m6 0h1',
    ip:'M24 4 43 24 24 44 5 24Z M31 17c-9-8-22 6-12 14 4 3 8 2 12-1 M24 12v24',
    disputes:'M24 5v36 M10 13h28 M10 13 3 28h14Z M38 13l-7 15h14Z M14 43h20',
    notarial:'M12 4h20l8 8v32H8V4Z M32 4v10h8 M15 22h17 M15 28h12 M15 34h9',
    health:'M18 5h12v13h13v12H30v13H18V30H5V18h13Z',
    education:'M3 15 24 5l21 10-21 10Z M10 20v16c9 8 19 8 28 0V20 M45 15v19',
    technology:'M11 11h26v26H11Z M18 18h12v12H18Z M17 2v9m14-9v9M17 37v9m14-9v9M2 17h9m-9 14h9m26-14h9m-9 14h9',
    biometrics:'M11 35c0-14 26-14 26 0 M6 25C6 5 42 5 42 25 M16 42c0-20 16-20 16-6 M21 45V31c0-5 6-5 6 0v9 M3 16C9-4 39-4 45 16',
    dpd:'M24 4 40 11v13c0 11-16 20-16 20S8 35 8 24V11Z M16 24l6 6 12-15',
    breach:'M12 22V12C12-1 36-1 36 12 M9 22h30v22H9Z M24 29v7',
    shareholders:'M24 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M11 43a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M37 43a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M24 17v6M11 29v-6h26v6'
  };
  const icon = (id, className='line-icon') => {
    const span=node('span',className,null,{'aria-hidden':'true'});
    // Se insertan únicamente trazados SVG constantes del propio código.
    span.innerHTML='<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[id]||paths.data)+'"/></svg>';return span;
  };

  // Revelados discretos y de una sola ejecución, con alternativa sin movimiento.
  let revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}
    }),{threshold:.06,rootMargin:'0px 0px -20px 0px'});
  }
  function reveal(scope=document) {
    $$('.reveal',scope).forEach(el=>{
      if(reduced.matches||!revealObserver)el.classList.add('is-revealed');
      else revealObserver.observe(el);
    });
  }
  function retire(scope){if(revealObserver)$$('.reveal',scope).forEach(el=>revealObserver.unobserve(el));}
  function softEnter(el) {
    if(!reduced.matches&&el.animate)el.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.2,.65,.3,1)'});
  }

  let filter='all', selectedService=null, selectedSector='health';
  let serviceQuery='';
  const normalizeService=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const serviceMatches=(service,query)=>{const text=normalizeService([service.title,service.summary,categoryName(service.category),...(service.bullets||[])].join(' '));return normalizeService(query).split(/\s+/).filter(Boolean).every(term=>text.includes(term));};

  const services=()=>I.get('serviceItems');
  function categoryName(category){return t({data:'filterData',business:'filterBusiness',operations:'filterOperations'}[category]);}
  // Áreas de práctica: índice editorial + panel de detalle (escritorio) / acordeón (móvil).
  const PRACTICE_ICONS={
    "corporate": "<path d=\"M5 27V8.5l13-3V27M18 12l9 2v13M3 27h26M10 12h3m-3 5h3m-3 5h3M22 18h1m-1 4h1\"/><path class=\"practice-icon-accent\" d=\"M5 8.5l13-3M10 27v-2h3v2\"/>",
    "data": "<path d=\"M16 3.5 26 7v7.8c0 6.1-4.2 10.9-10 13.7-5.8-2.8-10-7.6-10-13.7V7Z\"/><path d=\"M11 11.5h10M11 15.5h5\"/><path class=\"practice-icon-accent\" d=\"m12 21 2.8 2.6 5.7-6\"/>",
    "foreign": "<circle cx=\"16\" cy=\"16\" r=\"11\"/><path d=\"M5 16h22M16 5c-4 3.5-5.5 7-5.5 11S12 23.5 16 27M16 5c4 3.5 5.5 7 5.5 11S20 23.5 16 27\"/><path class=\"practice-icon-accent\" d=\"M6.3 10.8c5.8 2.7 13.6 2.7 19.4 0M6.3 21.2c5.8-2.7 13.6-2.7 19.4 0\"/>",
    "accounting": "<path d=\"M7 4.5h16a2 2 0 0 1 2 2v20H9a2 2 0 0 1-2-2Zm0 0v20a2 2 0 0 0 2 2M11 9h10M11 13h6M11 21v-3m5 3v-5\"/><path class=\"practice-icon-accent\" d=\"M21 21v-8M4.5 10H9M4.5 15H9M4.5 20H9\"/>",
    "incorporation": "<path d=\"M19.5 4.5H8a2 2 0 0 0-2 2v20h20V11ZM19.5 4.5V11H26M11 15h10M11 19h5\"/><path class=\"practice-icon-accent\" d=\"M20.5 20v6M17.5 23h6\"/>",
    "employment": "<rect x=\"4\" y=\"10\" width=\"24\" height=\"16\" rx=\"2\"/><path d=\"M11 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M4 15.5c6.8 4 17.2 4 24 0\"/><path class=\"practice-icon-accent\" d=\"M13 16.5v4h6v-4\"/>",
    "ip": "<path d=\"M11 22c0-2.5-4-4-4-9a9 9 0 0 1 18 0c0 5-4 6.5-4 9M11 22h10M12 25.5h8M14 28h4M16 22v-7\"/><path class=\"practice-icon-accent\" d=\"m12.5 11 3.5 4 3.5-4\"/>",
    "disputes": "<path d=\"M16 5v22M10 27h12M5 10l11-4 11 4M7 10l-4 9h8Zm18 0-4 9h8Z\"/><path class=\"practice-icon-accent\" d=\"M3 19c1 4 7 4 8 0m10 0c1 4 7 4 8 0\"/>",
    "notarial": "<path d=\"M18 4.5H7v23h18v-16ZM18 4.5v7h7M11 15h8M11 19h5\"/><path class=\"practice-icon-accent\" d=\"m16 24 9-9 3 3-9 9h-3Z\"/>"
};
  const practiceIcon=id=>'<svg class="practice-symbol" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">'+(PRACTICE_ICONS[id]||PRACTICE_ICONS.corporate)+'</svg>';
  const ARROW='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6.5 18.5 12 13 17.5"/></svg>';
  const desktopPractice=matchMedia('(min-width: 961px)');
  let selectedPractice='data',openPractice=null;
  const pad=n=>String(n).padStart(2,'0');
  function practiceDetail(service,{panel=false}={}){
    const wrap=document.createDocumentFragment();
    const total=pad(services().length),index=pad(services().indexOf(service)+1);
    if(panel){
      wrap.append(node('span','practice-panel-watermark',index,{'aria-hidden':'true'}));
      const meta=node('p','practice-panel-meta');meta.append(node('span','',categoryName(service.category)));
      const mark=node('span','practice-panel-icon');mark.innerHTML=practiceIcon(service.id);
      wrap.append(mark,meta,node('h3','practice-panel-title',service.title,{id:'practice-panel-title'}));
    }
    wrap.append(node('p','practice-summary',service.summary));
    if(service.price)wrap.append(node('p','practice-price',service.price));
    if(service.priceNote)wrap.append(node('p','practice-price-note',service.priceNote));
    wrap.append(node('p','practice-label',t('serviceIncludes')));
    const list=node('ul','practice-scope');service.bullets.forEach(text=>list.append(node('li','',text)));wrap.append(list);
    const actions=node('div','practice-actions');
    const ask=node('button','button button-primary practice-ask',null,{type:'button','data-practice-ask':service.id});
    ask.append(node('span','',t('serviceAsk')),node('span','',' ↗',{'aria-hidden':'true'}));
    actions.append(ask);
    // Tarea 4.2: enlace a la landing del servicio cuando ya existe (solo versión en español).
    const page=SERVICE_PAGES[service.id]||service.page;
    if(page){const more=node('a','button button-outline practice-more',null,{href:page});more.append(node('span','',t('serviceReadFull')),node('span','',' →',{'aria-hidden':'true'}));actions.append(more);}
    wrap.append(actions,node('p','practice-note',t('serviceScope')));
    return wrap;
  }
  let panelFitFrame=0;
  function fitPracticePanel(){
    cancelAnimationFrame(panelFitFrame);
    panelFitFrame=requestAnimationFrame(()=>{
      const panel=$('#practice-panel');if(!panel||!desktopPractice.matches)return;
      const inner=panel.querySelector('.practice-panel-inner');if(!inner)return;
      const header=document.querySelector('.site-header,.tl-header');
      const available=Math.max(300,innerHeight-(header?.getBoundingClientRect().height||72)-32);
      panel.dataset.density='regular';
      if(inner.getBoundingClientRect().height>available)panel.dataset.density='compact';
      if(inner.getBoundingClientRect().height>available)panel.dataset.density='dense';
    });
  }
  addEventListener('resize',fitPracticePanel,{passive:true});
  document.fonts?.ready.then(fitPracticePanel);
  function renderPanel(animate){
    const panel=$('#practice-panel');if(!panel)return;
    const service=services().find(s=>s.id===selectedPractice)||services()[0];
    const inner=node('div','practice-panel-inner');inner.append(practiceDetail(service,{panel:true}));
    panel.replaceChildren(inner);panel.setAttribute('aria-labelledby','practice-panel-title');
    fitPracticePanel();
    if(animate&&!reduced.matches&&inner.animate)inner.animate([{opacity:.6},{opacity:1}],{duration:180,easing:'ease-out'});
  }
  function syncPractice(){
    const desktop=desktopPractice.matches;
    $$('.practice-item').forEach(item=>{
      const id=item.dataset.serviceId,row=item.querySelector('.practice-row'),detail=item.querySelector('.practice-detail');
      const active=desktop?id===selectedPractice:id===openPractice;
      item.classList.toggle('is-active',active);
      if(desktop){row.removeAttribute('aria-expanded');row.setAttribute('aria-controls','practice-panel');row.setAttribute('aria-current',String(id===selectedPractice));detail.hidden=true;}
      else{row.removeAttribute('aria-current');row.setAttribute('aria-controls',detail.id);row.setAttribute('aria-expanded',String(active));detail.hidden=!active;}
    });
  }
  function selectPractice(id,animate=true){
    if(id===selectedPractice)return;selectedPractice=id;renderPanel(animate);syncPractice();
  }
  function renderServices() {
    const search=$('#service-search');
    if(search){search.closest('.service-search').hidden=false;search.placeholder=t('serviceSearchPlaceholder');$('#service-search-clear').setAttribute('aria-label',t('serviceSearchClear'));}
    const list=$('#services-grid');retire(list);list.replaceChildren();
    const total=services().length;
    services().forEach((service,index)=>{
      const item=node('li','practice-item reveal');item.dataset.category=service.category;item.dataset.serviceId=service.id;
      item.style.setProperty('--reveal-delay',Math.min(index,8)*45+'ms');
      const row=node('button','practice-row',null,{type:'button',id:'practice-row-'+service.id});
      const num=node('span','practice-index',pad(index+1),{'aria-hidden':'true'});
      const ic=node('span','practice-icon');ic.innerHTML=practiceIcon(service.id);
      const text=node('span','practice-text');text.append(node('span','practice-title',service.title),node('span','practice-category',categoryName(service.category)));
      const arrow=node('span','practice-arrow');arrow.innerHTML=ARROW;
      row.append(num,ic,text,arrow);
      const detail=node('div','practice-detail',null,{id:'practice-detail-'+service.id,role:'region','aria-labelledby':'practice-row-'+service.id});detail.hidden=true;
      detail.append(practiceDetail(service));
      item.append(row,detail);list.append(item);
      void total;
    });
    $$('[data-filter]').forEach(button=>{
      const key=button.dataset.filter,count=key==='all'?total:services().filter(s=>s.category===key).length;
      let badge=button.querySelector('.filter-count');if(!badge){badge=node('span','filter-count',null,{'aria-hidden':'true'});button.append(badge);}
      badge.textContent=pad(count);
    });
    if(HOME_REVIEW){
      const wrapper=node('li','more-services-wrapper');
      const disclosure=node('details','more-services',null,{id:'more-services'});
      const summary=node('summary','');summary.append(node('span','more-label','Ver más servicios'),node('span','less-label','Ver menos servicios'),node('span','more-services-symbol','+',{'aria-hidden':'true'}));
      const extra=node('ol','additional-services',null,{start:'5','aria-label':'Servicios adicionales'});
      [...list.children].slice(4).forEach(item=>extra.append(item));
      disclosure.append(summary,extra);wrapper.append(disclosure);list.append(wrapper);
      disclosure.addEventListener('toggle',()=>{
        if(!disclosure.open&&extra.querySelector('[data-service-id="'+selectedPractice+'"]'))selectPractice(services()[0].id,false);
        document.dispatchEvent(new Event('tempo:layoutchange'));
      });
    }
    renderPanel(false);applyFilter(false);reveal(list);
  }
  function applyFilter(animate=true) {
    const items=$$('.practice-item');let count=0,first=null;
    if(HOME_REVIEW&&(filter!=='all'||serviceQuery))$('#more-services').open=true;
    const byId=new Map(services().map(service=>[service.id,service]));
    items.forEach(item=>{item.hidden=(filter!=='all'&&item.dataset.category!==filter)||!serviceMatches(byId.get(item.dataset.serviceId),serviceQuery);if(!item.hidden){count++;first=first||item.dataset.serviceId;}});
    const more=$('#more-services');if(more)more.closest('.more-services-wrapper').hidden=![...more.querySelectorAll('.practice-item')].some(item=>!item.hidden);
    const empty=$('#service-search-empty');if(empty)empty.hidden=count!==0;
    $('.practice-layout')?.classList.toggle('is-search-empty',count===0);
    const clear=$('#service-search-clear');if(clear)clear.hidden=!serviceQuery;
    $$('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
    $('#service-count').textContent=t('servicesCount',{count});
    const visible=items.filter(item=>!item.hidden);
    if(first&&!visible.some(item=>item.dataset.serviceId===selectedPractice))selectPractice(first,animate);else syncPractice();
    if(animate&&!reduced.matches)visible.forEach((item,index)=>{if(item.animate)item.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300+Math.min(index,6)*40,easing:'cubic-bezier(.2,.65,.3,1)'});});
    document.dispatchEvent(new Event('tempo:layoutchange'));
  }
  $('#service-search')?.addEventListener('input',event=>{serviceQuery=event.target.value;applyFilter(false);});
  $('#service-search-clear')?.addEventListener('click',()=>{serviceQuery='';$('#service-search').value='';applyFilter(false);$('#service-search').focus();});
  let hoverTimer=0;
  $('#services-grid').addEventListener('pointerover',event=>{
    if(!desktopPractice.matches||event.pointerType==='touch')return;
    const item=event.target.closest('.practice-item');if(!item)return;
    clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(!$('#practice-panel')?.contains(document.activeElement))selectPractice(item.dataset.serviceId);},90);
  });
  $('#services-grid').addEventListener('pointerleave',()=>clearTimeout(hoverTimer));
  $('#services-grid').addEventListener('focusin',event=>{const item=event.target.closest('.practice-item');if(item&&desktopPractice.matches&&event.target.matches('.practice-row'))selectPractice(item.dataset.serviceId);});
  $('#services-grid').addEventListener('click',event=>{
    const row=event.target.closest('.practice-row');if(!row)return;
    const id=row.closest('.practice-item').dataset.serviceId;
    if(desktopPractice.matches){selectPractice(id);$('#practice-panel .practice-ask')?.focus({preventScroll:true});}
    else{openPractice=openPractice===id?null:id;syncPractice();if(openPractice&&!reduced.matches){const d=row.nextElementSibling;d.animate?.([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.65,.3,1)'});}document.dispatchEvent(new Event('tempo:layoutchange'));}
  });
  document.addEventListener('click',event=>{
    const ask=event.target.closest('[data-practice-ask]');if(!ask)return;
    const service=services().find(s=>s.id===ask.dataset.practiceAsk);if(service)window.TempoUI.openInquiry(service.formValue);
  });
  desktopPractice.addEventListener?.('change',syncPractice);
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;applyFilter();}));
  function populateService() {
    const service=services().find(s=>s.id===selectedService);if(!service)return;
    $('#service-detail-category').textContent=categoryName(service.category);
    $('#service-detail-title').textContent=service.title;
    $('#service-detail-summary').textContent=service.summary;
    $('#service-detail-list').replaceChildren(...service.bullets.map(text=>node('li','',text)));
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-service-detail]');if(!button)return;
    selectedService=button.dataset.serviceDetail;populateService();window.TempoUI.openDialog('service-detail-dialog');
  });
  $('#service-detail-contact').addEventListener('click',()=>{
    const service=services().find(s=>s.id===selectedService);if(service)window.TempoUI.openInquiry(service.formValue);
  });

  function renderSectors() {
    const tabs=$('#sector-tabs');if(!tabs)return;tabs.replaceChildren();
    I.get('sectorItems').forEach(sector=>{
      const selected=sector.id===selectedSector;
      const button=node('button','sector-tab',sector.label,{type:'button',role:'tab',id:'tab-'+sector.id,'aria-controls':'sector-panel','aria-selected':String(selected),tabindex:selected?'0':'-1'});
      button.dataset.sector=sector.id;tabs.append(button);
    });
    renderSectorPanel(false);
  }
  function renderSectorPanel(animate=true) {
    const sector=I.get('sectorItems').find(s=>s.id===selectedSector), panel=$('#sector-panel');
    $$('#sector-tabs button').forEach(button=>{const active=button.dataset.sector===selectedSector;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    panel.setAttribute('aria-labelledby','tab-'+selectedSector);panel.replaceChildren();
    const header=node('div','sector-panel-heading');header.append(icon(sector.id,'sector-icon'),node('span','sector-index',String(I.get('sectorItems').indexOf(sector)+1).padStart(2,'0')));
    const title=node('h3','',sector.title),body=node('p','sector-panel-body',sector.body);
    const list=node('ul','sector-checklist');list.append(...sector.bullets.map(item=>node('li','',item)));
    const cta=node('button','text-link',t('sectorConsult'),{type:'button'});cta.addEventListener('click',()=>window.TempoUI.openInquiry('Protección de datos'));
    panel.append(header,title,body,list,cta);if(animate)softEnter(panel);
  }
  $('#sector-tabs')?.addEventListener('click',event=>{const button=event.target.closest('[data-sector]');if(button){selectedSector=button.dataset.sector;renderSectorPanel();}});
  $('#sector-tabs')?.addEventListener('keydown',event=>{
    const buttons=$$('#sector-tabs button'),index=buttons.indexOf(document.activeElement);if(index<0)return;
    let next=index;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
    event.preventDefault();selectedSector=buttons[next].dataset.sector;renderSectorPanel();buttons[next].focus();
  });
  function renderTeam() {
    const grid=$('#team-grid');retire(grid);grid.replaceChildren();
    I.get('teamItems').forEach(person=>{
      const card=node('article','team-person reveal');
      const photo=node('div','team-person-photo');
      if(person.photo)photo.append(node('img','',null,{src:BASE+person.photo,alt:person.name,width:String(person.photoWidth||800),height:String(person.photoHeight||800),loading:'lazy',decoding:'async'}));
      else {photo.classList.add('team-photo-pending');photo.append(node('span','','RV',{'aria-hidden':'true'}),node('small','','Fotografía pendiente'));photo.setAttribute('aria-label','Fotografía de '+person.name+' pendiente');}
      card.append(photo,node('h3','',person.name));
      if(HOME_REVIEW&&person.degree)card.append(node('p','team-person-degree',person.degree));
      card.append(node('p','team-person-role',person.role),node('p','team-person-specialty',person.specialty));
      if(person.page){const link=node('a','team-profile-link',null,{href:person.page,target:'_blank',rel:'noopener noreferrer','aria-label':t('profileOpenLabel',{name:person.name})});link.append(node('span','',t('profileMore')),node('span','','↗',{'aria-hidden':'true'}));card.append(link);}
      grid.append(card);
    });reveal(grid);
  }
  function reviewCard(item) {
    const card=node('article','quote-card quote-card-'+item.id+(!item.image?' quote-nophoto':'')+(item.id==='pablo'?' quote-personal':''),null,{id:'testimonio-'+item.id,'aria-labelledby':'autor-'+item.id});
    const quote=node('blockquote','quote-text');item.paragraphs.forEach(text=>quote.append(node('p','',text)));card.append(quote);
    if(I.language!=='es') {
      card.append(node('p','quote-translation',t('reviewTranslation')));
      const original=node('details','quote-original'),summary=node('summary','',t('reviewOriginal'));original.dataset.reviewOriginal=item.id;original.append(summary);
      const body=node('blockquote','quote-original-text',null,{lang:'es'});item.original.forEach(text=>body.append(node('p','',text)));original.append(body);card.append(original);
    }
    const author=node('footer','quote-author');
    if(item.image)author.append(node('img','quote-portrait',null,{src:BASE+'assets/testimonials/'+item.image,alt:'',width:'1200',height:'1500',loading:'lazy',decoding:'async'}));
    const identity=node('div','quote-identity');identity.append(node('h3','',item.name,{id:'autor-'+item.id}),node('p','quote-role',item.role));
    if(item.company)identity.append(node('p','quote-company',item.company));
    const caption=item.id==='pablo'?t('reviewProfile'):new URL(item.website).hostname;
    identity.append(node('a','quote-website',caption,{href:item.website,target:'_blank',rel:'noopener noreferrer'}));
    if(item.id==='pablo')identity.append(node('p','quote-personal-note',t('reviewPersonal')));
    author.append(identity);
    if(item.logo)author.append(node('img','quote-logo',null,{src:BASE+'assets/testimonials/'+item.logo,alt:item.company,width:'120',height:'60',loading:'lazy',decoding:'async'}));
    card.append(author);return card;
  }
  function homeReviewCard(item){
    const card=node('article','quote-card quote-card-'+item.id,null,{id:'testimonio-'+item.id,'aria-labelledby':'autor-'+item.id});
    const quote=node('blockquote','quote-text');let beginning=item.paragraphs[0],remaining=item.paragraphs.slice(1);
    if(item.id==='pablo'){const end=beginning.indexOf('. ',beginning.indexOf('. ')+2);if(end>=0){remaining=[beginning.slice(end+2),...remaining];beginning=beginning.slice(0,end+1);}}
    quote.append(node('p','',beginning));
    if(remaining.length){const details=node('details','quote-full');const summary=node('summary','');summary.append(node('span','more-label','Leer testimonio completo'),node('span','less-label','Mostrar menos'));details.append(summary);remaining.forEach(p=>details.append(node('p','',p)));quote.append(details);}
    const author=node('footer','quote-author');
    if(item.image)author.append(node('img','quote-portrait',null,{src:BASE+'assets/testimonials/'+item.image,alt:'',width:'56',height:'56',loading:'lazy',decoding:'async'}));
    else author.append(node('span','quote-initials',item.id==='pablo'?'PLP':'EB',{'aria-hidden':'true'}));
    const identity=node('div','quote-identity');identity.append(node('h3','',item.name,{id:'autor-'+item.id}),node('p','quote-role',item.role));if(item.company)identity.append(node('p','quote-company',item.company));
    if(item.website&&['juan','eleazar'].includes(item.id))identity.append(node('a','quote-website',new URL(item.website).hostname,{href:item.website,target:'_blank',rel:'noopener noreferrer'}));
    author.append(identity);
    if(item.logo)author.append(node('img','quote-logo',null,{src:BASE+'assets/testimonials/'+item.logo,alt:item.company,width:'120',height:'60',loading:'lazy',decoding:'async'}));
    card.append(quote,author);return card;
  }
  function renderReview() {
    if(HOME_REVIEW){$('#review-stage').replaceChildren(...I.get('reviewItems').map(homeReviewCard));return;}

    const open=new Set($$('.quote-original[open]').map(el=>el.dataset.reviewOriginal));
    $('#review-stage').replaceChildren(...I.get('reviewItems').map(reviewCard));
    $('#client-review').replaceChildren(reviewCard(I.get('clientReview')));
    $$('.quote-original').forEach(el=>{el.open=open.has(el.dataset.reviewOriginal);});
  }
  function renderArticles() {
    const grid=$('#articles-grid');retire(grid);grid.replaceChildren();
    I.get('articleItems').forEach((article,index)=>{
      const featured=index===0,titleId='insight-title-'+article.id;
      const card=node('article','insight-entry '+(featured?'insight-feature':'insight-row')+' reveal',null,{'aria-labelledby':titleId});
      card.style.setProperty('--reveal-delay',index*55+'ms');
      if(featured){const art=node('div','insight-art',null,{'aria-hidden':'true'});art.append(icon(article.id));card.append(art);}
      const meta=node('div','insight-meta');
      meta.append(node('span','',t(featured?'insightFeatured':article.categoryKey)));
      const copy=node('div','insight-copy');
      if(featured)copy.append(node('p','insight-category',t(article.categoryKey)));
      copy.append(node('h3','',article.title,{id:titleId}),node('p','insight-summary',article.body));
      const action=node('a','insight-action',null,{href:article.page,'aria-label':t('insightReadLabel',{topic:article.title})});
      action.append(node('span','',t('insightRead')),node('span','insight-arrow','→',{'aria-hidden':'true'}));
      copy.append(action);card.append(meta,copy);
      if(featured)card.append(node('p','insight-edition',t('insightCollection')));
      grid.append(card);
    });reveal(grid);
  }
  function renderFaq() {
    const list=$('#faq-list');if(!list)return;const open=new Set($$('details[open]',list).map(el=>el.dataset.faq));retire(list);list.replaceChildren();
    I.get('faqItems').forEach((item,index)=>{
      const details=node('details','faq-item reveal');details.dataset.faq=String(index);if(open.has(String(index)))details.open=true;
      const summary=node('summary','');summary.append(node('span','',item.question),node('span','details-plus','+',{'aria-hidden':'true'}));details.append(summary,node('p','',item.answer));list.append(details);
    });reveal(list);
  }
  function renderCases(){
    const grid=$('#cases-grid');retire(grid);grid.replaceChildren();
    const logos={"gma":"assets/clients-home/1-01.webp","cce":"assets/clients-home/2-01.webp","solca":"assets/clients-home/2-02.webp","pazmino":"assets/clients-premium/client-014.svg","asistanet":"assets/clients-premium/client-003.svg"};
    I.get('caseItems').forEach((item,index)=>{
      const titleId='case-title-'+item.id;
      const card=node('article','case-card reveal',null,{'aria-labelledby':titleId});card.style.setProperty('--reveal-delay',index*90+'ms');
      const link=node('a','case-card-link',null,{href:item.page,'aria-labelledby':titleId});
      const art=node('div','case-art',null,{'aria-hidden':'true'}),brand=node('span','case-brand');
      brand.append(node('img','',null,{src:BASE+logos[item.id],alt:'',loading:'lazy',decoding:'async',width:'320',height:'200'}));art.append(brand);
      const content=node('div','case-content'),meta=node('div','case-meta');
      meta.append(node('span','case-index',String(index+1).padStart(2,'0')+' / 03'),node('span','case-sector',item.sector));
      content.append(node('h3','',item.name,{id:titleId}));if(!HOME_REVIEW)content.append(meta,node('p','case-summary',item.summary));
      const tags=node('ul','case-tags');(item.tags||[]).slice(0,2).forEach(tag=>tags.append(node('li','',tag)));
      const action=node('span','case-cta');action.append(node('span','',t('casesExplore')),node('span','case-cta-line',null,{'aria-hidden':'true'}));
      if(!HOME_REVIEW)content.append(tags);content.append(action);link.append(art,content);card.append(link);grid.append(card);
    });reveal(grid);
  }
  // Parallax muy leve del logotipo, limitado a esta sección y desactivado si se reduce el movimiento.
  const caseGrid=$('#cases-grid');let caseFrame=0,caseTarget=null,caseX=0,caseY=0;
  if(caseGrid&&finePointer.matches&&!reduced.matches){
    caseGrid.addEventListener('pointermove',event=>{
      const card=event.target.closest('.case-card');if(!card)return;
      caseTarget=card;caseX=event.clientX;caseY=event.clientY;
      if(!caseFrame)caseFrame=requestAnimationFrame(()=>{
        caseFrame=0;if(!caseTarget?.isConnected)return;
        const b=caseTarget.getBoundingClientRect(),x=(caseX-b.left)/b.width-.5,y=(caseY-b.top)/b.height-.5;
        caseTarget.style.setProperty('--case-x',((x+.5)*100).toFixed(1)+'%');
        caseTarget.style.setProperty('--case-y',((y+.5)*100).toFixed(1)+'%');
        caseTarget.style.setProperty('--logo-x',(x*9).toFixed(1)+'px');
        caseTarget.style.setProperty('--logo-y',(y*6).toFixed(1)+'px');
      });
    },{passive:true});
    caseGrid.addEventListener('pointerout',event=>{
      const card=event.target.closest('.case-card');if(card&&!card.contains(event.relatedTarget)){
        card.style.setProperty('--logo-x','0px');card.style.setProperty('--logo-y','0px');
      }
    });
  }
  $('#cases-consult')?.addEventListener('click',()=>window.TempoUI.openInquiry('Protección de datos'));
  function renderAll(){renderServices();renderSectors();renderTeam();renderReview();renderCases();renderArticles();renderFaq();if(selectedService)populateService();}
  document.addEventListener('toggle',event=>{if(event.target.matches('details'))document.dispatchEvent(new Event('tempo:layoutchange'));},true);
  function updatePrivacyLinks(){
    document.querySelectorAll('[data-privacy-link]').forEach(link=>link.setAttribute('href','politica-de-privacidad/'));
  }
  updatePrivacyLinks();
  document.addEventListener('tempo:languagechange',updatePrivacyLinks);
  renderAll();
  document.addEventListener('tempo:languagechange',renderAll);
  if(!reduced.matches&&revealObserver)document.documentElement.classList.add('motion-enabled');reveal();
  reduced.addEventListener('change',()=>{document.documentElement.classList.toggle('motion-enabled',!reduced.matches&&!!revealObserver);if(reduced.matches)$$('.reveal').forEach(el=>el.classList.add('is-revealed'));});

})();
/* Enlaces del pie a servicios sin página propia todavía: #servicio-<id> abre ese servicio en la Home (tarea 4.2, provisional). */
(()=>{function openService(){const m=location.hash.match(/^#servicio-([a-z]+)$/);if(!m)return;const row=document.getElementById('practice-row-'+m[1]);if(!row)return;const more=row.closest('details');if(more)more.open=true;if(row.getAttribute('aria-current')!=='true'&&row.getAttribute('aria-expanded')!=='true')row.click();(row.closest('.practice-item')||row).scrollIntoView({block:'center'});}
addEventListener('hashchange',openService);if(document.readyState==='complete')setTimeout(openService,60);else addEventListener('load',()=>setTimeout(openService,60));})();
