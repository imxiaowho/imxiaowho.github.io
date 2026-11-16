'use strict';

(() => {
  const copy = {
    viewComparison: ['查看前后对照', 'View comparison'],
    viewProject: ['查看项目', 'View project'],
    collapse: ['收起', 'Close'],
    caseTitle: ['第一单元达标练习', 'Unit 1 practice worksheet'],
    documentation: ['项目文档', 'Project documentation'],
    original: ['原始照片', 'Original photo'],
    originalLink: ['查看整张原始照片', 'Open the full original photo'],
    print: ['A4 打印版', 'A4 print version'],
    printLink: ['查看当前打印页大图', 'Open the current print page'],
    previous: ['上一页', 'Previous'],
    next: ['下一页', 'Next'],
    pdf: ['查看打印 PDF', 'Open printable PDF'],
    loadError: ['这一页暂时加载不了，请再试一次。', 'This page could not load. Please try again.']
  };

  const find = id => document.getElementById(id);
  const text = key => copy[key][document.documentElement.lang === 'en' ? 1 : 0];
  const disclosure = find('skills-results-disclosure');
  const disclosures = [...document.querySelectorAll('[data-result-disclosure]')].map(row => ({
    row,
    panel: find(row.dataset.resultDisclosure),
    action: row.querySelector('.row-action')
  }));
  const source = find('skills-results-source');
  const printLink = find('skills-results-print-link');
  const print = find('skills-results-print');
  const previous = find('skills-results-previous');
  const next = find('skills-results-next');
  const position = find('skills-results-position');
  const status = find('skills-results-status');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const printPages = [
    'assets/homepage-v0.23.4/cases/paper-encore/math-print-01.png',
    'assets/homepage-v0.23.4/cases/paper-encore/math-print-02.png'
  ];
  let page = 0;
  let pendingPage = 0;

  const refreshLens = () => document.dispatchEvent(new Event('home-lens-refresh'));

  function fade(elements) {
    if (reduceMotion.matches) return;
    for (const element of elements) {
      element.animate([{ opacity: .55 }, { opacity: 1 }], {
        duration: 300,
        easing: 'cubic-bezier(.4, 0, .2, 1)'
      });
    }
  }

  function localize() {
    for (const element of document.querySelectorAll('[data-result-copy]')) {
      element.textContent = text(element.dataset.resultCopy);
    }
    for (const element of document.querySelectorAll('[data-result-label]')) {
      element.setAttribute('aria-label', text(element.dataset.resultLabel));
    }
    status.textContent = '';
    refreshLens();
  }

  async function turnPage(index, control) {
    const request = ++pendingPage;
    const image = new Image();
    image.src = printPages[index];
    try {
      await image.decode();
    } catch {
      if (request === pendingPage) status.textContent = text('loadError');
      return;
    }
    if (request !== pendingPage) return;
    page = index;
    source.dataset.page = String(index + 1);
    print.src = image.src;
    printLink.href = image.src;
    position.textContent = (index + 1) + ' / ' + printPages.length;
    previous.disabled = index === 0;
    next.disabled = index === printPages.length - 1;
    if (control.disabled && document.activeElement === control) {
      (control === next ? previous : next).focus();
    }
    status.textContent = '';
    fade([source, print]);
    refreshLens();
  }

  for (const { row, panel } of disclosures) {
    row.href = '#' + panel.id;
    row.removeAttribute('target');
    row.setAttribute('role', 'button');
    row.setAttribute('aria-controls', panel.id);
    row.setAttribute('aria-expanded', 'false');
    row.addEventListener('click', event => {
      event.preventDefault();
      const open = panel.hidden;
      disclosure.hidden = !open;
      for (const item of disclosures) {
        const selected = open && item.row === row;
        item.panel.hidden = !selected;
        item.row.setAttribute('aria-expanded', String(selected));
        item.action.dataset.resultCopy = selected ? 'collapse' : item.row.dataset.resultAction;
      }
      localize();
      if (open) fade([panel]);
    });
    row.addEventListener('keydown', event => {
      if (event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) row.click();
    });
  }
  previous.addEventListener('click', () => turnPage(page - 1, previous));
  next.addEventListener('click', () => turnPage(page + 1, next));
  document.addEventListener('home-language-change', localize);
  document.body.dataset.skillsResults = 'ready';
  localize();

})();
