'use strict';

(() => {
  const copy = {
    zh: {
      'page.title': 'imxiaowho · 每一天，进步一点点。',
      'page.description': '陈震的个人作品：技能工具、校园漫画与前端词典。每一天，进步一点点。',
      'skip': '跳到作品',
      'home.label': 'imxiaowho，回到顶部',
      'language.next': 'EN',
      'language.label': 'Switch to English',
      'hero.first': '每一天，',
      'hero.second': '进步一点点。',
      'hero.description': '用 Codex 做工具、画漫画，也记录过程中的发现。',
      'work.label': '按类别浏览作品',
      'tabs.label': '作品分类',
      'tab.skills': '技能工具',
      'tab.comics': '校园漫画',
      'tab.vbc': '前端词典',
      'vbc.catalog.title': '个人前端词典',
      'vbc.catalog.summary': '查词条、体验示例，找可复用的前端做法。',
      'vbc.catalog.open': '打开词典',
      'vbc.open': '体验',
      'vbc.close': '收起',
      'vbc.used': '站内出处',
      'vbc.comics': '世界小剧场',
      'vbc.demo': '栏目切换示范',
      'vbc.example.position': '示范条的位置',
      'vbc.example.left': '左侧',
      'vbc.example.center': '中间',
      'vbc.example.right': '右侧',
      'vbc.example.title': '标题',
      'vbc.example.action': '操作',
      'vbc.example.paper': '把练习纸的原照整理成清楚的 A4 打印版。',
      'vbc.example.meter': '在本机整理 Codex 用量，并导出脱敏结果。',
      'vbc.copy.action': '复制提示词',
      'vbc.copy.done': '已复制',
      'vbc.copy.manual': '提示词已选中，可以手动复制。',
      'vbc.copy.label': '动效提示词',
      'vbc.spotlight.title': '鼠标跟随聚光灯',
      'vbc.spotlight.summary': '鼠标移到哪儿，条目就亮到哪儿。',
      'vbc.spotlight.note': '在示范条上移动鼠标，光斑会跟着走。也可以点左侧、中间或右侧。',
      'vbc.magnetic-hover.title': '磁吸悬停',
      'vbc.magnetic-hover.summary': '标题和右侧操作文字随鼠标轻轻移动。',
      'vbc.magnetic-hover.note': '移过示范条，或点下面的位置。虚线标着原位，两个数值显示标题和操作文字各移动了多少。',
      'vbc.text-magnifier.title': '文字放大镜',
      'vbc.text-magnifier.summary': '鼠标停在标题或操作文字上，圆圈内的字会放大。',
      'vbc.text-magnifier.note': '把鼠标移过文字，镜片会跟着走。触屏按住横向拖动，键盘聚焦后用左右键。',
      'vbc.tab-marker.title': '栏目指示线滑动',
      'vbc.tab-marker.summary': '切换栏目时，指示线滑到新位置并随文字变宽或变窄。',
      'vbc.tab-marker.note': '点下面的任意栏目，看看指示线怎样同时移动和改变宽度。',
      'vbc.inline-reveal.title': '同页展开',
      'vbc.inline-reveal.summary': '点开条目，内容直接在这一行下方出现。',
      'vbc.inline-reveal.note': '依次点开下面两个项目。新内容在该行下方淡入，上一项会收起。再点同一行即可合上。',
      'project.tunemeter': '本机用量整理与脱敏导出。',
      'project.paper': '把练习纸照片，整理成清楚的打印版。',
      'project.comics': '校园日常里的关系、规则与小摩擦。',
      'project.vbc.title': 'VBC 前端词典',
      'project.vbc': '收集参考，拆解交互，积累可复用的做法。',
      'project.open': '查看项目',
      'project.local': '整理中',
      'project.progress': '创作中',
      'about.summary': '关于我与其他探索',
      'about.description': '我是陈震，关注 AI、科技与独立开发。这里放一些自己做的东西，和还在继续的尝试。',
      'about.nav': '其他探索',
      'about.workbench': '元舵协同工作台',
      'about.notes': '做工作台的过程记录',
      'about.mail': '小谁的邮件小剧场',
      'about.expressions': '小谁的表情练习',
      'surface.label': '选择页面背景',
      'surface.title': '背景',
      'surface.ink': '墨影',
      'surface.none': '净面',
      'footer.credit': '© 2026 陈震',
      'light.on': '背景随动：开启',
      'light.off': '背景随动：关闭',
      'light.touch': '背景随动：触屏静态',
      'light.reduced': '背景随动：跟随系统静态',
      'logo.label': '抓住藏在字后的小谁',
      'logo.here': '在这里呀。',
      'logo.almost': '差一点点。',
      'logo.moved': '我换地方啦。',
      'logo.find': '这次能找到我吗？',
      'logo.caught': '抓到啦。',
      'logo.status': '抓到啦。小谁从字上方探出了头。',
    },
    en: {
      'page.title': 'imxiaowho · A little better, every day.',
      'page.description': 'Tools, campus comics and a UI dictionary by Chen Zhen. A little better, every day.',
      'skip': 'Skip to projects',
      'home.label': 'imxiaowho, back to top',
      'language.next': '中文',
      'language.label': '切换为中文',
      'hero.first': 'Every day,',
      'hero.second': 'a little better.',
      'hero.description': 'Making tools and comics with Codex, and keeping notes along the way.',
      'work.label': 'Browse projects by category',
      'tabs.label': 'Project categories',
      'tab.skills': 'Skills',
      'tab.comics': 'Comics',
      'tab.vbc': 'Dictionary',
      'vbc.catalog.title': 'Personal Frontend Dictionary',
      'vbc.catalog.summary': 'Browse terms, interactive examples and reusable patterns.',
      'vbc.catalog.open': 'Open dictionary',
      'vbc.open': 'Try it',
      'vbc.close': 'Close',
      'vbc.used': 'On this site',
      'vbc.comics': 'World Comics',
      'vbc.demo': 'Tab switch demonstration',
      'vbc.example.position': 'Example position',
      'vbc.example.left': 'Left',
      'vbc.example.center': 'Center',
      'vbc.example.right': 'Right',
      'vbc.example.title': 'Title',
      'vbc.example.action': 'Action',
      'vbc.example.paper': 'Turn worksheet photos into clear, printable A4 pages.',
      'vbc.example.meter': 'Organize Codex usage locally and export a redacted result.',
      'vbc.copy.action': 'Copy prompt',
      'vbc.copy.done': 'Copied',
      'vbc.copy.manual': 'The prompt is selected and ready to copy manually.',
      'vbc.copy.label': 'Motion prompt',
      'vbc.spotlight.title': 'Cursor-following spotlight',
      'vbc.spotlight.summary': 'A soft light follows the pointer across the row.',
      'vbc.spotlight.note': 'Move across the strip to follow the spotlight, or choose Left, Center, or Right.',
      'vbc.magnetic-hover.title': 'Magnetic hover',
      'vbc.magnetic-hover.summary': 'The title and action move gently with the pointer.',
      'vbc.magnetic-hover.note': 'Move across the strip or choose a position. The dashed outlines mark the starting points, and the values show how far each label moves.',
      'vbc.text-magnifier.title': 'Text magnifier',
      'vbc.text-magnifier.summary': 'The cursor enlarges the text under its circle.',
      'vbc.text-magnifier.note': 'Move the pointer across the text. On a touchscreen, press and drag sideways. With keyboard focus, use the left and right arrow keys.',
      'vbc.tab-marker.title': 'Sliding tab underline',
      'vbc.tab-marker.summary': 'The underline slides and resizes to fit the selected tab.',
      'vbc.tab-marker.note': 'Choose one of the tabs below and watch the underline move and change width.',
      'vbc.inline-reveal.title': 'Inline reveal',
      'vbc.inline-reveal.summary': 'Open a row to reveal its contents directly below.',
      'vbc.inline-reveal.note': 'Open each project below. Its content fades in under the row, and the previous project closes. Select the open row again to close it.',
      'project.tunemeter': 'Organize local usage and export a redacted copy.',
      'project.paper': 'Turn worksheet photos into clear, printable pages.',
      'project.comics': 'Relationships, rules, and small frictions of school life.',
      'project.vbc.title': 'VBC UI Dictionary',
      'project.vbc': 'Collect references, unpack interactions, and save reusable ideas.',
      'project.open': 'View project',
      'project.local': 'In progress',
      'project.progress': 'In progress',
      'about.summary': 'About me & other explorations',
      'about.description': 'I am Chen Zhen. I follow AI, technology, and independent development. This is a home for things I make and ideas I am still exploring.',
      'about.nav': 'Other explorations',
      'about.workbench': 'Yuanduo workbench',
      'about.notes': 'Building the workbench',
      'about.mail': 'Xiaowho\'s mail theatre',
      'about.expressions': 'Xiaowho\'s expression studies',
      'surface.label': 'Choose a page background',
      'surface.title': 'Backdrop',
      'surface.ink': 'Ink',
      'surface.none': 'Plain',
      'footer.credit': '© 2026 Chen Zhen',
      'light.on': 'Mouse light: on',
      'light.off': 'Mouse light: off',
      'light.touch': 'Mouse light: touch mode',
      'light.reduced': 'Mouse light: reduced motion',
      'logo.label': 'Catch Xiaowho hiding behind the letters',
      'logo.here': 'Over here.',
      'logo.almost': 'Almost!',
      'logo.moved': 'New hiding spot.',
      'logo.find': 'Can you find me?',
      'logo.caught': 'You got me!',
      'logo.status': 'You caught Xiaowho peeking above the letters.',
    }
  };
  const preference = 'xiaowho.home-language.v1';
  let locale = 'zh';
  try { if (localStorage.getItem(preference) === 'en') locale = 'en'; } catch { /* Session choice. */ }
  const parameters = new WeakMap();
  function t(key, values = {}) {
    return (copy[locale][key] ?? copy.zh[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => {
      const value = values[name]; return typeof value === 'function' ? value() : value ?? '';
    });
  }
  function setText(element, key, values = {}) {
    element.dataset.i18n = key;
    parameters.set(element, values);
    element.textContent = t(key, values);
  }
  function setAttribute(element, name, key) {
    element.setAttribute('data-i18n-' + name, key);
    element.setAttribute(name, t(key));
  }
  function apply() {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.locale = locale;
    document.title = t('page.title');
    document.querySelector('meta[name="description"]').content = t('page.description');
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n, parameters.get(element));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    });
    const button = document.getElementById('language-toggle');
    button.lang = locale === 'zh' ? 'en' : 'zh-CN';
    document.dispatchEvent(new CustomEvent('home-language-change', {detail: locale}));
  }
  window.homeLocale = {t, setText, setAttribute, get current() { return locale; }};
  document.getElementById('language-toggle').addEventListener('click', () => {
    locale = locale === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem(preference, locale); } catch { /* Session choice. */ }
    apply();
  });
  apply();
})();
