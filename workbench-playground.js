'use strict';
const $=id=>document.getElementById(id);
const names={all:'任务流转',communication:'沟通模块',collection:'采集模块',testing:'测试模块',audit:'审计模块',history:'工作记录'};
const tasks=[
 {title:'整理一份新工具资料',module:'collection',owner:'知识库维护 Agent',description:'收到一份关于新工具的介绍。把适用场景、限制和来源整理清楚，交给下一步使用的人。',result:'已整理：适合用来快速验证小想法；正式使用前，还需要核实兼容性。保留资料来源，并把尚未验证的内容单独标记。'},
 {title:'把一个疑问交给下一位',module:'communication',owner:'产品沟通角色',description:'资料里提到“支持离线”，但没有说明哪些功能能离线使用。这次只交接一个明确的问题。',result:'已收到答复：基础编辑可以离线，在线协作需要网络。这条回复只解决本次疑问，不代表其他问题也已确认。'},
 {title:'复核刚改好的页面',module:'testing',owner:'测试执行角色',description:'页面刚调整了标题间距。请核对窄屏排版、按钮可读性，以及切换深色后文字是否清楚。',result:'演示检查清单：标题未遮挡；按钮文字清楚；深浅色均可读。这里是一份预置的示例回报，不是对真实产品的测试结论。'}
].map((task,index)=>({...task,id:index+1,state:0}));
let view='all',selected=null;
const events=[];
function render(){
 const counts=[0,0,0];tasks.forEach(task=>counts[task.state]++);
 ['pending-count','active-count','done-count'].forEach((id,i)=>$(id).textContent=counts[i]);
 $('modules').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
 $('breadcrumb').textContent=names[view];
 $('view-title').textContent=view==='all'?'让每一次交接都有着落。':view==='history'?'做过的事，都有迹可循。':names[view];
 $('history').hidden=view!=='history';$('board').hidden=view==='history';
 $('history-list').replaceChildren();
 if(!events.length){const item=document.createElement('li');item.textContent='还没有记录。先打开任务卡，完成一次交接。';$('history-list').append(item)}
 events.forEach(event=>{const item=document.createElement('li');item.textContent=event;$('history-list').append(item)});
 $('board').replaceChildren();
 const visible=tasks.filter(task=>view==='all'||task.module===view);
 if(!visible.length&&view!=='history'){$('board').innerHTML='<p class="all-empty">这次体验没有安排审计任务。<br>可以先去任务流转，试试桌上的三件小事。</p>'}
 else ['待交接','正在处理','已闭环'].forEach((label,state)=>{
  const column=document.createElement('section');column.className='column';column.dataset.dropState=state;column.setAttribute('aria-label',label);
  const members=visible.filter(task=>task.state===state);
  column.innerHTML='<h3>'+label+'<span>'+members.length+'</span></h3>';
  members.forEach(task=>{const card=document.createElement('button');card.type='button';card.className='task-card';card.innerHTML='<small>'+names[task.module]+' · DEMO / 0'+task.id+'</small>'+(state<2?'<span class="drag-grip" aria-hidden="true">⠿</span>':'')+'<strong>'+task.title+'</strong><span>'+task.owner+'<br>'+['点击查看，准备交接 ↗','点击查看演示回报 ↗','交接和回报已记录 ✓'][state]+'</span>';card.addEventListener('click',()=>{if(!card.dataset.dragUsed)openTask(task)});if(state<2)enableDrag(card,task);column.append(card)});
  if(!members.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=['暂时没有待交接任务','等你交接第一件事','完成的任务会留在这里'][state];column.append(empty)}
  $('board').append(column);
 });
 const finished=counts[2]===3;
 $('finish').hidden=!finished;
 $('guide-number').textContent=finished?'03 / 03':String(Math.min(counts[2]+1,3)).padStart(2,'0')+' / 03';
 $('guide-text').textContent=finished?'三件事都留下了记录。可以打开“工作记录”再看一眼。':counts[1]?'查看回报后再闭环。也可以拖住卡片右上角，试试交给下一列。':'点开卡片，或按住右上角的六个点拖给下一列。';
}
function enableDrag(card,task){
 card.addEventListener('pointerdown',event=>{
  if(!event.target.closest('.drag-grip')||event.button!==0)return;
  event.preventDefault();card.setPointerCapture(event.pointerId);
  const start={x:event.clientX,y:event.clientY};let ghost=null,target=null;
  const columns=[...$('board').querySelectorAll('.column')];
  const destination=columns.find(column=>Number(column.dataset.dropState)===task.state+1);
  destination.classList.add('drop-ready');
  $('drag-status').textContent='拖向“'+['待交接','正在处理','已闭环'][task.state+1]+'”，松手后确认。';
  function move(e){
   if(!ghost&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<6)return;
   if(!ghost){ghost=card.cloneNode(true);ghost.classList.add('drag-ghost');ghost.style.width=card.getBoundingClientRect().width+'px';ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;document.body.append(ghost);card.classList.add('dragging');card.dataset.dragUsed='true'}
   ghost.style.left=e.clientX+14+'px';ghost.style.top=e.clientY-24+'px';
   target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.column');
   columns.forEach(column=>column.classList.toggle('drop-over',column===target&&column===destination));
   const edge=65;if(e.clientY>innerHeight-edge)window.scrollBy(0,18);else if(e.clientY<edge)window.scrollBy(0,-18);
  }
  function finish(e){
   const accepted=e.type==='pointerup'&&ghost&&target===destination;
   ghost?.remove();card.classList.remove('dragging');columns.forEach(column=>column.classList.remove('drop-ready','drop-over'));
   card.removeEventListener('pointermove',move);card.removeEventListener('pointerup',finish);card.removeEventListener('pointercancel',finish);
   if(card.hasPointerCapture(event.pointerId))card.releasePointerCapture(event.pointerId);
   setTimeout(()=>delete card.dataset.dragUsed,0);
   $('drag-status').textContent=accepted?'位置选好了，确认后再流转。':'拖动只提出下一步，确认后才会流转。';
   if(accepted){dropSpark(e.clientX,e.clientY);openTask(task)}
  }
  card.addEventListener('pointermove',move);card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
 });
}
function dropSpark(x,y){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const burst=document.createElement('div');burst.className='drop-spark';burst.setAttribute('aria-hidden','true');
 for(let i=0;i<6;i++){const star=document.createElement('span');star.textContent='✦';const a=i*Math.PI/3;star.style.cssText='left:'+x+'px;top:'+y+'px;--dx:'+Math.cos(a)*45+'px;--dy:'+Math.sin(a)*45+'px';burst.append(star)}
 document.body.append(burst);setTimeout(()=>burst.remove(),650);
}
function openTask(task){
 selected=task;$('task-code').textContent='DEMO / 0'+task.id;$('task-module').textContent=names[task.module];$('task-title').textContent=task.title;$('task-description').textContent=task.description;$('task-owner').textContent=task.owner;
 $('result').hidden=task.state===0;$('result-text').textContent=task.result;$('confirm-result').checked=task.state===2;$('confirm-result').disabled=task.state===2;
 $('task-tip').textContent=['点击后，任务会进入“正在处理”。这次只演示交接，不会启动 Agent。','回报是预先写好的示例。看过以后，勾选确认，再把结果留下来。','这件事已经留在本次体验的工作记录里。'][task.state];
 $('task-action').textContent=['交给 '+task.owner+' →','确认回报，记录闭环 ✓','回到工作台'][task.state];$('task-action').disabled=task.state===1;
 if(!$('task-dialog').open)$('task-dialog').showModal();
}
$('confirm-result').addEventListener('change',()=>{$('task-action').disabled=!$('confirm-result').checked});
$('task-action').addEventListener('click',()=>{
 if(selected.state===2){$('task-dialog').close();return}
 if(selected.state===1&&!$('confirm-result').checked)return;
 selected.state++;events.push((selected.state===1?'交接':'闭环')+' · '+selected.title+' / '+selected.owner);
 $('task-dialog').close();render();$('drag-status').textContent='已记录这次流转。还可以拖动下一张卡片。';
});
$('close-task').addEventListener('click',()=>$('task-dialog').close());
$('modules').addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(button){view=button.dataset.view;render()}});
$('reset').addEventListener('click',()=>{tasks.forEach(task=>task.state=0);events.length=0;view='all';render();$('drag-status').textContent='拖动只提出下一步，确认后才会流转。'});
$('off-duty').addEventListener('click',()=>$('sleep-dialog').showModal());
$('wake-up').addEventListener('click',()=>$('sleep-dialog').close());
$('buddy-greet').addEventListener('click',()=>{const buddy=$('buddy-greet');buddy.classList.remove('greeting');void buddy.offsetWidth;buddy.classList.add('greeting');$('drag-status').textContent='xiaowho：少一些传话，多一些推进。今天也拜托你啦。'});
const portrait=$('desk-buddy');
const buddyLines=['我去倒杯水，交给你啦。','按住六个点，试试挪一张卡片。','看完回报，才算有了着落。','桌上的便签里，还有我踩过的坑。'];
let buddyLine=0;
portrait.addEventListener('click',()=>{
 buddyLine=(buddyLine+1)%buddyLines.length;
 $('buddy-speech').textContent=buddyLines[buddyLine];
 portrait.classList.remove('is-greeting');void portrait.offsetWidth;portrait.classList.add('is-greeting');
});
portrait.addEventListener('animationend',()=>portrait.classList.remove('is-greeting'));
const buddyVisibility=new IntersectionObserver(entries=>{entries.forEach(entry=>portrait.classList.toggle('is-awake',entry.isIntersecting))});
buddyVisibility.observe(portrait);
render();
