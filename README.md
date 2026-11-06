# Портфолио Алексея — Web / AI Developer

Публичное портфолио для работодателей и заказчиков: **Amber Clinic CMS**, **шахматный тренажёр (Telegram Mini App, beta)** и **«Тихий код» (обучение Python)**.

## Сайт

После активации GitHub Pages: **https://cgskills.github.io/alexey-portfolio/**

## Включить бесплатный домен GitHub Pages

1. Откройте **Settings → Pages** для этого репозитория.
2. В **Build and deployment** установите **Source: Deploy from a branch**.
3. Выберите **Branch: main** и каталог **/(root)**, нажмите **Save**.
4. После развёртывания откройте `https://cgskills.github.io/alexey-portfolio/`.

Сайт статический: `index.html` + `styles.css`, адаптивен для компьютеров и смартфонов. Бесплатное размещение через GitHub Pages; HTTPS включается платформой.

## Проекты

- [Amber Clinic](https://amberclinictula.ru/) — корпоративный сайт стоматологии и собственная CMS.
- Шахматный тренажёр — бета-версия учебного Telegram Mini App, ещё не опубликована.
- [«Тихий код»](https://python-evening-lab.dendy88.chatgpt.site/) — обучающее веб-приложение Python.

Визуализации CMS и шахматного приложения на сайте **схематичные**, это не настоящие скриншоты. Видеодемонстрации Amber Clinic и шахматного тренажёра встроены прямо в сайт. MP4-файлы находятся в корне репозитория: `Amber_Clinic_Admin_Demo.mp4` и `Chess_Trainer_Beta_Demo.mp4`. Они автоматически извлечены из архива с помощью GitHub Actions.

## Изменения

Для обновления портфолио достаточно изменить `index.html` и `styles.css` в ветке `main`. GitHub Pages опубликует новую версию автоматически после коммита.

---
Стек и описания в портфолио основаны на сведениях о проектах. Позиционирование: web-разработка, автоматизация, AI-assisted development.

## Автообновление Python Lab

Каталог `python-lab/` публикуется вместе с портфолио после каждого изменения `main` через workflow `Publish portfolio and Python lab`. Последнее обновление включает диалог input() и полную панель операторов.

Перенос новых публикаций из Sites выполняет ежечасная автоматизация Codex «Обновлять Python Lab на GitHub» в исходном чате. Это локальная автоматизация Codex: для выполнения нужны работающий Codex и доступ к подключённым Sites/GitHub. Она переносит изменения, после чего GitHub Pages публикуется автоматически. Прямое скачивание Sites из GitHub Actions отключено из-за HTTP 403; scripts/sync-python-lab.py сохранён только как неиспользуемый прототип.
