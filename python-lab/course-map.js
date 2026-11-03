import {juniorPractice} from './practice-junior.js';
import {middlePractice} from './practice-middle.js';
import {seniorPractice} from './practice-senior.js';
import {diplomaLessons} from './diplomas.js';
export const courseModules=[
 [0,'start','Первая программа: вывод и переменные',['j01','n01','j02']],
 [0,'operators-1','Числа, арифметика и ввод',['j03','b01','n02','j04']],
 [0,'list-basics','Списки и последовательные вычисления',['j06','n17','n03','n04','n05']],
 [0,'decisions','Условия и логические выражения',['n07','n08','b02']],
 [0,'functions','Функции и ветвления',['b04','j05','b07','n16','n06']],
 [0,'sequences','Строки, кортежи, срезы и копии',['j10','j15','j16','n18','n20']],
 [0,'operators-2','Принадлежность, тождественность и операторы',['b03','n23','n24','n25','n22']],
 [0,'calculators','Программы-калькуляторы',['n09','n10']],
 [0,'loops','Циклы: от повторения до поиска',['b05','n11','j07','j08','n14','n12','n13','b06','n15']],
 [0,'advanced-lists','Обработка последовательностей',['n26','j11','j13','n19','n21']],
 [0,'junior-integration','Словари, модули и первые объекты',['j09','j14','j12','b08','b09']],
 [0,'junior-diploma','Финальное испытание Junior',['d01']],
 [1,'contracts','Ошибки, контракты и проверки',['m01','m11','m06']],
 [1,'data-structures','Структуры данных и индексы',['m08','m19','m15','m17','m18','m29']],
 [1,'algorithms','Алгоритмы: от стека до скользящего окна',['m20','m21','m22','m23','m24','m25','m26','m27','m28','m07']],
 [1,'objects','Объекты, протоколы и управление ресурсами',['m04','m05','m30','m31','m09','m32','m10','m33']],
 [1,'persistence','Модули, файлы и точные данные',['m34','m02','m03','m13','m14','m16']],
 [1,'middle-rehearsal','Сборка отчёта и собственные тесты',['m12','m35']],
 [1,'middle-diploma','Финальное испытание Middle',['d02']],
 [2,'architecture','Архитектура и границы ответственности',['s11','s01','s02','s03','s10','s24']],
 [2,'graphs','Графы и приоритеты',['s17','s18','s19']],
 [2,'advanced-data','Контракты данных и протоколы объектов',['s13','s14','s15','s21','s35']],
 [2,'state','Состояние, события и атомарность',['s04','s07','s08','s22','s23','s31']],
 [2,'performance','Память, кеш и ленивые конвейеры',['s06','s20','s32','s33']],
 [2,'concurrency','Асинхронность, лимиты и отмена',['s05','s25','s26','s27','s28']],
 [2,'reliability','Надёжность, outbox и защитные тесты',['s09','s29','s30','s16','s34','s12']],
 [2,'senior-diploma','Финальное испытание Senior',['d03']]
].map(([stage,id,title,ids])=>({stage,id,title,ids}));

export function expandCourse(lessons,make){
 const q=(id,stage,title,topic,story,task,theory,example,starter,solution,checks,hints,experiment)=>({
  ...make(id,stage,title,topic,[15,23,30][stage],story,task,theory,example,starter,hints,solution,checks,theory.at(-1)[1]),experiment
 });
 lessons.push(...juniorPractice(q),...middlePractice(q),...seniorPractice(q),...diplomaLessons(make));
 const index=new Map(lessons.map(l=>[l.id,l]));
 const ordered=[];
 for(const module of courseModules){
  for(const id of module.ids){
   const lesson=index.get(id);
   if(!lesson)throw Error('Missing course quest '+id);
   if(ordered.includes(lesson))throw Error('Duplicate course quest '+id);
   lesson.module=module.id;lesson.moduleTitle=module.title;
   lesson.mentor ||= ['Мира','Лев','Ася'][lesson.stage];
   lesson.experiment ||= 'Перед запуском предскажи результат примера. Затем измени одно значение и объясни, какие строки результата должны измениться. Вернись к заданию и напиши собственное решение.';
   lesson.input ||= lesson.id==='j04'?'2':lesson.id==='n10'?'1000\n4\n10':'';
   if(['j12','m12','s12'].includes(id))lesson.title=lesson.title.replace('Проект:','Практикум:');
   ordered.push(lesson);
  }
 }
 if(ordered.length!==lessons.length)throw Error('Unmapped course quests');
 lessons.splice(0,lessons.length,...ordered);
 for(const l of lessons)for(const check of l.checks)if(!check[2])check[2]='Сверь возвращаемое значение, тип и крайние случаи с договором в условии. Проверка допускает разные корректные реализации, кроме явно указанного учебного приёма.';
}
