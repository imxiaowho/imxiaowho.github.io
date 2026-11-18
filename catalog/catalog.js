'use strict';
(() => {
  history.scrollRestoration='manual';
  const $=id=>document.getElementById(id),data=window.VBC_DATA;
  if (!data) {
    $('index-error').hidden = false;
    return;
  }
  document.querySelector('.search-tools').hidden = false;
  $('browse').hidden = false;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const records=new Map(data.records.map(r=>[r.id,r])),terms=data.records.filter(r=>r.kind==='term'),elements=data.records.filter(r=>r.kind==='element'),recipes=data.records.filter(r=>r.kind==='recipe'),sources=data.records.filter(r=>r.kind==='source');
  const subjects=new Map(data.subjects.map(s=>[s.id,s.label])),covers=window.VBC_COVERS||{};
  const siteTerms = terms.filter(r => r.homepage_effect);
  const modes={elements:{label:'示例',items:elements},terms:{label:'词条',items:terms},recipes:{label:'组合',items:recipes},sources:{label:'来源',items:sources}};
  const disposition={'new-study':'新增实践 · 待审阅','existing-concept':'关联已有词条','related-concept':'相关机制','reference-pending':'待实践','scope-excluded':'超出网页范围'};
  const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>';
  const summaries={'motion-0007':'鼠标附近的点阵轻轻散开，再逐渐回弹。','motion-0001':'一组元素依次错开出现。','visual-0008':'比较文字与背景的亮度差异。','visual-0005':'比较同一图像的不同宽高比例。'};
  const order=['motion-0007','motion-0001','visual-0008','visual-0005','component-0004','layout-0001','component-0003','motion-0004'];
  elements.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99));
  modes.elements.items = [...elements, ...siteTerms];
  const linked = r => r.kind === 'element' ? [r] : (r.element_ids || []).map(id => records.get(id)).filter(Boolean);
  const accepted = e => e.status === 'verified' && e.review?.author_status === 'accepted';
  const isSavable = record => record && (record.kind === 'element' || Boolean(record.homepage_effect));
  const list = items => '<ul>' + (items || []).map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>';
  const arrow = '<svg class="row-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const practices = document.querySelector('.site-practices');
  const approved = $('approved');
  const random = $('random');
  const search = $('search');
  const favoritesToggle = $('favorites-toggle');
  const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[-–—_]/g, ' ');
  const query = () => normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const inventoryById = new Map((data.source_inventories || []).map(item => [item.source_id, item]));
  const inventoryFor = id => inventoryById.get(id);
  const termsByElement = new Map(elements.map(element => [element.id, terms.filter(term => term.element_ids.includes(element.id))]));
  const searchIndex = new Map(data.records.map(record => {
    const related = termsByElement.get(record.id) || [];
    const inventory = inventoryFor(record.id)?.entries || [];
    return [record.id, normalize([
      record.id, record.title.zh, record.title.en, record.plain_explanation, record.intent,
      ...record.tags || [], ...record.aliases || [],
      ...related.flatMap(term => [term.title.zh, term.title.en, ...term.aliases || []]),
      ...inventory.flatMap(item => [item.slug, item.title.zh, item.title.en])
    ].join(' '))];
  }));
  const preferred = { 'motion-0001': 'term-0018', 'visual-0008': 'term-0026' };
  function headword(element) {
    const related = termsByElement.get(element.id) || [];
    const words = query();
    return (words.length && related.find(term => words.every(word => searchIndex.get(term.id).includes(word)))) ||
      related.find(term => term.id === preferred[element.id]) || related[0] || element;
  }

  let detailReflow = null, example = null, preview = null, returnFocus = null;
  let mode = 'elements', domain = '', page = 0, favorites = false, detailId = '', routedHash;
  let sourcePage = 0, statusTimer, resizeTimer, lastPageSize;
  let saved = new Set();
  try {
    const value = JSON.parse(localStorage.getItem('vbc.sample-saves.v1') || '[]');
    if (Array.isArray(value)) saved = new Set(value.filter(id => isSavable(records.get(id))));
  } catch { /* The list remains usable without storage. */ }

  function matches(record, {ignoreDomain = false, words = query()} = {}) {
    const topic = ignoreDomain || !domain || record.domain === domain ||
      record.kind === 'recipe' && linked(record).some(item => item.domain === domain);
    const pin = record.homepage_effect ? record.id : record.kind === 'element' ? record.id : null;
    return topic && (!approved.checked || linked(record).some(accepted)) &&
      (!favorites || saved.has(pin)) && words.every(word => searchIndex.get(record.id).includes(word));
  }

  function resultsFor(id, ignoreDomain = false) {
    const words = query();
    const all = modes[id].items.filter(record => matches(record, {ignoreDomain: ignoreDomain || id === 'sources', words}));
    if (!words.length) return all;
    const phrase = words.join(' ');
    const rank = record => [record, ...(termsByElement.get(record.id) || [])].some(item =>
      [item.title.zh, item.title.en, ...item.aliases || []].some(name => normalize(name).trim() === phrase)
    ) ? 0 : 1;
    return all.sort((a, b) => rank(a) - rank(b));
  }

  function pageSize(kind = mode) {
    if (kind === 'elements') return innerWidth <= 360 && innerHeight < 720 ? 3 : 4;
    return Math.max(2, Math.min(10, Math.floor((2 * innerHeight - (innerWidth <= 600 ? 420 : 345)) / 90)));
  }

  function notify(text) {
    clearTimeout(statusTimer);
    $('app-status').textContent = text;
    statusTimer = setTimeout(() => { $('app-status').textContent = ''; }, 3800);
  }

  function updateSaved() {
    $('saved-count').textContent = saved.size;
    favoritesToggle.setAttribute('aria-pressed', String(favorites));
    document.querySelectorAll('[data-save]').forEach(button => {
      const active = saved.has(button.dataset.save);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', (active ? '取消收藏' : '收藏') + '「' + records.get(button.dataset.save).title.zh + '」');
      const label = button.querySelector('[data-save-label]');
      if (label) label.textContent = active ? '已收藏' : '收藏';
    });
  }

  function save(id) {
    if (!isSavable(records.get(id))) return;
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    let persisted = true;
    try { localStorage.setItem('vbc.sample-saves.v1', JSON.stringify([...saved])); }
    catch { persisted = false; }
    if (!detailId && favorites) {
      renderHome();
      ($('results').querySelector('[data-save]') || favoritesToggle).focus({preventScroll: true});
    } else updateSaved();
    notify(saved.has(id) ? persisted ? '已收藏' : '本次已收藏，浏览器无法保存' : '已取消收藏');
  }

  const markerObserver = new ResizeObserver(entries => {
    for (const { target } of entries) positionTabs(target);
  });
  function positionTabs(container) {
    window.VBCEffects.placeMarker(container, container.querySelector('[aria-selected=true]'), container.querySelector('.catalog-marker'));
  }

  function tabs(container, values, active, onChange) {
    if (!container.querySelector('.catalog-marker')) {
      container.classList.add('catalog-tabs');
      container.innerHTML = values.map(value =>
        '<button type="button" role="tab" id="' + container.id + '-' + value.id +
        '" aria-controls="' + (container.id === 'content-tabs' ? 'results' : 'panel-' + value.id) +
        '" data-tab="' + value.id + '">' + esc(value.label) + (value.count === undefined ? '' : '<span></span>') + '</button>'
      ).join('') + '<span class="catalog-marker" aria-hidden="true" hidden></span>';
      const buttons = [...container.querySelectorAll('[data-tab]')];
      for (const [index, button] of buttons.entries()) {
        button.addEventListener('click', () => onChange(button.dataset.tab));
        button.addEventListener('keydown', event => {
          const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          const next = offset ? (index + offset + buttons.length) % buttons.length :
            event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : -1;
          if (next < 0) return;
          event.preventDefault();
          onChange(buttons[next].dataset.tab);
          buttons[next].focus({preventScroll: true});
        });
      }
      markerObserver.observe(container);
    }
    for (const [index, button] of [...container.querySelectorAll('[data-tab]')].entries()) {
      const selected = button.dataset.tab === active;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (values[index].count !== undefined) {
        const count = String(values[index].count);
        if (button.lastChild.textContent !== count) button.lastChild.textContent = count;
      }
    }
    positionTabs(container);
  }

  function pager(container, total, size, current, change) {
    const pages = Math.ceil(total / size);
    container.hidden = pages <= 1;
    if (container.hidden) {
      container.replaceChildren();
      return;
    }
    const start = current * size + 1;
    const end = Math.min((current + 1) * size, total);
    container.innerHTML = '<span>' + start + '–' + end + ' / ' + total + '</span>' +
      '<div class="page-buttons"><button type="button" data-page="prev"' + (current === 0 ? ' disabled' : '') +
      '>上一页</button><span class="page-position">' + (current + 1) + ' / ' + pages +
      '</span><button type="button" data-page="next"' + (current >= pages - 1 ? ' disabled' : '') + '>下一页</button></div>';
    container.querySelector('[data-page=prev]').addEventListener('click', () => change(current - 1));
    container.querySelector('[data-page=next]').addEventListener('click', () => change(current + 1));
  }

  function empty() {
    const links = query().length && !favorites && !approved.checked
      ? Object.entries(modes).filter(([id]) => id !== mode).map(([id, entry]) => {
        const count = resultsFor(id, true).length;
        return count ? '<button type="button" data-mode="' + id + '">在' + entry.label + '中查看 ' + count + ' 项</button>' : '';
      }).join('') : '';
    const title = approved.checked ? '没有匹配的已批准版本' : favorites ? saved.size ? '收藏中没有匹配结果' : '还没有收藏' : '没有匹配结果';
    const hint = favorites && !saved.size ? '在示例旁选择收藏，之后可在这里找回。' : '可以换个词，或清除当前筛选。';
    const action = favorites && !saved.size ? '浏览示例' : '清除筛选';
    return '<div class="empty"><h3>' + title + '</h3>' +
      (links ? '<div class="match-links">' + links + '</div>' : '<p>' + hint + '</p>') +
      '<button type="button" data-reset>' + action + '</button></div>';
  }

  function selectMode(id) {
    if (mode === id && !favorites) return;
    navigate('home?mode=' + id, { vbcHome: { mode: id, query: search.value } });
  }

  function indexRow(record) {
    const stock = inventoryFor(record.id);
    const subtitle = record.title.en && record.title.en !== record.title.zh ? record.title.en : record.kind === 'source' ? record.author || '' : '';
    const category = record.homepage_effect ? '主页实例' : record.kind === 'recipe' ? '组合示例' :
      record.kind === 'source' ? stock ? stock.entries.length + ' 条参考' : '' : subjects.get(record.domain);
    return '<a class="index-row" href="#' + record.id + '" data-detail="' + record.id +
      '"><span class="index-label"><strong>' + esc(record.title.zh) + '</strong>' +
      (subtitle ? '<small' + (subtitle === record.title.en ? ' lang="en"' : '') + '>' + esc(subtitle) + '</small>' : '') +
      '</span><span class="index-category">' + esc(category) + '</span>' + arrow + '</a>';
  }

  function elementRow(element, featured) {
    const pin = '<button class="save-element" type="button" data-save="' + element.id + '">' + bookmark + '</button>';
    if (element.homepage_effect) return '<article class="element-card">' + indexRow(element) + pin + '</article>';
    const term = headword(element);
    const cover = covers[element.id];
    const title = '<h3>' + esc(term.title.zh) + '</h3>';
    const description = '<p>' + esc(summaries[element.id] || term.plain_explanation || element.title.zh) + '</p>';
    const art = '<div class="pattern" data-effect="' + esc(cover?.effect || 'static') + '" aria-hidden="true">' +
      (cover?.effect === 'paper' ? cover.html : '<div class="mini-stage">' + (cover?.html || '') + '</div>') + '</div>';
    const open = '<a class="element-open" href="#' + term.id + '" data-detail="' + term.id +
      '" aria-label="查看' + esc(term.title.zh) + '">';
    const content = featured
      ? '<div class="featured-heading">' + open + title + arrow + '</a>' + description +
        '<button class="paper-preview-toggle quiet" type="button" aria-pressed="true">点阵动效</button></div>' + art
      : open + art + '<div class="element-text">' + title + description + '</div>' + arrow + '</a>';
    return '<article class="element-card' + (featured ? ' featured-element' : '') + '" data-element="' + element.id +
      '">' + content + pin + '</article>';
  }

  function selectDomain(value) {
    domain = value;
    page = 0;
    renderHome();
  }

  function renderSubjects(unfiltered) {
    const labels = [{id: '', label: '全部主题'}, ...data.subjects];
    $('subjects').innerHTML = labels.map(subject => {
      const count = unfiltered.filter(record => !subject.id || record.domain === subject.id ||
        record.kind === 'recipe' && linked(record).some(item => item.domain === subject.id)).length;
      return '<button type="button" data-domain="' + subject.id + '" aria-pressed="' + (domain === subject.id) +
        '">' + esc(subject.label) + '<span>' + count + '</span></button>';
    }).join('');
    $('domain-select').innerHTML = labels.map(subject => '<option value="' + subject.id + '"' +
      (subject.id === domain ? ' selected' : '') + '>' + esc(subject.label) + '</option>').join('');
  }

  function saveHome(extra = {}) {
    history.replaceState({ vbcHome: { mode, domain, page, query: search.value, favorites, approved: approved.checked,
      practices: practices.open, ...extra } }, '');
  }

  function renderHome() {
    const result = $('results');
    const all = resultsFor(mode);
    const size = pageSize();
    lastPageSize = size;
    page = Math.min(page, Math.max(0, Math.ceil(all.length / size) - 1));
    const shown = all.slice(page * size, (page + 1) * size);
    result.setAttribute('role', 'tabpanel');
    result.setAttribute('aria-labelledby', 'content-tabs-' + mode);
    $('home').querySelector('.subject-rail').hidden = mode === 'sources';
    $('home').querySelector('.home-layout').classList.toggle('source-mode', mode === 'sources');
    tabs($('content-tabs'), ['terms', 'elements', 'recipes', 'sources'].map(id => ({
      id, label: modes[id].label, count: resultsFor(id, id !== mode).length
    })), mode, selectMode);
    $('results-title').textContent = favorites ? '已收藏' : modes[mode].label;
    const count = all.length + ' 项';
    if ($('result-count').textContent !== count) $('result-count').textContent = count;
    approved.closest('label').hidden = mode === 'sources' || !elements.some(accepted);
    random.disabled = !all.length;
    $('clear-search').hidden = !search.value;
    practices.hidden = mode !== 'elements' || Boolean(query().length || domain || favorites || approved.checked || page);
    $('more-tools').hidden = random.disabled && approved.closest('label').hidden;
    window.VBCBuddy?.unmount();
    window.VBCUI?.unmount();
    const featured = !page && !query().length && !domain && !favorites && !approved.checked;
    result.innerHTML = !shown.length ? empty() : mode === 'elements'
      ? '<div class="element-grid">' + shown.map((element, index) => elementRow(element, featured && index === 0 && element.id === 'motion-0007')).join('') + '</div>'
      : '<div class="index-list">' + shown.map(indexRow).join('') + '</div>';
    pager($('pagination'), all.length, size, page, next => {
      page = next;
      renderHome();
      $('results-title').focus();
    });
    renderSubjects(resultsFor(mode, true));
    window.VBCUI?.mount(result);
    window.VBCBuddy?.mount(result);
    wireDetails(result);
    result.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => save(button.dataset.save)));
    result.querySelector('[data-reset]')?.addEventListener('click', reset);
    result.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      selectMode(button.dataset.mode);
      $('results-title').focus();
    }));
    updateSaved();
    saveHome();
  }

  function navigate(hash, state = {}, replace = false) {
    if (replace) history.replaceState(state, '', '#' + hash);
    else if (location.hash !== '#' + hash) history.pushState(state, '', '#' + hash);
    else history.replaceState(state, '');
    route();
  }

  function openDetail(id, trigger) {
    if (!records.has(id)) return;
    if (detailId) {
      navigate(id, history.state, true);
      return;
    }
    returnFocus = trigger || null;
    saveHome({ scroll: scrollY, opener: trigger?.dataset.detail, random: trigger === random });
    navigate(id, { fromCatalogList: true });
  }

  function wireDetails(container) {
    container.querySelectorAll('[data-detail]').forEach(link => {
      if (link.dataset.bound) return;
      link.dataset.bound = 'true';
      link.addEventListener('click', event => {
        if (link.matches('a')) {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
        }
        openDetail(link.dataset.detail, link);
      });
    });
  }

  function reset() {
    domain = '';
    page = 0;
    favorites = false;
    search.value = '';
    approved.checked = false;
    renderHome();
    search.focus();
  }

  function returnHome() {
    if (!detailId) return;
    if (history.state?.fromCatalogList) history.back();
    else {
      const record = records.get(detailId);
      const target = record?.homepage_effect ? 'elements' : {term: 'terms', recipe: 'recipes', source: 'sources'}[record?.kind] || 'elements';
      navigate('home?mode=' + target, { vbcHome: { mode: target } }, true);
    }
  }
  function promptFor(record, e, usage, limits) {
    const url = 'https://imxiaowho.org/catalog/#' + record.id;
    const notes = [url, '请参考「'+record.title.zh+'」。', record.prompt || e?.integration_prompt, ...usage, ...limits.map(limit => '使用限制：'+limit)].filter(Boolean);
    if (record.homepage_effect) {
      notes.push('主页实例：'+window.VBCHomeExamples.original(record.id, true));
    }
    if (e) {
      notes.push('实例：'+e.preview_path, '运行文件：'+e.code_paths.join('、'), '接入、许可与来源附件：'+e.support_paths.join('、'), '版本：'+e.code_sha256, '保留相关资产来源、字体 OFL 许可、键盘、响应式和减少动态行为。', accepted(e)?'此版本已批准。':'此版本待审阅。');
    }
    return notes.join('\n');
  }
  async function copy(text, success = '接入说明已复制') {
    const entry = detailId;
    try {
      await navigator.clipboard.writeText(text);
      if (entry === detailId) {
        $('copy-fallback')?.remove();
        notify(success);
      }
    } catch {
      if (entry !== detailId) return;
      let box = $('copy-fallback');
      if (!box) {
        box = document.createElement('textarea');
        box.id = 'copy-fallback';
        box.className = 'copy-fallback';
        box.readOnly = true;
        box.setAttribute('aria-label', '手动复制文本');
        $('reader').querySelector('.detail-heading').after(box);
      }
      box.value = text;
      box.focus();
      box.select();
      notify('文字已选中，可以手动复制');
    }
  }

  function heading(record, element, description) {
    const context = subjects.get(record.domain) || (record.kind === 'recipe' ? '组合方案' : '');
    const note = record.homepage_effect ? '主页实例' : record.kind === 'source' ? '' :
      element?.preview_path ? '可操作示例' : '定义与参考资料';
    const pin = record.homepage_effect ? record : element;
    const saveButton = isSavable(pin)
      ? '<button type="button" data-save="' + pin.id + '" class="quiet">' + bookmark + '<span data-save-label>收藏</span></button>'
      : '';
    return '<header class="detail-heading"><div><div class="detail-title-line"><h1 id="entry-title">' + esc(record.title.zh) + '</h1>' +
      (record.title.en && record.title.en !== record.title.zh ? '<p class="english" lang="en">' + esc(record.title.en) + '</p>' : '') +
      '</div><p class="detail-description">' + esc(description) + '</p>' +
      (context || note ? '<p class="detail-tags">' + (context ? '<span>' + esc(context) + '</span>' : '') +
        (note ? '<span class="review-label">' + esc(note) + '</span>' : '') + '</p>' : '') +
      '</div><div class="detail-actions">' + saveButton +
      (record.kind === 'source' ? '<a class="source-original" href="' + esc(record.url) +
        '" target="_blank" rel="noopener noreferrer">打开原始来源</a>' :
        '<button class="primary" type="button" id="copy-main">复制接入说明</button>') + '</div></header>';
  }

  function createPreview(shell, url, title) {
    const state = shell.querySelector('.preview-status');
    const label = state.querySelector('[role=status]');
    const retry = state.querySelector('button');
    let frame, timer, paint = 0, loaded = false, height = 0, visible = true;

    function visibility(active) {
      visible = active;
      frame?.contentWindow?.postMessage({ type: 'vbc-preview-visibility', visible }, '*');
    }

    function reveal() {
      if (!loaded || !height) return;
      frame.style.height = height + 'px';
      if (shell.classList.contains('is-ready')) return;
      clearTimeout(timer);
      const focused = state.contains(document.activeElement);
      state.hidden = true;
      frame.inert = false;
      frame.removeAttribute('aria-hidden');
      frame.removeAttribute('tabindex');
      shell.classList.add('is-ready');
      visibility(visible);
      if (focused) frame.focus();
    }

    function layout() {
      if (!loaded || !height) return;
      if (shell.classList.contains('is-ready')) {
        reveal();
        return;
      }
      // Early measurements can describe the full specimen before its deferred compact layout runs.
      cancelAnimationFrame(paint);
      paint = requestAnimationFrame(() => {
        paint = requestAnimationFrame(reveal);
      });
    }

    function start() {
      clearTimeout(timer);
      cancelAnimationFrame(paint);
      frame?.remove();
      loaded = false;
      height = 0;
      const focus = document.activeElement === retry;
      shell.classList.remove('is-ready');
      state.hidden = false;
      retry.hidden = true;
      label.textContent = '示例载入中…';
      if (focus) label.focus();
      const next = document.createElement('iframe');
      frame = next;
      next.title = title + '可操作示例';
      next.setAttribute('sandbox', 'allow-scripts');
      next.setAttribute('aria-hidden', 'true');
      next.tabIndex = -1;
      next.inert = true;
      next.addEventListener('load', () => {
        if (frame !== next) return;
        loaded = true;
        layout();
      }, {once: true});
      next.src = url;
      shell.append(next);
      timer = setTimeout(() => {
        label.textContent = '示例暂未载入，你可以重试或查看用法。';
        retry.hidden = false;
      }, 8000);
    }

    retry.addEventListener('click', start);
    start();
    return {
      visibility,
      message(event) {
        if (event.source !== frame?.contentWindow || event.data?.type !== 'vbc-preview-height') return;
        const reported = Number(event.data.height);
        if (!Number.isFinite(reported) || reported <= 0 || reported > 12000) return;
        height = Math.max(120, Math.ceil(reported) + 2);
        layout();
      },
      destroy() {
        clearTimeout(timer);
        cancelAnimationFrame(paint);
        frame?.remove();
      },
    };
  }

  function addNeighbors(record, element) {
    const listItems = history.state?.fromCatalogList ? resultsFor(mode) :
      record.homepage_effect ? siteTerms : record.kind === 'recipe' ? recipes : record.kind === 'element' ? elements : terms;
    const idFor = item => item.kind === 'element' ? headword(item).id : item.id;
    const index = listItems.findIndex(item => idFor(item) === record.id || item.kind === 'element' && item.id === element?.id);
    if (index < 0) return;
    const links = ['上一项', '下一项'].map((label, step) => {
      const item = listItems[index + (step === 0 ? -1 : 1)];
      if (!item) return '';
      const neighbor = records.get(idFor(item));
      return '<a href="#' + neighbor.id + '" data-direction="' + (step ? 'next' : 'previous') + '" data-detail="' + neighbor.id + '">' + label + '<strong>' +
        esc(neighbor.title.zh) + '</strong></a>';
    }).join('');
    if (links) $('reader').insertAdjacentHTML('beforeend', '<nav class="sample-pagination" aria-label="相邻条目">' + links + '</nav>');
  }

  function showCandidate(record) {
    detailReflow = null;
    const term = record.kind === 'term' ? record : record.kind === 'element' ? headword(record) : null;
    const e = ['recipe', 'element'].includes(record.kind) ? record : linked(record)[0];
    const r = term || record;
    const ids = [...new Set([...(r.source_ids || []), ...(e?.source_ids || []), ...(record.kind === 'recipe' ? linked(record).flatMap(item => item.source_ids || []) : [])])];
    const related = [...new Set([...(r.related_ids || []), ...(e ? terms.filter(t => t.element_ids.includes(e.id)).map(t => t.id) : []), ...recipes.filter(item => item.element_ids.some(id => (e?.kind === 'element' ? [e.id] : e?.element_ids || []).includes(id))).map(item => item.id), ...(record.kind === 'recipe' ? linked(record).map(headword).filter(Boolean).map(t => t.id) : [])])].filter(id => id !== r.id).map(id => records.get(id)).filter(Boolean);
    const usage = r.use_when || e?.use_when || r.integration_steps || [];
    const limits = r.avoid_when || e?.avoid_when || [];
    const inline = r.homepage_effect;
    const hasPreview = inline || e?.preview_path;
    const hints = {
      'term-0041': '先看占位块的形状，再点「完成加载」对照真实布局。',
      'term-0042': '试试「查看全部作品」，观察从空结果回到有内容的列表。',
      'term-0053': '<span class="fine-paper-instruction">把鼠标移过点阵，观察它怎样回弹。</span><span class="static-paper-instruction">点阵在触屏和减少动态设置下保持静止。</span>'
    };
    const variant = {'term-0041': '&state=skeleton', 'term-0042': '&state=empty'}[r.id] || '';
    const tips = [...new Set((e?.parameters || []).map(p => p.description?.trim()).filter(Boolean))];
    const recipeTips = {
      'recipe-0001': '切换浅色和深色，比较同一版面在两种配色下的层次。',
      'recipe-0002': '切换作品分类，观察筛选后的列表和空结果。'
    };
    const inlineTips = {
      'magnetic': '移动指针或选一个位置。虚线框标出原位，数字显示横向位移。',
      'marker': '切换下方的栏目，看下划线怎样移动并对齐新标签。'
    };
    const firstTip = hints[r.id] || esc(recipeTips[r.id] || tips[0] || '操作下方示例，查看前后的变化。');
    const original = inline ? esc(window.VBCHomeExamples.original(r.id)) : '';
    const runtime = e ? '<details class="file-list"><summary>运行文件 '+e.code_paths.length+' 项和接入附件 '+e.support_paths.length+' 项</summary><h3>运行文件</h3>'+list(e.code_paths)+'<h3>接入与许可附件</h3>'+list(e.support_paths)+'</details>' : '';
    const relatedLinks = related.length ? '<h2 class="guide-section">相关内容</h2><div class="inline-links">'+related.map(item=>'<button type="button" data-detail="'+item.id+'">'+esc(item.title.zh)+'</button>').join('')+'</div>' : '';
    const specimen = inline ? window.VBCHomeExamples.sample(r.id, esc(inlineTips[inline] || r.first_action)) :
      hasPreview ? '<p class="preview-instructions">' + firstTip + '</p>' +
        '<div class="preview-shell"><div class="preview-status"><p role="status" tabindex="-1"></p>' +
        '<button type="button" hidden>重试加载示例</button></div></div>' : '';
    const provenance = inline ? '与主页使用同一套交互。' : record.kind === 'recipe' ? '此组合由本库编排，机制依据见所引用的元素。' : '以下来源用于核对词义与实现机制。示例由本库独立编写。';
    const title = hasPreview ? '用法与接入' : '定义与用法';
    $('reader').innerHTML = heading(r,e,r.plain_explanation || r.intent || '') +
      '<div class="detail-tabs"><div class="tabs" id="detail-tabs" role="tablist" aria-label="详情内容"></div></div>' +
      (hasPreview ? `<section id="panel-preview" role="tabpanel" aria-labelledby="detail-tabs-preview"><div class="preview-layout">
        <div class="live-stage">${specimen}${inline ? '<div class="preview-meta"><a href="'+original+'">在主页查看 <svg class="catalog-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6m-7 0h7v7"/></svg></a></div>' : '' }</div>
        <details class="quick-reference" open>
          <summary>${inline?'适用场景与操作方式':'适用场景'}</summary>
          <section><h2>适用场景</h2>${list(usage)}</section>
          ${inline?'<section><h2>其他操作方式</h2><p class="usage-tip">'+esc(r.fallback)+'</p></section>':''}
        </details>
      </div></section>` : '') +
      `<section id="panel-guide" role="tabpanel" aria-labelledby="detail-tabs-guide" ${hasPreview?'hidden':''}><div class="guide-grid">
        <section><h2>${hasPreview?'实现原理':'定义'}</h2><p>${esc(r.mechanism||r.composition_constraints?.join(' ')||e?.implementation_provenance)}</p>
          <h2 class="guide-section">适合使用</h2>${list(usage)}
          ${limits.length?'<h2 class="guide-section">使用限制</h2>'+list(limits):''}
          ${r.good_example?'<details><summary>用法示例</summary><p>'+esc(r.good_example)+'</p><p>'+esc(r.poor_example)+'</p></details>':''}
        </section><section><h2>接入要求</h2><p class="prompt">${esc(r.prompt||e?.integration_prompt||r.integration_steps?.join('。'))}</p>
          ${runtime}${relatedLinks}
        </section></div>
      </section>
      <section id="panel-sources" role="tabpanel" aria-labelledby="detail-tabs-sources" hidden><div class="source-panel">
        <h2>来源与机制依据</h2><ul class="source-list" id="source-citations"></ul><nav id="citation-pagination" class="pagination" aria-label="依据来源分页"></nav>
        <p class="source-note">${provenance}</p>${original?'<a href="'+original+'">打开主页原例 ↗</a>':''}
        ${e?'<div class="detail-status"><h2>当前版本记录</h2><p><code>'+esc(e.code_sha256)+'</code></p><p>'+(accepted(e)?'作者已批准此版本。':'候选版本 · 待作者逐项审阅')+'</p><p>'+(e.review?.checks?.length?'当前版本含本地检查记录。':'公开索引未附当前版本的检查记录。')+'</p><button type="button" id="copy-review">复制审阅指令</button></div>':''}
      </div></section>`;
    const panels = [{id:'guide',label:title},{id:'sources',label:'来源与版本'}];
    if (hasPreview) panels.unshift({id:'preview',label:'示例'});
    tabs($('detail-tabs'),panels,panels[0].id,setPanel);
    if (inline) example = window.VBCEffects.mount($('reader'));
    else if (hasPreview) {
      const url = '../' + e.preview_path + '?v=' + e.code_sha256.slice(0, 12) + '&view=compact' + variant;
      preview = createPreview($('reader').querySelector('.preview-shell'), url, r.title.zh);
    }

    let citationPage = 0;
    const citations = ids.map(id => records.get(id)).filter(Boolean);
    function renderCitations() {
      const size = innerWidth <= 360 ? 2 : innerWidth <= 600 ? 3 : 6;
      citationPage = Math.min(citationPage, Math.max(0,Math.ceil(citations.length/size)-1));
      $('source-citations').innerHTML = citations.slice(citationPage*size,(citationPage+1)*size).map(s=>'<li><div><button type="button" data-detail="'+s.id+'">'+esc(s.title.zh)+'</button><small>'+esc(s.id)+'</small></div><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">原始来源</a></li>').join('');
      $('citation-pagination').hidden = citations.length <= size;
      if (citations.length > size) pager($('citation-pagination'),citations.length,size,citationPage,next=>{citationPage=next;renderCitations();scrollTo(0,0);});
      wireDetails($('source-citations'));
    }
    const context = $('reader').querySelector('.quick-reference');
    let compact = matchMedia('(max-width: 900px)').matches;
    if (context) context.open = !compact;
    detailReflow = () => {
      renderCitations();
      const narrow = matchMedia('(max-width: 900px)').matches;
      if (context && narrow !== compact) context.open = !narrow;
      compact = narrow;
    };
    renderCitations();
    $('copy-main').addEventListener('click',()=>copy(promptFor(r,e,usage,limits)));
    const pin = $('reader').querySelector('[data-save]');
    pin?.addEventListener('click', () => save(pin.dataset.save));
    $('copy-review')?.addEventListener('click',()=>copy('我对 '+e.id+'「'+e.title.zh+'」（版本 '+e.code_sha256+'）的决定：[收录 / 修改 / 放弃 / 稍后]。\n备注：', '审阅指令已复制'));
    addNeighbors(r, e);
    wireDetails($('reader'));
    updateSaved();
  }
  function setPanel(name) {
    $('detail-tabs').querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === name;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex = active ? 0 : -1;
    });
    for (const panel of $('reader').querySelectorAll('[role=tabpanel]')) panel.hidden = panel.id !== 'panel-'+name;
    preview?.visibility(name === 'preview');
    if (name === 'preview') example?.position();
    else example?.reset();
    positionTabs($('detail-tabs'));
  }
  function sourceAvailability(source){
    if(source.status==='pending-source')return source.id==='src-0001'?'原文正文尚未获取；镜像文字与原文媒体的一致性待核实。':'官方身份、内容或可用入口待核实，暂缓实际采用。';
    const availability=source.availability||'';
    if(availability==='primary-text-read')return '已读取官方技术文档；此记录提供机制依据。';
    if(availability.startsWith('mirror-text-read'))return '已读取镜像文字；原始媒体与视觉效果尚未核实。';
    if(availability.startsWith('directory-and-selected-text-read'))return '已登记目录并读取部分文字；原站视觉检查尚未完成。';
    if(availability==='local-homepage-implementation')return '打开下方任一词条，体验小谁主页上的原例。';
    if(availability==='local-original-code-read')return '已读取本库原创实现；实际检查与逐项审阅另行记录。';
    if(availability.startsWith('Article body'))return '已读取文章正文与编号名称；配图内容尚未检查。';
    if(availability.startsWith('official text inspected'))return '已读取官方文字；尚未完成实际界面集成检查。';
    return '来源已登记，获取范围见下方记录；不代表复用批准。';
  }
  function sourceRelated(source) {
    const items = (source.related_ids || []).map(id => records.get(id)).filter(r => r?.homepage_effect);
    return items.length ? '<h2 class="guide-section">主页实例</h2><div class="inline-links">'+items.map(r => '<button type="button" data-detail="'+r.id+'">'+esc(r.title.zh)+'</button>').join('')+'</div>' : '';
  }
  function showSource(source){detailReflow=null;const inventory=inventoryFor(source.id);sourcePage=0;$('reader').innerHTML=heading(source,null,inventory?'按名称、编号或处理状态查找这份来源中的参考条目。':'可在此查阅原始出处、获取记录和复用条件。')+'<div class="source-panel"><dl class="source-facts"><div><dt>来源作者</dt><dd>'+esc(source.author||'来源记录中未注明')+'</dd></div><div><dt>获取日期</dt><dd>'+esc(source.acquired_on?source.acquired_on.slice(0,10):'尚未获取')+(!source.acquired_on&&source.received_on?'<small>投稿：'+esc(source.received_on.slice(0,10))+'</small>':'')+'</dd></div><div><dt>复用许可</dt><dd>'+esc(typeof source.license==='string'?source.license:source.license?.name||'需按原始来源核对')+'</dd></div></dl>'+(inventory?'<h2>参考目录</h2><div class="source-tools"><label class="sr-only" for="reference-search">搜索来源目录</label><input id="reference-search" type="search" placeholder="搜索参考名称或编号"><label class="sr-only" for="reference-status">处理状态</label><select id="reference-status"><option value="">全部状态</option>'+Object.entries(disposition).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join('')+'</select></div><div id="reference-results"></div><nav id="reference-pagination" class="pagination" aria-label="参考目录分页"></nav>':'<h2>当前记录</h2><p>'+esc(sourceAvailability(source))+'</p><details><summary>获取记录与复用说明</summary><p>'+esc(source.reuse_note||source.availability||'请以原始出处和实际获取记录为准。')+'</p></details>')+sourceRelated(source)+(inventory?'<p class="source-note">处理状态以当前公开索引为准。</p>':'')+'</div>';wireDetails($('reader'));if(inventory){const render=()=>{const search=$('reference-search').value.trim().toLocaleLowerCase(),state=$('reference-status').value,all=inventory.entries.filter(r=>(!state||r.disposition===state)&&[r.slug,r.title.zh,r.title.en,...r.term_ids].join(' ').toLocaleLowerCase().includes(search)),size=Math.max(2,Math.min(8,Math.floor((2*innerHeight-(innerWidth<=360?850:700))/(innerWidth<=600?125:95))));sourcePage=Math.min(sourcePage,Math.max(0,Math.ceil(all.length/size)-1));$('reference-results').innerHTML=all.slice(sourcePage*size,(sourcePage+1)*size).map(r=>'<div class="reference-row"><div><strong>'+esc(r.title.zh)+'</strong><small>'+(r.title.en?esc(r.title.en)+' · ':'')+esc(disposition[r.disposition])+'</small></div><div class="reference-actions">'+r.term_ids.map(id=>'<button type="button" data-detail="'+id+'">'+esc(records.get(id).title.zh)+'</button>').join('')+'<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">原始来源</a></div></div>').join('')||'<div class="empty">没有匹配的参考，请清空关键词或切换状态。</div>';pager($('reference-pagination'),all.length,size,sourcePage,next=>{sourcePage=next;render();scrollTo(0,0);});wireDetails($('reference-results'));};detailReflow=render;for(const id of ['reference-search','reference-status'])$(id).addEventListener(id==='reference-search'?'input':'change',()=>{sourcePage=0;render();});render();}}
  function route(initial = false) {
    routedHash = location.hash;
    window.VBCUI?.unmount();
    window.VBCBuddy?.unmount();
    const oldTabs = $('detail-tabs');
    if (oldTabs) markerObserver.unobserve(oldTabs);
    example?.destroy();
    preview?.destroy();
    example = preview = null;
    const [raw, params = ''] = location.hash.slice(1).split('?');
    const record = records.get(raw);
    document.body.classList.toggle('is-detail', Boolean(record));
    if (record) {
      detailId = record.id;
      $('home').hidden = true;
      $('detail').hidden = false;
      if (record.kind === 'source') showSource(record);
      else showCandidate(record);
      document.title = record.title.zh + ' · imxiaowho 前端词典';
      requestAnimationFrame(() => {
        if (detailId !== record.id) return;
        scrollTo(0, 0);
        if (!initial) $('reader').focus({preventScroll: true});
      });
      return;
    }

    const previous = detailId;
    detailId = '';
    const state = history.state?.vbcHome || {};
    const requested = new URLSearchParams(params).get('mode');
    const legacy = { dictionary: 'terms', gallery: 'elements', sources: 'sources', 'source-library': 'sources', series: 'sources', favorites: 'elements' };
    mode = [requested, legacy[raw], state.mode, 'elements'].find(id => Object.hasOwn(modes, id));
    domain = subjects.has(state.domain) && mode !== 'sources' ? state.domain : '';
    page = state.page || 0;
    favorites = mode === 'elements' && (raw === 'favorites' || Boolean(state.favorites));
    approved.checked = mode !== 'sources' && Boolean(state.approved) && elements.some(accepted);
    search.value = state.query || '';
    practices.open = Boolean(state.practices);
    $('home').hidden = false;
    $('detail').hidden = true;
    $('reader').replaceChildren();
    renderHome();
    document.title = '前端词典 · imxiaowho';
    requestAnimationFrame(() => {
      if (detailId) return;
      if (previous || state.scroll) scrollTo(0, state.scroll || 0);
      if (!previous) return;
      const opener = returnFocus;
      returnFocus = null;
      const target = opener?.isConnected && opener.checkVisibility() ? opener
        : state.random ? random : state.opener ? $('results').querySelector('[data-detail="' + state.opener + '"]') : null;
      (target || (state.opener ? search : $('results-title'))).focus({preventScroll: true});
    });
  }

  document.querySelector('a.skip').addEventListener('click', event => {
    event.preventDefault();
    (detailId ? $('reader') : search).focus();
  });
  wireDetails(practices);
  search.addEventListener('input', () => { page = 0; renderHome(); });
  $('clear-search').addEventListener('click', () => {
    search.value = '';
    page = 0;
    renderHome();
    search.focus();
  });
  approved.addEventListener('change', () => { page = 0; renderHome(); });
  $('domain-select').addEventListener('change', event => selectDomain(event.target.value));
  $('subjects').addEventListener('click', event => {
    const button = event.target.closest('[data-domain]');
    if (!button) return;
    selectDomain(button.dataset.domain);
    $('subjects').querySelector('[aria-pressed=true]')?.focus({preventScroll: true});
  });
  $('back-home').addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnHome();
  });
  favoritesToggle.addEventListener('click', () => {
    if (mode !== 'elements') {
      navigate('home?mode=elements', { vbcHome: { mode: 'elements', favorites: true } });
    } else if (favorites && location.hash === '#favorites') {
      navigate('home?mode=elements', { vbcHome: { mode: 'elements' } }, true);
    } else {
      favorites = !favorites;
      page = 0;
      if (favorites) {
        domain = '';
        search.value = '';
        approved.checked = false;
      }
      renderHome();
    }
  });
  random.addEventListener('click', () => {
    const pool = resultsFor(mode);
    if (!pool.length) return;
    const record = pool[Math.floor(Math.random() * pool.length)];
    openDetail(record.kind === 'element' ? headword(record).id : record.id, random);
  });
  addEventListener('vbc-buddy-found', event => notify('找到小谁 ' + event.detail.count + ' 次'));
  function syncRoute() { if (routedHash !== location.hash) route(); }
  addEventListener('popstate', syncRoute);
  addEventListener('hashchange', syncRoute);
  addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    const active = document.activeElement;
    const editing = active?.matches('input, textarea, select') || active?.isContentEditable;
    if (event.key === '/' && !editing && !detailId) {
      event.preventDefault();
      search.focus();
    }
    const preferences = $('pointer-toggle').getAttribute('aria-expanded') === 'true';
    if (event.key === 'Escape' && !editing && detailId && !preferences) returnHome();
  });
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (detailId) detailReflow?.();
      else if (lastPageSize !== pageSize()) {
        const previous = document.activeElement;
        const key = previous?.dataset.detail || previous?.dataset.save || previous?.dataset.domain;
        const attr = previous?.dataset.detail ? 'detail' : previous?.dataset.save ? 'save' : 'domain';
        renderHome();
        if (key !== undefined && !previous.isConnected) {
          (document.querySelector('[data-' + attr + '="' + key + '"]') || $('results-title')).focus({preventScroll: true});
        }
      }
    }, 150);
  });
  addEventListener('message', event => preview?.message(event));
  document.fonts.ready.then(() => {
    positionTabs($('content-tabs'));
    if ($('detail-tabs')) positionTabs($('detail-tabs'));
  });
  route(true);
})();
