'use strict';

(() => {
  const issues = [
    {
      number: 0,
      pages: 7,
      summary: {
        zh: '当国家成了同学，国际新闻会变成怎样的校园故事？',
        en: 'What happens when countries become classmates?'
      }
    },
    {
      number: 1,
      pages: 7,
      summary: {
        zh: '社团联演就要开始，音响却迟迟未到。',
        en: 'The club show is about to start, but the speakers are missing.'
      },
      english: [
        [
          'The answer: Panna',
          'The classmate from the last riddle was Panna, representing China. Did you guess right?',
          'Panda: Her two hair buns echo a panda’s round ears.',
          'Red and gold: Her red cardigan and gold tie echo the red and yellow of the flag.',
          'Cultural clue: A Chinese knot and jade pendant hang at her waist.'
        ],
        [
          'He arrives with a solution',
          'Last time, Panna was willing to talk things through and kept her word. Today, meet another classmate.',
          'At the club fair, the sound system is late and the showcase is about to start.',
          'Organizer: “Everyone’s here, and the speakers still haven’t arrived…”',
          'New student: “I borrowed a set. Let’s try it out.”',
          'Organizer: “Great! You’ve saved us.”'
        ],
        [
          'Now he wants the opening, too',
          'New student: “Can you hear me in the back?” Audience: “Loud and clear!”',
          'New student: “The equipment works. Leave the opening to me, too. I’ll lead you through it.”',
          'The organizer holds up the program. “Thank you, but we’ve already lined up a host.”'
        ],
        [
          'He takes the refusal to heart',
          'Organizer: “We’ve rehearsed. We’re opening as planned.”',
          'New student: “You mean you don’t need me to lead?”',
          'Organizer: “I mean we’ve already picked a host.”',
          'New student: “Then let’s do a trial run. See who can get the whole room going.”',
          'Organizer: “We have five minutes. You can try a bit, but the program stays as it is.”'
        ],
        [
          'He’s good, and he wants to win',
          'New student: “Friends in the back, can I borrow some applause?” The moment he speaks, the room comes alive.',
          'New student: “Well? Shall I open?”',
          'Organizer: “That worked well. We’ll still stick to the rehearsal for the show. Did you come to help or to replace the host?”'
        ],
        [
          'Just helping out',
          'New student: “…I was just helping out while I was here.”',
          'Organizer: “Then while you’re here, could you check the sound in the back?”',
          'He hands her the microphone. “Fine. I’ll watch the equipment. You open.”',
          'Organizer: “Welcome to the club fair!”',
          'By the speaker, he says, “See? You still need me.” She replies, “Yep. For the sound.”',
          'He really did help. He really wanted the spotlight, too.'
        ],
        [
          'Can you guess the new classmate?',
          'He knows how to work a room and is used to taking the lead. He can let small things go, but hates being underestimated.',
          'Look at his swept-up white hair, navy jacket, red striped tie and the aviators in his breast pocket.',
          'Which country does he represent? Share your guess and one clue. Issue 2 reveals his identity and introduces another classmate.'
        ]
      ]
    },
    {
      number: 2,
      pages: 7,
      summary: {
        zh: '社团开放日，一盏折灯能不能登上主展台？',
        en: 'Can a folding lamp make it onto the main stage at club open day?'
      },
      english: [
        [
          'The answer: Ace',
          'The white-haired classmate from the last riddle was Ace, representing the United States. Did you guess right?',
          'Bald eagle: His white hair echoes the eagle’s white head.',
          'Blue, white and red: A navy jacket, an ivory shirt and a red tie.',
          'Cultural clue: The aviator sunglasses are a nod to aviation.'
        ],
        [
          'It’s the club fair',
          'The entrance sign reads “Club Fair: Demonstrations and Sign-ups.”',
          'Volunteer: “The main stage is about to open. If you want to join a club, sign up at its table.”',
          'The origami club sets out a folded-paper lamp by the windows. Students stream toward the main stage.',
          'The organizer hands over the program. “Ace, you’re in charge of the main stage.”'
        ],
        [
          'She has her eye on half the table',
          'The origami club member gestures to passing students, but they keep walking. Her sign-up sheet is still empty.',
          'At the main table, the organizer points to a blank slot. “We’re still missing an opening demonstration.”',
          'She notices the empty right half of the table and steps onto the stage.'
        ],
        [
          'Two hellos, a round of applause',
          'Ace: “The club booths are on either side.” He checks the mic. “Hello? Hello?”',
          'The origami club member claps. “Those two hellos sounded grander than the opening ceremony!”',
          'She glances at the table. Ace laughs. “Come on, tell me. What have you got your eye on?”'
        ],
        [
          'Half a table for one demo',
          'Origami club member: “I’ll do the opening demo. Can our club use the right half of the table to sign up new members?”',
          'Ace clears the space. “Deal. You go first, and you can keep this half until we close.”',
          'She goes back to the window and picks up the lamp.'
        ],
        [
          'Her half of the table lights up',
          'At the opening, Ace takes the mic. “First up: the origami club.”',
          'The lamp glows. She points to the pleats. “My family taught me how to make this fold.”',
          'After the demonstration, a student stops at her half of the table to sign up.'
        ],
        [
          'Can you guess the new classmate?',
          'Look for the long black-and-white hair with a touch of red, the long ivory coat over a red vest, and the paper fold her family taught her.',
          'Which country does she represent? Share your guess and one clue. Issue 3 reveals her identity and the design clues.'
        ]
      ]
    },
    {
      number: 3,
      pages: 7,
      summary: {
        zh: '想买耳机还差十块，新同学在社团集市摆起了汽水摊。',
        en: 'A classmate short of money for headphones sets up a soda stall at the club fair.'
      }
    },
    {
      number: 4,
      pages: 7,
      summary: {
        zh: '冠军奖一支新球拍。连赢两场的新同学已经拉开拍套，决赛却还没打。',
        en: 'A new classmate wins two matches and opens his paddle case as if the prize is already his. There is still one match to go.'
      }
    }
  ];
  const pageText = {"0":[["当国家成了同学","封面。一位扎双发髻、穿红色开衫的女生抱着书站在校门口。学生们走进秋叶围着的校园。","School as Usual，第零期《入学之前》。把国际新闻里的大局势，画成校园里的小故事。原创虚构校园漫画。"],["我总觉得，新闻里很有戏。","第一格，桌上摆着耳机和显示世界地图的电脑，有人往笔记本上画关系图。旁白：我挺爱听人讲国际新闻。看着各方拉拢、试探、谈条件，总觉得这些关系本身就很有戏。","第二格，四个同学围桌商量。旁白：大家各有打算，为了一个目标合作，也会为了自己的利益重新站队。","第三格，学生们穿过校门。旁白：于是我想：要是把这些关系搬进一所学校，会发生什么？"],["学校，就是个小社会。","学生走过教学楼前的广场。旁白：这里是一所虚构的国际学校。School as Usual 把现实国际局势里的关系，改编成同学之间的校园故事。","左下格，同学们在教室对着白板讨论。旁白：同学的设定和关系，借用了国家之间的处境与博弈；外形、穿着和做事方式里，也藏着线索。","右下格，几个人边吃午饭边交谈。旁白：教室、食堂、走廊、社团……看起来都是小事，背后却各有打算。"],["我想讽刺的，是这些做法。","上格是一栋教学楼。旁白：我不希望有战争。也不认同把朋友当筹码、把规则当工具的做法。","左下格，两位同学在走廊握手。旁白：有人嘴上说是朋友，谈起利益，却先把朋友当了筹码。","右下格，一位同学越过排队用的隔离带。旁白：有人要求别人守规矩，轮到自己，总有“特殊情况”。","页末：那些看不惯的地方，我想放进漫画里，让它们自己露出破绽。"],["新闻在变，故事也会继续。","同学们围着校园公告板说话。旁白：后续故事会从现实国际新闻里找灵感，先核对背景，再改编成校园故事。","有人一起搬箱子，有人围着桌上的平面图商量。旁白：争场地、分资源、拉朋友、谈条件……先讲清一场同学之间的冲突，再把现实关系藏进细节。","页末：你可以先看他们怎么相处、怎么选择；也可以顺着线索，想想这像哪条新闻。希望你看得有趣、好玩，惦记这帮同学下一次又会发生什么。"],["我有想法，AI 来画。","电脑屏幕上是校园插画，桌上的笔记写着「校园与新闻」「同学的选择」「现实的讨论」。旁白：想法和观点来自我，画面由 Codex（AI）绘制，故事一起推敲。","旁白：把画面交给 AI，是为了缩短制作周期，更及时地跟上新闻，争取更频繁地更新。","旁边有一棵冒汗的小树涂鸦。旁白：关键是，我也不会画 😂","页末，学生们在校园广场聊天。旁白：我想表达的态度，会留在人物的选择和故事里。"],["新同学，先不点名。","社团市集的一次协商。靠门的摊位轮到她们组。对方想借，她答应让出这周，条件是下周换回来。","红色帐篷下，扎双发髻的女生抱着黑色本子，侧脸看向摊桌对面的同学。刚说好，对方又问：「下周也给我们吧。」","她对应哪个国家？评论区留下答案＋一条线索。下一期揭晓身份和造型提示，再认识一位新同学。"]],"4":[["第 4 期 · 谜底揭晓","上一期 17 号摊的摊主是塔拉，她代表印度。她靠在摊桌边，桌上放着汽水、零钱和一只钱盒。","左右逢源：找潘娜谈进货，请艾斯报摊号。会谈条件：留一瓶汽水，换一次广播。心里有账：耳机还差十块，这一摊赚了十二。","页底把孟加拉虎的颜色和塔拉的发色、印度国旗和她的服装配色并排，还画了织纹围巾的特写。"],["先慢一点 · 报名","体育馆挂着「校体育节·乒乓球单打赛」横幅。告示写着：乒乓球社承办、全校自愿报名、8 人单淘汰、每场先得 5 分胜。艾斯的桌上放着盒装新球拍，标为冠军奖品。","穿白外套的新同学捏了捏开胶的旧拍，望向新拍，心想：「这拍该换了。赢到最后，就有新的。」","他在艾斯面前弯腰签名：「算我一个。」"],["连赢两场","首轮对阵塔拉。新同学挥拍，塔拉伸手去接：「好快！我还没站稳呢！」他以 5 比 1 胜出。","半决赛对阵鹤子。球一弹，他就迎上去打。鹤子说：「球刚弹起来，他就抢着打！」他以 5 比 2 晋级。","长椅上，他拉开空拍套。磨花的旧拍还在旁边。他想：「球拍马上是我的了！」"],["决赛开打","艾斯站在裁判桌后，扬手宣布：「乒乓球单打决赛，现在开始！」左边的新同学和右边的潘娜隔网站定。","白球落在潘娜这一侧。他靠快攻先拿两分，记分牌是 2 比 0。","他抬起下巴，心想：「原来潘娜打球也就那样，看来冠军是我的了。」"],["网边短球","画面先给新同学站在球台外的靴子，再给潘娜看过去的眼神。她心想：「他站得远。放个短球。」","球过网就落，新同学伸拍够不到。记分牌翻到 2 比 2，潘娜连追两分。","打到 4 比 4。他已经往网前迈了一步，心想：「肯定还是短球！」球还在潘娜拍前，她看见他正扑过来。"],["最后一分","接着上一页，新同学的身体还往网前倾。潘娜心想：「他扑上来了。打底线！」她把球打到他这一侧靠近底线的位置。","艾斯说：「5 比 4，冠军是潘娜！」记分牌左 4 右 5，潘娜托着装有新拍的盒子。","新同学坐到长椅上，看着自己的旧拍，心想：「她还没出手，我就先扑了……」最后一格没有对白，他低头把旧拍收回拍套。"],["猜猜他是谁","体育馆门边，新同学独自站着。旁白：性子急，好胜。球刚弹起，他就抢着打。领先两分，就觉得冠军稳了。","下面三格是他的造型线索：棕卷发、圆熊耳；白外套、蓝毛衣、红围巾；套娃挂件。","你猜他代表哪个国家？评论里留个国名，再说一条你看出的线索。第 5 期揭晓。"]]};
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
      loading: '图片加载中…',
      loadFailed: '图片加载失败，请重试。'
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
      loading: 'Loading image…',
      loadFailed: 'The image could not load. Please try again.'
    }
  };
  const artRoot = new URL('../homepage-v0.24.2/assets/sau/', document.currentScript.src);
  const currentArtRoot = new URL('../homepage-v0.24.8/assets/sau/', document.currentScript.src);
  const revisedCover = new URL('../homepage-v0.24.3/assets/sau/P0/01-hand-fix.webp', document.currentScript.src);
  const originalArtRoot = new URL('../homepage-v0.23.3/assets/sau/', document.currentScript.src);
  const options = [...document.querySelectorAll('.sau-issue-option')];
  const coverButton = document.getElementById('sau-cover-button');
  const cover = document.getElementById('sau-cover');
  const lookup = document.getElementById('sau-lookup');
  const query = document.getElementById('sau-number');
  const feedback = document.getElementById('sau-find-status');
  const title = document.getElementById('sau-issue-title');
  const summary = document.getElementById('sau-issue-summary');
  const editionNote = document.getElementById('sau-edition-note');
  const read = document.getElementById('sau-read');
  const readLabel = read.querySelector('[data-lens-label]');
  const reader = document.getElementById('sau-reader');
  const readerTitle = document.getElementById('sau-reader-title');
  const readerImage = document.getElementById('sau-reader-image');
  const transcript = document.getElementById('sau-transcript');
  const transcriptTitle = document.getElementById('sau-transcript-title');
  const transcriptText = document.getElementById('sau-transcript-text');

  const router = window.homeRouter;
  const digits = '零一二三四五六七八九';
  const captions = {
    0: ['入学之前', 'Before School Begins'],
    1: ['社团联演', 'The Club Showcase'],
    2: ['社团开放日', 'Club Open Day'],
    3: ['17 号摊的生意', 'Business at Stall 17'],
    4: ['先慢一点', 'Start Slow'],
  };
  const readerPagers = [...reader.querySelectorAll('[data-sau-turn]')];
  const pageLabels = [...reader.querySelectorAll('[data-sau-position]')];
  const transcriptLabel = document.getElementById('sau-transcript-label');
  const feedbackLabels = {
    zh: {
      badRouteIssue: '没有这个期号，请从目录选择一期。',
      badRoutePage: '这期没有这一页，请从目录打开。',
      zhText: '本期有中文逐页文字版。',
      zhArt: '本期为中文原画。',
      textLabel: '本页文字',
      zhAvailable: 'Read page text in Chinese',
    },
    en: {
      badRouteIssue: 'That issue is not in the index. Choose an issue to continue.',
      badRoutePage: 'That page is out of range. Open the issue to continue.',
      zhText: 'Chinese artwork and page text.',
      zhArt: 'Original artwork in Chinese.',
      textLabel: 'Read page text',
      zhAvailable: 'Read page text in Chinese',
    },
  };
  let issue = issues.find(item => item.number === 1);
  let page = 1;
  let readerTrigger = read;
  let feedbackKey = '';

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const label = key => feedbackLabels[language()][key] || copy[language()][key];
  const selection = (number) => /^[0-9]+$/.test(number ?? '') ? Number(number) : NaN;

  function pageURL(number, pageNumber) {
    if (number === 0 && pageNumber === 1) return revisedCover.href;
    const root = number === 4 ? currentArtRoot : number === 1 || number === 2 ? originalArtRoot : artRoot;
    return new URL('P'+number+'/'+String(pageNumber).padStart(2, '0')+'.jpg', root).href;
  }

  function issueTitle(number) {
    if (language() === 'en') return 'SAU Issue '+number;
    return 'SAU第'+(digits[number] ?? number)+'期';
  }

  function showArtState(image, state) {
    image.dataset.artState = state;
    const status = image.nextElementSibling;
    status.hidden = state === 'ready';
    status.textContent = status.hidden ? '' : label(state === 'loading' ? 'loading' : 'loadFailed');
  }

  function setArt(image, url) {
    const same = image.getAttribute('src') && image.src === url;
    if (same && image.dataset.artState === 'ready') return;
    showArtState(image, 'loading');
    if (!same) image.src = url;
    if (image.complete && image.currentSrc === url) {
      showArtState(image, image.naturalWidth ? 'ready' : 'error');
    }
  }

  function renderTranscript() {
    const english = language() === 'en' ? issue.english?.[page - 1] : null;
    const entry = english || pageText[issue.number]?.[page - 1];
    transcript.hidden = !entry;
    reader.classList.toggle('sau-reader-has-transcript', !!entry);
    if (!entry) return;
    transcript.lang = english ? 'en' : 'zh-CN';
    transcriptLabel.lang = language() === 'en' ? 'en' : 'zh-CN';
    transcriptLabel.textContent = language() === 'en' && !english ? label('zhAvailable') : label('textLabel');
    const [heading, ...paragraphs] = entry;
    transcriptTitle.textContent = heading;
    transcriptText.replaceChildren(...paragraphs.map(value => {
      const paragraph = document.createElement('p');
      paragraph.textContent = value;
      return paragraph;
    }));
    if (readerImage.dataset.artState === 'error') transcript.open = true;
  }

  function renderReader() {
    if (reader.hidden) return;
    readerTitle.textContent = title.textContent;
    readerImage.alt = title.textContent+' · '+page+'/'+issue.pages;
    setArt(readerImage, pageURL(issue.number, page));
    for (const position of pageLabels) position.textContent = page+' / '+issue.pages;
    for (const button of readerPagers) {
      button.disabled = button.dataset.sauTurn === 'next' ? page === issue.pages : page === 1;
    }
    renderTranscript();
  }

  function renderIssue() {
    const lang = language();
    const english = lang === 'en';
    const number = issue.number;
    const shorthand = captions[number][english ? 1 : 0];
    title.textContent = issueTitle(number)+' · '+shorthand;
    summary.textContent = issue.summary[lang];
    editionNote.lang = english ? 'en' : 'zh-CN';
    editionNote.hidden = !english && !pageText[number];
    editionNote.textContent = english && issue.english?.length === issue.pages
      ? 'English transcript with every page.'
      : label(pageText[number] ? 'zhText' : 'zhArt');
    cover.alt = title.textContent;
    const action = label(reader.hidden ? 'read' : 'close');
    readLabel.textContent = action;
    coverButton.setAttribute('aria-label', action+' · '+title.textContent);
    document.title = title.textContent+' · School as Usual';
    setArt(cover, new URL('covers/P'+number+'.webp', currentArtRoot).href);
    for (const option of options) {
      const optionNumber = Number(option.dataset.issue);
      option.querySelector('[data-lens-label]').textContent =
        issueTitle(optionNumber)+' · '+captions[optionNumber][english ? 1 : 0];
      if (optionNumber === number) option.setAttribute('aria-current', 'true');
      else option.removeAttribute('aria-current');
    }
    document.dispatchEvent(new Event('sau-issue-change'));
    renderReader();
  }

  function setFeedback(key) {
    feedbackKey = key;
    feedback.textContent = key ? label(key) : '';
  }

  function selectIssue(number) {
    if (!issues.some(item => item.number === number)) {
      setFeedback('missing');
      return;
    }
    query.value = '';
    router.go('comics', {issue: number, page: reader.hidden ? null : 1, reason: 'issue'});
  }

  function openReader(event) {
    readerTrigger = event.currentTarget;
    router.go('comics', {issue: issue.number, page: 1, reason: 'open-reader'});
  }

  function closeReader() {
    router.go('comics', {issue: issue.number, reason: 'close-reader'});
    readerTrigger.focus();
  }

  function focusReader() {
    readerTitle.focus({preventScroll: true});
    reader.scrollIntoView({block: 'start'});
  }

  function syncRoute({section, issue: rawIssue, page: rawPage, reason}) {
    if (section !== 'comics') {
      reader.hidden = true;
      return;
    }
    const selected = issues.find(item => item.number === selection(rawIssue));
    const requested = selection(rawPage);
    const invalidIssue = rawIssue !== null && !selected;
    const validPage = selected && requested >= 1 && requested <= selected.pages;
    issue = selected || issues.find(item => item.number === 1);
    page = validPage ? requested : 1;
    reader.hidden = !validPage;
    read.setAttribute('aria-expanded', String(Boolean(validPage)));
    coverButton.setAttribute('aria-expanded', String(Boolean(validPage)));
    setFeedback(invalidIssue ? 'badRouteIssue' : rawPage !== null && !validPage ? 'badRoutePage' : '');
    renderIssue();
    if (validPage && ['initial', 'history', 'about-comic', 'open-reader', 'reader-bottom'].includes(reason)) {
      focusReader();
    }
  }

  for (const image of [cover, readerImage]) {
    image.addEventListener('load', () => {
      if (image.complete) showArtState(image, 'ready');
    });
    image.addEventListener('error', () => {
      if (!image.complete || !image.hasAttribute('src')) return;
      showArtState(image, 'error');
      if (image === readerImage && !transcript.hidden) transcript.open = true;
    });
  }

  for (const option of options) {
    option.addEventListener('click', () => selectIssue(Number(option.dataset.issue)));
  }
  lookup.addEventListener('submit', event => {
    event.preventDefault();
    const match = query.value.normalize('NFKC').trim().match(/^(?:第\s*)?(\d+)(?:\s*期)?$/u);
    selectIssue(match ? Number(match[1]) : NaN);
  });
  query.addEventListener('input', () => setFeedback(''));
  for (const trigger of [coverButton, read]) {
    trigger.addEventListener('click', event => {
      if (reader.hidden) openReader(event);
      else closeReader();
    });
  }
  document.getElementById('sau-reader-close').addEventListener('click', closeReader);
  for (const button of readerPagers) {
    button.addEventListener('click', () => {
      const next = button.dataset.sauTurn === 'next' ? page + 1 : page - 1;
      const fromBottom = button.closest('.sau-reader-pages-bottom');
      router.go('comics', {issue: issue.number, page: next, reason: fromBottom ? 'reader-bottom' : 'reader-turn'});
      if (!fromBottom && button.disabled) {
        button.parentElement.querySelector('[data-sau-turn]:not(:disabled)')?.focus();
      }
    });
  }

  function localize() {
    for (const element of document.querySelectorAll('[data-sau-copy]')) {
      element.textContent = label(element.dataset.sauCopy);
    }
    query.placeholder = label('example');
    setFeedback(feedbackKey);
    for (const image of [cover, readerImage]) {
      if (image.dataset.artState) showArtState(image, image.dataset.artState);
    }
    if (router.read().section === 'comics') renderIssue();
  }

  document.addEventListener('home-language-change', localize);
  document.addEventListener('home-route-change', event => syncRoute(event.detail));
  localize();
  syncRoute({...router.read(), reason: 'initial'});
})();
