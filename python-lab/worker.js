import { loadPyodide } from './python/pyodide.mjs';
let python;
let activeId = 0;
let buffer = '';
let lastFlush = 0;
let busy = false;
function flush() {
  if (buffer) { postMessage({type:'stdout',id:activeId,text:buffer}); buffer=''; lastFlush=performance.now(); }
}
try {
  python = await loadPyodide({indexURL:new URL('./python/', import.meta.url).href});
  const response = await fetch(new URL('./runner.py', import.meta.url));
  if (!response.ok) throw new Error('Не удалось загрузить среду выполнения.');
  python.globals.set('_emit_output', text => { buffer += text; if(buffer.length>1000 || performance.now()-lastFlush>40) flush(); });
  python.runPython(await response.text());
  postMessage({type:'ready'});
} catch(error) { postMessage({type:'init-error',message:String(error)}); }
self.onmessage = async ({data}) => {
  if (!python) return;
  if(data.type === 'lint') {
    if(busy) return;
    try {
      python.globals.set('_lint_source', data.code);
      postMessage({type:'lint',id:data.id,code:data.code,...JSON.parse(python.runPython('_lint_code(_lint_source)'))});
    } catch(error) { postMessage({type:'lint-unavailable',id:data.id}); }
    return;
  }
  if (data.type !== 'run' || busy) return;
  busy = true;
  activeId = data.id; buffer = ''; lastFlush=performance.now();
  try {
    let inputNumber=0;
    python.globals.set('_interactive_input', data.inputChannel ? prompt => {
      flush();
      const request=crypto.randomUUID();
      postMessage({type:'input',id:activeId,request,prompt:String(prompt),number:++inputNumber});
      for(;;){
        const xhr=new XMLHttpRequest();
        xhr.open('POST',new URL('./__python_input__',import.meta.url).href,false);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.send(JSON.stringify({channel:data.inputChannel,request}));
        if(xhr.status!==200)throw Error('Не удалось получить ввод. Запусти код ещё раз.');
        const response=JSON.parse(xhr.responseText);
        if(response.cancelled)throw Error('Ввод отменён.');
        if(!response.waiting)return response.value;
      }
    } : null);
    python.globals.set('_user_code', data.code);
    python.globals.set('_user_checks', JSON.stringify(data.checks || []));
    const inputs = data.validationInputs?.length ? data.validationInputs : [data.input || ''];
    python.globals.set('_user_trace', data.trace !== false);
    let result;
    for(let i=0;i<inputs.length;i++) {
      python.globals.set('_user_inputs', inputs[i]);
      python.globals.set('_emit_output', text => { if(i>0)return; buffer += text; if(buffer.length>1000 || performance.now()-lastFlush>40) flush(); });
      const part = JSON.parse(await python.runPythonAsync('await _execute(_user_code, _user_checks, _user_inputs, _user_trace)'));
      if(inputs.length>1) part.tests.forEach(t=>t.label=`Ввод ${inputs[i]} · ${t.label}`);
      if(i===0) result=part;
      else { result.tests.push(...part.tests); if(part.error) result.tests.push({label:`Ввод ${inputs[i]} · выполнение`,passed:false,detail:`${part.error.type}: ${part.error.message}`}); }
    }
    result.validationInputs=data.validationInputs||null;
    flush();
    postMessage({type:'result',id:activeId,result});
  } catch(error) { flush(); postMessage({type:'error',id:activeId,message:String(error)}); }
  finally { busy=false; }
};

