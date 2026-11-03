export function initQaDay(container = document) {
  const root = container.matches?.('#qa-workday') ? container : container.querySelector('#qa-workday');
  if (!root || root.dataset.dayReady) return;
  const find = (name) => root.querySelector('[data-day-' + name + ']');
  const source = find('source');
  const scenarios = [...source.querySelectorAll('article')];
  if (!scenarios.length) return;
  const form = find('form');
  const options = find('options');
  const title = find('title');
  const next = find('next');
  const feedback = find('feedback');
  const check = find('check');
  const ending = find('end');
  let index = 0;

  function draw(moveFocus) {
    const scenario = scenarios[index];
    find('count').textContent = 'Решение ' + (index + 1) + ' из ' + scenarios.length;
    title.textContent = scenario.querySelector('h3').textContent;
    find('case').replaceChildren(scenario.querySelector('.qa-case').cloneNode(true));
    find('question').textContent = scenario.querySelector('.qa-question').textContent;
    const choices = [...scenario.querySelectorAll('.qa-choices li')];
    options.replaceChildren(...choices.map((choice, number) => {
      const label = document.createElement('label');
      label.className = 'qa-day-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'qa-day-choice';
      input.value = String(number);
      input.required = true;
      label.append(input, document.createTextNode(' ' + choice.querySelector('span').textContent));
      return label;
    }));
    form.querySelector('fieldset').disabled = false;
    feedback.replaceChildren();
    delete feedback.dataset.result;
    check.hidden = false;
    check.textContent = 'Проверить решение';
    next.hidden = true;
    ending.hidden = true;
    find('card').hidden = false;
    if (moveFocus) title.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = options.querySelector('input:checked');
    if (!selected || form.querySelector('fieldset').disabled) return;
    const choice = scenarios[index].querySelectorAll('.qa-choices li')[Number(selected.value)];
    const correct = choice.hasAttribute('data-correct');
    feedback.dataset.result = correct ? 'correct' : 'retry';
    const result = document.createElement('strong');
    result.textContent = correct ? 'Верно.' : 'Попробуйте другой вариант.';
    feedback.replaceChildren(result, choice.querySelector('p').cloneNode(true));
    if (correct) {
      form.querySelector('fieldset').disabled = true;
      check.hidden = true;
      next.hidden = false;
      next.textContent = index === scenarios.length - 1 ? 'Подвести итог' : 'Следующее решение';
      next.focus({preventScroll: true});
    } else {
      check.textContent = 'Проверить ещё раз';
    }
  });

  next.addEventListener('click', () => {
    index += 1;
    if (index < scenarios.length) return draw(true);
    find('card').hidden = true;
    find('count').textContent = 'Пройдено решений: ' + scenarios.length + ' из ' + scenarios.length;
    ending.hidden = false;
    ending.querySelector('h3').focus();
  });

  find('restart').addEventListener('click', () => {
    index = 0;
    draw(true);
  });
  draw(false);
  root.dataset.dayReady = '1';
  source.hidden = true;
  find('live').hidden = false;
}
