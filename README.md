# Verdant — премиальный CBD-магазин (демо)

Демонстрационный интернет-магазин премиальных CBD-продуктов для рынка ЕС. Полный цикл покупки: каталог с фильтрами и
поиском, карточка товара, корзина, оформление заказа, отслеживание и онлайн-отказ от договора. Монорепозиторий из
React-витрины, API на Fastify и общего пакета, в котором живёт вся бизнес-логика.

<table>
  <tr>
    <td width="74%"><img src="docs/screenshots/desktop/01-home-hero.webp" alt="Главная страница, десктоп"></td>
    <td width="26%"><img src="docs/screenshots/mobile/01-home-hero.webp" alt="Главная страница, мобильная версия"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/desktop/08-product-purchase.webp" alt="Карточка товара: выбор фасовки, полная стоимость, дата доставки"></td>
    <td><img src="docs/screenshots/mobile/06-cart-drawer.webp" alt="Корзина, мобильная версия"></td>
  </tr>
</table>

Все экраны: [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md).

> **Это демо.** Платёжный провайдер и отправка писем не подключены, отзывы, лаборатория и статистика вымышлены,
> фото товаров стоковые. Полный список с путями к файлам: [docs/DEMO-NOTES.md](docs/DEMO-NOTES.md).

## Что показывает проект

**Покупка без сюрпризов.** Рядом с кнопкой покупки видны точная дата доставки, полная цена с доставкой и ссылка на
условия возврата. Поиск понимает запросы «возврат» или «статус заказа» и исправляет опечатки.

**Одна логика цены на клиенте и сервере.** Корзину и заказ считает одна функция `computeTotals` из
`@verdant/shared`. Сервер не доверяет ценам из браузера: при оформлении он пересчитывает каждую позицию по базе и
проверяет остаток.

**Требования ЕС реализованы в коде:**
- зачёркнутая цена выводится из истории цен как минимальная за 30 дней (директива Omnibus);
- кнопка отказа от договора работает в два шага и выдаёт квитанцию (директива 2023/2673);
- согласие на cookies с равноценным отказом;
- ограничения по странам для отдельных категорий;
- никаких выдуманных таймеров и фальшивой «срочности».

**Премиальный, но сдержанный интерфейс.** Цвет несёт фотография, движение спокойное и одинаковое по всему сайту,
текст держит контраст WCAG. Есть нижняя навигация для телефона и три языка: EN, DE, FR.

Подробно: [docs/FEATURES.md](docs/FEATURES.md) · [docs/COMPLIANCE.md](docs/COMPLIANCE.md) · [docs/DESIGN.md](docs/DESIGN.md)

## Стек

| Слой | Технологии |
|---|---|
| Витрина `apps/web` | React 19, Vite 7, Tailwind CSS 4, React Router 7, TanStack Query 5, Zustand 5, React Hook Form + Zod, Framer Motion, lucide-react |
| API `apps/api` | Fastify 5, Prisma 6, SQLite (переключается на Postgres), Zod 4, pino |
| Общий пакет `packages/shared` | типы, zod-схемы, расчёт корзины и доставки, фильтры каталога, сид-данные |
| Инструменты | TypeScript 5.8 (strict), npm workspaces, tsx, tsup, concurrently |

Архитектура витрины — Feature-Sliced Design. Подробно: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Быстрый старт

Нужен Node.js 20 или новее.

```bash
npm install            # ставит все воркспейсы и генерирует Prisma Client
npm run db:push        # создаёт apps/api/prisma/dev.db по схеме
npm run db:seed        # 14 товаров, 29 вариантов, история цен, 12 отзывов
npm run dev            # API на :3001, витрина на :5173 (/api проксируется в API)
```

Откройте http://localhost:5173. При первом входе сайт попросит подтвердить возраст 18+.

Промокоды для проверки: `WELCOME10` (−10%), `VERDANT5` (−5 €), `GREEN20` (−20%), `COMEBACK15` (−15%).

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | API и витрина вместе, с перезагрузкой при изменениях |
| `npm run dev:api` / `npm run dev:web` | по отдельности |
| `npm run typecheck` | проверка типов: shared → api → web |
| `npm run build` | сборка API (`apps/api/dist`) и витрины (`apps/web/dist`) |
| `npm run start:api` / `npm run preview:web` | запуск собранного API и просмотр собранной витрины |
| `npm run db:push` / `db:seed` / `db:reset` | схема, демо-данные, полный сброс (сброс стирает заказы) |
| `npm run db:backfill-prices -w @verdant/api` | дописывает историю цен в старую базу, не трогая заказы |
| `npm run db:studio -w @verdant/api` | Prisma Studio |
| `npm run screenshots` | переснимает скриншоты документации (нужен запущенный `npm run dev` и Chrome) |

## Структура

```
stor/
├─ apps/
│  ├─ web/                 витрина: app → pages → widgets → features → entities → shared
│  │  └─ public/images/    фотографии (CC0), источники в CREDITS.md
│  └─ api/                 Fastify: routes/, lib/ (сериализация, цены, почта), prisma/ (схема, сид)
├─ packages/
│  └─ shared/              типы, схемы, pricing.ts, filters.ts, constants.ts, data/
├─ scripts/                capture-screenshots.mjs
└─ docs/                   документация и скриншоты
```

## Конфигурация

`apps/api/.env` (образец: `.env.example`): `DATABASE_URL`, `PORT`, `HOST`, `CORS_ORIGIN`, необязательный `LOG_LEVEL`.
Витрина читает `VITE_API_URL` (базовый адрес API, по умолчанию `/api`) и `VITE_API_PROXY` (куда dev-сервер
проксирует `/api`).

**Переход на Postgres:** в `apps/api/prisma/schema.prisma` замените `provider = "sqlite"` на `"postgresql"`, задайте
`DATABASE_URL`, затем выполните `npm run db:push` и `npm run db:seed`. Массивы хранятся как JSON-строки, поэтому
схема переносится без изменений.

## Документация

| Документ | О чём |
|---|---|
| [FEATURES.md](docs/FEATURES.md) | функции магазина по шагам покупки, со скриншотами |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | устройство монорепозитория, слои, потоки данных, состояние |
| [API.md](docs/API.md) | все эндпоинты, параметры, ответы и ошибки |
| [DESIGN.md](docs/DESIGN.md) | дизайн-система и принципы, на которых она построена |
| [COMPLIANCE.md](docs/COMPLIANCE.md) | что из требований ЕС реализовано и что нет |
| [DEMO-NOTES.md](docs/DEMO-NOTES.md) | вымышленные данные, симуляции, известные ограничения |
| [SCREENSHOTS.md](docs/SCREENSHOTS.md) | галерея: 22 экрана десктопа и 12 мобильных |
| [CHANGELOG.md](CHANGELOG.md) | история изменений |
