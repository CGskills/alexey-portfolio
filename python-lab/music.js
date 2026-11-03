export const tracks=[
 {id:'cafe-1',title:'Мелодия 01',duration:108,source:'сделай мелодич(1).mp3'},
 {id:'cafe-2',title:'Мелодия 02',duration:142,source:'сделай мелодич (1)(1).mp3'},
 {id:'cafe-3',title:'Мелодия 03',duration:149,source:'сделай мелодич (2)(1).mp3'},
 {id:'cafe-4',title:'Мелодия 04',duration:84,source:'сделай мелодич (3)(1).mp3'}
];
export const validTrack=id=>tracks.some(t=>t.id===id)?id:id==='morning'?'cafe-2':'cafe-1';
export const musicTime=n=>`${Math.floor((Number.isFinite(n)?n:0)/60)}:${String(Math.floor((Number.isFinite(n)?n:0)%60)).padStart(2,'0')}`;
export class CafeMusic {
 constructor(){this.audio=null;this.track='';this.enabled=false;this.mode='playlist';this.level=30;this.sequence=0;this.onChange=()=>{};this.onTick=()=>{};this.onError=()=>{};}
 async play(track='cafe-1',volume=30,mode=this.mode){
  const token=++this.sequence;track=validTrack(track);this.mode=mode;this.level=volume;
  if(!this.audio||this.track!==track){
   this.audio?.pause();const audio=this.audio=new Audio(new URL(`./audio/${track}.mp3`,import.meta.url));this.track=track;audio.preload='metadata';
   audio.addEventListener('timeupdate',()=>{if(this.audio===audio)this.onTick();});
   audio.addEventListener('loadedmetadata',()=>{if(this.audio===audio)this.onTick();});
   audio.addEventListener('ended',()=>{if(this.audio!==audio||!this.enabled)return;this.play(this.next(1),this.level,this.mode).catch(()=>{});});
   audio.addEventListener('error',()=>{if(this.audio!==audio)return;this.enabled=false;this.onChange();this.onError('Не удалось загрузить трек. Выбери другую мелодию или попробуй снова.');});
  }
  const audio=this.audio;audio.loop=this.mode==='repeat';this.volume(volume);
  try{await audio.play();if(token!==this.sequence){if(this.audio!==audio)audio.pause();return;}this.enabled=true;this.onChange();}
  catch(error){if(token===this.sequence){this.enabled=false;this.onChange();this.onError('Музыка не запустилась. Нажми «Слушать» ещё раз.');}throw error;}
 }
 next(direction=1){const i=Math.max(0,tracks.findIndex(t=>t.id===this.track));if(this.mode==='shuffle'&&direction>0)return tracks[(i+1+Math.floor(Math.random()*(tracks.length-1)))%tracks.length].id;return tracks[(i+direction+tracks.length)%tracks.length].id;}
 pause(){this.sequence++;this.audio?.pause();this.enabled=false;this.onChange();}
 volume(value){this.level=Math.max(0,Math.min(100,Number(value)||0));if(this.audio)this.audio.volume=this.level/100;}
 setMode(mode){this.mode=['playlist','repeat','shuffle'].includes(mode)?mode:'playlist';if(this.audio)this.audio.loop=this.mode==='repeat';}
 seek(seconds){if(this.audio&&Number.isFinite(this.audio.duration))this.audio.currentTime=Math.max(0,Math.min(this.audio.duration,seconds));}
 hide(){this.audio?.pause();}
 async resume(){if(this.enabled&&this.audio)try{await this.audio.play();}catch{this.enabled=false;this.onChange();this.onError('Нажми «Слушать», чтобы продолжить музыку.');}}
}
