'use strict';

(() => {
  const panel = document.getElementById('panel-workbench');
  const trigger = document.getElementById('workbench-project');
  const preview = document.getElementById('workbench-preview');
  const paper = preview.querySelector('.preview-paper');
  const screen = preview.querySelector('.preview-screen');
  const frame = screen.querySelector('iframe');
  const copy = {
    zh: {
      tab: '工作台',
      title: 'xiaowho 的工作台',
      description: '交接任务、查看回报，再确认闭环。',
      open: '预览工作台',
      close: '收起预览',
      full: '打开完整演示',
      guide: '工作台的五段路',
      language: '示例任务在当前浏览器里运行。',
      frame: 'xiaowho 的工作台演示'
    },
    en: {
      tab: 'Workbench',
      title: 'xiaowho’s workbench',
      description: 'Hand off tasks, review what came back, and confirm completion.',
      open: 'Preview workbench',
      close: 'Close preview',
      full: 'Open full demo',
      guide: 'Five steps that shaped the workbench (Chinese)',
      language: 'Chinese interface. Uses sample tasks in this browser.',
      frame: 'xiaowho’s workbench demo'
    }
  };
  let pinned = false;
  let dismissed = false;
  let timer;

  function localize() {
    const labels = document.documentElement.lang === 'en' ? copy.en : copy.zh;
    for (const element of document.querySelectorAll('[data-workbench-copy]')) {
      const key = element.dataset.workbenchCopy;
      element.textContent = labels[key === 'open' && pinned ? 'close' : key];
    }
    frame.title = labels.frame;
  }

  function setOpen(open) {
    clearTimeout(timer);
    if (open && (panel.hidden || dismissed)) return;
    if (open && !frame.hasAttribute('src')) frame.src = frame.dataset.src;
    preview.dataset.state = open ? 'open' : 'closed';
    trigger.setAttribute('aria-expanded', String(open));
    paper.inert = !open;
    paper.setAttribute('aria-hidden', String(!open));
    localize();
  }

  function dismiss() {
    if (preview.dataset.state !== 'open') return false;
    pinned = false;
    dismissed = true;
    setOpen(false);
    trigger.focus({preventScroll: true});
    return true;
  }

  function closeAfterLeaving() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const focus = document.activeElement;
      if (trigger.matches(':hover') || preview.matches(':hover') || preview.contains(focus)) return;
      dismissed = false;
      if (!pinned && !trigger.contains(focus)) setOpen(false);
    }, 280);
  }

  for (const target of [trigger, preview]) {
    target.addEventListener('pointerenter', event => {
      clearTimeout(timer);
      if (event.pointerType !== 'touch') timer = setTimeout(() => setOpen(true), 100);
    });
    target.addEventListener('pointerleave', closeAfterLeaving);
    target.addEventListener('focusin', () => {
      if (target === preview || trigger.matches(':focus-visible')) setOpen(true);
    });
    target.addEventListener('focusout', closeAfterLeaving);
  }

  trigger.addEventListener('click', () => {
    if (pinned) {
      dismiss();
      return;
    }
    pinned = true;
    dismissed = false;
    setOpen(true);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dismiss()) event.preventDefault();
  });
  frame.addEventListener('load', () => {
    frame.contentDocument?.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const inner = frame.contentDocument;
      if (inner.querySelector('dialog[open], #workspace-menu:not([hidden]), #sidebar-more[open][data-desktop-expanded="1"]')) return;
      if (dismiss()) event.preventDefault();
    }, true);
  });

  new MutationObserver(() => {
    preview.hidden = panel.hidden;
    if (panel.hidden) {
      pinned = false;
      dismissed = false;
      setOpen(false);
    }
  }).observe(panel, {attributes: true, attributeFilter: ['hidden']});
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width) preview.style.setProperty('--preview-scale', entry.contentRect.width / 1185);
  }).observe(screen);
  document.addEventListener('home-language-change', localize);
  localize();

  preview.hidden = panel.hidden;
  if (!panel.hidden && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    pinned = true;
    setOpen(true);
  }
})();
