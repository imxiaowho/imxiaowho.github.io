'use strict';

(() => {
  const english = {
    originTitle: 'Xiaowho',
    originLine: 'A fifteen-centimeter ink spirit that stepped out of a draft. Its yellow bag is full of unfinished pages.',
    originAlt: 'Xiaowho steps off a draft sheet with its yellow bag.',
    nameTitle: 'Where the name came from',
    nameStory: "My first online name was 小谁 (xiaowho), from a line in Qiong Kaixin by The Flowers. I've used it for over ten years. When I drew Xiaowho, I thought of a little idea popping into my head and gave it the shape of an ink drop.",
    scrub: 'Paper animation position',
    treehouseTitle: 'Treehouse',
    treehouseLine: 'One treehouse, drawn twelve times. The branches cast their shadows by the words. When you drop by determines which drawing you see.',
    scenesLabel: 'Three moments at the treehouse',
    dawn: 'Dawn',
    dusk: 'Dusk',
    night: 'Night',
    dawnCaption: 'At first light, Xiaowho waters the flowers on the porch.',
    duskCaption: 'The porch lamp comes on, and Xiaowho sits down to draw a butterfly.',
    nightCaption: 'The window is still lit. Under the tree, Xiaowho tucks the drafts into its yellow bag.',
    lamp: 'Tap the treehouse lamp',
    dictionary: 'Try the sliding underline in the dictionary',
    authorTitle: "I'm Chen Zhen",
    authorMeta: 'Born in 1983. Aquarius.',
    authorQuote: 'I like having an idea of my own and being able to make it real.',
    authorLine: 'My mind jumps around a bit. I like trying new things. With a hand from Codex, I built this site and started drawing a school comic.',
    comicLink: 'Read School as Usual issue zero',
    coverAlt: 'Panna at the school gate on the cover of School as Usual issue zero.',
    readComic: 'Read the comic'
  };
  const playbackLabels = {
    zh: { play: '掀开纸角', pause: '暂停', resume: '接着看', replay: '再看一遍' },
    en: { play: 'Lift the corner', pause: 'Pause', resume: 'Resume', replay: 'Replay' }
  };
  const panel = document.getElementById('panel-about');
  const fieldList = [...panel.querySelectorAll('[data-about]')].map(element => {
    const attribute = element.hasAttribute('alt') ? 'alt' : element.hasAttribute('aria-label') ? 'aria-label' : null;
    const zh = attribute ? element.getAttribute(attribute) : element.textContent;
    return { element, attribute, zh, en: english[element.dataset.about] };
  });
  const motionControls = panel.querySelector('.about-motion');
  const play = panel.querySelector('.about-play');
  const playLabel = play.querySelector('[data-lens-label]');
  const scrub = panel.querySelector('.about-scrub');
  const seek = scrub.querySelector('input');
  const spirit = panel.querySelector('.about-draft-spirit');
  const dot = panel.querySelector('.about-ink-dot');
  const fold = panel.querySelector('.about-fold');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = Number(seek.max);
  let time = duration;
  let frame = null;
  let previous = null;
  let playing = false;
  let started = false;

  const sceneButtons = [...panel.querySelectorAll('[data-about-scene]')];
  const captions = [...panel.querySelectorAll('[data-about-caption]')];
  const plate = document.getElementById('treehouse-plate');
  const lamp = document.getElementById('about-lamp');
  const treehouseLamp = document.getElementById('treehouse-lantern');

  const aboutTab = document.getElementById('tab-about');
  const comicsTab = document.getElementById('tab-comics');
  const comicsPanel = document.getElementById('panel-comics');
  const comicLink = panel.querySelector('.about-comic > a');
  const comicCover = comicLink.querySelector('.about-comic-cover');
  const comicTurnTemplate = document.getElementById('about-comic-turn');
  const comicReader = document.getElementById('sau-reader');
  const comicPage = document.getElementById('sau-reader-image');
  const comicFigure = comicPage.closest('figure');
  let openingComic = false;
  let comicMotion;

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function updatePlaybackLabel() {
    const key = playing ? 'pause' : !started ? 'play' : time === duration ? 'replay' : 'resume';
    playLabel.textContent = playbackLabels[language()][key];
  }

  function applyLanguage() {
    const locale = language();
    for (const field of fieldList) {
      if (field.attribute) field.element.setAttribute(field.attribute, field[locale]);
      else field.element.textContent = field[locale];
    }
    updatePlaybackLabel();
  }

  function progress(at, begin, end) {
    return Math.max(0, Math.min(1, (at - begin) / (end - begin)));
  }

  function render(at) {
    time = at;
    const open = progress(at, 150, 590);
    const lift = progress(at, 355, 685);
    const reveal = progress(at, 530, 730);
    const settle = 1 - (1 - progress(at, 505, 1100)) ** 3;
    const advance = Math.sin(settle * Math.PI);
    fold.style.opacity = String((.5 + open * .5) * (1 - progress(at, 580, 810)));
    fold.style.transform = `perspective(380px) rotateY(${-48 * (1 - open)}deg) rotate(${(1 - open) * -9}deg)`;
    dot.style.opacity = String((1 - reveal) * progress(at, 0, 110));
    dot.style.transform = `translate(${lift * 38}%, ${lift * -105}%) scale(${1 + lift * .85})`;
    spirit.style.opacity = String(reveal);
    spirit.style.transform = `translate(${(settle - 1) * 11}%, ${(1 - settle) * 11 - advance * 5}%) rotate(${(1 - settle) * -7}deg) scale(${.83 + .17 * settle})`;
    seek.value = String(at);
  }

  function pause() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    playing = false;
    updatePlaybackLabel();
  }

  function tick(now) {
    if (previous !== null) render(Math.min(duration, time + now - previous));
    previous = now;
    if (time < duration) frame = requestAnimationFrame(tick);
    else pause();
  }

  play.addEventListener('click', () => {
    if (playing) {
      pause();
      return;
    }
    if (!started || time === duration) render(0);
    started = true;
    playing = true;
    scrub.hidden = false;
    updatePlaybackLabel();
    frame = requestAnimationFrame(tick);
  });

  seek.addEventListener('input', () => {
    const next = Number(seek.value);
    pause();
    render(next);
    updatePlaybackLabel();
  });

  function applyMotionPreference() {
    motionControls.hidden = reduced.matches;
    if (reduced.matches) {
      pause();
      render(duration);
      started = false;
      scrub.hidden = true;
      updatePlaybackLabel();
      comicMotion?.finish();
    }
  }

  function showScene(scene) {
    if (!sceneButtons.some(button => button.dataset.aboutScene === scene)) return;
    for (const choice of sceneButtons) choice.setAttribute('aria-pressed', String(choice.dataset.aboutScene === scene));
    for (const caption of captions) caption.hidden = caption.dataset.aboutCaption !== scene;
  }

  function openComicPage() {
    if (comicsPanel.hidden) comicsTab.click();
    comicsPanel.getAnimations?.().forEach(animation => animation.cancel());
    comicsPanel.querySelector('[data-issue="0"]').click();
    if (comicReader.hidden) document.getElementById('sau-read').click();
    document.getElementById('sau-next').click();
    document.getElementById('sau-reader-title').focus({ preventScroll: true });
    comicReader.scrollIntoView({ block: 'start' });
  }

  function restoreComicRoute() {
    const params = new URLSearchParams(location.search);
    if (params.get('section') === 'comics' && params.get('issue') === '0' && params.get('page') === '2') {
      openComicPage();
    } else if (params.get('section') === 'about') {
      aboutTab.click();
      if (typeof history.state?.aboutComicScroll === 'number') {
        comicLink.focus({ preventScroll: true });
        scrollTo(0, history.state.aboutComicScroll);
      }
    }
  }

  comicLink.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (openingComic) return;

    openingComic = true;
    let turn;
    let coverLeaf;
    let shift;
    try {
      if (!reduced.matches && comicCover.naturalWidth && typeof comicCover.animate === 'function') {
        turn = comicTurnTemplate.content.firstElementChild.cloneNode(true);
        coverLeaf = turn.querySelector('.about-comic-turn-cover');
        coverLeaf.querySelector('img').src = comicCover.currentSrc;
        comicLink.parentElement.append(turn);

        const { left, width } = turn.getBoundingClientRect();
        const clearance = Math.max(0, width + 8 - left);
        const timing = { duration: 480, easing: 'cubic-bezier(.36,.08,.24,1)', fill: 'both' };
        if (clearance) shift = turn.animate([{ transform: 'none' }, { transform: `translateX(${clearance}px)` }], timing);
        coverLeaf.lastElementChild.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: .82 }, { opacity: 0 }], timing);
        comicMotion = coverLeaf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-164deg)' }], timing);
        await comicMotion.finished;
        if (panel.hidden) return;
      }

      const origin = turn?.getBoundingClientRect();
      const aboutURL = new URL(location.href);
      aboutURL.searchParams.set('section', 'about');
      aboutURL.searchParams.delete('issue');
      aboutURL.searchParams.delete('page');
      history.replaceState({ ...history.state, aboutComicScroll: scrollY }, '', aboutURL);
      history.pushState(null, '', comicLink.href);
      openComicPage();

      const preview = turn?.querySelector('.about-comic-turn-page');
      if (origin && preview.naturalWidth && !reduced.matches) {
        const target = comicPage.getBoundingClientRect();
        shift?.cancel();
        coverLeaf.remove();
        turn.classList.add('is-landing');
        Object.assign(turn.style, { left: `${origin.left}px`, top: `${origin.top}px`, width: `${origin.width}px` });
        document.body.append(turn);
        comicFigure.dataset.aboutLanding = '';
        const translate = `translate(${target.left - origin.left}px, ${target.top - origin.top}px)`;
        comicMotion = turn.animate([
          { transform: 'none' },
          { transform: `${translate} scale(${target.width / origin.width})` }
        ], { duration: 220, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
        await comicMotion.finished;
      }
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      turn?.remove();
      delete comicFigure.dataset.aboutLanding;
      comicMotion = undefined;
      openingComic = false;
    }
  });

  for (const button of sceneButtons) {
    button.addEventListener('click', () => showScene(button.dataset.aboutScene));
  }

  lamp.hidden = false;
  lamp.addEventListener('click', () => {
    treehouseLamp.click();
    document.querySelector('.world-illustration').scrollIntoView({ block: 'nearest' });
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  new MutationObserver(() => { if (panel.hidden) pause(); }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  document.querySelector('.category-tabs').addEventListener('click', event => {
    if (event.isTrusted && event.target.closest('[role="tab"]')) comicMotion?.cancel();
  });
  new MutationObserver(() => showScene(plate.dataset.scene)).observe(plate, { attributes: true, attributeFilter: ['data-scene'] });
  reduced.addEventListener('change', applyMotionPreference);
  document.addEventListener('home-language-change', applyLanguage);
  showScene(plate.dataset.scene);
  applyLanguage();
  applyMotionPreference();
  panel.dataset.aboutReady = '';

  addEventListener('popstate', () => {
    comicMotion?.cancel();
    restoreComicRoute();
  });
  restoreComicRoute();
})();
