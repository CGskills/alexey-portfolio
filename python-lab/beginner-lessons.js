import {beginnerGuides} from './beginner-guides.js';
export function createBeginnerLessons(make){
 const add=(id,title,topic,guide,story,task,starter,hints,solution,checks)=>{
  const g=beginnerGuides.find(g=>g.id==='guide-'+guide);
  return {...make(id,0,title,topic,12,story,task,g.sections,g.code,starter,hints,solution,checks,g.walk.join(' ')),guide:g.id};
 };
 return [
 add('b01','Печенье на всех','+ − * / // % ** · = +=','arithmetic','Мира раскладывает печенье по тарелкам. Целые порции и остаток считаются по-разному.',
 'Есть cookies = 17 и per_plate = 5. Рассчитай plates (число полных тарелок) и leftover (остаток). Не меняй cookies и per_plate. Выведи plates, затем leftover, каждое с новой строки.',
 'cookies = 17\nper_plate = 5\n# Рассчитай plates и leftover\n', ['// даёт число полных порций, % — остаток.','plates = cookies // per_plate; leftover = cookies % per_plate. Затем два print.'],
 'cookies = 17\nper_plate = 5\nplates = cookies // per_plate\nleftover = cookies % per_plate\nprint(plates)\nprint(leftover)',
 [['Полные тарелки','plates == 3'],['Остаток','leftover == 2'],['Исходные данные','cookies == 17 and per_plate == 5'],['Вывод','_output.strip().splitlines() == ["3", "2"]']]),
 add('b02','Можно открыть двери?','bool · and · or · not','logic','У Миры готов кофе, есть чай и закончилась уборка. Проверим, можно ли принимать гостей.',
 'Создай is_open = True, has_coffee = False, has_tea = True, cleaning = False. Рассчитай can_serve: кофейня открыта, есть кофе ИЛИ чай и уборка НЕ идёт. Выведи can_serve. Используй эти четыре переменные в логическом выражении.',
 'is_open = True\nhas_coffee = False\nhas_tea = True\ncleaning = False\n# can_serve = ...\n', ['Объедини наличие напитков в скобках: (has_coffee or has_tea).','Соедини is_open, скобки и not cleaning через and.'],
 'is_open = True\nhas_coffee = False\nhas_tea = True\ncleaning = False\ncan_serve = is_open and (has_coffee or has_tea) and not cleaning\nprint(can_serve)',
 [['Можно обслуживать','can_serve is True'],['Напитки и уборка','is_open is True and has_coffee is False and has_tea is True and cleaning is False'],['Вывод','_output.strip() == "True"'],['Правило работает при изменении условий','_logic_rule(_tree)']]),
 add('b03','Есть ли чай в меню?','in · not in · is None','membership','Лев ищет чай, а Мира проверяет, свободен ли столик.',
 'Создай menu = ["кофе", "чай"], table = None. Сохрани has_tea как результат проверки "чай" in menu, no_cocoa как "какао" not in menu, is_free как table is None. Выведи три значения в одной строке через print.',
 'menu = ["кофе", "чай"]\ntable = None\n# Три проверки\n', ['Принадлежность: элемент in список. Отсутствие: элемент not in список.','Для отсутствующего значения: table is None. print(has_tea, no_cocoa, is_free).'],
 'menu = ["кофе", "чай"]\ntable = None\nhas_tea = "чай" in menu\nno_cocoa = "какао" not in menu\nis_free = table is None\nprint(has_tea, no_cocoa, is_free)',
 [['Проверки','has_tea is True and no_cocoa is True and is_free is True'],['Вывод','_output.strip() == "True True True"']]),
 add('b04','Одна формула, разные заказы','def · параметры · return','functions','Ася предлагает вынести расчёт в функцию: тогда его можно повторять с любыми ценами.',
 'Напиши cost(price, count=1), которая возвращает price * count. Покажи стоимость двух чашек по 180 через print(cost(180, 2)). Не печатай результат внутри cost: его нужно вернуть.',
 'def cost(price, count=1):\n    pass\n\n# Вызови функцию снаружи\n', ['Тело функции имеет отступ четыре пробела.','Внутри: return price * count. Снаружи: print(cost(180, 2)).'],
 'def cost(price, count=1):\n    return price * count\n\nprint(cost(180, 2))',
 [['Две чашки','cost(180, 2) == 360'],['По умолчанию одна','cost(120) == 120'],['Нулевой заказ','cost(200, 0) == 0'],['Именованные аргументы','cost(count=3, price=50) == 150'],['Вывод','_output.strip() == "360"']]),
 add('b05','Номера на стаканчиках','for · range · границы','for','Нина заказала три чашки для книжного клуба. Пронумеруем их автоматически.',
 'Циклом for с range выведи числа от 1 до 3 включительно, каждое с новой строки.',
 '# for number in range(...):\n', ['Правая граница range не включается.','Используй range(1, 4), а внутри print(number).'],
 'for number in range(1, 4):\n    print(number)',
 [['Номера','_output.strip().splitlines() == ["1", "2", "3"]'],['Цикл for','any(isinstance(n, __import__("ast").For) for n in __import__("ast").walk(_tree))'],['Использован range','_uses_call(_tree, "range")']]),
 add('b06','Пропустить отмену, закрыть смену','break · continue','while','Отрицательные чеки отменены, а нулевой чек — сигнал закрытия. После него больше ничего не считаем.',
 'Напиши shift_total(orders): суммируй положительные числа до первого 0. Отрицательные пропускай. Всё после 0 игнорируй. Верни сумму; для пустого списка верни 0. Можно использовать любой корректный алгоритм.',
 'def shift_total(orders):\n    pass', ['Начни total = 0. При order == 0 останови цикл через break.','При order < 0 используй continue. Иначе прибавь order. return total поставь после цикла.'],
 'def shift_total(orders):\n    total = 0\n    for order in orders:\n        if order == 0:\n            break\n        if order < 0:\n            continue\n        total += order\n    return total',
 [['Отмена и закрытие','shift_total([120, -1, 180, 0, 200]) == 300'],['Пусто','shift_total([]) == 0'],['Сразу закрыто','shift_total([0, 100]) == 0'],['Без закрытия','shift_total([10, -2, 20]) == 30'],['Только отмены','shift_total([-1, -3]) == 0']]),
 add('b07','Разные подарки гостям','if · elif · else','conditions','Для большого заказа Мира приготовила десерт, для среднего — печенье.',
 'Напиши present(total): от 1000 включительно верни "десерт", от 500 включительно — "печенье", иначе "улыбка".',
 'def present(total):\n    pass', ['Сначала проверь большую границу >= 1000.','После первой ветки используй elif total >= 500, затем else.'],
 'def present(total):\n    if total >= 1000:\n        return "десерт"\n    elif total >= 500:\n        return "печенье"\n    else:\n        return "улыбка"',
 [['Большой заказ','present(1500) == "десерт"'],['Граница 1000','present(1000) == "десерт"'],['Средний заказ','present(999) == "печенье"'],['Граница 500','present(500) == "печенье"'],['Маленький заказ','present(499) == "улыбка"']]),
 add('b08','Коробки для выпечки','import · from · as','imports','На книжный вечер нужно упаковать выпечку. Частично заполненная коробка тоже нужна.',
 'Импортируй math. Напиши boxes(count, capacity), возвращающую math.ceil(count / capacity). count — неотрицательное целое, capacity — положительное целое. Разрешены from-import и псевдонимы. Используй ceil.',
 'import math\n\ndef boxes(count, capacity):\n    pass', ['ceil округляет вверх, поэтому 7 / 3 потребует 3 коробки.','return math.ceil(count / capacity)'],
 'import math\n\ndef boxes(count, capacity):\n    return math.ceil(count / capacity)',
 [['С остатком','boxes(7, 3) == 3'],['Без остатка','boxes(6, 3) == 2'],['Ничего упаковывать','boxes(0, 3) == 0'],['Одна коробка','boxes(1, 5) == 1'],['Использован ceil','_uses_call(_tree, "math.ceil")']]),
 add('b09','У каждого своя чашка','class · __init__ · self','classes','У Нины чай, у Аси кофе. Объекты помогут не перепутать их напитки.',
 'Создай класс Cup. __init__(self, drink, ml) сохраняет drink и ml в атрибутах экземпляра. Метод sip(amount) уменьшает ml, но не ниже 0. amount — неотрицательное число. У каждой чашки свой объём.',
 'class Cup:\n    def __init__(self, drink, ml):\n        pass\n\n    def sip(self, amount):\n        pass', ['В __init__ запиши self.drink = drink и self.ml = ml.','В sip: self.ml = max(0, self.ml - amount).'],
 'class Cup:\n    def __init__(self, drink, ml):\n        self.drink = drink\n        self.ml = ml\n\n    def sip(self, amount):\n        self.ml = max(0, self.ml - amount)',
 [['Данные чашки','Cup("чай", 200).drink == "чай" and Cup("чай", 200).ml == 200'],['Глоток','(lambda c: (c.sip(50), c.ml))(Cup("чай", 200))[-1] == 150'],['Не ниже нуля','(lambda c: (c.sip(500), c.ml))(Cup("чай", 200))[-1] == 0'],['Чашки независимы','(lambda a,b: (a.sip(30), a.ml, b.ml))(Cup("чай",200),Cup("кофе",100))[1:] == (170,100)']])
 ];
}
