/* Shared material and motion for the story and its horizontal motion card. */
(() => {
  'use strict';
  const ns='http://www.w3.org/2000/svg';
  function stamp(foot,delay=0,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches){
    foot.walked=true;
    foot.node.classList.add('is-walked');
    if(reduced)return;
    foot.sole.getAnimations().forEach(animation=>animation.cancel());
    foot.dust.getAnimations().forEach(animation=>animation.cancel());
    foot.sole.animate([
      {transform:'translateY(-7px) scale(1.35)',opacity:0},
      {transform:'translateY(0) scale(.86,1.1)',opacity:1,offset:.5},
      {transform:'scale(1)',opacity:1}
    ],{duration:420,delay,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
    foot.dust.animate([
      {transform:'scale(.5)',opacity:0},
      {transform:'scale(1)',opacity:.5,offset:.4},
      {transform:'scale(1.9)',opacity:0}
    ],{duration:520,delay:delay+120,easing:'ease-out'});
  }
  function create(route,{step=70,spread=8,size=1.8}={}){
    const total=route.getTotalLength(),fragment=document.createDocumentFragment(),feet=[];
    for(let at=10,index=0;at<total;at+=step,index++){
      const point=route.getPointAtLength(at);
      const ahead=route.getPointAtLength(Math.min(total,at+2));
      const angle=Math.atan2(ahead.y-point.y,ahead.x-point.x)*180/Math.PI+90;
      const lateral=index%2?spread:-spread;
      const node=document.createElementNS(ns,'g');
      node.classList.add('footprint');
      node.setAttribute('transform',`translate(${point.x},${point.y}) rotate(${angle+(index%2?6:-6)}) translate(${lateral},0) scale(${index%2?-size:size},${size})`);
      const sole=document.createElementNS(ns,'path');
      sole.setAttribute('d','M-1-7C-4-7-5-4-4-1L-3 3Q0 4 3 2L4-1C5-5 2-8-1-7ZM-2.5 4.5L2.5 4Q3 8 0 8.5Q-3 9-2.5 4.5Z');
      const dust=document.createElementNS(ns,'ellipse');
      dust.classList.add('step-dust');dust.setAttribute('rx','6');dust.setAttribute('ry','9');
      node.append(dust,sole);fragment.append(node);feet.push({node,sole,dust,y:point.y,walked:false});
    }
    return {fragment,feet};
  }
  window.FootstepMotion={create,stamp};
})();
