import {icon} from '../ui.js';
import {initQaDay} from './day.js';

const parts = [
  {id: 'lessons', title: 'Уроки', symbol: 'book'},
  {id: 'plan', title: 'План с нуля', symbol: 'route'},
  {id: 'day', title: 'Рабочий день', symbol: 'cup'},
];

export async function mountQa(main, partId) {
  const current = parts.find(part => part.id === partId) || parts[0];
  const nav = parts.map(part => {
    const href = part === parts[0] ? '#qa' : '#qa/' + part.id;
    return `<a href="${href}" ${part === current ? 'aria-current="page"' : ''}>${icon(part.symbol)}${part.title}</a>`;
  }).join('');
  main.innerHTML = `<header class="qa-cover">
    <div class="qa-cover-copy"><p class="qa-kicker"><span></span> ТЕТРАДЬ ПРАКТИКИ &nbsp; / &nbsp; ПРОФЕССИИ</p>
    <h1>QA Automation<br><em>на Python</em></h1>
    <p class="qa-lead">Научитесь проверять веб-приложения. Пройдите путь от первого тест-кейса до автотестов, которые запускаются при каждом изменении кода.</p>
    <p class="qa-folio">6 уроков <b>·</b> 4 этапа обучения <b>·</b> 1 учебная смена</p></div>
    <div class="qa-cover-art"><img src="./assets/cafe-workspace.webp" alt=""></div>
    </header><nav class="qa-nav" aria-label="Разделы курса QA Automation">${nav}</nav>
    <div class="qa-reading" aria-busy="true"><p>Открываем материал…</p></div>`;
  const reading = main.querySelector('.qa-reading');
  try {
    const response = await fetch(new URL('./' + current.id + '.html', import.meta.url));
    if (!response.ok) throw new Error('Material unavailable');
    const html = await response.text();
    if (!reading.isConnected) return;
    reading.innerHTML = html;
    if (current.id === 'day') initQaDay(reading);
  } catch {
    if (!reading.isConnected) return;
    reading.innerHTML = '<p>Не удалось загрузить материал.</p><button class="btn" type="button">Попробовать ещё раз</button>';
    reading.querySelector('button').addEventListener('click', () => mountQa(main, partId));
  } finally {
    reading.removeAttribute('aria-busy');
  }
}
