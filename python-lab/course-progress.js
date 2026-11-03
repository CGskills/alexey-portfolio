import {lessons} from './curriculum.js';
import {courseModules} from './course-map.js';
export const diplomaIds=['d01','d02','d03'];
export const stageLessons=stage=>lessons.filter(l=>l.stage===stage);
export const stagePractice=stage=>stageLessons(stage).filter(l=>!l.diploma);
export function diplomaGate(state,lesson){
 if(!lesson?.diploma)return {ready:true,missing:[],previous:null};
 const missing=stagePractice(lesson.stage).filter(l=>!state.done.includes(l.id));
 const previous=lesson.stage>0&&!state.done.includes(diplomaIds[lesson.stage-1])?lessons.find(l=>l.id===diplomaIds[lesson.stage-1]):null;
 return {ready:missing.length===0&&!previous,missing,previous};
}
export function recommendedLesson(state){return lessons.find(l=>!state.done.includes(l.id))||lessons.at(-1);}
export function moduleStatus(state,module){
 const done=module.ids.filter(id=>state.done.includes(id)).length;
 return {done,total:module.ids.length,complete:done===module.ids.length};
}
export function courseStats(state){return {quests:lessons.length,modules:courseModules.length,diplomas:diplomaIds.filter(id=>state.done.includes(id)).length};}
