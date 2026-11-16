'use strict';

(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, lower, upper) => Math.max(lower, Math.min(value, upper));

  function placeMarker(bar, selected, marker) {
    if (!marker || !selected) return;
    const bounds = selected.getBoundingClientRect();
    if (!bounds.width) return;
    marker.style.setProperty('--marker-x', bounds.left - bar.getBoundingClientRect().left + 'px');
    marker.style.setProperty('--marker-width', String(bounds.width));
    marker.hidden = false;
    bar.classList.add('marker-ready');
  }

  const offsets = new WeakMap();

  function positionRow(row, x, y) {
    const titleX = x * 4;
    const actionX = x * 7;
    row.style.setProperty('--row-x', titleX.toFixed(2) + 'px');
    row.style.setProperty('--row-y', (y * 2).toFixed(2) + 'px');
    row.style.setProperty('--action-x', actionX.toFixed(2) + 'px');
    row.style.setProperty('--action-y', (y * 4).toFixed(2) + 'px');
    row.dataset.dx = actionX.toFixed(2);
    row.dataset.dy = (y * 4).toFixed(2);
    const values = [titleX, actionX];
    offsets.get(row)?.forEach((label, index) => {
      const shift = Math.round(values[index] * 10) / 10;
      const text = (shift > 0 ? '+' : '') + shift + ' px';
      if (label.textContent !== text) label.textContent = text;
    });
  }

  function resetRow(row) {
    const value = row.dataset.vbcPosition;
    positionRow(row, value === undefined ? 0 : Number(value) * 2 - 1, 0);
    if (value !== undefined) {
      row.style.setProperty('--row-light-x', Number((Number(value) * 100).toFixed(2)) + '%');
      row.style.setProperty('--row-light-y', '50%');
    }
  }

  function bindRows(root, listen) {
    const rows = [...root.querySelectorAll('.project-row')];
    for (const row of rows) {
      offsets.set(row, [...row.querySelectorAll('[data-vbc-offset]')]);
      listen(row, 'focus', () => resetRow(row));
      listen(row, 'pointermove', event => {
        if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
        // Use the stationary hit box. Only the visible labels move.
        const bounds = row.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const left = event.clientX - bounds.left;
        const top = event.clientY - bounds.top;
        positionRow(row, clamp(left / bounds.width * 2 - 1, -1, 1), clamp(top / bounds.height * 2 - 1, -1, 1));
        row.style.setProperty('--row-light-x', left + 'px');
        row.style.setProperty('--row-light-y', top + 'px');
      });
      for (const event of ['pointerleave', 'pointercancel', 'blur']) {
        listen(row, event, () => resetRow(row));
      }
    }
    for (const group of root.querySelectorAll('[data-vbc-positions]')) {
      const row = rows.find(item => item.id === group.dataset.vbcPositions);
      if (!row) continue;
      const options = group.querySelectorAll('button');
      listen(group, 'click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        options.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
        row.dataset.vbcPosition = button.value;
        resetRow(row);
      });
      group.hidden = false;
    }
    const reset = () => rows.forEach(resetRow);
    reset();
    return reset;
  }

  function bindMarker(bar, listen) {
    const marker = bar.querySelector('.tab-marker');
    const buttons = [...bar.querySelectorAll('button')];
    const position = () => placeMarker(bar, bar.querySelector('[aria-pressed=true]'), marker);
    bar.hidden = false;
    listen(bar, 'click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      for (const choice of buttons) choice.setAttribute('aria-pressed', String(choice === button));
      position();
    });
    return position;
  }

  function bindLens(stage, listen) {
    let dragPointer = null;
    stage.tabIndex = 0;

    function show(x, y, input) {
      stage.style.setProperty('--vbc-lens-x', clamp(x, 0, stage.clientWidth) + 'px');
      stage.style.setProperty('--vbc-lens-y', clamp(y, 0, stage.clientHeight) + 'px');
      stage.dataset.vbcLensInput = input;
    }

    function hide() {
      const pointer = dragPointer;
      dragPointer = null;
      delete stage.dataset.vbcLensInput;
      if (pointer !== null && stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
    }

    function follow(event) {
      const dragging = event.pointerId === dragPointer;
      if (!dragging && (event.pointerType !== 'mouse' || dragPointer !== null)) return;
      const bounds = stage.getBoundingClientRect();
      show(event.clientX - bounds.left - stage.clientLeft, event.clientY - bounds.top - stage.clientTop, dragging ? 'drag' : 'mouse');
    }

    for (const type of ['pointerenter', 'pointermove']) listen(stage, type, follow);
    listen(stage, 'pointerleave', () => { if (stage.dataset.vbcLensInput === 'mouse') hide(); });
    listen(stage, 'pointerdown', event => {
      if (event.pointerType === 'mouse' || !event.isPrimary || dragPointer !== null) return;
      dragPointer = event.pointerId;
      stage.setPointerCapture(dragPointer);
      follow(event);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      listen(stage, type, event => { if (event.pointerId === dragPointer) hide(); });
    }
    listen(stage, 'focus', () => {
      if (stage.matches(':focus-visible')) show(stage.clientWidth / 2, stage.clientHeight / 2, 'keyboard');
    });
    listen(stage, 'keydown', event => {
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      if (!direction || dragPointer !== null) return;
      event.preventDefault();
      const x = stage.dataset.vbcLensInput === 'keyboard'
        ? Number.parseFloat(stage.style.getPropertyValue('--vbc-lens-x'))
        : stage.clientWidth / 2;
      show(x + direction * 16, stage.clientHeight / 2, 'keyboard');
    });
    listen(stage, 'blur', () => { if (stage.dataset.vbcLensInput === 'keyboard') hide(); });
    const disclosure = stage.closest('details');
    if (disclosure) listen(disclosure, 'toggle', () => { if (!disclosure.open) hide(); });
    return hide;
  }

  function mount(root) {
    const controller = new AbortController();
    const listen = (node, type, handle) => node.addEventListener(type, handle, {signal: controller.signal});
    const resetRows = bindRows(root, listen);
    const bars = [...root.querySelectorAll('[data-vbc-marker-demo]')];
    const positions = bars.map(bar => bindMarker(bar, listen));
    const stages = [...root.querySelectorAll('[data-vbc-lens-stage]')];
    const lenses = stages.map(stage => bindLens(stage, listen));
    const position = () => positions.forEach(update => update());
    const reset = () => { resetRows(); lenses.forEach(hide => hide()); };
    const observer = positions.length ? new ResizeObserver(position) : null;
    for (const bar of bars) {
      observer.observe(bar);
      const disclosure = bar.closest('details');
      if (disclosure) listen(disclosure, 'toggle', position);
    }
    listen(window, 'blur', reset);
    listen(fine, 'change', reset);
    listen(reduced, 'change', reset);
    position();
    return {
      reset,
      position,
      destroy() { controller.abort(); observer?.disconnect(); reset(); },
    };
  }

  window.VBCEffects = { mount, placeMarker };
})();

