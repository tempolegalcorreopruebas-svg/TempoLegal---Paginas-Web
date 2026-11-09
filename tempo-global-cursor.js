/* TempoLegal global cursor aura | all pages, all locales, no interaction interception */
(() => {
  'use strict';
  if (window.__tempoGlobalCursorReady) return;
  window.__tempoGlobalCursorReady = true;

  const enabled = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!enabled.matches || reduced.matches) return;

  const start = () => {
    if (!document.body || document.getElementById('tempo-global-cursor-glow')) return;
    const aura = document.createElement('div');
    aura.id = 'tempo-global-cursor-glow';
    aura.setAttribute('aria-hidden', 'true');
    document.body.appendChild(aura);

    const radius = 86;
    let targetX = -220, targetY = -220;
    let currentX = -220, currentY = -220;
    let visible = false, frame = 0;
    let lastClass = '';

    function brightness(rgb) {
      const channels = rgb.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return null;
      const values = channels.slice(0, 3).map(Number);
      const alpha = channels.length >= 4 ? Number(channels[3]) : 1;
      if (alpha < 0.17) return null;
      return (values[0] * .2126 + values[1] * .7152 + values[2] * .0722);
    }

    function lightSurface(node) {
      let element = node && node.nodeType === 1 ? node : node?.parentElement;
      let first = true;
      while (element && element !== document.documentElement) {
        if (element.id !== 'tempo-global-cursor-glow') {
          const style = window.getComputedStyle(element);
          const bg = brightness(style.backgroundColor);
          if (bg !== null) return bg > 142;
          // An image/gradient with white typography is generally a dark hero.
          if (style.backgroundImage !== 'none') {
            const foreground = brightness(style.color);
            if (foreground !== null && foreground > 186) return false;
          }
          if (first && element.matches('img, video, picture')) {
            const parentStyle = element.parentElement && window.getComputedStyle(element.parentElement);
            if (parentStyle) {
              const fg = brightness(parentStyle.color);
              if (fg !== null && fg > 190) return false;
            }
          }
        }
        first = false;
        element = element.parentElement;
      }
      return true;
    }

    function paint() {
      frame = 0;
      const ratio = .24;
      currentX += (targetX - currentX) * ratio;
      currentY += (targetY - currentY) * ratio;
      aura.style.transform = `translate3d(${(currentX - radius).toFixed(1)}px, ${(currentY - radius).toFixed(1)}px, 0)`;
      if (visible && (Math.abs(targetX - currentX) > .35 || Math.abs(targetY - currentY) > .35)) {
        frame = requestAnimationFrame(paint);
      }
    }

    function move(event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      targetX = event.clientX;
      targetY = event.clientY;
      const nextClass = lightSurface(event.target) ? 'light' : 'dark';
      if (nextClass !== lastClass) {
        aura.classList.toggle('is-on-light', nextClass === 'light');
        lastClass = nextClass;
      }
      if (!visible) {
        visible = true;
        currentX = targetX;
        currentY = targetY;
        aura.classList.add('is-visible');
      }
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function hide() {
      visible = false;
      aura.classList.remove('is-visible');
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', e => { if (!e.relatedTarget) hide(); }, { passive: true });
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
    reduced.addEventListener?.('change', () => { if (reduced.matches) { hide(); aura.remove(); } });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
