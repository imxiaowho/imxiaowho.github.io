/* EXE small-window layout. Wide browser views retain the original DOM. */
const desktopWide = matchMedia('(min-width:900px)');
if (!desktopWide.matches) document.documentElement.dataset.desktopShell = 'beta';
document.addEventListener('DOMContentLoaded', () => {
  const sidebar=document.querySelector('.sidebar'), brand=document.querySelector('.brand');
  if(!sidebar || !brand)return;
  const more=document.querySelector('#sidebar-more');
  const placements=[], shorts=[];
  function remember(node){
    if(!node)return null;
    const marker=document.createComment('desktop-original-position');
    node.before(marker);placements.push({node,marker});return node;
  }
  const actions=document.createElement('div');actions.className='desktop-brand-actions';actions.hidden=true;
  brand.append(actions);
  const search=remember(document.querySelector('#navigation [data-view="library"]'));
  search?.setAttribute('aria-label','资料检索');
  const moved=['attention','board','history'].map(view=>remember(document.querySelector('#navigation [data-view="'+view+'"]'))).filter(Boolean);
  remember(more);
  const menu=document.createElement('div');menu.className='desktop-more-list';
  const existing=more?[...more.querySelectorAll(':scope > button[data-view]')].map(remember):[];
  for(const button of sidebar.querySelectorAll('[data-view]')){
    const full=button.querySelector('.nav-text strong, .nav-label-text');
    const label=full?.textContent?.trim();if(!label)continue;
    const originalTitle=button.getAttribute('title');
    const short=label.endsWith('模块')?label.slice(0,-2):null;
    if(short){
      full.dataset.desktopFullLabel='1';
      const visual=document.createElement('span');visual.className='desktop-short-label';
      visual.setAttribute('aria-hidden','true');visual.textContent=short;visual.hidden=true;
      full.after(visual);shorts.push({button,full,visual,label,originalTitle});
    }
  }
  let compact=null;
  actions.addEventListener('click',event=>{
    const navigation=document.querySelector('#navigation');
    if(compact && event.target.closest('[data-view]') && navigation?.onclick) navigation.onclick.call(navigation,event);
  });
  function apply(){
    const next=!desktopWide.matches;
    if(compact===next)return;compact=next;
    if(next){
      document.documentElement.dataset.desktopShell='beta';actions.hidden=false;
      if(search)actions.append(search);
      if(more){actions.append(more);more.append(menu);for(const node of [...moved,...existing])menu.append(node);more.dataset.desktopExpanded='0';more.open=false;}
    }else{
      delete document.documentElement.dataset.desktopShell;
      for(const {node,marker} of placements)marker.after(node);
      menu.remove();actions.hidden=true;
      if(more){delete more.dataset.desktopExpanded;more.open=!!more.querySelector('.nav-item.active');}
    }
    for(const item of shorts){
      item.visual.hidden=!next;
      if(next)item.button.title=item.label;
      else if(item.originalTitle===null)item.button.removeAttribute('title');
      else item.button.title=item.originalTitle;
    }
  }
  if(more)more.addEventListener('click',event=>{
    if(!compact)return;
    if(event.target.closest('summary')){
      event.preventDefault();const open=more.dataset.desktopExpanded!=='1';
      more.dataset.desktopExpanded=open?'1':'0';more.open=open;
    }else if(event.target.closest('button[data-view]')){
      more.dataset.desktopExpanded='0';requestAnimationFrame(()=>{if(compact)more.open=false;});
    }
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape' || !compact || more?.dataset.desktopExpanded!=='1' ||
       document.querySelector('dialog[open], #workspace-menu:not([hidden])'))return;
    more.dataset.desktopExpanded='0';
    more.open=false;
    more.querySelector('summary').focus();
    event.preventDefault();
  });
  desktopWide.addEventListener('change',apply);
  apply();
});
