'use strict';

(() => {
  const list = document.querySelector('.sau-issues');
  const lookup = document.getElementById('sau-lookup');
  const feedback = document.getElementById('sau-find-status');

  function revealSelectedIssue() {
    const selected = list.querySelector('[aria-current="true"]');
    if (!selected || list.scrollHeight <= list.clientHeight) return;

    const top = list.getBoundingClientRect().top + list.clientTop;
    const bottom = top + list.clientHeight;
    const row = selected.getBoundingClientRect();
    if (row.top < top) list.scrollTop += row.top - top;
    else if (row.bottom > bottom) list.scrollTop += row.bottom - bottom;
  }

  list.addEventListener('click', event => {
    if (event.target.closest('.sau-issue-option')) revealSelectedIssue();
  });
  lookup.addEventListener('submit', () => {
    if (!feedback.textContent) revealSelectedIssue();
  });
  revealSelectedIssue();
})();
