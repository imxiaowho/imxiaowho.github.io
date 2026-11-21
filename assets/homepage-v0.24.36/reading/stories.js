'use strict';

(() => {
  const main = document.querySelector('#main-content');
  const route = main.querySelector('.stage-route');
  const routeLinks = [...route.querySelectorAll('[data-stage-link]')];
  const sheets = [...main.querySelectorAll('.story-sheet')];
  const chapters = new Map(sheets.map(sheet => ['#' + sheet.id, sheet]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeChapter;
  let chapterFade;

  function show(chapter) {
    for (const sheet of sheets) sheet.hidden = sheet !== chapter;
    for (const link of routeLinks) {
      if (chapters.get(link.hash) === chapter) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    activeChapter = chapter;
  }

  function switchChapter(chapter, onShown) {
    const previous = activeChapter;
    const canFade = previous !== chapter && !reducedMotion.matches &&
      typeof previous.animate === 'function';
    const opacity = canFade ? Number(getComputedStyle(previous).opacity) : 1;
    chapterFade?.cancel();
    chapterFade = null;

    if (!canFade) {
      show(chapter);
      onShown?.();
      return;
    }

    const leaving = previous.animate([{opacity}, {opacity: 0}], {
      duration: 115 * opacity,
      easing: 'ease-in',
      fill: 'forwards',
    });
    chapterFade = leaving;
    leaving.onfinish = () => {
      if (chapterFade !== leaving) return;
      show(chapter);
      leaving.cancel();
      chapterFade = reducedMotion.matches ? null : chapter.animate(
        [{opacity: 0}, {opacity: 1}],
        {duration: 230, easing: 'cubic-bezier(.22, .8, .26, 1)'},
      );
      onShown?.();
    };
  }

  function alignRoute() {
    const page = document.documentElement;
    const routeTop = route.getBoundingClientRect().top + window.scrollY;
    const margin = parseFloat(getComputedStyle(route).scrollMarginBlockStart);
    if (page.scrollHeight - page.clientHeight < routeTop - margin) {
      window.scrollTo(0, 0);
    } else {
      route.scrollIntoView({block: 'start'});
    }
  }

  function restoreChapter() {
    const chapter = chapters.get(location.hash);
    if (chapter) {
      switchChapter(chapter, () => requestAnimationFrame(alignRoute));
    } else if (!location.hash) {
      switchChapter(sheets[0]);
    }
  }

  main.addEventListener('click', event => {
    const link = event.target.closest('a[data-stage-link]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const chapter = chapters.get(link.hash);
    if (!chapter) return;

    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    switchChapter(chapter, () => {
      const heading = chapter.querySelector('h2');
      const position = heading.getBoundingClientRect();
      if (!route.contains(link) || position.top < 0 || position.bottom > innerHeight) alignRoute();
      heading.focus({preventScroll: true});
    });
  });

  const sorter = main.querySelector('[data-sorter]');
  if (sorter) {
    const next = {ready: 'misfiled', misfiled: 'sorted', sorted: 'ready'};
    const copy = sorter.querySelectorAll('[data-sorter-copy]');
    sorter.querySelector('button').addEventListener('click', () => {
      const step = next[sorter.dataset.sorter];
      sorter.dataset.sorter = step;
      for (const entry of copy) entry.hidden = entry.dataset.sorterCopy !== step;
      sorter.scrollIntoView({block: 'nearest'});
    });
    sorter.hidden = false;
    main.querySelector('#sorter-fallback').hidden = true;
  }

  addEventListener('hashchange', restoreChapter);
  show(chapters.get(location.hash) || sheets[0]);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && chapterFade?.playState === 'running') chapterFade.finish();
  });
  if (chapters.has(location.hash)) {
    addEventListener('load', () => requestAnimationFrame(alignRoute), {once: true});
  }
})();
