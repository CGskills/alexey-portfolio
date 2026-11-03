import {practiceDefaults,recordAward,savedAward,sanitizePractice} from './fair-practice.js';
import {validTrack} from './music.js';
export const KEY='quiet-code-v1';
export const fresh=()=>({version:1,...practiceDefaults(),checkedCode:{},done:[],drafts:{},inputs:{},solutionBackups:{},hints:{},projectReviews:{},notes:'',purchases:[],hiddenDecor:[],activeDecor:'',days:[],seconds:0,practiceDay:'',practiceSeconds:0,current:'j01',settings:{motion:true,sound:false,live:false,readSize:16,codeSize:16,readerFont:'manrope',codeFont:'mono',volume:30,track:'cafe-1',musicMode:'playlist',pauseHidden:true},bookmarks:[],sandboxBackup:'',cafe:{spoken:[],served:[],order:'',ready:'',weather:'evening',drink:'кофе',brewStep:0,seat:''},session:25});
export function sanitize(value, ids) {
  const out=fresh();
  if(!value || typeof value!=='object' || value.version!==1) throw Error('Этот файл не похож на сохранение «Тихого кода».');
  const valid=new Set(ids);
  if(typeof value.checkedCode?.j12==='string'&&(value.done||[]).includes('j12'))out.checkedCode.j12=value.checkedCode.j12.slice(0,50000);
  const validDraft=id=>valid.has(id)||id==='sandbox'||(id.startsWith('demo-')&&valid.has(id.slice(5)));
  out.done=[...new Set((Array.isArray(value.done)?value.done:[]).filter(x=>valid.has(x)))];
  for(const [id, code] of Object.entries(value.drafts||{})) if(validDraft(id) && typeof code==='string') out.drafts[id]=code.slice(0,50000);
  for(const [id, count] of Object.entries(value.hints||{})) if(valid.has(id)&&Number.isFinite(count)) out.hints[id]=Math.max(0,Math.min(3,count));
  for(const [id,input] of Object.entries(value.inputs||{})) if(validDraft(id)&&typeof input==='string')out.inputs[id]=input.slice(0,10000);
  for(const [id,code] of Object.entries(value.solutionBackups||{})) if(valid.has(id)&&typeof code==='string')out.solutionBackups[id]=code.slice(0,50000);
  for(const [id,text] of Object.entries(value.projectReviews||{})) if(['d01','d02','d03'].includes(id)&&typeof text==='string')out.projectReviews[id]=text.slice(0,8000);
  out.notes=typeof value.notes==='string'?value.notes.slice(0,50000):'';
  out.purchases=[...new Set((Array.isArray(value.purchases)?value.purchases:[]).filter(x=>['plant','lamp','cat','rain'].includes(x)))];
  out.hiddenDecor=[...new Set((Array.isArray(value.hiddenDecor)?value.hiddenDecor:[]).filter(id=>out.purchases.includes(id)))];
  out.activeDecor=out.purchases.includes(value.activeDecor)?value.activeDecor:'';
  out.days=[...new Set((Array.isArray(value.days)?value.days:[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-1000);
  out.seconds=Number.isFinite(value.seconds)?Math.max(0,Math.min(1e8,value.seconds)):0;
  out.current=valid.has(value.current)?value.current:'j01';
  const pref=value.settings||{};
  out.settings={motion:pref.motion!==false,sound:false,live:pref.live===true,
    readSize:Number.isFinite(pref.readSize)?Math.max(14,Math.min(22,pref.readSize)):16,
    codeSize:Number.isFinite(pref.codeSize)?Math.max(14,Math.min(26,pref.codeSize)):16,
    readerFont:['manrope','system','lora'].includes(pref.readerFont)?pref.readerFont:'manrope',
    codeFont:['mono','consolas','courier'].includes(pref.codeFont)?pref.codeFont:'mono',
    volume:Number.isFinite(pref.volume)?Math.max(0,Math.min(100,pref.volume)):30,
    track:validTrack(pref.track),musicMode:['playlist','repeat','shuffle'].includes(pref.musicMode)?pref.musicMode:'playlist',pauseHidden:pref.pauseHidden!==false};
  out.bookmarks=[...new Set((Array.isArray(value.bookmarks)?value.bookmarks:[]).filter(x=>typeof x==='string'&&/^[a-z0-9-]{1,40}$/.test(x)))].slice(0,500);
  out.sandboxBackup=typeof value.sandboxBackup==='string'?value.sandboxBackup.slice(0,50000):'';
  const cafe=value.cafe||{};
  const orderIds=new Set(['j03','j09','j12','m12','m14','s12']);
  out.cafe={seat:['window','shared'].includes(cafe.seat)?cafe.seat:'',spoken:[...new Set((Array.isArray(cafe.spoken)?cafe.spoken:[]).filter(x=>['mira','lev','asya','nina','tim','cat'].includes(x)))],
    served:[...new Set((Array.isArray(cafe.served)?cafe.served:[]).filter(x=>orderIds.has(x)))],order:orderIds.has(cafe.order)?cafe.order:'',ready:orderIds.has(cafe.ready)&&cafe.ready===cafe.order?cafe.ready:'',weather:cafe.weather==='rain'?'rain':'evening',drink:['кофе','чай','какао'].includes(cafe.drink)?cafe.drink:'кофе',brewStep:Number.isFinite(cafe.brewStep)?Math.max(0,Math.min(3,Math.floor(cafe.brewStep))):0};
  out.session=[15,25,45].includes(value.session)?value.session:25;
  out.practiceDay=typeof value.practiceDay==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value.practiceDay)?value.practiceDay:'';
  out.practiceSeconds=Number.isFinite(value.practiceSeconds)?Math.max(0,Math.min(86400,value.practiceSeconds)):0;
  Object.assign(out,sanitizePractice(value,valid,out.done));
  return out;
}
export function load(ids) {try {const raw=localStorage.getItem(KEY);return raw?sanitize(JSON.parse(raw),ids):fresh();}catch {return fresh();}}
export function save(state) {try {localStorage.setItem(KEY,JSON.stringify(state));return true;} catch{return false;}}
export function reward(state, lesson) {if(state.done.includes(lesson.id))return false;recordAward(state,lesson);state.done.push(lesson.id);return true;}
export function totals(state, lessons, items) {const completed=lessons.filter(x=>state.done.includes(x.id));return {xp:completed.reduce((n,l)=>n+l.xp,0),coins:completed.reduce((n,l)=>n+Math.min(l.coins,savedAward(state,l).coins),0)-items.filter(x=>state.purchases.includes(x.id)).reduce((n,x)=>n+x.cost,0)};}
