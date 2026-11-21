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
    },
    {
      number: 5,
      pages: 8,
      summary: {
        zh: "食堂只剩三块苹果派，她刚好排第三。艾斯先买走一块，回头还招呼她也先买。",
        en: "Three slices of apple pie are left, and she’s third in line. Ace skips the queue to buy one and waves her over."
      }
    },
    {
      number: 6,
      pages: 8,
      summary: {
        zh: '画展布置完，三位同学要拍张合影。顶灯太硬，窗帘又挡住了红花。',
        en: 'Three classmates try to take a group photo after setting up the art show. The overhead light is harsh, and the curtain keeps hiding a red flower.'
      }
    }
  ];
  const pageText = {
    "1": [
      ["第 1 期 · 谜底揭晓", "上期谜底是中国·潘娜。她抱着黑色本子站在校园台阶前。三幅特写揭开线索：双丸子头呼应熊猫圆耳，红开衫、金领带呼应国旗的红与黄，腰间挂着中国结与玉坠。你猜对了吗？"],
      ["他一来，先解决了麻烦。", "上期的潘娜肯商量，也守得住约定。今天，社团开放日联演就要开始，约好的音响迟迟没到。拿着节目夹的女生看着观众：「人都来了，音响还没来……」", "白发的新同学一手拿麦，一手提着音箱走来：「我借到一套。先试试。」他把音箱放到桌上，女生说：「太好了，帮大忙了！」"],
      ["音响稳了，开场也想接了。", "新同学举着麦问：「后排，听得见吗？」有人举手：「听得见！」", "他把手放在胸前：「设备没问题。开场也交给我，我带着你们。」女生举起节目单：「谢谢你，主持已经排好了。」"],
      ["一句“不用”，他却认真了。", "女生说：「我们排练过，开场按原安排。」他皱起眉：「你的意思是，不用我带头？」她答：「我说的是，主持已经定了。」", "他俯身撑住桌面：「那就试一段。看谁更能带动全场。」她摊开手：「离开场还有五分钟。试一段，正式安排不变。」"],
      ["他真有本事，也真想赢。", "他挥手喊：「后排的朋友，掌声借我一下！」台下纷纷鼓掌。旁白：一开口，他还真把气氛带了起来。", "他转向女生：「怎么样？开场我来？」她答：「效果很好。正式主持，还是按排练走。你是来帮忙，还是来换主持？」他攥着麦，收起了笑。"],
      ["原来，“顺便”才是重点。", "他摸着后颈：「……我就顺便。」女生微笑：「那就顺便，帮我听听后排。」他把麦递还给她：「行。设备我盯着，开场你上。」", "她站在台前：「欢迎来到社团开放日！」他蹲在音箱旁：「看，还是得有我。」她答：「对，音响。」页末：忙是真的帮，主角也是真的想当。"],
      ["这位新同学，你猜到了吗？", "白发同学站在幕布旁。页上写着：真能撑场，也习惯带头。小事可以不计较，被看轻却很难忍。", "三处特写：白色上扬的头发，藏蓝外套与红色条纹领带，胸前口袋的飞行员墨镜。他对应哪个国家？评论区留下答案和一条线索。第 2 期揭晓，再认识一位新同学。"]
    ],
    "2": [
      ["第 2 期 · 谜底揭晓", "上期的白发同学是美国·艾斯。他推开门，身后是谱架和钢琴。白发呼应白头鹰的白色头部，藏蓝外套、米白衬衫、红色领带组成蓝白红配色。胸前的飞行员墨镜带一点航空文化的味道。上期的白发同学，你猜对了吗？"],
      ["今天，社团招新。", "门口写着「社团开放日，看展示·现场报名」。拿着节目夹的同学指向礼堂：「主展台马上开场。想入社，就到各社桌上报名。」", "人群沿过道走向蓝帘主展台。左侧窗边，折纸社的新同学正摆弄一盏折纸灯，桌上放着报名表。台前，负责人递出节目夹：「艾斯，主展台你来安排。」"],
      ["她看上了那半张桌。", "新同学从折纸社桌后伸手招呼，过道里的学生继续往台前走，桌上的报名表还空着。", "主展台边，负责人指着节目单空栏：「开场还差一段演示。」麦和节目夹放在左边，右半张长桌空着。新同学看着桌子，一只脚迈上台阶。"],
      ["两声试麦，一阵掌声。", "艾斯低头对着麦：「各社的展位在两边。喂？喂？」新同学俯身拍手，笑得附近的同学都转过头来：「您这两声『喂』，比正式开幕还气派！」", "下一格，她双手还合着，眼睛已瞟向桌面。艾斯笑着问：「说吧，你看上哪儿了？」"],
      ["半张桌，换一段演示。", "她摊手指向桌子：「开场演示我来。右半张桌借我们折纸社招新，行吗？」", "艾斯拿起节目夹，手掌拍在桌面上：「行。你做第一场，右半张桌给你们用到散场。」她回到窗边，双手托起折纸灯的木底座。"],
      ["那半张桌，亮了。", "开场时，艾斯坐在台左举起麦：「第一场，请折纸社。」台右摆上了折纸社的名牌、报名表和亮起的纸灯。", "她指着灯罩的折纹：「这折法是我家教的。」演示后，一位背书包的同学伏在右半张桌上填表。艾斯托着下巴看着她们。"],
      ["这位新同学，你猜到了吗？", "她一手搭着折纸灯。三幅局部画出线索：黑白长发，头顶一抹红；米白长外套，红色马甲；红边灯罩上家里教的折法。", "她对应哪个国家？评论区留答案和一条线索。第 3 期揭晓身份和设计线索。"]
    ],
    "3": [
      ["第 3 期 · 谜底揭晓", "上期用开场演示换半张主桌的同学是鹤子，代表日本。她站在折纸灯旁。善于借势：看准艾斯的主会场，主动接下开场演示。在意名分：想给折纸社留个位置，多接活也愿意。以家传手艺为傲：借到主台，灯罩还用家里的折法。", "下方三处特写是丹顶鹤意象、米白外套和红马甲，以及家传折法。"],
      ["17 号摊的生意", "社团集市上，卷发的新同学看着手机上的耳机：「买耳机还差十块。集市上也能摆个人摊，我去挣点。」登记同学递来桌牌：「个人摊按报名顺序排。你是 17 号。」", "8 号桌游摊前，潘娜按「3 元一瓶」卖汽水。新同学想：「整筐买兴许能便宜点，再一瓶瓶卖，赚个差价。」", "主持人艾斯播报：「8 号摊的桌游体验马上开始，报名的同学请到桌边。」有人转向 8 号摊。她想：「艾斯一报，大家就过去了。我也请他报 17 号摊。」"],
      ["整筐买走", "「潘娜，怎么开局？」玩家已经坐齐。潘娜把价签翻过去：「我得先带这局，汽水一会儿再卖。」", "新同学蹲在筐边：「剩下的我全买了，你忙你的。给熟人便宜点呗？」潘娜答：「十瓶都拿？行，省得我一瓶瓶卖。按进价，两块一瓶。空筐记得还我。」", "两张十元钞票递过去。新同学提走整筐汽水，潘娜坐回棋盘前给玩家示范。"],
      ["请艾斯报摊号", "新同学在 17 号摊摆上汽水，立起「4 元一瓶」的价签。过道里的人从桌边走过去。", "她把「17 号摊有汽水」的纸条推到广播台上：「等会儿播报，帮我捎上 17 号摊呗？我请你喝汽水，给你留一瓶。」艾斯伸手接纸条：「行，下一轮我顺带报。」"],
      ["17 号摊来客了", "艾斯拿起麦：「逛渴了的同学，17 号摊有汽水。」潘娜还在带桌游，过道里的同学转向 17 号摊。", "「来一瓶。」一名同学放下四元，新同学递出汽水。她卖掉了八瓶，把一瓶放到钱盒后面，筐里还剩一瓶。"],
      ["这局结束后", "潘娜到 17 号摊，看见「4 元一瓶」的价签，回头瞥了一眼：「两块从我这儿拿，四块往外卖。刚才还跟我讲交情呢。」这是她的心声。新同学笑着递汽水：「这瓶你拿着。」潘娜只伸手提筐：「我就来拿筐。」", "稍后，艾斯夹着节目单来了。新同学递出留的那瓶：「给你留的在这儿。」艾斯笑着伸手：「你还真给我留着呢。」"],
      ["耳机的钱够了", "新同学拧开剩下的一瓶汽水。账本上写着「卖汽水 32 元，进货 20 元」，旁边的手机显示那副耳机。她想：「赚了十二块。耳机的钱够了。」", "三幅特写给出线索：深色卷发里的暖橙挑染，橙外套、白衬衫和绿裤子，还有藏蓝围巾上的织纹。这位新同学对应哪个国家？评论区留个答案，再说说你看见的一个线索。第 4 期揭晓她的身份和设计线索。"]
    ],
    "0":[["当国家成了同学","封面。一位扎双发髻、穿红色开衫的女生抱着书站在校门口。学生们走进秋叶围着的校园。","School as Usual，第零期《入学之前》。把国际新闻里的大局势，画成校园里的小故事。原创虚构校园漫画。"],["我总觉得，新闻里很有戏。","第一格，桌上摆着耳机和显示世界地图的电脑，有人往笔记本上画关系图。旁白：我挺爱听人讲国际新闻。看着各方拉拢、试探、谈条件，总觉得这些关系本身就很有戏。","第二格，四个同学围桌商量。旁白：大家各有打算，为了一个目标合作，也会为了自己的利益重新站队。","第三格，学生们穿过校门。旁白：于是我想：要是把这些关系搬进一所学校，会发生什么？"],["学校，就是个小社会。","学生走过教学楼前的广场。旁白：这里是一所虚构的国际学校。School as Usual 把现实国际局势里的关系，改编成同学之间的校园故事。","左下格，同学们在教室对着白板讨论。旁白：同学的设定和关系，借用了国家之间的处境与博弈；外形、穿着和做事方式里，也藏着线索。","右下格，几个人边吃午饭边交谈。旁白：教室、食堂、走廊、社团……看起来都是小事，背后却各有打算。"],["我想讽刺的，是这些做法。","上格是一栋教学楼。旁白：我不希望有战争。也不认同把朋友当筹码、把规则当工具的做法。","左下格，两位同学在走廊握手。旁白：有人嘴上说是朋友，谈起利益，却先把朋友当了筹码。","右下格，一位同学越过排队用的隔离带。旁白：有人要求别人守规矩，轮到自己，总有“特殊情况”。","页末：那些看不惯的地方，我想放进漫画里，让它们自己露出破绽。"],["新闻在变，故事也会继续。","同学们围着校园公告板说话。旁白：后续故事会从现实国际新闻里找灵感，先核对背景，再改编成校园故事。","有人一起搬箱子，有人围着桌上的平面图商量。旁白：争场地、分资源、拉朋友、谈条件……先讲清一场同学之间的冲突，再把现实关系藏进细节。","页末：你可以先看他们怎么相处、怎么选择；也可以顺着线索，想想这像哪条新闻。希望你看得有趣、好玩，惦记这帮同学下一次又会发生什么。"],["我有想法，AI 来画。","电脑屏幕上是校园插画，桌上的笔记写着「校园与新闻」「同学的选择」「现实的讨论」。旁白：想法和观点来自我，画面由 Codex（AI）绘制，故事一起推敲。","旁白：把画面交给 AI，是为了缩短制作周期，更及时地跟上新闻，争取更频繁地更新。","旁边有一棵冒汗的小树涂鸦。旁白：关键是，我也不会画 😂","页末，学生们在校园广场聊天。旁白：我想表达的态度，会留在人物的选择和故事里。"],["新同学，先不点名。","社团市集的一次协商。靠门的摊位轮到她们组。对方想借，她答应让出这周，条件是下周换回来。","红色帐篷下，扎双发髻的女生抱着黑色本子，侧脸看向摊桌对面的同学。刚说好，对方又问：「下周也给我们吧。」","她对应哪个国家？评论区留下答案＋一条线索。下一期揭晓身份和造型提示，再认识一位新同学。"]],"4":[["第 4 期 · 谜底揭晓","上一期 17 号摊的摊主是塔拉，她代表印度。她靠在摊桌边，桌上放着汽水、零钱和一只钱盒。","左右逢源：找潘娜谈进货，请艾斯报摊号。会谈条件：留一瓶汽水，换一次广播。心里有账：耳机还差十块，这一摊赚了十二。","页底把孟加拉虎的颜色和塔拉的发色、印度国旗和她的服装配色并排，还画了织纹围巾的特写。"],["先慢一点 · 报名","体育馆挂着「校体育节·乒乓球单打赛」横幅。告示写着：乒乓球社承办、全校自愿报名、8 人单淘汰、每场先得 5 分胜。艾斯的桌上放着盒装新球拍，标为冠军奖品。","穿白外套的新同学捏了捏开胶的旧拍，望向新拍，心想：「这拍该换了。赢到最后，就有新的。」","他在艾斯面前弯腰签名：「算我一个。」"],["连赢两场","首轮对阵塔拉。新同学挥拍，塔拉伸手去接：「好快！我还没站稳呢！」他以 5 比 1 胜出。","半决赛对阵鹤子。球一弹，他就迎上去打。鹤子说：「球刚弹起来，他就抢着打！」他以 5 比 2 晋级。","长椅上，他拉开空拍套。磨花的旧拍还在旁边。他想：「球拍马上是我的了！」"],["决赛开打","艾斯站在裁判桌后，扬手宣布：「乒乓球单打决赛，现在开始！」左边的新同学和右边的潘娜隔网站定。","白球落在潘娜这一侧。他靠快攻先拿两分，记分牌是 2 比 0。","他抬起下巴，心想：「原来潘娜打球也就那样，看来冠军是我的了。」"],["网边短球","画面先给新同学站在球台外的靴子，再给潘娜看过去的眼神。她心想：「他站得远。放个短球。」","球过网就落，新同学伸拍够不到。记分牌翻到 2 比 2，潘娜连追两分。","打到 4 比 4。他已经往网前迈了一步，心想：「肯定还是短球！」球还在潘娜拍前，她看见他正扑过来。"],["最后一分","接着上一页，新同学的身体还往网前倾。潘娜心想：「他扑上来了。打底线！」她把球打到他这一侧靠近底线的位置。","艾斯说：「5 比 4，冠军是潘娜！」记分牌左 4 右 5，潘娜托着装有新拍的盒子。","新同学坐到长椅上，看着自己的旧拍，心想：「她还没出手，我就先扑了……」最后一格没有对白，他低头把旧拍收回拍套。"],["猜猜他是谁","体育馆门边，新同学独自站着。旁白：性子急，好胜。球刚弹起，他就抢着打。领先两分，就觉得冠军稳了。","下面三格是他的造型线索：棕卷发、圆熊耳；白外套、蓝毛衣、红围巾；套娃挂件。","你猜他代表哪个国家？评论里留个国名，再说一条你看出的线索。第 5 期揭晓。"]],
    "5": [
      [
        "第 5 期 · 谜底揭晓",
        "上一期打乒乓球的新同学是米沙，他代表俄罗斯。球刚弹起，他已握着旧拍迎上去。旁边写着「性子急，好胜。」他想：「都领先两分了，冠军稳了！」",
        "页底并排画了棕熊和米沙的圆耳、俄罗斯国旗和米沙的服装配色，最后一格是套娃挂件。"
      ],
      [
        "我很好 · 这回先来",
        "上周五，食堂阿姨指着空盘说：「卖完了。」这周五午休，莉奥娜给带盖茶杯倒红茶，心想：「这回先去买派。」",
        "甜点窗口贴着「周五苹果派」「每人限买一块」。一名同学在窗口前，米沙排第二，莉奥娜端着杯子排第三。柜里还剩三块苹果派。"
      ],
      [
        "半块地砖",
        "米沙的靴子快碰到排头同学的鞋跟。莉奥娜说：「米沙，劳驾，给前面留点空。」他退开半块砖，回头问：「这下行了吧？」",
        "墙上时钟显示 12:27。艾斯从队伍旁走向窗口：「阿姨，来一块苹果派。我得赶十二点半的广播。」"
      ],
      [
        "你也先买一块",
        "艾斯刷卡买了一块派，回头招呼：「莉奥娜，过来，你也先买一块。」米沙和莉奥娜都看过来。托盘里只剩两块。",
        "排头同学举起饭卡：「阿姨，我要一块。」米沙对莉奥娜说：「就剩两块。他要一块，我也要。你要是先买，我就买不着了。」莉奥娜拿出饭卡，仍站在原地。"
      ],
      [
        "我很好",
        "莉奥娜低头看杯子，心想：「真想吃。可一想到插队，心里就发紧。」她手一抖，杯盖响了两声。",
        "米沙问：「你没事吧？」莉奥娜勉强笑了笑：「我很好。」",
        "她收回饭卡，对窗口说：「阿姨，我排第三。先给前面两位吧。」站在队伍侧面的艾斯低头看着手里的派。"
      ],
      [
        "卖完了",
        "艾斯对排头的同学说：「对不住。」他拿着派离开。排头买走一块，米沙买到最后一块。",
        "莉奥娜端着茶走过空柜。米沙坐在桌边，桌上有一块派和两把叉子。他叫她：「莉奥娜，过来，趁热。」"
      ],
      [
        "大的给你",
        "米沙想：「她刚才要是先买，这块就轮不到我了。」他把派分成两份，把盘子推向莉奥娜：「大的给你。」",
        "莉奥娜想：「我还以为今天只能喝茶了。」她笑得邻桌回头，拿叉子伸向大的那块：「那我就不客气了。」"
      ],
      [
        "猜猜这位同学",
        "她端着带盖茶杯。画上写着：「她最怕当众失态。排队时，她连半块地砖都留意。被叫去插队，她心里一紧。手一抖，杯盖响了两声。」",
        "下面三格是铜色大卷发、藏蓝外套和红白蓝格纹、包上的圆顶帽。",
        "「你猜她代表哪个国家？评论留个国名，再说一条线索。第6期揭晓。」"
      ]
    ],
    "6": [
      [
        "第 6 期 · 谜底揭晓",
        "上一期端着茶杯的同学是莉奥娜，她代表英国。她举着杯子说：「我很好。」画上写着：「最怕当众失态。一想到插队，手就抖。杯盖响了两声。」",
        "页底把狮鬃和她的铜红卷发、英国国旗和她的外套与格纹并排，最后一格特写包上的圆顶帽。"
      ],
      [
        "拍张合影吧",
        "明天学校办画展。米沙搬展板，莉奥娜贴说明牌，洛朗的画挂好了。莉奥娜提议：「拍张合影吧。」",
        "莉奥娜把包放在椅子上，洛朗把包放在桌面，把包带盘好：「这弧度，漂亮。」",
        "莉奥娜把手机架在画架上。洛朗看着屏幕里的人说：「这顶灯照的，眼窝都黑了。」"
      ],
      [
        "去窗边",
        "洛朗搬起画架：「去窗边。那儿光好。」米沙和莉奥娜跟到窗边。",
        "洛朗说：「米沙，挨着莉奥娜。」米沙走到莉奥娜身边，问：「这儿？」"
      ],
      [
        "连笑都得练？",
        "洛朗叫米沙：「放松。笑一下。」米沙挤出笑容，心想：「拍张照，连笑都得练？」",
        "洛朗让莉奥娜先端着杯子。米沙转身：「我去后边歇会儿。」他坐下来，心想：「搬展板都没这么累。」",
        "洛朗回过头说：「好了。」窗边的玻璃瓶里有一朵红花。"
      ],
      [
        "就要这阵风",
        "洛朗伸手招呼米沙：「米沙，站中间。」米沙走过来，风吹起纱帘，扑在他脸上。",
        "米沙伸手朝向窗户。洛朗拦他：「别关！就要这阵风。」米沙把帘子交给他：「那你管住它。」"
      ],
      [
        "十秒定时",
        "莉奥娜按下十秒定时，跑回米沙身边。她招呼托着帘角的洛朗：「你也进来呀！」洛朗说：「你们先拍。我托着帘子。」",
        "纱帘还遮着窗台上的红花。洛朗想：「帘角再往左一点，花就露出来了。」他伸手拉住帘角。快门响了，莉奥娜和米沙笑起来。"
      ],
      [
        "拍下的合影",
        "照片里，莉奥娜和米沙在笑，红花从飘起的帘子下面露出来。画面的右上角拍到了洛朗的手。",
        "莉奥娜取下手机，三人凑过来看。「就一只手！」洛朗说：「嗯，花露出来了。」",
        "他继续看着照片里的手：「我这只手……跟把钳子似的。」"
      ],
      [
        "猜猜这位同学",
        "新同学站在窗边托着帘角。画上写着：「讲究，浪漫，不肯将就。为了让花露出来，他站到了镜头外。」",
        "下方三格是他的造型线索：红铜前发、黑贝雷帽、藏蓝、米白、红。",
        "「你猜他对应哪个国家？留言写一个国名，再说一条线索。第 7 期揭晓。」"
      ]
    ]
  };
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
      loadFailed: '图片加载失败。',
      retryArt: '重新加载本页图片'
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
      loadFailed: 'The image could not load.',
      retryArt: 'Reload page image'
    }
  };
  const artRoot = new URL('../homepage-v0.24.2/assets/sau/', document.currentScript.src);
  const currentArtRoot = new URL('../homepage-v0.24.8/assets/sau/', document.currentScript.src);
  const revisedCover = new URL('../homepage-v0.24.3/assets/sau/P0/01-hand-fix.webp', document.currentScript.src);
  const originalArtRoot = new URL('../homepage-v0.23.3/assets/sau/', document.currentScript.src);
  const issueFiveArtRoot = new URL('../homepage-v0.24.20/assets/sau/', document.currentScript.src);
  const issueSixArtRoot = new URL('../homepage-v0.24.26/assets/sau/', document.currentScript.src);
  const issueCoverRoots = {5: issueFiveArtRoot, 6: issueSixArtRoot};
  const issueArtRoots = {1: originalArtRoot, 2: originalArtRoot, 4: currentArtRoot, ...issueCoverRoots};
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
  const retryArt = document.getElementById('sau-retry-art');
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
    5: ['我很好', 'I’m Fine'],
    6: ['再往左一点', 'A Little More to the Left'],
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
    const root = issueArtRoots[number] ?? artRoot;
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
    if (image === readerImage) retryArt.hidden = state !== 'error';
  }

  function setArt(image, url, retry = false) {
    if (!retry && image.dataset.artUrl === url) return;
    image.dataset.artUrl = url;
    const request = new URL(url);
    if (retry) request.searchParams.set('retry', String(Date.now()));
    showArtState(image, 'loading');
    image.src = request.href;
    if (image.complete && image.currentSrc === request.href) {
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
    const coverRoot = issueCoverRoots[number] ?? currentArtRoot;
    setArt(cover, new URL('covers/P'+number+'.webp', coverRoot).href);
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
    const restoreFocus = reason === 'history' && reader.contains(document.activeElement);
    reader.hidden = !validPage;
    read.setAttribute('aria-expanded', String(Boolean(validPage)));
    coverButton.setAttribute('aria-expanded', String(Boolean(validPage)));
    setFeedback(invalidIssue ? 'badRouteIssue' : rawPage !== null && !validPage ? 'badRoutePage' : '');
    renderIssue();
    if (validPage && ['initial', 'history', 'about-comic', 'open-reader', 'reader-bottom'].includes(reason)) {
      focusReader();
    } else if (!validPage && restoreFocus) {
      readerTrigger.focus();
    }
  }

  retryArt.addEventListener('click', () => {
    focusReader();
    setArt(readerImage, pageURL(issue.number, page), true);
  });

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
