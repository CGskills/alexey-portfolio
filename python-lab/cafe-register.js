import {lessons} from './curriculum.js';

export function checkoutProgram(source,drink,count){
 if(!['кофе','чай','какао'].includes(drink)||!Number.isInteger(count)||count<1||count>20)throw Error('Выбери от 1 до 20 чашек.');
 if(typeof source!=='string'||!source.trim())throw Error('Открой задание по кассе и ещё раз проверь свой код.');
 const items=JSON.stringify(Array(count).fill(drink));
 return `${source}\n\n# Заказ из кофейни\n_cafe_amount = checkout(${items}, {"кофе": 180, "чай": 120, "какао": 200})\nprint("__CAFE_RECEIPT__" + str(_cafe_amount))\n`;
}
export function receiptAmount(result){
 if(result.error)throw Error(`Касса не смогла выполнить код: ${result.error.message}`);
 if(!result.tests?.length||!result.tests.every(t=>t.passed))throw Error('Этот черновик не прошёл проверку кассы. Вернись к заданию и проверь функцию checkout.');
 const match=result.output.match(/(?:^|\n)__CAFE_RECEIPT__(\d+(?:\.\d+)?)\s*$/);
 if(!match||!Number.isFinite(Number(match[1])))throw Error('Касса должна вернуть числовую стоимость заказа. Проверь функцию checkout.');
 return Number(match[1]);
}
export function createCafeRegister(getState){
 let worker=null,timer=null,sequence=0;
 const stop=()=>{sequence++;clearTimeout(timer);worker?.terminate();worker=null;};
 window.addEventListener('hashchange',stop);
 return {
  stop,
  run(){
   if(worker)return;
   const state=getState(),receipt=document.querySelector('#cafe-receipt'),button=document.querySelector('[data-action="cafe-checkout"]');
   if(!receipt||!button||!state.done.includes('j12'))return;
   const drink=document.querySelector('#register-drink').value,count=Number(document.querySelector('#register-count').value);
   let code;
   try{code=checkoutProgram(state.checkedCode?.j12||state.drafts.j12,drink,count);}catch(e){receipt.textContent=e.message;return;}
   const token=++sequence;
   const finish=(text,error=false)=>{if(token!==sequence)return;receipt.textContent=text;receipt.classList.toggle('receipt-error',error);button.disabled=false;button.textContent='Рассчитать ещё один чек';stop();};
   button.disabled=true;receipt.classList.remove('receipt-error');receipt.textContent='Открываем кассу · загружаем Python…';
   timer=setTimeout(()=>finish('Касса не успела загрузиться. Попробуй ещё раз — твой код сохранён.',true),45000);
   try{worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});}catch{finish('Не удалось открыть Python. Попробуй перезагрузить страницу.',true);return;}
   worker.onmessage=({data})=>{
    if(token!==sequence)return;
    if(data.type==='ready'){
     clearTimeout(timer);timer=setTimeout(()=>finish('Выполнение остановлено по времени. Проверь циклы в своей кассе.',true),10000);
     receipt.textContent='Твоя функция checkout считает заказ…';
     worker.postMessage({type:'run',id:token,code,input:'',checks:lessons.find(l=>l.id==='j12').checks,trace:false});
    }else if(data.type==='result'){
     try{const total=receiptAmount(data.result);finish(`${drink[0].toUpperCase()+drink.slice(1)} × ${count}\nИтого: ${total.toLocaleString('ru-RU')} ₽\nРассчитано твоим Python-кодом. Заказ готов!`);}catch(e){finish(e.message,true);}
    }else if(data.type==='init-error'||data.type==='error')finish('Не удалось выполнить код кассы. Открой задание и проверь решение.',true);
   };
   worker.onerror=()=>finish('Python остановился. Код сохранён, попробуй ещё раз.',true);
  }
 };
}
