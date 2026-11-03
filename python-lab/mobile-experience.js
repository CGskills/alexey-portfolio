let headline=null;
export function stopHeadline(){
 if(headline){headline.classList.remove('is-typing');headline.querySelectorAll('.typed-char').forEach(c=>{c.style.animation='none';c.style.opacity='1';});headline=null;}
}
export function startHeadline(motion=true){
 stopHeadline();
 const title=document.querySelector('[data-typewriter]');
 if(!title||!motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 headline=title;
 if(!title.querySelector('.typed-char')){
  title.setAttribute('aria-label','Маленькая кофейня. Большая история твоего кода.');
  const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  let index=0;
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   for(const word of node.textContent.split(/(\s+)/)){
    if(!word)continue;
    if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));continue;}
    const wrap=document.createElement('span');wrap.className='typed-word';wrap.setAttribute('aria-hidden','true');
    for(const char of word){const span=document.createElement('span');span.className='typed-char';span.textContent=char;span.style.setProperty('--type-delay',`${index++*42}ms`);wrap.append(span);}
    fragment.append(wrap);
   }
   node.replaceWith(fragment);
  });
 }
 title.classList.add('is-typing');
}
export function bindViewport(){
 const sync=()=>{
  const view=window.visualViewport;
  const height=view?.height||window.innerHeight,top=view?.offsetTop||0;
  document.documentElement.style.setProperty('--visible-height',height+'px');
  document.documentElement.style.setProperty('--viewport-top',top+'px');
  document.documentElement.style.setProperty('--keyboard-inset',Math.max(0,window.innerHeight-height-top)+'px');
  document.body.classList.toggle('keyboard-active',height<window.innerHeight*.77);
 };
 window.visualViewport?.addEventListener('resize',sync);
 window.visualViewport?.addEventListener('scroll',sync);
 window.addEventListener('resize',sync);sync();
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)stopHeadline();});
}
