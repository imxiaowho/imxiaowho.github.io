'use strict';
// One scoped spring field powers the page, the reusable scene and its thumbnail.
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  function create(canvas, options = {}) {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return { destroy() {}, configure() {}, pulse() {} };
    const local = Boolean(options.local), target = options.target || window;
    const radius = options.radius || 165, push = options.push || 17;
    const duration = options.duration || 1500, limit = options.limit || 7;
    const listeners = [];
    let points = [], pulses = [], pointer = null, frame = 0, previous = 0;
    let width = 0, height = 0, enabled = false, lastPulse = 0, destroyed = false;
    function listen(node, name, handler, opts) {
      node.addEventListener(name, handler, opts);
      listeners.push(() => node.removeEventListener(name, handler, opts));
    }
    function paint(now) {
      frame = 0;
      if (!enabled || document.hidden || destroyed) return;
      const dt = clamp((now - previous) / 16.67 || 1, .3, 2);
      previous = now;
      pulses = pulses.filter(p => now - p.born < duration);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = local ? 'rgba(49,86,64,.40)' : 'rgba(69,91,59,.18)';
      ctx.beginPath();
      let energy = 0, displaced = 0;
      for (const p of points) {
        let tx = 0, ty = 0;
        if (pointer) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx, dy);
          const force = Math.pow(Math.max(0, 1 - distance / radius), 2) * push;
          tx += dx / (distance || 1) * force; ty += dy / (distance || 1) * force;
        }
        for (const pulse of pulses) {
          const dx = p.x - pulse.x, dy = p.y - pulse.y, distance = Math.hypot(dx, dy);
          const age = now - pulse.born, ring = (distance - age * .22) / (local ? 18 : 26);
          const force = Math.exp(-ring * ring) * Math.pow(1 - age / duration, 2) * (local ? 8 : 10) * pulse.strength;
          tx += dx / (distance || 1) * force; ty += dy / (distance || 1) * force;
        }
        p.vx = (p.vx + (tx - p.ox) * .105 * dt) * Math.pow(.72, dt);
        p.vy = (p.vy + (ty - p.oy) * .105 * dt) * Math.pow(.72, dt);
        p.ox += p.vx * dt; p.oy += p.vy * dt;
        const movement = Math.hypot(p.ox, p.oy);
        if (movement > .1) displaced++;
        energy = Math.max(energy, Math.abs(tx - p.ox), Math.abs(ty - p.oy), Math.abs(p.vx), Math.abs(p.vy));
        const x = p.x + p.ox, y = p.y + p.oy, dot = .68 + Math.min(.42, movement * .04);
        ctx.moveTo(x + dot, y); ctx.arc(x, y, dot, 0, Math.PI * 2);
      }
      ctx.fill(); canvas.dataset.displaced = String(displaced);
      canvas.dataset.state = pulses.length || energy > .025 ? 'moving' : 'idle';
      if (canvas.dataset.state === 'moving') frame = requestAnimationFrame(paint);
    }
    function wake() {
      if (enabled && !document.hidden && !frame && !destroyed) {
        previous = performance.now(); frame = requestAnimationFrame(paint);
      }
    }
    function reset() {
      cancelAnimationFrame(frame); frame = 0; pointer = null; pulses = [];
      for (const p of points) p.ox = p.oy = p.vx = p.vy = 0;
      canvas.dataset.displaced = '0';
    }
    function resize() {
      reset();
      const rect = canvas.getBoundingClientRect();
      width = local ? rect.width : document.documentElement.clientWidth;
      height = local ? rect.height : innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = options.step || (width <= 600 ? 28 : 24);
      points = [];
      for (let y = step / 2; y < height + step; y += step)
        for (let x = step / 2; x < width + step; x += step) points.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0 });
      wake();
    }
    function configure() {
      reset(); enabled = fine.matches && !reduced.matches && options.allowed?.() !== false;
      canvas.dataset.state = enabled ? 'idle' : 'static';
      options.onEnabled?.(enabled, fine.matches, reduced.matches);
      if (enabled) resize(); else ctx.clearRect(0, 0, width, height);
    }
    function pulse(x = width / 2, y = height / 2) {
      if (!enabled) return;
      pulses.push({ x, y, born: performance.now(), strength: 1 });
      if (pulses.length > limit) pulses.shift();
      wake();
    }
    function move(event) {
      if (!enabled || event.pointerType === 'touch') return;
      const rect = local ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      const x = local ? clamp(event.clientX - rect.left, 2, width - 2) : event.clientX;
      const y = local ? clamp(event.clientY - rect.top, 2, height - 2) : event.clientY;
      const distance = pointer ? Math.hypot(x - pointer.x, y - pointer.y) : 12;
      pointer = { x, y };
      const now = performance.now();
      if (distance > 2 && now - lastPulse > 55) {
        pulse(x, y); pulses[pulses.length - 1].strength = clamp(distance / 30, .45, 1); lastPulse = now;
      }
      wake();
    }
    function release() { pointer = null; pulses = []; wake(); }
    listen(target, 'pointermove', move, { passive: true });
    listen(local ? target : document.documentElement, 'pointerleave', release);
    listen(target, 'pointercancel', release);
    if (local) listen(target, 'pointerenter', move, { passive: true });
    listen(window, 'blur', () => { reset(); wake(); });
    listen(document, 'visibilitychange', () => {
      reset(); canvas.dataset.state = document.hidden ? 'paused' : enabled ? 'idle' : 'static';
      if (!document.hidden) wake();
    });
    listen(fine, 'change', configure); listen(reduced, 'change', configure);
    const observer = local ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(canvas); else listen(window, 'resize', resize, { passive: true });
    configure();
    return { configure, pulse, destroy() { destroyed = true; reset(); observer?.disconnect(); listeners.forEach(remove => remove()); } };
  }
  window.VBCPaperField = { create };
  const canvas = document.getElementById('paper-field'), toggle = document.getElementById('paper-motion');
  if (!canvas || !toggle) return;
  let optedOut = false;
  try { optedOut = localStorage.getItem('vbc.paper-motion.v1') === 'off'; } catch { /* Session choice. */ }
  const surface = canvas.closest('[data-paper-surface]');
  const field = create(canvas, {
    local: Boolean(surface), target: surface || window,
    allowed: () => !optedOut,
    onEnabled(enabled, hasPointer, isReduced) {
      document.documentElement.classList.toggle('paper-wave-ready', enabled);
      toggle.hidden = false; toggle.disabled = !hasPointer || isReduced;
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = isReduced ? '底纹动效：跟随系统静态' : !hasPointer ? '底纹动效：触屏静态' : '底纹动效：' + (enabled ? '开启' : '关闭');
    }
  });
  toggle.addEventListener('click', () => {
    optedOut = !optedOut;
    try { localStorage.setItem('vbc.paper-motion.v1', optedOut ? 'off' : 'on'); } catch { /* Session choice. */ }
    field.configure();
  });
})();
