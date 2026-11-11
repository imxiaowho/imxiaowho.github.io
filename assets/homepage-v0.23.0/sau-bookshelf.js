'use strict';

(() => {
  const issues = [
    {
      number: 1,
      pages: 7,
      summary: {
        zh: '上期谜底揭晓。社团开放日，联演快开始了，音响还没到。',
        en: 'The last riddle is answered. The club show is about to start and the speakers are missing.'
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
      upcoming: '敬请期待',
      reveal: '谜底揭晓',
      read: '阅读本期',
      close: '收起阅读',
      previous: '上一页',
      next: '下一页',
      missing: '目录里没有这期。'
    },
    en: {
      tagline: 'World affairs retold as stories from a schoolyard.',
      contents: 'Issue index',
      number: 'Issue number',
      example: 'Issue number',
      find: 'Go',
      upcoming: 'More to come',
      reveal: 'The Answer Revealed',
      read: 'Read issue',
      close: 'Close reader',
      previous: 'Previous',
      next: 'Next',
      missing: 'That issue is not in the index.'
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
  const reader = document.getElementById('sau-reader');
  const readerTitle = document.getElementById('sau-reader-title');
  const readerImage = document.getElementById('sau-reader-image');
  const previous = document.getElementById('sau-previous');
  const next = document.getElementById('sau-next');
  const position = document.getElementById('sau-page-number');
  const options = [...document.querySelectorAll('.sau-issue-option')];

  let issue = issues[0];
  let page = 1;
  let readerTrigger = read;

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const label = key => copy[language()][key];
  const issueNumber = number => language() === 'zh' ? `第 ${number} 期` : `Issue ${number}`;
  const pageURL = number => new URL(`P${issue.number}/${String(number).padStart(2, '0')}.jpg`, artRoot).href;

  function renderReader() {
    if (reader.hidden) return;
    readerTitle.textContent = title.textContent;
    const url = pageURL(page);
    if (readerImage.src !== url) readerImage.src = url;
    readerImage.alt = `${issueNumber(issue.number)} · ${page}/${issue.pages}`;
    position.textContent = `${page} / ${issue.pages}`;
    previous.disabled = page === 1;
    next.disabled = page === issue.pages;
  }

  function renderIssue() {
    title.textContent = `${issueNumber(issue.number)} · ${label('reveal')}`;
    summary.textContent = issue.summary[language()];
    cover.alt = title.textContent;
    const url = pageURL(1);
    if (cover.src !== url) cover.src = url;
    coverButton.setAttribute('aria-label', `${label('read')} · ${issueNumber(issue.number)}`);
    for (const option of options) {
      const number = Number(option.dataset.issue);
      option.querySelector('span').textContent = issueNumber(number);
      if (number === issue.number) option.setAttribute('aria-current', 'true');
      else option.removeAttribute('aria-current');
    }
    renderReader();
  }

  function selectIssue(number) {
    const selected = issues.find(item => item.number === number);
    if (!selected) {
      feedback.textContent = label('missing');
      return;
    }
    issue = selected;
    page = 1;
    feedback.textContent = '';
    query.value = '';
    renderIssue();
  }

  function setReader(open) {
    reader.hidden = !open;
    read.setAttribute('aria-expanded', String(open));
    coverButton.setAttribute('aria-expanded', String(open));
    read.textContent = label(open ? 'close' : 'read');
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
