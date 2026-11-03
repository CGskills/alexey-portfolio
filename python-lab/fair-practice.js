// Local learning rules. No clipboard is read outside an actual editor paste.
export const practiceDefaults=()=>({assistance:{},awards:{},copyStreak:0,recoveryRemaining:0});
export function markAssistance(state,id,kind='view'){
 if(state.done.includes(id))return false;
 state.assistance??={};
 const previous=state.assistance[id]||{};
 const copied=kind!=='view';
 state.assistance[id]={revealed:true,copied:previous.copied===true||copied};
 if(copied&&!previous.copied){
  state.copyStreak=(state.copyStreak||0)+1;
  if(state.copyStreak>=3){state.recoveryRemaining=3;state.copyStreak=0;}
 }
 return !previous.revealed||copied&&!previous.copied;
}
export function awardFor(state,lesson){
 const assisted=state.assistance?.[lesson.id]?.revealed===true;
 const reduced=!assisted&&(state.recoveryRemaining||0)>0;
 return {coins:assisted?0:reduced?Math.floor(lesson.coins/2):lesson.coins,assisted,reduced};
}
export function recordAward(state,lesson){
 const award=awardFor(state,lesson);
 state.awards??={};state.awards[lesson.id]=award;
 if(!award.assisted){state.copyStreak=0;if(award.reduced)state.recoveryRemaining--;}
 return award;
}
export function savedAward(state,lesson){return state.awards?.[lesson.id]||{coins:state.assistance?.[lesson.id]?.revealed?0:lesson.coins,assisted:!!state.assistance?.[lesson.id]?.revealed,reduced:false};}
export function sanitizePractice(value,valid,done){
 const result=practiceDefaults();
 for(const [id,a] of Object.entries(value.assistance||{}))if(valid.has(id)&&a&&typeof a==='object')result.assistance[id]={revealed:a.revealed===true||a.copied===true,copied:a.copied===true};
 for(const [id,a] of Object.entries(value.awards||{}))if(valid.has(id)&&done.includes(id)&&a&&typeof a==='object'&&Number.isFinite(a.coins))result.awards[id]={coins:Math.max(0,Math.min(1000,Math.floor(a.coins))),assisted:result.assistance[id]?.revealed===true||a.assisted===true,reduced:a.reduced===true};
 for(const a of Object.values(result.awards))if(a.assisted)a.coins=0;
 result.copyStreak=Number.isFinite(value.copyStreak)?Math.max(0,Math.min(2,Math.floor(value.copyStreak))):0;
 result.recoveryRemaining=Number.isFinite(value.recoveryRemaining)?Math.max(0,Math.min(3,Math.floor(value.recoveryRemaining))):0;
 return result;
}
// Conservative token comparison only on pasted code; identical hand-written answers are valid.
export function codeTokens(code){return (String(code).match(/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|[\p{L}\p{N}_]+|==|!=|<=|>=|\*\*|\/\/|\S)/gu)||[]).filter(t=>!t.startsWith('#')).join('\x1f');}
export function isSolutionPaste(inserted,after,solution){
 const reference=codeTokens(solution),pasted=codeTokens(inserted);
 if(!pasted||!reference)return false;
 return pasted===reference||(codeTokens(after)===reference&&pasted.length>=reference.length*.65);
}
export function rewardNotice(state,lesson){
 const done=state.done.includes(lesson.id),a=done?savedAward(state,lesson):awardFor(state,lesson);
 if(done)return a.assisted?'Завершено с разбором · 0 искр. Опыт и пройденная тема сохранены.':`Награда сохранена: ${a.coins} искр. Повторная проверка не выдаёт искры.`;
 if(a.assisted)return 'Учебный разбор · 0 искр за это задание. XP и продвижение по курсу сохраняются.';
 if(a.reduced)return `Самостоятельная практика · ${a.coins} из ${lesson.coins} искр. До полной награды: ${state.recoveryRemaining} самостоятельных заданий.`;
 return `За самостоятельное решение: ${lesson.coins} искр. Подсказки и пробный пример бесплатны.`;
}
export const rewardRules=`<div class="reward-rules"><p>Подсказки, объяснения и пробные примеры не снижают награду.</p><ul><li>Открытый полный ответ переводит текущее задание в учебный разбор: <strong>0 искр</strong>, но XP и продвижение сохраняются.</li><li>Копирование или вставка полных ответов трёх разных незавершённых заданий без самостоятельной сдачи между ними включает <strong>три задания с 50% искр</strong> (округление вниз). Самостоятельная работа восстанавливает обычную награду.</li><li>Повторные нажатия в одном задании не увеличивают счётчик. Уже полученные награды не отнимаются.</li><li>Сброс редактора, возврат черновика и перезагрузка не отменяют отметку разбора. Совпадение написанного вручную кода с образцом не считается копированием.</li></ul></div>`;
