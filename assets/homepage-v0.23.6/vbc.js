'use strict';

(() => {
  const prompts = {
    "vbc-spotlight": {
      "zh": "请为网页列表实现鼠标跟随聚光灯。根据指针在当前条目内的位置更新 CSS 变量，让一束半径 260 像素的柔和径向渐变跟着移动，移开后用 160 毫秒淡出。保留条目原有排版、点击范围和键盘焦点。用原生 CSS 与 JavaScript，触屏和减少动态效果模式下保持静态。",
      "en": "Add a cursor-following spotlight to a web list. Use pointer coordinates inside the current row to update CSS variables and move a soft radial gradient with a 260 px radius. Fade the light out over 160 ms on exit. Preserve the row layout, click target, and keyboard focus. Use plain CSS and JavaScript, with a static treatment for touch and reduced motion."
    },
    "vbc-magnetic-hover": {
      "zh": "请为列表条目实现磁吸悬停。把鼠标在条目内的位置映射到 -1 到 1。用 transform 移动标题区和右侧操作文字，标题横向最多 4 像素、纵向 2 像素，操作文字横向最多 7 像素、纵向 4 像素。过渡用 180 毫秒，移出、取消或失焦后归零。用静止的条目计算坐标，保留点击范围，并适配触屏和减少动态效果设置。",
      "en": "Add magnetic hover to a list row. Normalize the pointer position within the row to -1 through 1. Transform the title by up to 4 px horizontally and 2 px vertically, and the action by up to 7 px horizontally and 4 px vertically. Use a 180 ms transition and reset on pointer exit, cancellation, or blur. Measure the stationary row and preserve its hit area. Respect touch and reduced motion."
    },
    "vbc-text-magnifier": {
      "zh": "请实现鼠标文字放大镜。悬停在可操作标签上时，让原生指针过渡到小圆圈，在 24 像素的圆形裁剪层里重绘同一文字并放大到 1.22 倍。保留文字样式和原始排版，测量固定锚点来校正滚动条预留空间造成的偏移。放大层忽略指针事件，文本输入、键盘操作、触屏和减少动态效果模式保留原生行为。",
      "en": "Build a text magnifier for actionable labels. Morph the native pointer into a small circle and render the same text at 1.22× inside a 24 px circular clip. Match the label typography and preserve the original layout. Measure the fixed anchor to compensate for scrollbar gutters. Let pointer events pass through the overlay and keep native input, keyboard, touch, and reduced-motion behavior."
    },
    "vbc-tab-marker": {
      "zh": "请为栏目导航实现一条滑动指示线。测量选中标签相对于导航容器的横向位置和宽度，用同一条下划线做平移和横向缩放，过渡时长为 260 毫秒。窗口尺寸或语言变化时重新测量。保持标签页的选择状态、键盘导航和焦点清晰可见，并尊重减少动态效果设置。",
      "en": "Add a sliding underline to a tab bar. Measure the selected tab’s horizontal position relative to the bar and its width. Move and scale a single underline over 260 ms. Recalculate after resizing or a language change. Preserve accessible selection, keyboard navigation, and visible focus. Respect reduced motion."
    },
    "vbc-inline-reveal": {
      "zh": "请为列表做同页展开。点一个条目时，把内容放在这一行下方，打开另一条时收起上一条，再点当前条目即可收起。展开内容的透明度从 0.55 到 1，历时 300 毫秒。优先用原生 details 和 summary，保留键盘、触屏、焦点和读屏语义，减少动态效果时直接展开。",
      "en": "Create an inline disclosure list. Open the content directly below its row, close the previous row when another opens, and close the current row on a second activation. Fade the revealed content from 0.55 to full opacity over 300 ms. Use native details and summary semantics, preserve keyboard, touch, focus, and screen reader behavior, and show the content immediately for reduced motion."
    }
  };

  const panel = document.getElementById('panel-vbc');
  const locale = window.homeLocale;
  if (!panel || !locale) return;

  const lensStage = panel.querySelector('[data-vbc-lens-stage]');
  if (lensStage) {
    let dragPointer = null;
    lensStage.tabIndex = 0;

    function showLens(x, y, input) {
      const left = Math.max(0, Math.min(x, lensStage.clientWidth));
      const top = Math.max(0, Math.min(y, lensStage.clientHeight));
      lensStage.style.setProperty('--vbc-lens-x', left + 'px');
      lensStage.style.setProperty('--vbc-lens-y', top + 'px');
      lensStage.dataset.vbcLensInput = input;
    }

    function hideLens() {
      const pointer = dragPointer;
      dragPointer = null;
      delete lensStage.dataset.vbcLensInput;
      if (pointer !== null && lensStage.hasPointerCapture(pointer)) {
        lensStage.releasePointerCapture(pointer);
      }
    }

    function followPointer(event) {
      const dragging = event.pointerId === dragPointer;
      if (!dragging && (event.pointerType !== 'mouse' || dragPointer !== null)) return;
      // The clip and its transform origin share the stage's padding box.
      const bounds = lensStage.getBoundingClientRect();
      showLens(
        event.clientX - bounds.left - lensStage.clientLeft,
        event.clientY - bounds.top - lensStage.clientTop,
        dragging ? 'drag' : 'mouse'
      );
    }

    lensStage.addEventListener('pointerenter', followPointer);
    lensStage.addEventListener('pointermove', followPointer);
    lensStage.addEventListener('pointerleave', () => {
      if (lensStage.dataset.vbcLensInput === 'mouse') hideLens();
    });
    lensStage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || !event.isPrimary || dragPointer !== null) return;
      dragPointer = event.pointerId;
      lensStage.setPointerCapture(dragPointer);
      followPointer(event);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      lensStage.addEventListener(type, event => {
        if (event.pointerId === dragPointer) hideLens();
      });
    }
    lensStage.addEventListener('focus', () => {
      if (lensStage.matches(':focus-visible')) {
        showLens(lensStage.clientWidth / 2, lensStage.clientHeight / 2, 'keyboard');
      }
    });
    lensStage.addEventListener('keydown', event => {
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      if (!direction || dragPointer !== null) return;
      event.preventDefault();
      const x = lensStage.dataset.vbcLensInput === 'keyboard'
        ? Number.parseFloat(lensStage.style.getPropertyValue('--vbc-lens-x'))
        : lensStage.clientWidth / 2;
      showLens(x + direction * 16, lensStage.clientHeight / 2, 'keyboard');
    });
    lensStage.addEventListener('blur', () => {
      if (lensStage.dataset.vbcLensInput === 'keyboard') hideLens();
    });
    lensStage.closest('details').addEventListener('toggle', event => {
      if (!event.currentTarget.open) hideLens();
    });
    window.addEventListener('blur', hideLens);
  }

  const buttons = panel.querySelectorAll('[data-vbc-copy]');
  const feedback = new WeakMap();
  const manual = document.createElement('div');
  const instruction = document.createElement('p');
  const field = document.createElement('textarea');
  let copying = false;

  manual.className = 'vbc-prompt-manual';
  field.readOnly = true;
  field.rows = 5;
  locale.setText(instruction, 'vbc.copy.manual');
  locale.setAttribute(field, 'aria-label', 'vbc.copy.label');
  manual.append(instruction, field);

  function promptFor(entry) {
    return prompts[entry.id]?.[locale.current];
  }

  function copyWithSelection(text) {
    const previousFocus = document.activeElement;
    const selection = document.createElement('textarea');
    selection.value = text;
    selection.readOnly = true;
    selection.tabIndex = -1;
    selection.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.append(selection);
    try {
      selection.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      selection.remove();
      previousFocus?.focus({preventScroll: true});
    }
  }

  async function writePrompt(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Embedded or restricted browsers can still allow copying a selection.
    }
    return copyWithSelection(text);
  }

  function setLabel(label, key) {
    locale.setText(label, key);
    document.dispatchEvent(new Event('home-lens-refresh'));
  }

  panel.addEventListener('click', async event => {
    const button = event.target.closest('[data-vbc-copy]');
    if (!button || copying) return;
    const entry = button.closest('details');
    const text = promptFor(entry);
    if (!text) return;
    const label = button.querySelector('[data-lens-label]');

    clearTimeout(feedback.get(label));
    setLabel(label, 'vbc.copy.action');
    copying = true;
    try {
      if (await writePrompt(text)) {
        manual.remove();
        setLabel(label, 'vbc.copy.done');
        feedback.set(label, setTimeout(() => {
          setLabel(label, 'vbc.copy.action');
          feedback.delete(label);
        }, 1800));
      } else if (entry.open && !panel.hidden) {
        field.value = promptFor(entry);
        entry.querySelector('.vbc-note').append(manual);
        field.focus();
        field.select();
      }
    } finally {
      copying = false;
    }
  });

  document.addEventListener('home-language-change', () => {
    if (manual.isConnected) field.value = promptFor(manual.closest('details'));
  });

  for (const button of buttons) button.hidden = false;
})();
