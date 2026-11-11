'use strict';

(() => {
  const issues = [
    {
      number: 1,
      pages: 7,
      summary: {
        zh: '社团联演就要开始，音响却迟迟未到。',
        en: 'The club show is about to start, but the speakers are missing.'
      }
    },
    {
      number: 2,
      pages: 7,
      summary: {
        zh: '社团开放日，一盏折灯能不能登上主展台？',
        en: 'Can a folding lamp make it onto the main stage at club open day?'
      }
    }
  ];
  const copy = {
    zh: {
      tagline: '把国际新闻里的大局势，画成校园里的小故事。',
      contents: '连载目录',
      number: '期号',
      example: '输入期号',
      find: '定位',
      read: '阅读本期',
      close: '收起阅读',
      previous: '上一页',
      next: '下一页',
      missing: '目录里没有这期。',
      loadFailed: '这期暂时加载不了，请再试一次。'
    },
    en: {
      tagline: 'World affairs retold as stories from a schoolyard.',
      contents: 'Issue index',
      number: 'Issue number',
      example: 'Issue number',
      find: 'Go',
      read: 'Read issue',
      close: 'Close reader',
      previous: 'Previous',
      next: 'Next',
      missing: 'That issue is not in the index.',
      loadFailed: 'This issue could not load. Please try again.'
    }
  };
  const artRoot = new URL('assets/sau/', document.currentScript.src);
  const coverButton = document.getElementById('sau-cover-button');
  const cover = document.getElementById('sau-cover');
  const lookup = document.getElementById('sau-lookup');
  const query = document.getElementById('sau-number');
  const feedback = document.getElementById('sau-find-status');
  const title = document.getElementById('sau-issue-title');
  const summary = document.getElementById('sau-issue-summary');
  const read = document.getElementById('sau-read');
  const readLabel = read.querySelector('[data-lens-label]');
  const reader = document.getElementById('sau-reader');
  const readerTitle = document.getElementById('sau-reader-title');
  const readerImage = document.getElementById('sau-reader-image');
  const previous = document.getElementById('sau-previous');
  const next = document.getElementById('sau-next');
  const position = document.getElementById('sau-page-number');
  const options = [...document.querySelectorAll('.sau-issue-option')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const issueTransition = {duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)'};
  const digits = '零一二三四五六七八九';

  let issue = issues[0];
  let page = 1;
  let readerTrigger = read;
  let selectionRequest = 0;

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const label = key => copy[language()][key];
  const pageURL = (number, pageNumber) =>
    new URL(`P${number}/${String(pageNumber).padStart(2, '0')}.jpg`, artRoot).href;

  function issueTitle(number) {
    if (language() === 'en') return `SAU Issue ${number}`;
    if (number < 10) return `SAU第${digits[number]}期`;
    if (number >= 100) return `SAU第${number}期`;
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return `SAU第${tens > 1 ? digits[tens] : ''}十${ones ? digits[ones] : ''}期`;
  }

  function setArt(image, url, animate) {
    if (image.src === url) return;
    const layer = image.nextElementSibling;
    if (layer?.classList.contains('sau-art-outgoing')) layer.remove();

    if (animate && image.complete && image.naturalWidth) {
      // Keep the old art above the decoded incoming page as it fades away.
      const outgoing = image.cloneNode();
      outgoing.removeAttribute('id');
      outgoing.removeAttribute('loading');
      outgoing.alt = '';
      outgoing.className = 'sau-art-outgoing';
      outgoing.setAttribute('aria-hidden', 'true');
      image.after(outgoing);
      const fade = outgoing.animate([{opacity: 1}, {opacity: 0}], {
        ...issueTransition, fill: 'forwards'
      });
      fade.onfinish = fade.oncancel = () => outgoing.remove();
    }
    image.src = url;
  }

  function renderReader(animate = false) {
    if (reader.hidden) return;
    readerTitle.textContent = title.textContent;
    setArt(readerImage, pageURL(issue.number, page), animate);
    readerImage.alt = `${title.textContent} · ${page}/${issue.pages}`;
    position.textContent = `${page} / ${issue.pages}`;
    previous.disabled = page === 1;
    next.disabled = page === issue.pages;
  }

  function renderIssue(animate = false) {
    title.textContent = issueTitle(issue.number);
    summary.textContent = issue.summary[language()];
    cover.alt = title.textContent;
    setArt(cover, pageURL(issue.number, 1), animate);
    coverButton.setAttribute('aria-label', `${label('read')} · ${title.textContent}`);
    for (const option of options) {
      const number = Number(option.dataset.issue);
      option.querySelector('[data-lens-label]').textContent = issueTitle(number);
      if (number === issue.number) option.setAttribute('aria-current', 'true');
      else option.removeAttribute('aria-current');
    }
    renderReader(animate);
    if (animate) {
      const details = reader.hidden ? [title.parentElement] : [title.parentElement, readerTitle];
      for (const element of details) {
        element.animate([
          {opacity: .62, transform: 'translateY(3px)'},
          {opacity: 1, transform: 'translateY(0)'}
        ], issueTransition);
      }
    }
  }

  async function selectIssue(number) {
    const request = ++selectionRequest;
    const selected = issues.find(item => item.number === number);
    if (!selected) {
      feedback.textContent = label('missing');
      return;
    }
    feedback.textContent = '';
    const entered = query.value;
    const changed = selected !== issue;
    if (changed) {
      const incoming = new Image();
      incoming.src = pageURL(selected.number, 1);
      try {
        await incoming.decode();
      } catch {
        if (request === selectionRequest) feedback.textContent = label('loadFailed');
        return;
      }
      if (request !== selectionRequest) return;
    }
    issue = selected;
    page = 1;
    if (query.value === entered) query.value = '';
    renderIssue(changed && !motionPreference.matches && typeof cover.animate === 'function');
    if (changed) document.dispatchEvent(new Event('home-lens-refresh'));
  }

  function setReader(open) {
    reader.hidden = !open;
    read.setAttribute('aria-expanded', String(open));
    coverButton.setAttribute('aria-expanded', String(open));
    readLabel.textContent = label(open ? 'close' : 'read');
    renderReader();
  }

  function toggleReader(event) {
    if (!reader.hidden) {
      setReader(false);
      return;
    }
    readerTrigger = event.currentTarget;
    setReader(true);
    readerTitle.focus({preventScroll: true});
    reader.scrollIntoView({block: 'start'});
  }

  for (const option of options) {
    option.addEventListener('click', () => selectIssue(Number(option.dataset.issue)));
  }
  lookup.addEventListener('submit', event => {
    event.preventDefault();
    const match = query.value.normalize('NFKC').trim().match(/^(?:第\s*)?(\d+)(?:\s*期)?$/u);
    selectIssue(match ? Number(match[1]) : NaN);
  });
  query.addEventListener('input', () => { feedback.textContent = ''; });
  coverButton.addEventListener('click', toggleReader);
  read.addEventListener('click', toggleReader);
  document.getElementById('sau-reader-close').addEventListener('click', () => {
    setReader(false);
    readerTrigger.focus();
  });
  previous.addEventListener('click', () => {
    page -= 1;
    renderReader();
    if (previous.disabled) next.focus();
  });
  next.addEventListener('click', () => {
    page += 1;
    renderReader();
    if (next.disabled) previous.focus();
  });

  function localize() {
    for (const element of document.querySelectorAll('[data-sau-copy]')) {
      element.textContent = label(element.dataset.sauCopy);
    }
    query.placeholder = label('example');
    feedback.textContent = '';
    renderIssue();
    setReader(!reader.hidden);
  }

  document.addEventListener('home-language-change', localize);
  localize();
  if (new URLSearchParams(location.search).get('section') === 'comics') {
    document.getElementById('tab-comics').click();
  }
})();
