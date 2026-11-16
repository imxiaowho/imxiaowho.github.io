'use strict';
(() => {
  const photo='assets/quiet-coast-thumb.webp';
  const lines='<i></i><i></i><i></i>';
  const sheet='<div class="mini-sheet"><span class="mini-meta">TYPE / HIERARCHY</span><b>让信息有秩序</b><p>重要的先被看见</p><div class="mini-rule"></div><div class="mini-rule short"></div></div>';
  const grid='<div class="mini-grid-lines">'+Array(6).fill('<i></i>').join('')+'</div>';
  const image='<img src="'+photo+'" alt="" loading="lazy" width="240" height="160">';
  const patterns={
    'visual-0001':['hierarchy',sheet],
    'visual-0002':['type','<div class="mini-typesize"><span>Aa</span><i></i><small>17 / 28</small></div>'],
    'visual-0003':['palette','<div class="mini-swatches"><i><span>操作</span></i><i><span>错误</span></i><i><span>提示</span></i></div>'],
    'visual-0004':['surface','<div class="mini-surface"><i></i><i></i><small>边界与层次</small></div>'],
    'visual-0005':['ratio','<div class="mini-frame"><div>'+image+'<span>3:4</span></div><div>'+image+'<span>16:9</span></div></div>'],
    'visual-0006':['spacing','<div class="mini-editorial"><div><b>为内容<br>建立秩序</b><span>层次 / 网格</span><i></i><i></i><i></i></div><img src="'+photo+'" alt="" loading="lazy" width="240" height="160"></div>'],
    'visual-0007':['measure','<div class="mini-reading"><b>给阅读一点呼吸</b><p>行宽影响视线移动。<br>留出稳定的阅读节奏。</p><i></i><small>适度行宽</small></div>'],
    'visual-0008':['contrast','<div class="mini-contrast"><span>Aa<small>可读</small></span><span>Aa<small>低对比</small></span></div>'],
    'visual-0009':['crop','<div class="mini-crop">'+image+'<i></i><span>焦点</span></div>'],
    'visual-0010':['glass',image+'<div class="mini-glass"><b>Glass</b><span>透出背景层次</span></div>'],
    'visual-0011':['font','<div class="mini-fontpair"><span>Aa<small>Sans</small></span><span>Aa<small>Serif</small></span></div>'],
    'layout-0001':['grid',grid+'<div class="mini-grid-foot"><span>minmax</span><i></i><span>auto-fit</span></div>'],
    'layout-0002':['responsive','<div class="mini-device"><i></i><div><b></b><span></span><span></span></div></div><div class="mini-device phone"><i></i><div><b></b><span></span></div></div>'],
    'layout-0003':['bento','<div class="mini-bento"><i><span>主内容</span></i><i></i><i></i></div>'],
    'component-0001':['card','<div class="mini-contentcard"><i></i><div><b>一个清楚的入口</b><span>标题 · 摘要 · 操作</span></div><svg viewBox="0 0 20 20"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></div>'],
    'component-0002':['disclosure','<div class="mini-disclosure"><b>如何开始？<i></i></b><div><span>先找到合适的元素。</span><i></i></div><b>如何复用？<i></i></b></div>'],
    'component-0003':['tabs','<div class="mini-tabset"><div><span>介绍</span><span>参数</span><i></i></div><b></b><p></p></div>'],
    'component-0004':['skeleton','<div class="mini-skeleton"><b></b><div>'+lines+'<b class="mini-placeholder-tag"></b></div><span></span></div>'],
    'component-0005':['form','<div class="mini-form"><small>内容标题</small><b>实时预览<i></i></b><div><span>颜色</span><i></i><i></i><i></i></div></div>'],
    'component-0006':['feedback','<div class="mini-toast"><span class="mini-check"><svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-8"/></svg></span><div><b>更改已保存</b><small>操作结果可见</small></div></div>'],
    'motion-0001':['stagger','<div class="mini-squares"><i><span>01</span><b>整理</b></i><i><span>02</span><b>设计</b></i><i><span>03</span><b>完成</b></i></div><div class="mini-timeline"><i></i><i></i><i></i></div>'],
    'motion-0002':['scroll','<div class="mini-scroll"><b></b>'+lines+'<span></span></div><i class="mini-scroll-track"></i>'],
    'motion-0003':['tilt','<div class="mini-pass"><span>POINTER / RESPONSE</span><b>靠近，便有回应</b><i></i></div>'],
    'motion-0004':['typing','<div class="mini-typing" data-typing-text="让文字有节奏"><span>让文字有节奏</span></div><small class="mini-type-foot">一字一拍</small>'],
    'motion-0005':['ripple','<div class="mini-ripple"><span>轻触一下</span><i></i></div>'],
    'motion-0006':['marquee','<div class="mini-marquee"><span>Type · Motion · Layout · </span><span>Type · Motion · Layout · </span></div><div class="mini-marquee-rule"></div>'],
    'motion-0007':['paper','<canvas class="mini-paper-canvas"></canvas><div class="mini-paper-note"><i></i><span class="paper-note-wide">轻轻一碰，<b>纸面就有回应。</b></span><span class="paper-note-narrow">移近 · 波动</span></div>']
  };
  window.VBC_COVERS=Object.fromEntries(Object.entries(patterns).map(([id,[effect,html]])=>[id,{effect,html}]));
})();
