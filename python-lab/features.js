import {musicPanel} from './music-view.js';
import {tracks,musicTime,validTrack} from './music.js';
import {achievements,achievementDetail,nookView} from './collections.js';
import {totals} from './state.js';
import {lessons} from './curriculum.js';
import {shop} from './ui.js';
import {automationBoard,registerView} from './cafe-world.js';
import {createCafeRegister} from './cafe-register.js';
import {esc,icon,highlight} from './ui.js';
import {library,libraryCards} from './learning.js';
import {cafeView,cafePanelContent,characters,dialogue,cafeOrders,brewView} from './cafe.js';

export function createFeatures(ctx){
 const {getState,persist,modal,toast,applyTypography,toggleSound,getEditor,saveDraft,getPage,music}=ctx;
 const $=s=>document.querySelector(s);
 const register=createCafeRegister(getState);
 const close=()=>$('#dialog').close();
 const renderCafe=()=>{register.stop();if(getPage()==='cafe')$('#main').innerHTML=cafeView(getState());};
 $('#dialog').addEventListener('overlay:change',register.stop);
 $('#dialog').addEventListener('overlay:closed',register.stop);
 function openCafePanel(id){
  const names={orders:'Задачи нашей кофейни',register:'Касса «Переплёта»',systems:'Кофейня учится вместе с тобой',menu:'За стойкой у Миры'};
  if(!names[id])return;
  const state=getState();let body;
  if(id==='systems')body=automationBoard(state);
  else if(id==='register')body=registerView(state);
  else body=cafePanelContent(state,id);
  modal(names[id],'<div class="cafe-panel-body">'+body+'</div>',{kind:'panel',kicker:'КОФЕЙНЯ «ПЕРЕПЛЁТ»'});
 }
 function talk(id,topic=null){modal('Разговор за чашкой кофе',dialogue(id,topic,getState()),{kind:'conversation',kicker:'КОФЕЙНЯ «ПЕРЕПЛЁТ»'});}
 async function copy(text){try{await navigator.clipboard.writeText(text);toast('Код скопирован.');}catch{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.append(el);el.select();const ok=document.execCommand('copy');el.remove();toast(ok?'Код скопирован.':'Не удалось скопировать. Выдели код вручную.');}}
 function settings(){const state=getState(),p=state.settings;modal('Твой ритм',`<div class="settings-section"><h3>Текст и редактор</h3><label class="setting-field">Размер текста уроков <output id="read-size-label">${p.readSize}px</output><input type="range" id="read-size" min="14" max="22" value="${p.readSize}"></label><label class="setting-field">Шрифт уроков<select id="reader-font">${[['manrope','Manrope — привычный'],['system','Системный — простой'],['lora','Lora — книжный']].map(([id,title])=>`<option value="${id}" ${p.readerFont===id?'selected':''}>${title}</option>`).join('')}</select></label><label class="setting-field">Размер кода <output id="code-size-label">${p.codeSize}px</output><input type="range" id="code-size" min="14" max="26" value="${p.codeSize}"></label><label class="setting-field">Шрифт кода<select id="code-font">${[['mono','Моноширинный'],['consolas','Consolas'],['courier','Courier New']].map(([id,title])=>`<option value="${id}" ${p.codeFont===id?'selected':''}>${title}</option>`).join('')}</select></label><p class="setting-preview">Так будет выглядеть объяснение. Читай в удобном для себя размере.</p></div><div class="settings-music-card"><span>${icon('music')}</span><div><h3>Музыка твоего вечера</h3><p>Четыре мелодии · громкость · плейлист</p></div><button class="btn secondary" data-action="music-settings">Открыть плеер</button></div><div class="setting-row"><div><strong>Плавная анимация</strong><p>Параллакс, персонажи и жизнь за окном.</p></div><input id="motion-check" type="checkbox" aria-label="Плавная анимация" ${p.motion?'checked':''}></div><div class="setting-row"><div><strong>Мой вечерний ритуал</strong><p>${state.session} минут без спешки и штрафов.</p></div><button class="text-btn" data-action="session">Изменить</button></div><p class="setting-note">Прогресс, код, настройки и заметки хранятся в этом браузере. Для другого устройства скачай файл и загрузи его здесь. При очистке данных браузера сохранение исчезнет.</p><div class="backup-actions"><button class="btn secondary" data-action="export">${icon('download')}Скачать прогресс</button><button class="btn secondary" data-action="import">Загрузить прогресс</button></div>`);}
 function musicSettings(){modal('Музыка для твоего вечера',musicPanel(getState(),music),{kind:'music',kicker:'ПЕРЕПЛЁТ · ПРОИГРЫВАТЕЛЬ'});syncMusicUI();}
 function syncMusicUI(){
  const state=getState(),track=tracks.find(t=>t.id===validTrack(state.settings.track));
  if(!$('#now-playing'))return;
  $('#now-playing').textContent=track.title;
  $('#playback-status').textContent=state.settings.sound?'Сейчас играет':'Музыка на паузе';
  const play=$('[data-action="music-toggle"]');if(play)play.innerHTML=icon(state.settings.sound?'stop':'play')+'<span>'+(state.settings.sound?'Пауза':'Слушать')+'</span>';
  $('.record')?.classList.toggle('spinning',state.settings.sound);
  document.querySelectorAll('[data-action="music-select"]').forEach(b=>{const selected=b.dataset.id===track.id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  syncMusicTime();
 }
 function syncMusicTime(){if(!$('#music-seek'))return;const track=tracks.find(t=>t.id===validTrack(getState().settings.track));const duration=music.track===track.id&&Number.isFinite(music.audio?.duration)?music.audio.duration:track.duration;const elapsed=music.track===track.id?music.audio?.currentTime||0:0;$('#music-elapsed').textContent=musicTime(elapsed);$('#music-duration').textContent=musicTime(duration);$('#music-seek').max=String(Math.floor(duration));if(document.activeElement!==$('#music-seek'))$('#music-seek').value=String(Math.floor(elapsed));}
 function chooseTrack(id){getState().settings.track=validTrack(id);persist();toggleSound(true);syncMusicUI();}
 function filterLibrary(){if(!$('#library-results'))return;const state=getState();const query=($('#library-search')?.value||'').toLocaleLowerCase('ru').replace(/ё/g,'е').trim(),filter=$('#library-filter')?.value||'Все материалы';const items=library.filter(a=>(filter==='Все материалы'||filter==='Избранное'&&state.bookmarks.includes(a.id)||a.category===filter)&&[a.title,a.summary,...a.sections.flat()].join(' ').toLocaleLowerCase('ru').replace(/ё/g,'е').includes(query));$('#library-results').innerHTML=libraryCards(items,state);$('#library-count').textContent=`Найдено материалов: ${items.length}`;}
 document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,id=el.dataset.id,state=getState();switch(action){
 case 'music-settings':musicSettings();break;
 case 'music-toggle':toggleSound();break;
 case 'music-select':chooseTrack(id);break;
 case 'music-prev':case 'music-next':music.track=validTrack(state.settings.track);music.setMode(state.settings.musicMode);chooseTrack(music.next(action==='music-prev'?-1:1));break;
 case 'achievement':{const a=achievements(state).find(a=>a.id===id);if(a)modal(a.title,achievementDetail(a),{kind:'achievement',kicker:'КОЛЛЕКЦИЯ ДОСТИЖЕНИЙ'});break;}
 case 'toggle-decor':if(state.purchases.includes(id)){state.hiddenDecor??=[];state.hiddenDecor=state.hiddenDecor.includes(id)?state.hiddenDecor.filter(x=>x!==id):[...state.hiddenDecor,id];persist();$('#main').innerHTML=nookView(state,totals(state,lessons,shop));}break;
 case 'cafe-panel':openCafePanel(id);break;
 case 'cafe-checkout':register.run();break;
 case 'copy-example':{const article=library.find(a=>a.id===id);if(article)copy(article.code);break;}
 case 'book-practice':{const article=library.find(a=>a.id===id&&a.practiceCode);if(!article)break;saveDraft();if(state.drafts.sandbox&&state.drafts.sandbox!==article.practiceCode)state.sandboxBackup=state.drafts.sandbox;state.drafts.sandbox=article.practiceCode;state.inputs.sandbox='';persist();location.hash='sandbox';toast('Заполни пропуск и запусти код. Проверки assert уже в шаблоне.');break;}
 case 'open-example':{const article=library.find(a=>a.id===id);if(!article)break;saveDraft();if(state.drafts.sandbox&&state.drafts.sandbox!==article.code)state.sandboxBackup=state.drafts.sandbox;state.drafts.sandbox=article.code;state.inputs.sandbox=article.input||'';persist();location.hash='sandbox';toast('Пример открыт. Предыдущий черновик песочницы сохранён.');break;}
 case 'restore-sandbox':if(state.sandboxBackup){const current=getEditor().getValue();getEditor().setValue(state.sandboxBackup);state.sandboxBackup=current;persist();toast('Предыдущий черновик возвращён.');}break;
 case 'bookmark':{const index=state.bookmarks.indexOf(id);if(index>=0)state.bookmarks.splice(index,1);else state.bookmarks.push(id);persist();el.innerHTML=icon('book')+(index>=0?'В избранное':'В избранном');break;}
 case 'talk':if(characters[id]){if(!state.cafe.spoken.includes(id))state.cafe.spoken.push(id);persist();talk(id);}break;
 case 'talk-topic':if(characters[id])talk(id,Number(el.dataset.topic));break;
 case 'show-orders':openCafePanel('orders');break;
 case 'choose-seat':if(['window','shared'].includes(id)){state.cafe.seat=id;persist();renderCafe();modal(id==='window'?'Твой столик у окна':'За одним столом с Асей',`<p class="dialogue-text">${id==='window'?'Нина убрала карандаши и подвинула лампу. Теперь здесь твоё место. Можно спокойно открыть первую главу.':'Ася повернула ноутбук: «Давай разберём одну функцию. Ты выбираешь темп, я помогу с объяснениями».'}</p><a class="btn" data-action="close-modal" href="#library/${id==='window'?'guide-start':'guide-functions'}">Открыть книгу</a>`);}break;
 case 'cafe-books':modal('Полка Льва',`<p class="muted">Выбери, что хочется понять сегодня.</p><div class="dialogue-choices"><a href="#library" data-action="close-modal" class="btn">Вся библиотека</a><a href="#library/lib-decimal" data-action="close-modal" class="btn secondary">Decimal — деньги без сюрпризов</a><a href="#library/lib-datetime" data-action="close-modal" class="btn secondary">datetime — календарь</a><a href="#library/guide-for" data-action="close-modal" class="btn secondary">Циклы — ещё раз с самого начала</a></div>`);break;
 case 'cafe-weather':state.cafe.weather=state.cafe.weather==='rain'?'evening':'rain';persist();renderCafe();toast(state.cafe.weather==='rain'?'За окном пошёл дождь. Внутри тепло.':'Облака разошлись. Вечерний свет снова с нами.');break;
 case 'pet-cat':if(!state.cafe.spoken.includes('cat'))state.cafe.spoken.push('cat');persist();modal('Семён тоже занят',`<p class="dialogue-text">Мр-р. Семён потянулся, устроился рядом с твоей чашкой и закрыл глаза. Не все задачи нужно решать сразу.</p><button class="btn" data-action="close-modal">Немного посидим вместе ${icon('cup')}</button>`);break;
 case 'take-order':{const order=cafeOrders.find(o=>o.lesson===id);if(!order||state.cafe.served.includes(id)||state.cafe.order===id)break;state.cafe.order=id;state.cafe.ready=state.done.includes(id)?id:'';persist();renderCafe();openCafePanel('orders');toast(state.cafe.ready?'Задача уже решена. Можно передать результат Мире.':'Заказ принят. Реши задачу и вернись к Мире.');break;}
 case 'serve-order':{const order=cafeOrders.find(o=>o.lesson===state.cafe.order);if(!order||state.cafe.ready!==order.lesson)break;if(!state.cafe.served.includes(order.lesson))state.cafe.served.push(order.lesson);state.cafe.order='';state.cafe.ready='';persist();renderCafe();modal('Заказ готов',`<p class="eyebrow">${esc(order.guest)}</p><p class="dialogue-text">${esc(order.reply)}</p><p class="setting-note">Готовых заказов: ${state.cafe.served.length} из ${cafeOrders.length}. Опыт за урок уже начислен; повторное обслуживание не создаёт лишних наград.</p><button class="btn" data-action="close-modal">Вернуться в кофейню</button>`);break;}
 case 'brew':modal('Чашка для тебя',brewView(state));break;
 case 'choose-drink':if(['кофе','чай','какао'].includes(id)){state.cafe.drink=id;state.cafe.brewStep=0;persist();modal('Чашка для тебя',brewView(state));}break;
 case 'brew-step':state.cafe.brewStep=state.cafe.brewStep===3?0:state.cafe.brewStep+1;persist();modal('Чашка для тебя',brewView(state));break;
 }});
 document.addEventListener('change',event=>{const state=getState();if(event.target.id==='reader-font'){state.settings.readerFont=event.target.value;applyTypography();persist();}if(event.target.id==='code-font'){state.settings.codeFont=event.target.value;applyTypography();persist();}if(event.target.id==='music-mode'){state.settings.musicMode=event.target.value;music.setMode(event.target.value);persist();}if(event.target.id==='music-background'){state.settings.pauseHidden=event.target.checked;persist();}if(event.target.id==='music-seek')music.seek(Number(event.target.value));if(event.target.id==='music-track'){state.settings.track=event.target.value;persist();if(state.settings.sound)toggleSound(true);}if(event.target.id==='library-filter')filterLibrary();});
 document.addEventListener('input',event=>{const state=getState();if(event.target.id==='library-search')filterLibrary();if(event.target.id==='read-size'){state.settings.readSize=Number(event.target.value);$('#read-size-label').textContent=event.target.value+'px';applyTypography();persist();}if(event.target.id==='code-size'){state.settings.codeSize=Number(event.target.value);$('#code-size-label').textContent=event.target.value+'px';applyTypography();persist();}if(event.target.id==='music-volume'){state.settings.volume=Number(event.target.value);$('#volume-label').textContent=event.target.value+'%';music.volume(state.settings.volume);persist();}});
 return {settings,copy,filterLibrary,syncMusicUI,syncMusicTime};
}
