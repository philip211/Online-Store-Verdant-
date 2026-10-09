# Архитектура

## Обзор

```
┌──────────────────────────────┐        /api (прокси Vite в dev)        ┌──────────────────────────────┐
│  apps/web  (React 19 + Vite) │  ───────────────────────────────────▶  │  apps/api  (Fastify 5)       │
│  Feature-Sliced Design       │  ◀───────────────────────────────────  │  routes → lib → Prisma       │
│  TanStack Query, Zustand     │              JSON                      │  SQLite (или Postgres)       │
└──────────────┬───────────────┘                                        └──────────────┬───────────────┘
               │                     import '@verdant/shared'                          │
               └──────────────────────────────┬────────────────────────────────────────┘
                                              ▼
                         ┌──────────────────────────────────────────┐
                         │ packages/shared                          │
                         │ типы · zod-схемы · pricing · filters ·   │
                         │ константы (доставка, НДС, промокоды) ·   │
                         │ сид-данные                               │
                         └──────────────────────────────────────────┘
```

Это npm workspaces из трёх пакетов. Пакет `@verdant/shared` публикуется как исходники TypeScript (`main: src/index.ts`).
Витрина и API импортируют его напрямую, без отдельной сборки. При сборке API `tsup` встраивает shared в бандл.

## Главный принцип: одна логика на клиенте и сервере

Всё, что влияет на деньги и на правила, лежит в `packages/shared` и выполняется одинаково с обеих сторон:

| Что | Где | Кто использует |
|---|---|---|
| Расчёт корзины: подытог, скидки, подписка, промокод, доставка, порог бесплатной доставки | `pricing.ts` → `computeTotals` | корзина в браузере и создание заказа на сервере |
| Цена доставки по зоне и способу, срок доставки | `pricing.ts` → `deliveryPriceFor`, `deliveryDaysFor` | оформление и API |
| Ограничения по странам | `constants.ts`, `restrictedCategoriesFor` | шаг доставки и проверка в `POST /orders` |
| Фильтры, сортировка и поиск каталога | `filters.ts` → `applyFilters` | `GET /products` и поиск в браузере |
| Валидация форм и запросов | `schemas.ts` (zod) | React Hook Form на клиенте, парсинг тела запроса на сервере |
| Типы `Product`, `Order`, `CartTotals`… | `types.ts` | везде |

Сервер никогда не доверяет ценам из браузера. Клиент присылает только `productId`, `variantId`, количество и
флаги. API заново берёт цены из базы, проверяет остаток, страну и промокод и только потом считает итог той же
функцией `computeTotals`.

## Витрина: Feature-Sliced Design

```
apps/web/src/
├─ app/        точка входа, роутер, провайдеры (Query), RootLayout, глобальные стили и токены
├─ pages/      страницы маршрутов (home, catalog, product, cart, checkout, orders, order, withdrawal, …)
├─ widgets/    крупные блоки страниц (header, hero, cart-drawer, product-purchase, product-reviews, …)
├─ features/   пользовательские действия (add-to-cart, product-search, product-filters, product-quiz, …)
├─ entities/   бизнес-сущности: модель, запросы, UI (product, cart, order, review, wishlist, compare, category)
└─ shared/     API-клиент, i18n, конфиг и маршруты, хуки, UI-кит (Button, Modal, Drawer, Select, …)
```

**Правило импортов:** `pages → widgets → features → entities → shared`. Нижний слой не знает о верхнем. Например,
`ProductCard` из `entities` не импортирует кнопку «в корзину» из `features`, а получает её через проп-слот
`actionSlot`. Каждый срез наружу отдаёт только свой `index.ts`.

Все страницы загружаются лениво (`React.lazy`). Vite выносит библиотеки в отдельные чанки: vendor, motion, query.

## Данные и состояние

**Данные с сервера** идут через TanStack Query (`entities/*/model/queries.ts`, клиент `shared/api/client.ts`).
Настройки по умолчанию: `staleTime` 5 минут, `gcTime` 30 минут, один повтор, без перезапроса при фокусе окна.
Каталог загружается целиком один раз в `RootLayout`. Каталог небольшой, поэтому поиск, похожие товары и сравнение
работают мгновенно в браузере.

**Состояние браузера** хранится в Zustand с сохранением в localStorage:

| Ключ | Что хранит |
|---|---|
| `verdant:cart` | позиции корзины и промокод |
| `verdant:wishlist`, `verdant:compare`, `verdant:recent` | id товаров: избранное, сравнение (до 3), недавно просмотренные (до 8) |
| `verdant:orders` | заказы, оформленные в этом браузере (аккаунтов в демо нет) |
| `verdant:age`, `verdant:consent`, `verdant:locale` | подтверждение возраста, согласие на cookies, язык |

## API

```
apps/api/src/
├─ server.ts           запуск
├─ app.ts              Fastify: CORS, лимит 300 запросов/мин, обработчик ошибок, префикс /api
├─ routes/             products, reviews, orders, withdrawals, misc (health, promo, shipping, newsletter)
└─ lib/
   ├─ serialize.ts     строки БД → DTO; вычисление Omnibus-цены из PriceHistory
   ├─ locale.ts        язык из ?lang= или Accept-Language
   ├─ mailer.ts        заглушка почты: пишет письмо в лог
   ├─ errors.ts        HttpError, notFound, badRequest
   └─ prisma.ts        клиент Prisma
```

Ошибки приходят в одном формате `{ error, details? }`. Ошибка zod-валидации даёт `400` со списком полей. Полный
список эндпоинтов: [API.md](API.md).

### Модель данных

```
Product 1─* Variant 1─* PriceHistory          Order 1─* OrderItem *─1 Variant
   │                                             │
   └─* Review                                    └─* Withdrawal
Subscriber
```

- **PriceHistory** хранит все цены варианта по датам. Зачёркнутая цена нигде не вводится руками: сериализатор
  вычисляет минимальную цену за 30 дней до текущей и отдаёт её, только если текущая цена ниже.
- **Withdrawal** — принятые заявления об отказе: какие позиции, когда, с какого email.
- Массивы (эффекты, терпены, переводы) хранятся как JSON-строки. Поэтому схема без изменений переносится с SQLite на
  Postgres.

## Интернационализация

Своя лёгкая реализация (`shared/i18n/core.ts`):
- ключ перевода — английская строка;
- если перевода нет, показывается английский;
- подстановки вида `{var}` и выбор формы множественного числа.

Словари `de` и `fr` (около 670 строк каждый) подгружаются динамическим импортом только для выбранного языка. Первый
рендер ждёт, пока загрузится нужный словарь. Описания товаров переводит сервер из поля `Product.i18n`. Клиент передаёт
язык заголовком `Accept-Language`.

## Производительность

- Фоновые слои неподвижны: анимированный фон заставлял бы все элементы с `backdrop-filter` перерисовывать размытие
  на каждом кадре.
- Для мелких повторяющихся элементов вместо размытия используется `.glass-lite`.
- Фотографии в WebP шириной 1000–1600 px. Главное фото грузится с `fetchpriority="high"`, остальные лениво.
- Анимации трогают только `transform` и `opacity`. При `prefers-reduced-motion` движение отключено глобально.

## Сборка и проверка

`npm run typecheck` проверяет типы во всех трёх пакетах (strict). `npm run build` собирает API через tsup в
`apps/api/dist` (ESM, node20) и витрину через `tsc -b && vite build` в `apps/web/dist`. Тестов, линтера и CI в
проекте нет, см. [DEMO-NOTES.md](DEMO-NOTES.md#инженерные-пробелы).
