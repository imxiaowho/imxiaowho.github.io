'use strict';

(() => {
  const params = new URLSearchParams(location.search);
  const replay = params.get('intro') === 'replay';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (motion.matches || document.hidden || location.hash || params.has('section') ||
      (!replay && (navigation?.type === 'back_forward' || scrollY > 0 || document.activeElement !== document.body))) return;

  const artwork = document.getElementById('treehouse-picture');
  const template = document.getElementById('site-arrival-template');
  const brand = document.getElementById('brand-play');
  const wordmark = brand.querySelector('.wordmark');
  const wordmarkText = wordmark.querySelector('[data-lens-label]');
  if (!replay && !artwork) return;

  const graceTime = 140;
  const imprintTime = 510;
  const waitLimit = 1100;
  const events = new AbortController();
  const { signal } = events;
  let overlay;
  let started;
  let pending;
  let release;
  let cleanup;
  let flight;
  let headerFade;
  let settled = false;

  function finish() {
    const restoreFocus = overlay?.contains(document.activeElement);
    clearTimeout(pending);
    clearTimeout(release);
    clearTimeout(cleanup);
    flight?.cancel();
    headerFade?.cancel();
    overlay?.remove();
    events.abort();
    if (restoreFocus) wordmark.focus({ preventScroll: true });
  }

  function reveal() {
    if (signal.aborted || overlay.dataset.phase === 'leaving') return;

    const signature = overlay.querySelector('.site-arrival__signature');
    const from = signature.querySelector('.site-arrival__letters').getBoundingClientRect();
    const to = wordmarkText.getBoundingClientRect();
    const exitTime = parseFloat(getComputedStyle(overlay).getPropertyValue('--arrival-exit'));
    overlay.dataset.phase = 'leaving';

    if (from.width && to.width && typeof signature.animate === 'function') {
      const scale = to.width / from.width;
      const x = to.left - from.left;
      const y = to.top - from.top + (to.height - from.height * scale) / 2;
      const destination = `translate(${x}px, ${y}px) scale(${scale})`;
      overlay.dataset.flight = '';
      flight = signature.animate([
        { transform: 'none', opacity: 1 },
        { transform: destination, opacity: 1, offset: .8 },
        { transform: destination, opacity: 0 }
      ], { duration: exitTime, easing: 'cubic-bezier(.22,.7,.24,1)', fill: 'both' });
      headerFade = brand.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 70, delay: exitTime - 70, fill: 'backwards'
      });
    }
    cleanup = setTimeout(finish, exitTime);
  }

  function afterArtwork() {
    if (signal.aborted) return;
    settled = true;

    if (!overlay) {
      if (!replay) finish();
      return;
    }
    if (overlay.dataset.phase === 'opening') {
      clearTimeout(release);
      release = setTimeout(reveal, Math.max(0, imprintTime - (performance.now() - started)));
    }
  }

  function watchArtwork() {
    const source = artwork.src;
    // An image error can replace the selected scene with the daylight fallback.
    artwork.decode().then(afterArtwork, () => setTimeout(() => {
      if (signal.aborted) return;
      if (artwork.src === source) afterArtwork();
      else watchArtwork();
    }, 0));
  }

  function show() {
    if (document.hidden || motion.matches) {
      finish();
      return;
    }
    overlay = template.content.firstElementChild.cloneNode(true);
    template.before(overlay);
    if (getComputedStyle(overlay).position !== 'fixed') {
      finish();
      return;
    }

    const skip = overlay.querySelector('.site-arrival__skip');
    if (document.documentElement.lang === 'en') skip.textContent = 'Skip intro';
    skip.addEventListener('click', finish, { signal });
    started = performance.now();
    overlay.dataset.phase = 'opening';
    overlay.hidden = false;
    release = setTimeout(reveal, settled ? imprintTime : waitLimit);
  }

  addEventListener('pagehide', finish, { signal });
  addEventListener('scroll', finish, { signal, passive: true });
  addEventListener('resize', () => {
    if (overlay?.dataset.phase === 'leaving') finish();
  }, { signal });
  motion.addEventListener('change', finish, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); }, { signal });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' || !overlay) finish(); }, { signal });
  for (const type of ['focusin', 'pointerdown']) {
    document.addEventListener(type, event => { if (!overlay?.contains(event.target)) finish(); }, { signal, capture: true });
  }

  pending = setTimeout(show, replay ? 0 : graceTime);
  if (artwork && typeof artwork.decode === 'function') {
    watchArtwork();
  } else if (artwork && !artwork.complete) {
    artwork.addEventListener('load', afterArtwork, { signal, once: true });
    artwork.addEventListener('error', afterArtwork, { signal, once: true });
  } else {
    afterArtwork();
  }
})();
