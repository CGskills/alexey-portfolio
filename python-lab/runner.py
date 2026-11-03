import ast as _ast
import sys as _sys
import json as _json
import inspect as _inspect
import traceback as _traceback
import io as _io
import types as _types
import copy as _copy
import contextlib as _contextlib
import operator as _operator
import reprlib as _reprlib
import logging as _logging

def _logic_rule(tree):
    # Re-evaluate the student's assigned expression for every boolean input.
    import itertools
    import ast
    expression = None
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'can_serve' for t in node.targets):
            expression = node.value
    if expression is None:
        return False
    names = {'is_open', 'has_coffee', 'has_tea', 'cleaning'}
    if not names.issubset({n.id for n in ast.walk(expression) if isinstance(n, ast.Name)}):
        return False
    compiled = compile(ast.Expression(expression), '<logic-check>', 'eval')
    for opened, coffee, tea, cleaning in itertools.product([False, True], repeat=4):
        values = dict(is_open=opened, has_coffee=coffee, has_tea=tea, cleaning=cleaning)
        if eval(compiled, {'__builtins__': {}}, values) != (opened and (coffee or tea) and not cleaning):
            return False
    return True

def _uses_call(tree, wanted):
    aliases = {}
    def name(node):
        if isinstance(node, _ast.Name): return aliases.get(node.id, node.id)
        if isinstance(node, _ast.Attribute): return name(node.value) + '.' + node.attr
        return ''
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Import):
            for alias in node.names: aliases[alias.asname or alias.name] = alias.name
        elif isinstance(node, _ast.ImportFrom):
            for alias in node.names:
                resolved = (node.module + '.' if node.module != 'builtins' and node.module else '') + alias.name
                aliases[alias.asname or alias.name] = resolved
    for node in _ast.walk(tree):
        if isinstance(node, _ast.Assign):
            value = name(node.value)
            if value:
                for target in node.targets:
                    if isinstance(target, _ast.Name): aliases[target.id] = value
    return any(isinstance(n, _ast.Call) and name(n.func) == wanted for n in _ast.walk(tree))

def _raises(kind, fn):
    try:
        fn()
    except kind:
        return True
    except BaseException:
        return False
    return False

def _service_probe(cls):
    class Repo:
        def __init__(self): self.saved = []
        def save(self, key, amount): self.saved.append((key, amount))
    repo = Repo()
    value = cls(repo).place('A', [180, 120])
    return value, repo.saved

def _retry_probe(fn):
    calls = [0]
    def operation():
        calls[0] += 1
        if calls[0] == 1: raise ConnectionError('Попробуй снова')
        return 42
    return fn(operation), calls[0]

def _retry_limit(fn):
    calls = [0]
    def operation():
        calls[0] += 1
        raise ConnectionError('Нет соединения')
    try:
        fn(operation, 3)
    except ConnectionError:
        return calls[0]
    return -1

def _final_atomic(cls):
    store = {}
    service = cls(store)
    try:
        service.place('bad', [-1])
    except ValueError:
        return store == {}
    return False

def _unchanged(fn, *args):
    before = _copy.deepcopy(args)
    fn(*args)
    return args == before

def _quiet(fn, *args):
    captured = _io.StringIO()
    with _contextlib.redirect_stdout(captured):
        fn(*args)
    return captured.getvalue() == ''

def _unittest_probe(cls):
    import unittest
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(cls)
    result = unittest.TestResult()
    suite.run(result)
    return result.wasSuccessful() and result.testsRun >= 2

def _unittest_mutation(cls, fn):
    namespace = fn.__globals__
    original = namespace.get('subtotal')
    try:
        namespace['subtotal'] = lambda prices: -999
        return not _unittest_probe(cls)
    finally:
        namespace['subtotal'] = original

def _snapshot(values):
    result = {}
    for key, value in list(values.items())[:70]:
        if key.startswith('_') or key == 'input': continue
        if isinstance(value, (_types.ModuleType, _types.FunctionType, type)): continue
        try:
            if isinstance(value, (list, tuple, dict, set)) and len(value) > 30:
                result[key] = f'<{type(value).__name__}: {len(value)} элементов>'
            else:
                result[key] = repr(value)[:200]
        except BaseException:
            result[key] = f'<{type(value).__name__}>'
        if len(result) >= 14: break
    return result

async def _execute(code, checks_json, input_text, tracing=True):
    frames = []
    steps = 0
    inputs = iter(input_text.splitlines())
    output = []
    answer_output = []
    is_prompt = False
    size = 0
    live = True
    class Stream:
        encoding = 'utf-8'
        def write(self, text):
            nonlocal size
            if not live: return len(text)
            size += len(text)
            if size > 12000:
                raise RuntimeError('Слишком много вывода: сократи цикл или печать (лимит 12 000 символов).')
            output.append(text)
            if not is_prompt: answer_output.append(text)
            if text:
                _emit_output(text)
            return len(text)
        def flush(self): pass
        def isatty(self): return False
    def read_input(prompt=''):
        nonlocal is_prompt
        if prompt:
            is_prompt = True
            try: print(prompt, end='')
            finally: is_prompt = False
        try: return next(inputs)
        except StopIteration: raise EOFError('Добавь строки в поле «Ввод для input()».')
    def trace(frame, event, arg):
        nonlocal steps
        if frame.f_code.co_filename != 'main.py': return None
        if event == 'line':
            steps += 1
            if steps > 100000:
                raise TimeoutError('Превышено 100 000 шагов. Проверь условие завершения цикла.')
            if tracing and len(frames) < 160:
                frames.append({'line':frame.f_lineno, 'scope':frame.f_code.co_name, 'values':_snapshot(frame.f_globals if frame.f_code.co_name == '<module>' else frame.f_locals), 'event':'before'})
        return trace
    old_main = _sys.modules.get('__main__')
    module = _types.ModuleType('__main__')
    ns = module.__dict__
    ns.update({'__name__':'__main__', 'input':read_input})
    _sys.modules['__main__'] = module
    original_stdout, original_stderr = _sys.stdout, _sys.stderr
    original_handlers, original_level = _logging.root.handlers, _logging.root.level
    _logging.root.handlers = []
    _logging.root.setLevel(_logging.WARNING)
    error = None
    tests = []
    _sys.stdout = _sys.stderr = Stream()
    try:
        tree = _ast.parse(code, filename='main.py')
        _sys.settrace(trace)
        value = eval(compile(tree, 'main.py', 'exec', flags=_ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), ns)
        if _inspect.isawaitable(value): await value
    except BaseException as exc:
        tb = _traceback.extract_tb(exc.__traceback__)
        line = getattr(exc, 'lineno', None)
        for item in tb:
            if item.filename == 'main.py': line = item.lineno
        error = {'type':type(exc).__name__, 'message':str(exc)[:1200], 'line':line, 'offset':getattr(exc,'offset',None), 'end_offset':getattr(exc,'end_offset',None)}
    finally:
        _sys.settrace(None)
        if tracing:
            frames.append({'line':None, 'scope':'итог', 'values':_snapshot(ns), 'event':'end'})
    captured = ''.join(output)
    live = False
    if error is None:
        ns.update({'_logic_rule':_logic_rule, '_uses_call':_uses_call, '_output':''.join(answer_output), '_input_values':input_text.splitlines(), '_tree':tree, '_raises':_raises,
                   '_service_probe':_service_probe, '_retry_probe':_retry_probe,
                   '_retry_limit':_retry_limit, '_final_atomic':_final_atomic,
                   '_unchanged':_unchanged, '_quiet':_quiet, '_unittest_probe':_unittest_probe, '_unittest_mutation':_unittest_mutation})
        ns.update({name:globals()[name] for name in _COURSE_PROBES})
        for spec in _json.loads(checks_json):
            label, expression = spec[:2]
            help_text = spec[2] if len(spec) > 2 else None
            try:
                parsed = _ast.parse(expression, mode='eval')
                body = parsed.body
                detail = help_text or 'Результат пока не соответствует условию.'
                if isinstance(body, _ast.Compare) and len(body.ops) == 1:
                    async def part(node):
                        result = eval(compile(_ast.Expression(node), '<проверка>', 'eval', flags=_ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), ns)
                        return await result if _inspect.isawaitable(result) else result
                    actual = await part(body.left)
                    expected = await part(body.comparators[0])
                    operators = {_ast.Eq:_operator.eq, _ast.NotEq:_operator.ne, _ast.Lt:_operator.lt, _ast.LtE:_operator.le, _ast.Gt:_operator.gt, _ast.GtE:_operator.ge, _ast.Is:_operator.is_, _ast.IsNot:_operator.is_not, _ast.In:lambda a,b:a in b, _ast.NotIn:lambda a,b:a not in b}
                    check = operators[type(body.ops[0])](actual, expected)
                    detail = f'Выражение: {expression}. Получено: {_reprlib.repr(actual)}. Ожидается: {_reprlib.repr(expected)}.'
                    if help_text: detail += ' ' + help_text
                else:
                    check = eval(compile(parsed, '<проверка>', 'eval', flags=_ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), ns)
                    if _inspect.isawaitable(check): check = await check
                tests.append({'label':label, 'passed':bool(check), 'detail':None if check else detail})
            except BaseException as exc:
                tests.append({'label':label, 'passed':False, 'detail':f'{type(exc).__name__}: {str(exc)[:350]}'})
    for handler in _logging.root.handlers:
        try: handler.close()
        except Exception: pass
    _logging.root.handlers, _logging.root.level = original_handlers, original_level
    _sys.stdout, _sys.stderr = original_stdout, original_stderr
    if old_main is not None: _sys.modules['__main__'] = old_main
    else: _sys.modules.pop('__main__', None)
    return _json.dumps({'output':captured, 'error':error, 'tests':tests, 'frames':frames, 'steps':steps}, ensure_ascii=False)


def _lint_code(code):
    try:
        compile(code, 'main.py', 'exec', flags=_ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
        return _json.dumps({'valid':True,'error':None})
    except SyntaxError as exc:
        return _json.dumps({'valid':False,'error':{'type':type(exc).__name__,'message':str(exc),'line':exc.lineno,'offset':exc.offset,'end_offset':getattr(exc,'end_offset',None)}})


# Behavioural probes for complete projects and algorithms. They use deterministic
# data and fake I/O; no network requests, package installation or wall-clock races.
def _io_probe(fn, text):
    values = iter(text.splitlines())
    namespace = fn.__globals__
    original = namespace.get('input')
    class LimitedIO(_io.StringIO):
        def write(self,text):
            if self.tell()+len(text)>12000: raise RuntimeError('Слишком много вывода при проверке ввода/вывода')
            return super().write(text)
    stream = LimitedIO()
    def read(prompt=''):
        try: return next(values)
        except StopIteration: raise EOFError('Не хватает строк контрольного ввода')
    namespace['input'] = read
    try:
        with _contextlib.redirect_stdout(stream): fn()
    finally:
        if original is None: namespace.pop('input', None)
        else: namespace['input'] = original
    return stream.getvalue().strip()

def _junior_expected(values):
    total = 0
    prices = {'кофе':180,'чай':120,'какао':200}
    for part in values[0].split(','):
        if ':' not in part: continue
        name, count = part.split(':',1)
        name, count = name.strip().lower(), count.strip()
        if count.isdecimal() and int(count)>0: total += prices.get(name,0)*int(count)
    guests = int(values[1])
    second = f'На гостя: {round(total/guests,2):.2f} ₽' if guests>0 else 'Некорректное число гостей'
    return f'Итого: {total:.2f} ₽\n{second}'

class _AccessList(list):
    def __init__(self, values): super().__init__(values); self.reads=0
    def __getitem__(self, index):
        value=super().__getitem__(index)
        self.reads+=len(value) if isinstance(index,slice) else 1
        return value
    def __iter__(self):
        for value in super().__iter__(): self.reads+=1; yield value
    def index(self, value, *args):
        self.reads+=len(self)
        return super().index(value,*args)
    def copy(self):
        self.reads+=len(self)
        return super().copy()

def _binary_probe(fn):
    values=_AccessList(range(2048))
    result=fn(values,2047)
    return result==2047 and values.reads<=80

def _linear_probe(fn):
    work=[0]
    class Key:
        def __init__(self,value): self.value=value
        def __hash__(self): work[0]+=1; return hash(self.value)
        def __eq__(self,other): work[0]+=1; return isinstance(other,Key) and self.value==other.value
    values=[Key(i) for i in range(300)]+[Key(299)]
    result=fn(values)
    return isinstance(result,Key) and result.value==299 and work[0]<=5000

def _window_probe(fn):
    operations=[0]
    class Number(int):
        def __add__(self,other): operations[0]+=1; return Number(int(self)+int(other))
        def __radd__(self,other): return self.__add__(other)
        def __sub__(self,other): operations[0]+=1; return Number(int(self)-int(other))
        def __rsub__(self,other): operations[0]+=1; return Number(int(other)-int(self))
    values=_AccessList(Number(i) for i in range(500))
    result=fn(values,100)
    return result==sum(range(400,500)) and values.reads<=5000 and operations[0]<=5000


def _stock_probe(cls):
    stock=cls(5)
    if not _raises(ValueError,lambda:stock.take(6)) or stock.amount!=5: return False
    if not _raises(ValueError,lambda:stock.add(-1)) or stock.amount!=5: return False
    if not _raises(ValueError,lambda:stock.take(-1)) or stock.amount!=5: return False
    stock.take(5)
    return stock.amount==0 and cls(3).amount==3

def _context_probe(factory):
    log=[]
    with factory(log): log.append('work')
    if log!=['open','work','close']: return False
    log=[]
    try:
        with factory(log): raise ValueError('внутри')
    except ValueError: return log==['open','close']
    return False

def _suite_probe(cls, minimum=3):
    import unittest
    result=unittest.TestResult()
    unittest.defaultTestLoader.loadTestsFromTestCase(cls).run(result)
    return result.wasSuccessful() and result.testsRun>=minimum

def _suite_mutation(cls,fn,name):
    namespace=fn.__globals__
    original=namespace.get(name)
    try:
        namespace[name]=lambda *a,**kw:-999
        return not _suite_probe(cls)
    finally: namespace[name]=original

def _class_suite_mutation(suite,cls,method):
    original=getattr(cls,method)
    try:
        setattr(cls,method,lambda *a,**kw:None)
        return not _suite_probe(suite)
    finally: setattr(cls,method,original)

def _lru_probe(cls):
    cache=cls(2)
    cache.put('A',0); cache.put('B',2)
    if cache.get('A')!=0: return False
    cache.put('C',3)
    if cache.get('B') is not None or cache.get('A')!=0: return False
    cache.put('A',9); cache.put('D',4)
    return cache.get('C') is None and cache.get('A')==9 and cache.get('D')==4

def _atomic_list_probe(factory):
    items=[[1]]; identity=id(items)
    with factory(items): items.append([2])
    if items!=[[1],[2]]: return False
    try:
        with factory(items): items[0].append(9); items.append([3]); raise ValueError('откат')
    except ValueError: return id(items)==identity and items==[[1],[2]]
    return False

async def _concurrency_probe(fn):
    import asyncio
    active=0; peak=0
    async def work(value):
        nonlocal active,peak
        active+=1; peak=max(peak,active)
        await asyncio.sleep(0)
        active-=1
        return value*2
    result=await fn([1,2,3,4,5],work,2)
    if result!=[2,4,6,8,10] or peak>2 or peak<1: return False
    try: await fn([1],work,0)
    except ValueError: return True
    return False

async def _timeout_probe(fn):
    import asyncio
    async def fast(): return 7
    async def slow(): await asyncio.sleep(1); return 9
    async def bad(): raise ValueError('чужая ошибка')
    if await fn(fast,1)!=7 or await fn(slow,.001,'late')!='late': return False
    try: await fn(bad,1,'hidden')
    except ValueError: return True
    return False

async def _cancel_probe(fn):
    import asyncio
    class Resource:
        def __init__(self): self.log=[]
        def open(self): self.log.append('open')
        def close(self): self.log.append('close')
    async def success(): return 42
    resource=Resource()
    if await fn(resource,success)!=42 or resource.log!=['open','close']: return False
    async def bad(): raise ValueError('ошибка')
    resource=Resource()
    try: await fn(resource,bad)
    except ValueError: pass
    else: return False
    if resource.log!=['open','close']: return False
    started=asyncio.Event()
    blocker=asyncio.Event()
    async def wait(): started.set(); await blocker.wait()
    resource=Resource(); task=asyncio.create_task(fn(resource,wait))
    await started.wait(); task.cancel()
    try: await task
    except asyncio.CancelledError: return resource.log==['open','close']
    return False

def _batch_copy_probe(fn):
    events=[{'id':'A','data':[1]}]
    result=fn(events,set(),1)
    if result!=events or result is events: return False
    result[0]['data'].append(2)
    return events==[{'id':'A','data':[1]}]

def _migration_copy_probe(fn):
    original={'version':2,'items':{'A':'Лес'}}
    result=fn(original); result['items']['A']='Дом'
    return original['items']['A']=='Лес' and _unchanged(fn,{'version':1,'books':[{'id':'A','title':'Лес'}]})

def _version_cache_probe(cls):
    cache=cls(); calls=[]
    def loader(key): calls.append(key); return {'A':0,'B':False,'C':None}[key]
    for key in ['A','B','C']:
        if cache.get(key,loader)!=loader_value(key): return False
        cache.get(key,loader)
    if calls!=['A','B','C'] or cache.version!=0: return False
    cache.invalidate(); cache.get('A',loader)
    return calls==['A','B','C','A'] and cache.version==1

def loader_value(key): return {'A':0,'B':False,'C':None}[key]

def _lazy_probe(fn):
    def source():
        yield ' A '; yield ''; yield 'B'
        raise RuntimeError('Прочитан лишний элемент источника')
    def untouched():
        raise RuntimeError('Источник прочитан при нулевом лимите')
        yield ''
    return fn(source(),2)==['A','B'] and fn(untouched(),0)==[]

def _matrix_copy_probe(cls):
    rows=[[1,2],[3,4]]; a=cls(rows); rows[0][0]=99
    if a.rows!=[[1,2],[3,4]]: return False
    b=cls([[1,0],[0,1]]); result=a@b
    result.rows[0][0]=7
    return a.rows==[[1,2],[3,4]] and b.rows==[[1,0],[0,1]]

def _ledger_probe(cls,mode):
    from decimal import Decimal
    menu={'кофе':'180.50','чай':'120.00'}; stock={'кофе':3,'чай':2}
    ledger=cls(menu,stock)
    if mode=='money':
        return ledger.place('A',{'кофе':2,'чай':1})==Decimal('481.00') and ledger.report()=={'orders':1,'revenue':'481.00','stock':{'кофе':1,'чай':1}}
    if mode=='repeat':
        ledger.place('A',{'чай':1})
        return ledger.place('A',{'чай':99})==Decimal('120') and ledger.report()['stock']['чай']==1 and len(ledger.orders)==1
    if mode=='atomic':
        before=_copy.deepcopy(ledger.report())
        return _raises(ValueError,lambda:ledger.place('A',{'чай':1,'кофе':99})) and ledger.report()==before and ledger.orders=={}
    if mode=='invalid':
        for items in ({},{'вода':1},{'чай':0},{'чай':-1},{'чай':True},{'чай':1.5}):
            if not _raises(ValueError,lambda:ledger.place('A',items)): return False
        bad=cls({'чай':'-1'},{'чай':2})
        return _raises(ValueError,lambda:bad.place('A',{'чай':1})) and ledger.stock==stock and ledger.orders=={}
    if mode=='copies':
        menu['кофе']='0'; stock['кофе']=99
        items={'чай':1}; ledger.place('A',items); items['чай']=99
        report=ledger.report(); report['stock']['кофе']=0
        return ledger.menu['кофе']=='180.50' and ledger.stock['кофе']==3 and ledger.orders['A']['items']['чай']==1
    if mode=='ranking':
        ledger.place('A',{'кофе':1,'чай':1}); ledger.place('B',{'кофе':1})
        return ledger.top_items(1)==[('кофе',2)] and ledger.top_items(4)==[('кофе',2),('чай',1)] and ledger.top_items(0)==[]
    ledger.place('A',{'чай':1})
    if mode=='json':
        restored=cls.load(ledger.dump())
        equal=restored.report()==ledger.report() and restored.orders==ledger.orders
        restored.place('B',{'чай':1})
        return equal and ledger.stock['чай']==1 and restored.stock['чай']==0
    if mode=='file':
        path='_diploma_shift.json'
        try:
            ledger.save(path); restored=cls.from_file(path)
            return restored.report()==ledger.report() and restored.orders==ledger.orders
        finally:
            import os
            if os.path.exists(path): os.remove(path)
    return False

def _network_repo_probe(cls):
    repo=cls()
    order={'id':'BK-0001','items':{'чай':1},'total':'120.00'}
    event={'id':'BK-0001','kind':'order.created','total':'120.00'}
    repo.commit(order,event); order['items']['чай']=99; event['total']='0'
    repo.commit({'id':'BK-0001','items':{},'total':'0'},event)
    value=repo.get('BK-0001')
    if value['items']['чай']!=1 or value['total']!='120.00' or len(repo.all_orders())!=1 or len(repo.pending())!=1: return False
    value['items']['чай']=7
    all_orders=repo.all_orders(); all_orders[0]['items']['чай']=8
    pending=repo.pending(); pending[0]['total']='0'
    if repo.get('BK-0001')['items']['чай']!=1 or repo.pending()[0]['total']!='120.00': return False
    repo.acknowledge('BK-0001'); repo.acknowledge('absent')
    return repo.pending()==[] and repo.get('absent') is None

async def _network_probe(repo_cls,service_cls,mode):
    import asyncio
    from decimal import Decimal
    repo=repo_cls(); sent=[]
    async def publisher(event): sent.append(_copy.deepcopy(event))
    menu={'чай':'10.05','кофе':'180.50'}
    service=service_cls(repo,menu,publisher)
    if mode=='validation':
        order=await service.place('BK-0001',{'чай':1},10)
        if order!={'id':'BK-0001','items':{'чай':1},'total':'9.05'} or service.revenue()!=Decimal('9.05'): return False
        for key,items,discount in [('bad',{'чай':1},0),('BK-１２３４',{'чай':1},0),('BK-0002',{},0),('BK-0002',{'вода':1},0),('BK-0002',{'чай':0},0),('BK-0002',{'чай':True},0),('BK-0002',{'чай':1},101),('BK-0002',{'чай':1},-1)]:
            try: await service.place(key,items,discount)
            except ValueError: pass
            else: return False
        return len(repo.all_orders())==1 and len(repo.pending())==1 and sent==[]
    if mode=='concurrent':
        results=await asyncio.gather(*(service.place('BK-0001',{'чай':2}) for _ in range(6)))
        repeat=await service.place('BK-0001',{},-9)
        return all(o['total']=='20.10' for o in results) and repeat['total']=='20.10' and len(repo.all_orders())==1 and len(repo.pending())==1
    if mode=='copies':
        menu['чай']='0'; items={'чай':1}
        result=await service.place('BK-0001',items); result['items']['чай']=99; items['чай']=77
        return repo.get('BK-0001')=={'id':'BK-0001','items':{'чай':1},'total':'10.05'}
    await service.place('BK-0001',{'чай':1})
    if mode=='retry':
        calls=[]
        async def flaky(event):
            calls.append(event['id'])
            if len(calls)<3: raise ConnectionError('временно')
            if not repo.pending(): raise AssertionError('Подтверждено до отправки')
        service=service_cls(repo,menu,flaky)
        confirmed=await service.flush(3)
        return confirmed==1 and len(calls)==3 and repo.pending()==[] and await service.flush()==0
    if mode=='failure':
        await service.place('BK-0002',{'кофе':1})
        calls=[]
        async def fail(event): calls.append(event['id']); raise ConnectionError('нет связи')
        service=service_cls(repo,menu,fail)
        if await service.flush(2)!=0 or len(calls)!=4 or len(repo.pending())!=2: return False
        async def bad(event): raise ValueError('не временная')
        service=service_cls(repo,menu,bad)
        try: await service.flush()
        except ValueError: pass
        else: return False
        if len(repo.pending())!=2: return False
        service=service_cls(repo,menu,publisher)
        if await service.flush()!=2 or repo.pending()!=[]: return False
        try: await service.flush(0)
        except ValueError: return True
        return False
    if mode=='flush':
        async def slow(event): await asyncio.sleep(0); sent.append(event['id'])
        service=service_cls(repo,menu,slow)
        values=await asyncio.gather(service.flush(),service.flush())
        return sum(values)==1 and sent==['BK-0001'] and repo.pending()==[]
    if mode=='cancel':
        started=asyncio.Event(); block=asyncio.Event()
        async def wait(event): started.set(); await block.wait()
        service=service_cls(repo,menu,wait)
        task=asyncio.create_task(service.flush())
        await started.wait(); task.cancel()
        try: await task
        except asyncio.CancelledError: return len(repo.pending())==1
        return False
    return False

_COURSE_PROBES = ['_io_probe','_junior_expected','_binary_probe','_linear_probe','_window_probe','_stock_probe','_context_probe','_suite_probe','_suite_mutation','_class_suite_mutation','_lru_probe','_atomic_list_probe','_concurrency_probe','_timeout_probe','_cancel_probe','_batch_copy_probe','_migration_copy_probe','_version_cache_probe','_lazy_probe','_matrix_copy_probe','_ledger_probe','_network_repo_probe','_network_probe']
