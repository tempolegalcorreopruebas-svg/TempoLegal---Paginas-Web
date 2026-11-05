'use strict';
// Reuse the existing contact form, preserving its values and event handlers.
(() => {
  const contact = document.getElementById('contacto');
  if (!contact || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'diagnostic-dialog';
  dialog.id = 'diagnostic-dialog';
  const title = contact.querySelector('h2');
  title.id = 'diagnostic-dialog-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'diagnostic-dialog-close';
  close.setAttribute('aria-label', 'Cerrar diagnóstico');
  close.textContent = '×';
  close.autofocus = true;
  dialog.append(close);
  document.body.append(dialog);
  dialog.append(contact);
  let trigger;
  document.querySelectorAll('a[href="#contacto"]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      event.preventDefault();
      trigger = link;
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('diagnostic-dialog-open');
      dialog.scrollTop = 0;
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('diagnostic-dialog-open');
    trigger?.focus({ preventScroll: true });
  });
})();