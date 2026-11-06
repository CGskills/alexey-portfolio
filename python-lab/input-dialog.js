import {inputIcon} from './python-tools.js';
let setup;
async function controller() {
  if (!('serviceWorker' in navigator)) throw Error('Этот браузер не поддерживает диалог ввода. Открой сайт в современном браузере.');
  await navigator.serviceWorker.register(new URL('./input-sw.js',import.meta.url),{scope:'./',updateViaCache:'none'});
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve,reject) => {
    const timer=setTimeout(()=>reject(Error('Не удалось подготовить ввод. Обнови страницу и повтори запуск.')),10000);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve();},{once:true});
  });
}
export async function openInputSession({onWaiting,onAnswer,onCancel}) {
  await (setup ||= controller().catch(error=>{setup=null;throw error;}));
  const channel=crypto.randomUUID();
  await new Promise((resolve,reject)=>{
    const ports=new MessageChannel();
    const timer=setTimeout(()=>{ports.port1.close();reject(Error('Не удалось подключить ввод. Повтори запуск.'));},10000);
    ports.port1.onmessage=()=>{clearTimeout(timer);ports.port1.close();resolve();};
    navigator.serviceWorker.controller.postMessage({type:'input-open',channel},[ports.port2]);
  });
  let dialog,closed=false;
  return {channel,
    request(data) {
      if(closed)return;
      onWaiting();
      dialog?.remove();
      dialog=document.createElement('dialog');
      dialog.className='python-input-dialog';
      dialog.setAttribute('aria-labelledby','python-input-title');
      dialog.setAttribute('aria-describedby','python-input-help');
      dialog.innerHTML=`<form><div class="input-dialog-heading">${inputIcon}<span>ДИАЛОГ С ПРОГРАММОЙ</span><span class="input-count"></span></div><h2 id="python-input-title">Твой ход</h2><p id="python-input-help">Python ждёт ответ. Введи значение и продолжай эксперимент.</p><label for="python-answer" class="input-question"></label><input id="python-answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="10000" autofocus><p class="input-caption">Enter — продолжить · пустая строка тоже допустима</p><div class="input-dialog-actions"><button type="button" class="btn secondary" data-cancel>Остановить</button><button type="submit" class="btn">Передать в программу <span aria-hidden="true">↵</span></button></div><p class="input-safety">Код сохранён. Можно не торопиться.</p></form>`;
      dialog.querySelector('.input-count').textContent=`Ввод ${data.number}`;
      dialog.querySelector('.input-question').textContent=data.prompt || 'Введи значение для input()';
      document.body.append(dialog);
      const cancel=()=>{this.close();onCancel();};
      dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
      dialog.querySelector('[data-cancel]').onclick=cancel;
      dialog.querySelector('form').onsubmit=event=>{
        event.preventDefault();
        if(closed||!dialog.open)return;
        const value=dialog.querySelector('input').value;
        dialog.close();dialog.remove();dialog=null;
        onAnswer();
        navigator.serviceWorker.controller.postMessage({type:'input-answer',channel,request:data.request,value});
      };
      dialog.showModal();dialog.querySelector('input').focus();
    },
    close(){if(closed)return;closed=true;dialog?.close();dialog?.remove();dialog=null;navigator.serviceWorker.controller?.postMessage({type:'input-close',channel});}
  };
}

