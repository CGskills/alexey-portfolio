(() => {
  const heading = document.querySelector('.hero h1');
  const portrait = document.querySelector('.portrait');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!heading || !portrait) return;
  if (!motion.matches) {
    heading.setAttribute('aria-label', 'Сайты, сервисы и интерфейсы.');
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const word of node.textContent.split(/(\s+)/)) {
        if (!word.trim()) { fragment.append(word); continue; }
        const group = document.createElement('span');
        group.className = 'typed-word';
        group.setAttribute('aria-hidden', 'true');
        for (const char of word) {
          const letter = document.createElement('span');
          letter.className = 'typed-letter';
          letter.style.setProperty('--delay', index++ * 42 + 'ms');
          letter.textContent = char;
          group.append(letter);
        }
        fragment.append(group);
      }
      node.replaceWith(fragment);
    }
  }
  let frame = 0;
  function paint() {
    frame = 0;
    const bounds = portrait.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) return;
    const offset = (innerHeight / 2 - bounds.top - bounds.height / 2) * 0.045;
    const limit = portrait.querySelector('img').clientHeight * 0.019;
    portrait.style.setProperty('--shift', Math.max(-limit, Math.min(limit, offset)) + 'px');
  }
  function queue() { if (!frame) frame = requestAnimationFrame(paint); }
  function sync() {
    if (motion.matches) {
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      cancelAnimationFrame(frame);
      frame = 0;
      portrait.style.removeProperty('--shift');
    } else {
      addEventListener('scroll', queue, {passive:true});
      addEventListener('resize', queue);
      queue();
    }
  }
  motion.addEventListener('change', sync);
  sync();
})();