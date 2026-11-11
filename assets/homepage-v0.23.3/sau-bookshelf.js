'use strict';

(() => {
  const issues = [
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
  const editionNote = document.getElementById('sau-edition-note');
  const read = document.getElementById('sau-read');
  const readLabel = read.querySelector('[data-lens-label]');
  const reader = document.getElementById('sau-reader');
  const readerTitle = document.getElementById('sau-reader-title');
  const readerImage = document.getElementById('sau-reader-image');
  const transcript = document.getElementById('sau-transcript');
  const transcriptTitle = document.getElementById('sau-transcript-title');
  const transcriptText = document.getElementById('sau-transcript-text');
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

  function renderTranscript() {
    const entry = language() === 'en' ? issue.english?.[page - 1] : null;
    transcript.hidden = !entry;
    reader.classList.toggle('sau-reader-has-transcript', !!entry);
    if (!entry) return;

    const [heading, ...paragraphs] = entry;
    transcriptTitle.textContent = heading;
    transcriptText.replaceChildren(...paragraphs.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
  }

  function renderReader(animate = false) {
    if (reader.hidden) return;
    readerTitle.textContent = title.textContent;
    setArt(readerImage, pageURL(issue.number, page), animate);
    readerImage.alt = `${title.textContent} · ${page}/${issue.pages}`;
    position.textContent = `${page} / ${issue.pages}`;
    previous.disabled = page === 1;
    next.disabled = page === issue.pages;
    renderTranscript();
  }

  function renderIssue(animate = false) {
    title.textContent = issueTitle(issue.number);
    summary.textContent = issue.summary[language()];
    editionNote.hidden = language() !== 'en';
    if (!editionNote.hidden) {
      editionNote.textContent = issue.english?.length === issue.pages
        ? 'English transcript with every page.'
        : 'Original artwork in Chinese.';
    }
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
      if (!reader.hidden && !transcript.hidden) details.push(transcript);
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
    readLabel.textContent = label(reader.hidden ? 'read' : 'close');
    renderIssue();
  }

  document.addEventListener('home-language-change', localize);
  localize();
  if (new URLSearchParams(location.search).get('section') === 'comics') {
    document.getElementById('tab-comics').click();
  }
})();
