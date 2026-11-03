import {room} from './room.js';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 home:'M3 11l9-8 9 8M5 9v11h14V9M9 20v-7h6v7',
 code:'M8 5L2 12l6 7m8-14 6 7-6 7m-3-16-2 18',
 route:'M5 19h10a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h10M3 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0M19 1v5',
 flask:'M9 3h6m-5 0v6L4 19q-1 2 2 2h12q3 0 2-2L14 9V3M7 15h10',
 layers:'m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 17l9 5 9-5',
 book:'M12 5q-5-4-10-1v15q5-3 10 1 5-4 10-1V4q-5-3-10 1Zm0 0v15',
 cup:'M4 5h13v9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Zm13 2h2a3 3 0 0 1 0 6h-2M3 22h16',
 music:'M9 18V5l11-2v13M9 8l11-2M9 18a3 3 0 1 1-3-3c1 0 2 0 3 1m11 0a3 3 0 1 1-3-3c1 0 2 0 3 1',
 volume:'M11 4 5 9H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
 mute:'M11 4 5 9H2v6h3l6 5Zm5 5 6 6m0-6-6 6',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z',
 spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
 coin:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v2m0 8v2',
 arrow:'M4 12h16m-6-6 6 6-6 6',
 back:'M20 12H4m6-6-6 6 6 6',
 chevron:'m9 5 7 7-7 7',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-9-5v5l3 2',
 sprout:'M12 22V11M12 15C3 16 2 9 3 5c6-1 9 3 9 10m0-4c0-7 5-9 9-9 1 7-3 11-9 9',
 compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-6-3-2 5-5 2 2-5Z',
 check:'m5 12 4 4L19 6',
 x:'m6 6 12 12M6 18 18 6',
 play:'m8 4 12 8-12 8Z',
 stop:'M5 5h14v14H5Z',
 terminal:'m4 7 5 5-5 5m9 0h7',
 sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
 moon:'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z',
 lamp:'m8 3-5 9h18l-5-9Zm4 9v9m-5 0h10',
 cat:'M4 9V2l6 4h4l6-4v7a9 9 0 1 1-16 0m3 4h1m8 0h1m-7 4 2 1 2-1',
 rain:'M6 13a5 5 0 1 1 2-10 6 6 0 0 1 11 5 3 3 0 1 1-1 6M7 17l-1 4m7-4-1 4m7-4-1 4',
 database:'M20 5c0 2-4 3-8 3S4 7 4 5s4-3 8-3 8 1 8 3Zm-16 0v14c0 2 4 3 8 3s8-1 8-3V5M4 12c0 2 4 3 8 3s8-1 8-3',
 download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
 menu:'M4 6h16M4 12h16M4 18h16',
 bulb:'M8 17v-2a7 7 0 1 1 8 0v2Zm1 4h6M9 17h6',
 flag:'M5 22V3m0 0c6-5 9 5 16 0v10c-7 5-10-5-16 0'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]||icons.code}"/></svg>`;
export function highlight(code){const re=/(#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|try|except|raise|with|pass|yield|async|await|True|False|None|assert|lambda)\b|\b\d+(?:\.\d+)?\b|\b(?:print|input|int|str|len|range|sum|list|set|dict|round|sorted|open|max|min|any)\b)/g;let result='',last=0;for(const m of code.matchAll(re)){result+=esc(code.slice(last,m.index));let cls=m[0][0]==='#'?'comment':/^[f]?["']/.test(m[0])?'string':/^\d/.test(m[0])?'number':/^(print|input|int|str|len|range|sum|list|set|dict|round|sorted|open|max|min|any)$/.test(m[0])?'call':'keyword';result+=`<span class="syntax-${cls}">${esc(m[0])}</span>`;last=m.index+m[0].length;}return result+esc(code.slice(last))+'\n';}
export const shop=[{id:'plant',title:'Больше зелени',desc:'Большое растение у твоего стола.',cost:45,icon:'sprout'},{id:'lamp',title:'Тёплый свет',desc:'Чуть больше солнечного уюта.',cost:75,icon:'lamp'},{id:'cat',title:'Кот Семён',desc:'Тихий напарник для сложных задач.',cost:120,icon:'cat'},{id:'rain',title:'Вечерний дождь',desc:'Капли за окном и спокойный ритм.',cost:160,icon:'rain'}];
export {room};
