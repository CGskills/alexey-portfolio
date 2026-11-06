import {openInputSession} from '../input-dialog.js';
import {pythonTools,bindPythonTools} from '../python-tools.js';
import {esc} from '../ui.js';

export async function initLab(root) {
  const response = await fetch(new URL('./cases.json', import.meta.url));
  if (!response.ok) throw Error('Задания недоступны');
  const cases = await response.json();
  if (!root.isConnected) return;
  const get = name => root.querySelector('[data-' + name + ']');
  const select = root.querySelector('select'), editor = root.querySelector('textarea');
  editor.insertAdjacentHTML('afterend',pythonTools());
  bindPythonTools(root,(text,cursor)=>{if(editor.readOnly)return;const from=editor.selectionStart;editor.setRangeText(text,from,editor.selectionEnd,'end');if(cursor!==undefined)editor.setSelectionRange(from+cursor,from+cursor);editor.dispatchEvent(new Event('input'));editor.focus();});
  const key = 'pereplet.qa.lab.v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify(saved)); } catch {} };
  let inputSession, currentRun=0;
  let active, current = Math.max(0, cases.findIndex(c => c.id === saved.current)), timer;
  const item = () => cases[current];
  function finish() {
    currentRun++;inputSession?.close();inputSession=null;
    clearTimeout(timer);
    active?.terminate();
    active = null;
    editor.readOnly = false;
    get('run').disabled = false;
    get('stop').hidden = true;
  }
  function progress() {
    const done = cases.filter(c => saved[c.id]?.done).length;
    get('progress').textContent = 'Пройдено ' + done + ' из ' + cases.length;
    cases.forEach((c,i) => select.options[i].textContent = (saved[c.id]?.done ? '✓ ' : '') + (i+1) + '. ' + c.title);
  }
  function render() {
    finish();
    const c = item();
    for (const field of ['chapter','title','story','contract','theory','example','hint']) get(field).textContent = c[field];
    get('source').href = c.source;
    get('source').textContent = c.sourceTitle;
    root.querySelectorAll('details').forEach(d => d.open = false);
    select.selectedIndex = current;
    editor.value = saved[c.id]?.code ?? c.starter;
    get('result').textContent = saved[c.id]?.done ? 'Задание пройдено. Можно попробовать другой набор тестов.' : '';
    get('next').hidden = !saved[c.id]?.done || current === cases.length-1;
    saved.current = c.id;
    save(); progress();
  }
  cases.forEach(c => select.add(new Option(c.title, c.id)));
  select.onchange = () => { current = select.selectedIndex; render(); };
  get('next').onclick = () => { current++; render(); select.focus(); };
  editor.oninput = () => { const id = item().id; saved[id] = {...saved[id], code:editor.value}; save(); get('result').textContent = ''; };
  editor.onkeydown = event => {
    if (event.key !== 'Enter' || event.isComposing || editor.readOnly) return;
    const start = editor.selectionStart;
    const line = editor.value.slice(0,start).split('\n').pop();
    const indent = line.match(/^ */)[0] + (line.trimEnd().endsWith(':') ? '    ' : '');
    event.preventDefault();
    editor.setRangeText('\n' + indent,start,editor.selectionEnd,'end');
    editor.dispatchEvent(new Event('input'));
  };
  window.addEventListener('hashchange',()=>{if(!root.isConnected)finish();},{once:true});
  get('stop').onclick = () => { finish(); get('result').textContent = 'Запуск остановлен. Можно изменить тесты.'; };
  get('run').onclick = async () => {
    const c = item(), output = get('result');
    finish();
    editor.readOnly = true;
    get('run').disabled = true;
    get('stop').hidden = false;
    output.textContent = 'Загружаем Python…';
    const fail = message => { finish(); output.textContent = message; };
    const runToken=currentRun;
    try {
      inputSession=await openInputSession({onWaiting:()=>clearTimeout(timer),onAnswer:()=>{timer=setTimeout(()=>fail('Проверка остановлена через 10 секунд.'),10000);},onCancel:()=>fail('Запуск остановлен. Твои тесты сохранены.')});
      if(!root.isConnected||runToken!==currentRun){inputSession.close();return;}
      active = new Worker(new URL('./lab-worker.js', import.meta.url), {type:'module'});
      active.onerror = () => fail('Не удалось запустить Python. Повторите запуск.');
      const timeout = (ms, message) => { clearTimeout(timer); timer = setTimeout(() => fail(message), ms); };
      timeout(60000,'Python не успел загрузиться. Повторите запуск.');
      active.onmessage = ({data}) => {
        if(data.type==='input'){inputSession?.request(data);return;}
        if (data.ready) {
          output.textContent = 'Выполняем проверки…';
          timeout(10000,'Проверка остановлена через 10 секунд. Проверьте условия циклов.');
          return;
        }
        finish();
        if (data.error) { output.textContent = data.error; return; }
        const [reference, ...variants] = data.results;
        if (reference.invalid || !reference.passed) {
          output.innerHTML = '<strong>Проверьте тест на исправной версии</strong><pre>' + esc(reference.invalid || reference.detail) + '</pre>';
          return;
        }
        const passed = variants.length === c.bugs.length && variants.every(r => !r.invalid && !r.passed);
        output.innerHTML = '<strong>' + (passed ? 'Задание пройдено' : 'Набор можно усилить') + '</strong><ul><li>Исправная версия прошла. Тестов: ' + reference.count + '.</li>' +
          variants.map((r,i) => '<li>' + esc(c.bugs[i].label) + ' — ' + (r.invalid ? esc(r.invalid) : r.passed ? 'дефект пропущен' : 'дефект обнаружен') + '.</li>').join('') + '</ul>';
        if (passed) {
          saved[c.id] = {code:editor.value,done:true}; save(); progress();
          get('next').hidden = current === cases.length-1;
          if (cases.every(c => saved[c.id]?.done)) output.insertAdjacentHTML('beforeend','<p>Смена завершена. Все проверки предзаказа готовы к следующему выпуску.</p>');
        }
      };
      active.postMessage({inputChannel:inputSession?.channel,code:editor.value, versions:[c.implementation, ...c.bugs.map(b => b.implementation)]});
    } catch { fail('Среда Python недоступна. Повторите запуск.'); }
  };
  window.addEventListener('hashchange', finish, {once:true});
  render();
}

