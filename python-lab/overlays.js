import {esc,icon} from './ui.js';

// One native dialog keeps keyboard focus inside the active window.
export function createOverlay(dialog){
 let opener=null;
 dialog.setAttribute('aria-labelledby','modal-title');
 dialog.addEventListener('close',()=>{
  if(dialog.open)return;
  document.documentElement.classList.remove('overlay-open');
  dialog.dispatchEvent(new Event('overlay:closed'));
  (opener?.isConnected?opener:document.querySelector('#main'))?.focus({preventScroll:true});
  opener=null;
 });
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const box=dialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
 });
 return function modal(title,body,options={}){
  const wasOpen=dialog.open;
  if(!wasOpen)opener=document.activeElement;
  const previous=wasOpen&&dialog.contains(document.activeElement)?document.activeElement:null;
  const focusKey=previous?.dataset;
  const focusId=previous?.id;
  dialog.dispatchEvent(new Event('overlay:change'));
  dialog.className='overlay '+(options.kind?'overlay-'+options.kind:'');
  dialog.dataset.lessonPanel=options.lessonPanel||'';
  dialog.innerHTML=`<div class="modal-inner"><header class="modal-top"><div><p class="eyebrow">${esc(options.kicker||'ТИХИЙ КОД · ТВОЙ ВЕЧЕР')}</p><h2 id="modal-title" tabindex="-1">${esc(title)}</h2></div><button class="icon-btn modal-close" data-action="close-modal" aria-label="Закрыть окно">${icon('x')}</button></header><div class="modal-scroll">${body}</div></div>`;
  document.documentElement.classList.add('overlay-open');
  if(!wasOpen)dialog.showModal();
  const candidates=[...dialog.querySelectorAll('button,a,input,textarea,select')];
  const target=wasOpen?candidates.find(el=>!el.disabled&&(focusId?el.id===focusId:focusKey?.action&&el.dataset.action===focusKey.action&&el.dataset.id===focusKey.id&&el.dataset.topic===focusKey.topic)):null;
  (target||dialog.querySelector('#modal-title')).focus({preventScroll:true});
 };
}
