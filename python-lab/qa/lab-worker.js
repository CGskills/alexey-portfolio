import {loadPyodide} from '../python/pyodide.mjs';
self.onmessage = async ({data}) => {
  try {
    const [py, response] = await Promise.all([
      loadPyodide({indexURL:new URL('../python/', import.meta.url).href, stdout:()=>{}, stderr:()=>{}}),
      fetch(new URL('./check.py', import.meta.url))
    ]);
    if (!response.ok) throw Error('Не удалось открыть проверяющую программу.');
    py.runPython(await response.text());
    let number=0;
    if(data.inputChannel){
      py.globals.set('_dialog_input',prompt=>{
        const request=crypto.randomUUID();
        postMessage({type:'input',request,prompt:String(prompt),number:++number});
        for(;;){const xhr=new XMLHttpRequest();xhr.open('POST',new URL('../__python_input__',import.meta.url),false);xhr.setRequestHeader('Content-Type','application/json');xhr.send(JSON.stringify({channel:data.inputChannel,request}));if(xhr.status!==200)throw Error('Ввод недоступен.');const result=JSON.parse(xhr.responseText);if(result.cancelled)throw Error('Ввод отменён.');if(!result.waiting)return result.value;}
      });
      py.runPython('import builtins\nbuiltins.input = lambda prompt="": str(_dialog_input(str(prompt)))');
    }
    postMessage({ready:true});
    py.globals.set('student_tests', data.code);
    const results = [];
    for (const version of data.versions) {
      py.globals.set('version_code', version);
      const result = JSON.parse(py.runPython('json.dumps(evaluate(version_code, student_tests))'));
      results.push(result);
      if (result.invalid || (results.length === 1 && !result.passed)) break;
    }
    postMessage({results});
  } catch (error) { postMessage({error:String(error)}); }
};

