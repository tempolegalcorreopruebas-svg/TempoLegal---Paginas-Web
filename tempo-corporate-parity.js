'use strict';
(() => {
  const body = document.body;
  if (!body?.classList.contains('tl-corporate-parity')) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mirror the corporate-law landing's staggered entrance without changing source copy.
  const heroItems = document.querySelectorAll('.service-hero-copy > *, .reform-hero .hero-grid-own > div:first-child > *, .tl-approved-hero .tl-container > *');
  heroItems.forEach((item, i) => item.style.setProperty('--parity-delay', `${Math.min(i * 85, 500)}ms`));
  if (!reduce) {
    body.classList.add('parity-loading');
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.remove('parity-loading')));
  }

  // Turn existing procedural steps into the corporate-style two-column selection.
  // Preserve every heading, paragraph, and link from the original markup.
  document.querySelectorAll('.service-section .service-process').forEach((list, listIndex) => {
    const items = [...list.children].filter(el => el.matches('li'));
    if (items.length < 3 || list.closest('.parity-explorer')) return;
    const explorer = document.createElement('div');
    explorer.className = 'parity-explorer';
    const titles = document.createElement('div');
    titles.className = 'parity-titles';
    titles.setAttribute('role', 'tablist');
    const panels = document.createElement('div');
    panels.className = 'parity-panels';
    const buttons = [], articles = [];
    items.forEach((item,i) => {
      const heading = item.querySelector('h3,h4,strong');
      if (!heading) return;
      const tab = document.createElement('button');
      tab.type='button';tab.className='parity-title';tab.setAttribute('role','tab');
      tab.id=`parity-tab-${listIndex}-${i}`;
      const panelId=`parity-panel-${listIndex}-${i}`;
      tab.setAttribute('aria-controls',panelId);
      const label=document.createElement('span');label.className='parity-title-label';label.textContent=heading.textContent.trim();
      const arrow=document.createElement('span');arrow.className='parity-title-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
      tab.append(label,arrow);
      const panel=document.createElement('article');panel.className='parity-panel';panel.id=panelId;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);
      // Clone rather than rewrite copy; all legal text remains unchanged.
      for(const child of item.children) panel.appendChild(child.cloneNode(true));
      panel.setAttribute('tabindex','0');
      titles.appendChild(tab);panels.appendChild(panel);
      buttons.push(tab);articles.push(panel);
    });
    if (buttons.length < 3) return;
    const activate = (n,focus=false) => {
      buttons.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===n));tab.tabIndex=i===n?0:-1;});
      articles.forEach((panel,i)=>{panel.dataset.active=String(i===n);panel.hidden=i!==n;});
      if(focus) buttons[n].focus();
    };
    buttons.forEach((tab,i)=>{
      tab.addEventListener('mouseenter',()=>activate(i));
      tab.addEventListener('focus',()=>activate(i));
      tab.addEventListener('click',()=>activate(i));
      tab.addEventListener('keydown',e=>{
        const delta=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;
        if(delta){e.preventDefault();activate((i+delta+buttons.length)%buttons.length,true)}
        else if(e.key==='Home'){e.preventDefault();activate(0,true)}
        else if(e.key==='End'){e.preventDefault();activate(buttons.length-1,true)}
      });
    });
    activate(0);
    explorer.append(titles,panels);
    list.before(explorer);
    list.hidden=true;
    list.setAttribute('aria-hidden','true');
  });
})();
