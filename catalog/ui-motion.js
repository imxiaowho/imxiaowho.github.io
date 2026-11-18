'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const paperOptions = document.getElementById('paper-options');
  const paperURL = new URL(location.href);
  const paper = paperURL.searchParams.get('paper');
  if (paperOptions && Array.from(paperOptions.options).some(option => option.value === paper)) {
    paperOptions.value = paper;
    paperOptions.hidden = false;
    document.documentElement.dataset.paper = paper;
    paperOptions.addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('paper', paperOptions.value);
      history.replaceState(history.state, '', url);
      document.documentElement.dataset.paper = paperOptions.value;
    });
  }
  let cleanup = () => {}, entryTimer = 0;
  const overlay = document.getElementById('entry-overlay');
  function finishEntry() { clearTimeout(entryTimer); overlay?.classList.remove('is-running'); }
  function entry() {
    finishEntry();
    if (!overlay || reduced.matches || document.hidden) return;
    // One 640ms paper reveal; it neither delays data nor captures input/focus.
    void overlay.offsetWidth;
    overlay.classList.add('is-running');
    entryTimer = setTimeout(finishEntry, 700);
  }
  const replay = document.getElementById('replay-entry');
  const panel = document.getElementById('pointer-panel');
  const trigger = document.getElementById('pointer-toggle');
  const paperToggle = document.getElementById('catalog-paper-motion');
  if (typeof panel.showPopover === 'function') {
    panel.hidden = false;
    trigger.hidden = false;
    panel.addEventListener('toggle', () => {
      trigger.setAttribute('aria-expanded', String(panel.matches(':popover-open')));
    });
  }
  replay.addEventListener('click', () => {
    panel.hidePopover();
    trigger.focus({preventScroll: true});
    entry();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishEntry(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishEntry(); });
  function configureEntry() {
    replay.disabled = reduced.matches;
    if (reduced.matches) finishEntry();
  }
  reduced.addEventListener('change', configureEntry);
  configureEntry();

  const paperPreference = 'vbc.paper-motion.v1';
  let paperEnabled = false;
  try { paperEnabled = localStorage.getItem(paperPreference) === 'on'; } catch { /* Session preference. */ }
  const background = window.VBCPaperField.create(document.getElementById('paper-field'), {
    allowed: () => paperEnabled,
    onEnabled(enabled, hasPointer, isReduced) {
      document.documentElement.classList.toggle('paper-wave-ready', enabled);
      paperToggle.disabled = !hasPointer || isReduced;
      paperToggle.setAttribute('aria-pressed', String(enabled));
      paperToggle.textContent = isReduced ? '纸面随系统静止' : !hasPointer ? '纸面在触屏静止' : '纸面动效';
    },
  });
  paperToggle.addEventListener('click', () => {
    paperEnabled = !paperEnabled;
    try { localStorage.setItem(paperPreference, paperEnabled ? 'on' : 'off'); } catch { /* Session preference. */ }
    background?.configure();
  });

  function mount(container) {
    cleanup();
    const disposers = [];
    container.querySelectorAll('.element-card[data-element]').forEach(card => {
      const art = card.querySelector('.pattern'), canvas = art.querySelector('.mini-paper-canvas');
      const paperToggle = card.querySelector('.paper-preview-toggle');
      let paperQuiet = false;
      const field = canvas && window.VBCPaperField?.create(canvas, { local: true, target: art, step: 17, radius: 90, push: 13, limit: 4, duration: 1100, allowed: () => !paperQuiet,
        onEnabled: (enabled, hasPointer, isReduced) => {
          art.classList.toggle('paper-preview-ready', enabled);
          if (!paperToggle) return;
          paperToggle.disabled = !hasPointer || isReduced;
          paperToggle.setAttribute('aria-pressed', String(enabled));
          paperToggle.textContent = isReduced ? '点阵随系统静止' : !hasPointer ? '点阵在触屏静止' : '点阵动效';
        } });
      const togglePaper = () => { paperQuiet = !paperQuiet; field?.configure(); };
      paperToggle?.addEventListener('click', togglePaper);
      const typing = art.querySelector('[data-typing-text]'), typingText = typing?.querySelector('span');
      const headline = typing?.dataset.typingText || '';
      const glyphs = typingText && typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(headline)].map(part => part.segment) : [];
      let typingTimer = 0;
      const resetTyping = () => { clearTimeout(typingTimer); typingTimer = 0; if (typingText) typingText.textContent = headline; };
      const playTyping = () => {
        resetTyping();
        if (!glyphs.length) return;
        typingText.textContent = '';
        let count = 0;
        const reveal = () => {
          typingText.textContent = glyphs.slice(0, ++count).join('');
          typingTimer = count < glyphs.length ? setTimeout(reveal, 1400 / glyphs.length) : 0;
        };
        typingTimer = setTimeout(reveal, 1400 / glyphs.length);
      };
      let active = false, pointerInside = false, focusing = false;
      const update = () => {
        const next = !document.hidden && !reduced.matches && (pointerInside || focusing);
        if (next === active) return;
        active = next; card.classList.toggle('is-previewing', active);
        if (active) playTyping(); else resetTyping();
        if (active && focusing) field?.pulse();
      };
      const enter = event => { if (event.pointerType !== 'touch' && fine.matches) { pointerInside = true; update(); } };
      const leave = () => { pointerInside = false; update(); };
      const focus = event => { focusing = event.target.matches('.element-open:focus-visible'); update(); };
      const blur = event => { if (!card.contains(event.relatedTarget)) { focusing = false; update(); } };
      const move = event => {
        if (!active || art.dataset.effect !== 'tilt' && art.dataset.effect !== 'ripple') return;
        const rect = art.getBoundingClientRect(), px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        art.style.setProperty('--rx', (-(py - .5) * 16).toFixed(2) + 'deg');
        art.style.setProperty('--ry', ((px - .5) * 20).toFixed(2) + 'deg');
        art.style.setProperty('--px', (px * 100).toFixed(1) + '%'); art.style.setProperty('--py', (py * 100).toFixed(1) + '%');
      };
      const stop = () => { pointerInside = focusing = false; update(); };
      const bindings = [[card,'pointerenter',enter],[card,'pointerleave',leave],[card,'pointermove',move],[card,'focusin',focus],[card,'focusout',blur],[window,'blur',stop],[document,'visibilitychange',stop],[reduced,'change',stop]];
      bindings.forEach(([node,name,handler]) => node.addEventListener(name,handler));
      disposers.push(() => { resetTyping(); field?.destroy(); paperToggle?.removeEventListener('click', togglePaper); bindings.forEach(([node,name,handler]) => node.removeEventListener(name,handler)); card.classList.remove('is-previewing'); });
    });
    cleanup = () => disposers.forEach(dispose => dispose());
  }
  window.VBCUI = { mount, unmount: () => { cleanup(); cleanup = () => {}; } };
})();
