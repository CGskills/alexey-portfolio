import {esc} from './ui.js';
const svg=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export const inputIcon=svg('<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m7 8 3 3-3 3m6 0h4"/>');
const keyboardIcon=svg('<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h1m4 0h1m4 0h1M6 12h1m4 0h1m4 0h1M7 16h10"/>');
const groups=[
 ['Частые',[['input()','Ввод с диалогом','input("")',7],['print()','Вывести значение','print()',6],['    ','Отступ'],['\n','Новая строка'],[':','Двоеточие'],['=','Присвоить'],['(','Круглые скобки'],['"','Двойные кавычки'],["'",'Одинарные кавычки'],[',','Запятая'],['#','Комментарий']]],
 ['Скобки и знаки',[['(','Открыть круглую'],[')','Закрыть круглую'],['[','Открыть квадратную'],[']','Закрыть квадратную'],['{','Открыть фигурную'],['}','Закрыть фигурную'],['"','Двойная кавычка'],["'",'Одинарная кавычка'],['"""','Многострочная строка'],["'''",'Многострочная строка'],[':','Двоеточие'],[',','Запятая'],['.','Точка'],[';','Точка с запятой'],['#','Комментарий'],['\\','Обратная косая'],['->','Аннотация результата'],['...','Ellipsis'],['\n','Новая строка'],['    ','Отступ']]],
 ['Арифметика',[['+','Сложить'],['-','Вычесть'],['*','Умножить'],['/','Разделить'],['//','Целое деление'],['%','Остаток'],['**','Степень'],['@','Матричное умножение']]],
 ['Сравнение',[['==','Равно'],['!=','Не равно'],['<','Меньше'],['>','Больше'],['<=','Не больше'],['>=','Не меньше']]],
 ['Логика',[['and','И',' and '],['or','Или',' or '],['not','Не','not '],['in','Входит в',' in '],['not in','Не входит',' not in '],['is','Тот же объект',' is '],['is not','Другой объект',' is not '],['True','Истина'],['False','Ложь'],['None','Нет значения']]],
 ['Присваивание',['=','+=','-=','*=','/=','//=','%=','**=','@=','&=','|=','^=','>>=','<<=',':='].map(s=>[s,s===':='?'Присвоить в выражении':'Присваивание '+s])],
 ['Битовые',[['&','Побитовое И'],['|','Побитовое ИЛИ'],['^','Исключающее ИЛИ'],['~','Инверсия'],['<<','Сдвиг влево'],['>>','Сдвиг вправо']]],
 ['Шаблоны',[['if','Условие','if :\n    pass',3],['else','Иначе','else:\n    pass'],['elif','Ещё условие','elif :\n    pass',5],['for','Цикл по элементам','for item in items:\n    pass'],['while','Цикл по условию','while :\n    pass',6],['def','Функция','def name():\n    pass',4],['class','Класс','class Name:\n    pass',6],['return','Вернуть значение','return '],['try / except','Обработать ошибку','try:\n    pass\nexcept ValueError:\n    pass'],['with','Контекст','with :\n    pass',5],['import','Импорт','import '],['from','Импорт из модуля','from module import name'],['lambda','Лямбда','lambda x: x'],['async def','Асинхронная функция','async def name():\n    pass'],['await','Дождаться','await '],['assert','Проверить условие','assert '],['raise','Вызвать ошибку','raise '],['yield','Выдать значение','yield '],['break','Выйти из цикла'],['continue','Следующий шаг'],['pass','Пустой блок'],['del','Удалить','del '],['global','Глобальное имя','global '],['nonlocal','Внешнее имя','nonlocal '],['match','Выбор варианта','match value:\n    case _:\n        pass']]]
];
export function pythonTools(){return `<details class="python-tools"><summary>${keyboardIcon}<span>Символы и операторы</span><span class="tools-summary-note">Python · быстрый ввод</span></summary><div class="tools-body"><label>Найти символ или действие<input type="search" class="tools-search" placeholder="Например: деление, !=, input" autocomplete="off"></label><div class="tools-tabs" role="group" aria-label="Группы символов">${groups.map(([name],i)=>`<button type="button" data-tool-group="${i}" aria-pressed="${i===0}">${name}</button>`).join('')}</div><div class="tools-grid"></div><p class="tools-feedback" role="status">Вставка в позицию курсора. Код остаётся на месте.</p></div></details>`;}
export function bindPythonTools(root,insert){
 const panel=root.querySelector('.python-tools');if(!panel)return;
 const grid=panel.querySelector('.tools-grid'),search=panel.querySelector('input');let group=0;
 const render=()=>{
  const query=search.value.trim().toLocaleLowerCase();
  const entries=query?groups.flatMap(g=>g[1]).filter(([key,label])=>`${key} ${label}`.toLocaleLowerCase().includes(query)):groups[group][1];
  const unique=[...new Map(entries.map(e=>[e[0],e])).values()];grid.replaceChildren();
  for(const [key,label,text=key,cursor] of unique){
   const button=document.createElement('button');button.type='button';button.className='tool-key';button.setAttribute('aria-label',`${label}: ${key==='\n'?'Enter':key==='    '?'Tab':key}`);
   button.innerHTML=`<code>${esc(key==='\n'?'↵':key==='    '?'Tab':key)}</code><span>${esc(label)}</span>`;
   button.onpointerdown=e=>e.preventDefault();
   button.onclick=()=>{insert(text,cursor);panel.querySelector('.tools-feedback').textContent=`Вставлено: ${label}. Можно продолжать код.`;};grid.append(button);
  }
  if(!unique.length)grid.textContent='Ничего не найдено. Попробуй название или сам символ.';
 };
 panel.querySelectorAll('[data-tool-group]').forEach(button=>button.onclick=()=>{group=Number(button.dataset.toolGroup);search.value='';panel.querySelectorAll('[data-tool-group]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});
 search.oninput=render;render();
}

