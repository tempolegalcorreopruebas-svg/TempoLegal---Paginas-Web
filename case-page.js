'use strict';
(() => {
  const I=window.TempoI18n,t=I.t,id=document.body.dataset.case;
  const $=q=>document.querySelector(q),$$=(q,root=document)=>[...root.querySelectorAll(q)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const node=(tag,className,text,attrs={})=>{
    const el=document.createElement(tag);if(className)el.className=className;
    if(text!==undefined&&text!==null)el.textContent=text;
    Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));return el;
  };
  let frame=0;
  const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}
  }),{threshold:.06,rootMargin:'0px 0px -15px 0px'}):null;
  function reveal(){
    $$('.project-reveal').forEach(el=>{
      if(reduced.matches||!revealObserver)el.classList.add('is-revealed');
      else if(!el.classList.contains('is-revealed'))revealObserver.observe(el);
    });
  }
  function retire(root){$$('.project-reveal',root).forEach(el=>revealObserver?.unobserve(el));}
  function updateReading(){
    frame=0;
    const height=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty('--reading-progress',Math.min(1,Math.max(0,scrollY/height)).toFixed(5));
    const offset=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))+70;
    const current=$$('.project-story-section').filter(el=>el.getBoundingClientRect().top<=offset).at(-1);
    $$('#project-index a').forEach(link=>{
      if(current&&link.hash==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(updateReading);}
  function updateLinks(){
    $$('[data-project-home]').forEach(link=>{
      const hash=link.getAttribute('href').split('#')[1];
      link.setAttribute('href','index.html?lang='+I.language+(hash?'#'+hash:''));
    });
    $$('[data-project-consult]').forEach(link=>link.setAttribute('href','index.html?lang='+I.language+(['gma','cce'].includes(id)?'':'&consulta=proteccion-datos')+'#contacto'));
    $$('[data-project-privacy]').forEach(link=>link.setAttribute('href','politica-de-privacidad.html?lang='+I.language));
  }
  function renderPage(){
    const current=I.get('caseItems'),cases=current.some(project=>project.id===id)?current:I.get('legacyCaseItems'),item=cases.find(project=>project.id===id);if(!item)return;
    $('#project-page-title').textContent=item.name+' — '+t('projectLabel')+' | Tempo Legal';
    $('#project-meta-description').setAttribute('content',item.summary);
    $('#project-title').textContent=item.name;$('#project-lead').textContent=item.summary;
    $$('.project-sector-label').forEach(el=>el.textContent=item.sector);
    $('#project-tags').replaceChildren(...item.tags.map(text=>node('li','',text)));
    const story=$('#project-story'),index=$('#project-index');retire(story);story.replaceChildren();index.replaceChildren();
    item.story.forEach((part,n)=>{
      const section=node('section','project-story-section project-reveal'+(n===2?' project-outcome':''),null,{id:'caso-seccion-'+n,'aria-labelledby':'caso-titulo-'+n});
      section.append(node('p','eyebrow',t('projectLabel')),node('h2','',part.heading,{id:'caso-titulo-'+n}),...part.paragraphs.map(text=>node('p','',text)));
      story.append(section);const li=node('li','');li.append(node('a','',part.heading,{href:'#caso-seccion-'+n}));index.append(li);
    });
    const related=$('#project-related');retire(related);related.replaceChildren();
    cases.filter(project=>project.id!==id).forEach(project=>{
      const card=node('a','project-related-card project-reveal',null,{href:project.page+'?lang='+I.language});
      card.append(node('p','eyebrow',project.sector),node('h3','',project.name),node('p','',project.summary),node('span','text-link',t('casesReadFull')));related.append(card);
    });
    updateLinks();reveal();requestUpdate();
  }
  document.documentElement.classList.toggle('project-motion',!reduced.matches&&!!revealObserver);
  renderPage();document.addEventListener('tempo:languagechange',renderPage);
  reduced.addEventListener('change',()=>{document.documentElement.classList.toggle('project-motion',!reduced.matches&&!!revealObserver);reveal();});
  addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate,{passive:true});
  document.addEventListener('load',requestUpdate,true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestUpdate();});
  document.fonts?.ready.then(requestUpdate);
})();
