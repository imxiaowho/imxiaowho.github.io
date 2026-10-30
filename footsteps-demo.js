(() => {
  'use strict';
  const journey=document.getElementById('journey');
  const svg=document.getElementById('walking-trail');
  const route=document.getElementById('trail-path');
  const footprints=document.getElementById('footprints');
  const chapters=[...document.querySelectorAll('.chapter')];
  const navigation=[...document.querySelectorAll('[data-nav]')];
  const small=matchMedia('(max-width:700px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const replay=document.getElementById('replay-steps');
  const header=document.querySelector('.site-header');
  let feet=[];
  let paintFrame=0;
  let layoutFrame=0;

  function stamp(foot,delay=0){FootstepMotion.stamp(foot,delay,reduced.matches);}
  function paintWalk(animate=true) {
    paintFrame=0;
    const bounds=journey.getBoundingClientRect();
    const cursor=Math.max(0,innerHeight*.62-bounds.top);
    let order=0;
    feet.forEach(foot=>{
      if(foot.y>=cursor||foot.walked)return;
      const visible=foot.y+bounds.top>85;
      if(animate&&visible)stamp(foot,order++*95);
      else{foot.walked=true;foot.node.classList.add('is-walked');}
    });
    header.style.setProperty('--walk-progress',Math.min(1,cursor/Math.max(1,journey.clientHeight-innerHeight*.3)));
    let active=chapters[0];
    chapters.forEach(chapter=>{if(chapter.getBoundingClientRect().top<innerHeight*.48)active=chapter;});
    chapters.forEach(chapter=>chapter.classList.toggle('is-current',chapter===active));
    navigation.forEach(link=>{
      if(link.dataset.nav===active.dataset.chapter)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function drawTrail() {
    layoutFrame=0;
    const bounds=journey.getBoundingClientRect();
    const width=journey.clientWidth;
    const height=journey.clientHeight;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const anchors=chapters.map(chapter=>{
      const rect=chapter.querySelector('.trail-anchor').getBoundingClientRect();
      return {x:rect.left-bounds.left,y:rect.top-bounds.top};
    });
    const first=anchors[0];
    let d=small.matches ? `M${first.x+3} 8C${first.x-10} 65 ${first.x+14} ${first.y-85} ${first.x} ${first.y}` : `M${first.x+30} 18C${first.x+65} 110 ${first.x-40} ${first.y-115} ${first.x} ${first.y}`;
    for(let i=1;i<anchors.length;i++){
      const a=anchors[i-1],b=anchors[i];
      const gap=b.y-a.y;
      const bend=small.matches ? (i%2?17:-16) : (i%2?165:-170);
      d+=`C${a.x+bend} ${a.y+gap*.42} ${b.x-bend} ${b.y-gap*.4} ${b.x} ${b.y}`;
    }
    const last=anchors[anchors.length-1];
    d+=small.matches ? `C${last.x+10} ${last.y+80} 18 ${height-140} 26 ${height-90}` : `C${last.x-25} ${last.y+100} ${width*.54} ${height-180} ${width*.55} ${height-140}`;
    route.setAttribute('d',d);
    const drawn=FootstepMotion.create(route,small.matches?{step:55,spread:4,size:1.35}:{});
    feet=drawn.feet;footprints.replaceChildren(drawn.fragment);
    paintWalk(false);
  }
  function queueLayout(){if(!layoutFrame)layoutFrame=requestAnimationFrame(drawTrail);}
  new ResizeObserver(queueLayout).observe(journey);
  addEventListener('resize',queueLayout,{passive:true});
  addEventListener('scroll',()=>{if(!paintFrame)paintFrame=requestAnimationFrame(paintWalk);},{passive:true});
  document.querySelectorAll('.chapter-notes').forEach(detail=>detail.addEventListener('toggle',queueLayout));
  document.querySelectorAll('.chapter-visual img').forEach(img=>img.addEventListener('load',queueLayout));
  document.fonts.ready.then(queueLayout);
  replay.addEventListener('click',()=>{
    const top=journey.getBoundingClientRect().top;
    const visible=feet.filter(foot=>foot.y+top>90&&foot.y+top<innerHeight-25);
    visible.forEach((foot,index)=>stamp(foot,index*150));
  });
  document.querySelectorAll('.scene-button').forEach(button=>{
    let reset;
    button.addEventListener('click',()=>{
      clearTimeout(reset);
      button.classList.remove('is-greeting');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        button.classList.add('is-greeting');
        reset=setTimeout(()=>button.classList.remove('is-greeting'),1900);
      }));
    });
  });
  reduced.addEventListener('change',()=>{
    if(reduced.matches)feet.forEach(foot=>[foot.sole,foot.dust].forEach(node=>node.getAnimations().forEach(animation=>animation.cancel())));
  });
  drawTrail();
})();
