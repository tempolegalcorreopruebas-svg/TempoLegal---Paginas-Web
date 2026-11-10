'use strict';
(() => {
  const body = document.body;
  if (!body || !body.classList.contains('corporate-law-page')) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enterHero() {
    const heroItems = [...document.querySelectorAll('.service-hero-copy > *, .service-overview')];
    heroItems.forEach((item, index) => item.style.setProperty('--hero-delay', `${140 + index * 90}ms`));
    if (reduce) {
      body.classList.add('tl-corp-loaded');
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('tl-corp-loaded')));
  }

  function staggerSectionChildren() {
    document.querySelectorAll('.service-section').forEach(section => {
      const children = [...section.children].filter(el => !el.hidden);
      children.forEach((child, index) => child.style.setProperty('--corp-delay', `${Math.min(index * 90, 420)}ms`));
    });
  }

  function buildContextExplorer() {
    const section = document.querySelector('#context');
    const list = section?.querySelector('.service-process');
    if (!section || !list || section.querySelector('.corp-route-explorer')) return;

    const items = [...list.querySelectorAll(':scope > li')].map((item) => {
      const title = item.querySelector('h3')?.textContent?.trim() || '';
      const paragraphs = [...item.querySelectorAll('p')];
      const description = paragraphs.find(p => !p.querySelector('a'))?.textContent?.trim() || '';
      const link = item.querySelector('a');
      return {
        title,
        description,
        href: link?.getAttribute('href') || '#',
        cta: link?.textContent?.trim() || ''
      };
    }).filter(entry => entry.title);

    if (!items.length) return;

    const explorer = document.createElement('div');
    explorer.className = 'corp-route-explorer';

    const listBox = document.createElement('div');
    listBox.className = 'corp-route-list';

    const stage = document.createElement('div');
    stage.className = 'corp-route-stage';

    const triggers = [];
    const cards = [];

    const activate = (nextIndex) => {
      triggers.forEach((button, index) => {
        const active = index === nextIndex;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-expanded', active ? 'true' : 'false');
        button.setAttribute('aria-current', active ? 'true' : 'false');
      });
      cards.forEach((card, index) => card.classList.toggle('is-active', index === nextIndex));
      if (window.innerWidth <= 700) {
        const activeCard = cards[nextIndex];
        if (activeCard) {
          stage.style.minHeight = '0px';
          activeCard.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        }
      }
    };

    items.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'corp-route-trigger';
      button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      button.setAttribute('aria-controls', `corp-route-card-${index}`);
      button.innerHTML = `<span class="corp-route-trigger-title">${entry.title}</span><span class="corp-route-trigger-arrow" aria-hidden="true">↗</span>`;
      button.addEventListener('mouseenter', () => activate(index));
      button.addEventListener('focus', () => activate(index));
      button.addEventListener('click', () => activate(index));
      triggers.push(button);
      listBox.appendChild(button);

      const card = document.createElement('article');
      card.className = 'corp-route-card';
      card.id = `corp-route-card-${index}`;
      const title = document.createElement('h3');
      title.textContent = entry.title;
      const description = document.createElement('p');
      description.textContent = entry.description;
      const cta = document.createElement('a');
      cta.className = 'text-link';
      cta.href = entry.href;
      cta.innerHTML = `${entry.cta} <span aria-hidden="true">↗</span>`;
      card.append(title, description, cta);
      cards.push(card);
      stage.appendChild(card);
    });

    explorer.append(listBox, stage);
    list.hidden = true;
    list.after(explorer);
    activate(0);
  }

  function enableKeyboardHoverExperience() {
    const questions = document.querySelectorAll('#scope .service-question summary, #testimonials .service-question summary, #questions .service-question summary');
    questions.forEach(summary => summary.setAttribute('tabindex', '0'));
  }

  function mountStickyOverview() {
    const overview = document.querySelector('.service-overview');
    if (!overview) return;
    overview.setAttribute('data-corp-sticky', 'true');
  }

  function revealRelatedServices() {
    const links = [...document.querySelectorAll('.service-related-links a')];
    if (!links.length) return;
    links.forEach((link, index) => {
      link.style.setProperty('--related-delay', `${(index % 2) * 95}ms`);
    });
    if (reduce || !('IntersectionObserver' in window)) {
      links.forEach(link => link.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.14, rootMargin: '0px 0px -30px 0px'});
    links.forEach(link => observer.observe(link));
  }

  enterHero();
  revealRelatedServices();
  buildContextExplorer();
  staggerSectionChildren();
  enableKeyboardHoverExperience();
  mountStickyOverview();
})();
