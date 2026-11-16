"use strict";
// Reuse the current switch guard without changing the TS/KS application bundle.
document.querySelector('.ops-switch-link[href="/workbench/ops.html"]')?.addEventListener('click',async event=>{
  event.preventDefault();
  closeWorkspaceMenu(true);
  if(inFlightMutations||busyActions||workspaceLoading){toast('请等待当前操作完成。',true);return;}
  const needsConfirmation=document.querySelector('dialog[open]')||batchSelected.size||closureReopenSelection.size;
  if(needsConfirmation&&!await confirmWorkspaceSwitch())return;
  if(inFlightMutations||busyActions||workspaceLoading){toast('请等待当前操作完成。',true);return;}
  window.location.assign('/workbench/ops.html');
});
