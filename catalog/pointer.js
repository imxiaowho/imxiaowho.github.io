'use strict';
(() => {
  const modes = ['system', 'arrow', 'ring', 'spring'], key = 'vbc.pointer.v1';
  const root = document.documentElement, embedded = parent !== window;
  let mode = 'arrow';
  try { const saved = localStorage.getItem(key); if (modes.includes(saved)) mode = saved; } catch { /* Opaque frames use the parent's preference. */ }
  const frame = () => document.querySelector('#reader iframe');
  function broadcast() { frame()?.contentWindow.postMessage({ type: 'vbc-pointer-mode', mode }, '*'); }
  function apply(next, persist = false) {
    if (!modes.includes(next)) return;
    mode = next;
    root.dataset.pointer = mode;
    document.querySelectorAll('input[name=pointer-style]').forEach(input => { input.checked = input.value === mode; });
    if (persist) try { localStorage.setItem(key, mode); } catch { /* Session-only. */ }
    if (!embedded) broadcast();
  }
  addEventListener('message', event => {
    const value = event.data;
    if (embedded) {
      if (event.source === parent && value?.type === 'vbc-pointer-mode') apply(value.mode);
      return;
    }
    if (event.source === frame()?.contentWindow && value?.type === 'vbc-pointer-ready') broadcast();
  });
  document.querySelectorAll('input[name=pointer-style]').forEach(input => input.addEventListener('change', () => apply(input.value, true)));
  apply(mode);
  if (embedded) parent.postMessage({ type: 'vbc-pointer-ready' }, '*');
})();
