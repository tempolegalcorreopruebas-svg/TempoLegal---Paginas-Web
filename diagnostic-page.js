'use strict';

// Progress is browser-local and never changes answers, scoring, or result copy.
(() => {
  const main = document.querySelector('.diagnostic-page');
  if (!main) return;
  const form = main.querySelector('form');
  const fields = [...form.querySelectorAll('select')];
  const meter = main.querySelector('progress');
  const status = main.querySelector('[data-progress-status]');
  const english = document.documentElement.lang.startsWith('en');
  const update = () => {
    const answered = fields.filter(field => field.value !== '').length;
    fields.forEach(field => field.closest('.field').classList.toggle('is-answered', field.value !== ''));
    meter.value = answered;
    main.querySelector('[data-answered-count]').textContent = String(answered);
    status.textContent = english ? `${answered} of 5 questions answered` : `${answered} de 5 preguntas respondidas`;
  };
  form.addEventListener('change', update);
  form.addEventListener('reset', () => requestAnimationFrame(update));
  update();
})();
