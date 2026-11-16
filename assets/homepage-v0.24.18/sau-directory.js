'use strict';

(() => {
  const list = document.querySelector('.sau-issues');

  function revealSelectedIssue() {
    const selected = list.querySelector('[aria-current="true"]');
    if (!selected || list.scrollHeight <= list.clientHeight) return;

    const top = list.getBoundingClientRect().top + list.clientTop;
    const bottom = top + list.clientHeight;
    const row = selected.getBoundingClientRect();
    if (row.top < top) list.scrollTop += row.top - top;
    else if (row.bottom > bottom) list.scrollTop += row.bottom - bottom;
  }

  document.addEventListener('sau-issue-change', revealSelectedIssue);
  revealSelectedIssue();
})();
