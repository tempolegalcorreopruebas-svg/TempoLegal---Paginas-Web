'use strict';
(() => {
  document.documentElement.classList.add('has-js');
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 640px)');
  const config = window.TEMPO_CONFIG || {};
  const I18n = window.TempoI18n;
  const t = I18n.t;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attributes) => {
    const element = document.createElementNS(svgNS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  // Navegación móvil: estado accesible y cierre con Escape o al elegir un enlace.
  const menuButton = $('.menu-toggle');
  const nav = $('#main-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = t('menuOpen');
    nav.classList.remove('is-open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = t(open ? 'menuClose' : 'menuOpen');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a,button')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 1101px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Diálogos nativos: confinamiento de foco, Escape y restauración del foco.
  function updateDialogLock() { document.body.classList.toggle('dialog-open', !!$('dialog[open]')); }
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    $$('dialog[open]').forEach(item => item.close());
    dialog.showModal();
    updateDialogLock();
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open)));
  $$('dialog').forEach(dialog => {
    $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', updateDialogLock);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });
  $$('[data-close-dialog]').forEach(link => link.addEventListener('click', () => link.closest('dialog').close()));
  $$('[data-service]').forEach(button => button.addEventListener('click', () => {
    $('#contact-form').elements.servicio.value = button.dataset.service;
    openDialog('contact-dialog');
  }));

  // Los recorridos entran una vez; el latido y los rombos continúan mientras se ven.
  const motionSections = [$('#empresas-extranjeras'), $('.hero')];
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0 });
    motionSections.forEach(section => motionObserver.observe(section));
  } else motionSections.forEach(section => section.classList.add('is-visible','is-in-view'));
  function syncMotionVisibility(){document.documentElement.classList.toggle('motion-paused',document.hidden);}
  document.addEventListener('visibilitychange',syncMotionVisibility);
  syncMotionVisibility();

  // Interpolación dependiente del tiempo: movimiento suave y ningún bucle en reposo.
  const hero = $('.hero'), method = $('.method'), steps = $$('.step');
  const motion = {photo:0,backdrop:0,diamond:0,pointer:0,progress:0};
  const target = {...motion};
  let scrollFrame = 0, needsMeasure = true, lastFrame = 0, pointerTarget = 0;
  function measure() {
    const heroBounds = hero.getBoundingClientRect(), methodBounds = method.getBoundingClientRect();
    const offset = !mobile.matches && !reducedMotion.matches && heroBounds.bottom > 0 ? clamp(-heroBounds.top,0,innerHeight) : 0;
    target.photo = offset*.035;target.backdrop = -offset*.065;target.diamond = -offset*.045;
    target.progress = mobile.matches || reducedMotion.matches ? 1 : clamp(.035 + (-methodBounds.top / Math.max(1,methodBounds.height-innerHeight)) * 1.12);
    target.pointer = reducedMotion.matches ? 0 : pointerTarget;
    const height = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty('--reading-progress',clamp(scrollY/height).toFixed(5));
    needsMeasure = false;
  }
  function updateScroll(now = performance.now()) {
    scrollFrame = 0;if(needsMeasure)measure();
    const dt = Math.min(64,lastFrame?now-lastFrame:16);lastFrame=now;
    const ease = reducedMotion.matches ? 1 : 1-Math.exp(-dt/75);
    let settling = false;
    for(const key of Object.keys(motion)){
      const difference=target[key]-motion[key];
      if(Math.abs(difference)>(key==='progress'?.0003:.025)){motion[key]+=difference*ease;settling=true;}else motion[key]=target[key];
    }
    hero.style.setProperty('--photo-shift',motion.photo.toFixed(2)+'px');
    hero.style.setProperty('--backdrop-shift',motion.backdrop.toFixed(2)+'px');
    hero.style.setProperty('--diamond-shift',motion.diamond.toFixed(2)+'px');
    hero.style.setProperty('--diamond-x',motion.pointer.toFixed(2)+'px');
    method.style.setProperty('--progress',motion.progress.toFixed(4));
    steps.forEach((step,i)=>step.classList.toggle('active',motion.progress>=i*.25));
    if(settling&&!document.hidden)scrollFrame=requestAnimationFrame(updateScroll);else lastFrame=0;
  }
  function requestScrollUpdate(){needsMeasure=true;if(!scrollFrame&&!document.hidden)scrollFrame=requestAnimationFrame(updateScroll);}
  addEventListener('scroll',requestScrollUpdate,{passive:true});addEventListener('resize',requestScrollUpdate,{passive:true});
  reducedMotion.addEventListener('change',requestScrollUpdate);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(scrollFrame);scrollFrame=0;lastFrame=0;}else requestScrollUpdate();});
  document.addEventListener('load',requestScrollUpdate,true);
  document.addEventListener('tempo:layoutchange',requestScrollUpdate);
  requestScrollUpdate();
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $('.hero-visual').addEventListener('pointermove',event=>{
      if(reducedMotion.matches)return;const rect=event.currentTarget.getBoundingClientRect();pointerTarget=(event.clientX-rect.left-rect.width/2)*.018;requestScrollUpdate();
    },{passive:true});
    $('.hero-visual').addEventListener('pointerleave',()=>{pointerTarget=0;requestScrollUpdate();});
  }

  // Radar: escala orientativa de atención, editable por la firma (no valoración legal).
  // Los índices de respuestas y los pesos no dependen del idioma.
  const impacts = [
    [[100,0,0,0,30],[55,0,0,0,18],[80,0,0,0,25]],
    [[0,20,0,0,0],[0,78,0,0,0],[0,70,0,0,0]],
    [[0,0,28,0,0],[0,0,65,0,0],[0,0,90,0,0]],
    [[0,0,0,40,0],[0,0,0,60,0],[0,0,0,30,0]],
    [[0,0,0,0,72],[0,0,0,0,15],[0,0,0,0,62]],
    [[0,18,0,0,0],[0,0,0,0,0],[0,22,0,0,0]]
  ];
  let areas = I18n.get('areas');
  let questions = I18n.get('questions').map((question,i) => ({...question, impacts:impacts[i]}));
  let assessmentComplete = false;
  const answers = Array(questions.length).fill(null);
  let currentQuestion = 0;
  let transitioning = false;
  let questionTimer = 0;
  let chartFrame = 0;
  let displayedValues = Array(5).fill(6);
  const cx = 400, cy = 380, radius = 280;
  const position = (i, value) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
    return [cx + Math.cos(angle) * radius * value / 100, cy + Math.sin(angle) * radius * value / 100];
  };
  const polygonPoints = values => values.map((value, i) => position(i, value).map(n => n.toFixed(2)).join(',')).join(' ');
  const grid = $('#radar-grid');
  [25, 50, 75, 100].forEach(value => grid.append(svgElement('polygon', { points: polygonPoints(Array(5).fill(value)) })));
  areas.forEach((_, i) => {
    const [x,y] = position(i, 100);
    grid.append(svgElement('line', {x1:cx,y1:cy,x2:x,y2:y}));
  });
  const markers = areas.map(() => {
    const circle = svgElement('circle', {r:5.5});
    $('#radar-markers').append(circle); return circle;
  });
  $('#radar-markers').append(svgElement('circle', { cx,cy,r:2.8,class:'center-dot' }));
  function getScores() {
    const scores = Array(5).fill(0);
    answers.forEach((answer, i) => {
      if (answer === null) return;
      questions[i].impacts[answer].forEach((value, area) => {
        // La sexta respuesta suma al área corporativa; las demás fijan el área.
        scores[area] = i === 5 ? Math.min(100, scores[area] + value) : Math.max(scores[area], value);
      });
    });
    return scores;
  }
  function paintRadar(values) {
    $('#radar-shape').setAttribute('points', polygonPoints(values));
    markers.forEach((circle, i) => {
      const [x,y] = position(i, values[i]);
      circle.setAttribute('cx', x);circle.setAttribute('cy', y);
      circle.style.opacity = values[i] > 8 ? '1' : '0';
    });
  }
  function updateRadar() {
    cancelAnimationFrame(chartFrame);
    const initial = [...displayedValues];
    const target = getScores().map(score => Math.max(6, score));
    const start = performance.now();
    const duration = reducedMotion.matches ? 0 : 650;
    function frame(now) {
      const t = duration ? clamp((now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      displayedValues = target.map((value, i) => initial[i] + (value - initial[i]) * eased);
      paintRadar(displayedValues);
      if (t < 1) chartFrame = requestAnimationFrame(frame);
    }
    chartFrame = requestAnimationFrame(frame);
    const count = answers.filter(answer => answer !== null).length;
    $('#radar-chart-desc').textContent = count ? t(count === 1 ? 'chartAnsweredOne' : 'chartAnswered', {count, scores:areas.map((area,i) => t('chartScore', {area, score:getScores()[i]})).join('; ')}) : t('chartEmpty');
  }
  const stage = $('#question-stage');
  const progress = $('.question-progress');
  const previous = $('#previous-question');
  function updateProgress(complete = false) {
    const count = answers.filter(answer => answer !== null).length;
    progress.setAttribute('aria-valuenow', count);
    $('span', progress).style.width = `${count / 6 * 100}%`;
    $('#question-counter').textContent = complete ? t('complete') : t('questionCounter', {number:currentQuestion + 1});
  }
  function renderQuestion(focus = false) {
    transitioning = false;
    clearTimeout(questionTimer);
    updateProgress();
    stage.replaceChildren();
    stage.classList.remove('question-enter');
    void stage.offsetWidth;
    stage.classList.add('question-enter');
    const question = questions[currentQuestion];
    const heading = document.createElement('h3');
    heading.className = 'question-title'; heading.id = 'current-question-title';
    heading.tabIndex = -1; heading.textContent = question.text;
    const list = document.createElement('div');
    list.className = 'answer-list';list.setAttribute('role','group');list.setAttribute('aria-labelledby', heading.id);
    question.options.forEach((option, i) => {
      const button = document.createElement('button');
      button.className = 'answer-option';button.type = 'button';button.textContent = option;
      button.setAttribute('aria-pressed', String(answers[currentQuestion] === i));
      if (answers[currentQuestion] === i) button.classList.add('selected');
      button.addEventListener('click', () => selectAnswer(i, button));
      list.append(button);
    });
    stage.append(heading, list);
    previous.hidden = currentQuestion === 0;
    $('#question-hint').textContent = t('questionHint');
    if (focus) heading.focus({ preventScroll:true });
  }
  function selectAnswer(index, button) {
    if (transitioning) return;
    transitioning = true;
    answers[currentQuestion] = index;
    $$('.answer-option', stage).forEach(item => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
      item.disabled = true;
    });
    updateProgress();updateRadar();
    previous.disabled = true;
    questionTimer = setTimeout(() => {
      previous.disabled = false;
      if (currentQuestion === questions.length - 1) renderResult();
      else { currentQuestion++; renderQuestion(true); }
    }, reducedMotion.matches ? 0 : 420);
  }
  previous.addEventListener('click', () => {
    if (transitioning || currentQuestion === 0) return;
    currentQuestion--;renderQuestion(true);
  });
  function resetRadar() {
    clearTimeout(questionTimer);answers.fill(null);currentQuestion = 0;diagnosisSummary = '';assessmentComplete = false;
    renderQuestion(true);updateRadar();$('#radar-caption').textContent = t('captionStart');
  }
  let diagnosisSummary = '';
  const priorityText = score => t(score >= 85 ? 'priorityHigh' : score >= 40 ? 'priorityMedium' : 'priorityLow');
  function buildDiagnosisSummary() {
    if (!assessmentComplete) return '';
    const sorted = areas.map((area,i) => ({area,score:getScores()[i]})).sort((a,b) => b.score-a.score);
    return t('summaryTitle') + '\n' + sorted.map(({area,score}) => `${area}: ${priorityText(score)}`).join('\n') + '\n\n' + t('answers') + ':\n' + questions.map((q,i) => `${q.text}\n${q.options[answers[i]]}`).join('\n\n');
  }
  function renderResult(focus = true) {
    assessmentComplete = true;
    transitioning = false;updateProgress(true);stage.replaceChildren();
    previous.hidden = true;
    $('#question-hint').textContent = '';
    const eyebrow = document.createElement('p');eyebrow.className = 'eyebrow result-eyebrow';eyebrow.textContent = t('result');
    const heading = document.createElement('h3');heading.className = 'result-title';heading.tabIndex = -1;heading.textContent = t('resultTitle');
    const scores = getScores();
    const sorted = areas.map((area,i) => ({area,score:scores[i],index:i})).sort((a,b) => b.score-a.score);
    const list = document.createElement('ul');list.className = 'result-list';
    sorted.forEach(({area,score}) => {
      const row = document.createElement('li');const title = document.createElement('span');title.textContent = area;
      const priority = document.createElement('span');priority.className = `priority priority-${score >= 85 ? 'high' : score >= 40 ? 'medium' : 'low'}`;priority.textContent = priorityText(score);
      row.append(title,priority);list.append(row);
    });
    diagnosisSummary = buildDiagnosisSummary();
    const actions = document.createElement('div');actions.className = 'diagnostic-result-actions';
    const contact = document.createElement('button');contact.className = 'button button-primary';contact.textContent = t('consultLawyer');
    contact.addEventListener('click', () => openInquiry('Radar legal empresarial'));
    const restart = document.createElement('button');restart.className = 'restart-radar';restart.textContent = t('restart');restart.addEventListener('click', resetRadar);
    actions.append(contact,restart);
    const note = document.createElement('p');note.className = 'result-fineprint';note.textContent = t('resultNote');
    stage.append(eyebrow,heading,list,actions,note);
    if (focus) heading.focus({preventScroll:true});
    $('#radar-caption').textContent = t('captionComplete');
  }
  renderQuestion();paintRadar(displayedValues);

  // Contacto: las claves internas son estables; el texto se genera en el idioma elegido.
  const form = $('#contact-form');
  let requestText = '';
  let requestData = null;
  const email = typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email) ? config.email : '';
  const phone = typeof config.whatsapp === 'string' ? config.whatsapp.replace(/\D/g, '') : '';
  const validPhone = /^\d{8,15}$/.test(phone);
  let booking = '';
  try { const candidate = new URL(config.bookingUrl);if (candidate.protocol === 'https:') booking = candidate.href; } catch (_) {}
  function updateContactCopy() {
    const enabled = booking || validPhone || email;
    $('#contact-description').textContent = t(enabled ? 'configuredDescription' : 'contactDescription');
    $('#contact-note').textContent = t(enabled ? 'configuredNote' : 'contactLocalNote');
    $('#contact-submit span').textContent = t(enabled ? 'reviewEnquiry' : 'prepare');
  }
  function prepareRequest() {
    if (!requestData) return;
    const selected = [...form.elements.servicio.options].find(option => option.value === requestData.servicio);
    const serviceName = selected?.textContent || t('businessAdvice');
    requestText = `${t('requestTitle')}\n\n${t('name')}: ${requestData.nombre}\n${t('email')}: ${requestData.correo}\n${t('company')}: ${requestData.empresa || t('notProvided')}\n${t('service')}: ${serviceName}\n${t('languageField')}: ${I18n.names[I18n.language]}\n\n${t('enquiryLabel')}:\n${requestData.mensaje}`;
    diagnosisSummary = buildDiagnosisSummary();
    if (requestData.servicio === 'Radar legal empresarial' && diagnosisSummary) requestText += '\n\n' + diagnosisSummary;
    const send = $('#contact-send');
    let destination = '';
    let sendKey = 'continue', noteKey = 'unconfiguredNote';
    if (booking) { destination = booking;sendKey = 'selectTime';noteKey = 'bookingNote'; }
    else if (validPhone) { destination = `https://wa.me/${phone}?text=${encodeURIComponent(requestText)}`;sendKey = 'continueWhatsapp';noteKey = 'whatsappNote'; }
    else if (email) { destination = `mailto:${email}?subject=${encodeURIComponent(t('enquiryLabel') + ' — ' + serviceName)}&body=${encodeURIComponent(requestText)}`;sendKey = 'openEmail';noteKey = 'emailNote'; }
    send.textContent = t(sendKey);$('#contact-result-note').textContent = t(noteKey);
    const emailAlternative = $('#contact-send-email');
    emailAlternative.hidden = !email || (!validPhone && !booking);
    emailAlternative.textContent = t('openEmail');
    if(email){emailAlternative.href = `mailto:${email}?subject=${encodeURIComponent(t('enquiryLabel') + ' — ' + serviceName)}&body=${encodeURIComponent(requestText)}`;emailAlternative.target='_blank';emailAlternative.rel='noopener noreferrer';}
    send.hidden = !destination;
    if (destination) { send.href = destination;send.target = '_blank';send.rel = 'noopener noreferrer'; }
    else send.removeAttribute('href');
    document.dispatchEvent(new CustomEvent('tempo:requestprepared',{detail:{data:requestData,summary:requestText,assessment:requestData.servicio==='Radar legal empresarial'?diagnosisSummary:''}}));
  }
  function validateField(field) {
    field.setCustomValidity('');
    if (field.required && !field.value.trim()) field.setCustomValidity(t('requiredField'));
    else if (field.type === 'email' && field.validity.typeMismatch) field.setCustomValidity(t('invalidEmail'));
  }
  const fields = $$('input:not([name=website]),textarea',form);
  fields.forEach(field => {
    field.addEventListener('invalid', () => validateField(field));
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    fields.forEach(validateField);
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    requestData = Object.fromEntries(Object.entries(data).map(([key,value]) => [key,String(value).trim()]));
    prepareRequest();
    form.hidden = true;$('#contact-result').hidden = false;$('#contact-result h3').tabIndex = -1;$('#contact-result h3').focus({preventScroll:true});
  });
  $('#edit-request').addEventListener('click', () => { $('#contact-result').hidden = true;form.hidden = false;form.elements.nombre.focus(); });
  $('#download-request').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + requestText],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');link.href = url;link.download = `TempoLegal-${I18n.language}.txt`;
    document.body.append(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.addEventListener('tempo:languagechange', () => {
    areas = I18n.get('areas');
    questions = I18n.get('questions').map((question,i) => ({...question,impacts:impacts[i]}));
    // Si el cambio coincide con la transición de una respuesta, se completa el avance.
    if (transitioning) {
      clearTimeout(questionTimer);transitioning = false;previous.disabled = false;
      if (currentQuestion === questions.length - 1) assessmentComplete = true;
      else currentQuestion++;
    }
    if (assessmentComplete) renderResult(false);
    else renderQuestion(false);
    updateRadar();
    $('.menu-toggle .sr-only').textContent = t(menuButton.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen');
    updateContactCopy();
    fields.forEach(field => field.setCustomValidity(''));
    if (!$('#contact-result').hidden) prepareRequest();
    requestScrollUpdate();
  });
  updateContactCopy();
  function openInquiry(service) {
    if(service)form.elements.servicio.value=service;
    form.hidden=false;$('#contact-result').hidden=true;
    openDialog('contact-dialog');
  }
  window.TempoUI=Object.freeze({openDialog,openInquiry});
  // Las páginas de casos pueden llevar directamente a la consulta correspondiente.
  try {
    const entry=new URL(location.href);
    const requestedService=entry.searchParams.get('consulta');
    const service=(window.TempoI18n.get('serviceItems')||[]).find(item=>item.formValue===requestedService||item.id===requestedService);
    if(requestedService==='proteccion-datos'||requestedService==='empresa'||service){
      openInquiry(service?.formValue||(requestedService==='proteccion-datos'?'Protección de datos':undefined));
      entry.searchParams.delete('consulta');
      history.replaceState(history.state,'',entry);
    }
  } catch (_) {}
})();
