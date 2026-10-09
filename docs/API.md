# API

Базовый адрес: `http://localhost:3001/api`. Витрина в dev-режиме обращается к `/api` через прокси Vite.

## Общие правила

| | |
|---|---|
| Формат | JSON. Все суммы целые, в евроцентах, с НДС (`1990` = 19,90 €) |
| Язык | `?lang=en\|de\|fr` или заголовок `Accept-Language`, по умолчанию `en`. Влияет на тексты товаров |
| Ошибки | `{ "error": string, "details"?: unknown }` |
| Валидация | тела запросов и query-параметры проверяются zod-схемами из `@verdant/shared`; при ошибке ответ `400` со списком нарушений в `details` |
| Лимит | 300 запросов в минуту с одного адреса |
| CORS | разрешённые адреса задаются в `CORS_ORIGIN` через запятую |
| Аутентификация | нет (демо), см. [DEMO-NOTES.md](DEMO-NOTES.md#известные-проблемы) |

Пример ошибки валидации:

```json
{
  "error": "Invalid request",
  "details": [
    { "code": "invalid_type", "path": ["customer"], "message": "Invalid input: expected object, received undefined" }
  ]
}
```

---

## Товары

### `GET /products`

Каталог с фильтрами. Ответ: `{ items: Product[], total: number, locale: string }`.

| Параметр | Тип | Описание |
|---|---|---|
| `category` | `flowers \| oils \| edibles \| cosmetics \| prerolls \| tea \| all` | категория |
| `effect` | список через запятую | `relax`, `sleep`, `focus`, `energy`, `balance`, `recovery` (подходит, если совпал хотя бы один) |
| `badge` | список через запятую | `new`, `hit`, `sale`, `limited`, `organic` |
| `min`, `max` | число, центы | диапазон минимальной цены товара |
| `cbd` | число | минимальное содержание CBD, % |
| `q` | строка ≤ 80 | поиск по названию, сорту, описанию, аромату, терпенам и переводам |
| `sort` | `popular \| price-asc \| price-desc \| rating \| new \| cbd` | сортировка |
| `stock` | `1` | только товары в наличии |

```bash
curl "http://localhost:3001/api/products?category=oils&sort=price-asc&lang=de"
```

### `GET /products/:slug`

Один товар. `404 Product not found`, если товара нет.

```json
{
  "id": "p14",
  "slug": "daily-oil-5",
  "name": "Daily Oil 5%",
  "category": "oils",
  "shortDescription": "A gentle everyday dose for beginners. 500 mg CBD, mint flavour.",
  "cbd": 5,
  "thc": 0,
  "effects": ["balance", "relax"],
  "rating": 4.7,
  "reviewsCount": 342,
  "variants": [
    { "id": "p14-10", "label": "10 ml", "price": 1990, "oldPrice": 2490, "lowestPrice30d": 2490, "stock": 58 },
    { "id": "p14-30", "label": "30 ml", "price": 4990, "stock": 20 }
  ],
  "badges": ["sale"],
  "labReportUrl": "/lab-results#p14",
  "origin": "Netherlands"
}
```

Поля `oldPrice` и `lowestPrice30d` вычисляются из таблицы `PriceHistory`. Они есть в ответе, только если текущая цена
ниже минимальной цены за 30 дней до её введения (директива Omnibus). Подробно: [COMPLIANCE.md](COMPLIANCE.md#цена-до-скидки-omnibus).

### Прочие эндпоинты товаров

| Метод и путь | Ответ |
|---|---|
| `GET /products/featured` | 4 товара с отметкой `hit` |
| `GET /products/new` | 4 самых новых товара |
| `GET /products/by-ids?ids=p1,p2` | товары по списку id (до 50), для избранного и сравнения |
| `GET /products/:id/related` | 4 похожих: та же категория и общие эффекты |

---

## Отзывы

| Метод и путь | Описание |
|---|---|
| `GET /reviews?productId=p1&limit=20` | отзывы товара, сначала самые полезные; `limit` до 50 |
| `POST /reviews` | новый отзыв; ответ `201` |
| `POST /reviews/:id/helpful` | отметка «полезно» |

Тело `POST /reviews`:

```json
{ "productId": "p1", "author": "Lena", "city": "Hamburg", "rating": 5, "title": "Great taste", "text": "At least twenty characters of review text." }
```

Ограничения: имя и город 2–60 символов, оценка 1–5, заголовок 3–80, текст 20–1000. После нового отзыва рейтинг
товара пересчитывается.

---

## Заказы

### `POST /orders`

Создаёт заказ. Ответ `201` с объектом `Order`.

```json
{
  "items": [
    { "productId": "p1", "variantId": "p1-5", "qty": 1, "subscription": false, "bundle": false }
  ],
  "customer": {
    "name": "Anna Weber", "email": "anna.weber@example.com", "phone": "+49 30 5550 1234",
    "country": "DE", "city": "Berlin", "postalCode": "10115", "address": "Invalidenstraße 12"
  },
  "delivery": "standard",
  "payment": "card",
  "promoCode": "WELCOME10"
}
```

Что сервер проверяет, по порядку:
1. Страна входит в список доставки, иначе `400` с `details.field = "country"`.
2. Промокод действителен, иначе `400` с `details.field = "promoCode"`.
3. Для страны нет ограничений по категориям: например, цветки нельзя отправлять в IE, SE, FI, LT, SK. Иначе `400`
   со списком товаров.
4. Каждая позиция пересчитывается по ценам из базы. Позиция набора получает −10%.
5. Остаток достаточен, иначе `400 "… only N left in stock"`.

Затем сервер считает итог через `computeTotals`, доставку через `deliveryPriceFor` и НДС 19%. В одной транзакции он
создаёт заказ с номером вида `VD-123456` и списывает остаток.

`delivery`: `standard | express | pickup`. `payment`: `card | paypal | wallet | sepa | klarna`. Оплата в демо не
проводится.

### `GET /orders/:id` и `GET /orders?email=`

Заказ по номеру и список заказов по email (до 50, новые первыми). `GET /orders/:id` возвращает и принятые отказы в
поле `withdrawals`.

> ⚠️ Оба эндпоинта отдают персональные данные без проверки владельца. Для демо это допустимо, для рабочего
> магазина нет. См. [DEMO-NOTES.md](DEMO-NOTES.md#известные-проблемы).

---

## Отказ от договора

### `POST /withdrawals`

Второй шаг кнопки отказа ЕС: покупатель подтвердил заявление.

```json
{ "orderId": "VD-421106", "email": "anna.weber@example.com", "items": ["p1:p1-5:once"], "reason": "Changed my mind" }
```

- Пустой `items` означает отказ от всего заказа. Иначе это ключи позиций из `order.items[].key`.
- Номер заказа нечувствителен к регистру, email тоже.

| Ответ | Когда |
|---|---|
| `201` | квитанция `{ id: "WD-…", orderId, email, createdAt, items, emailSent }` |
| `404` | заказа нет **или** email не совпадает: ответ одинаковый, чтобы номера заказов нельзя было подбирать |
| `400` | прошло больше 30 дней с даты заказа (14 законных дней от получения плюс запас на доставку) |
| `400` | в `items` есть позиции не из этого заказа |

Поле `emailSent` равно `true`, только если письмо действительно передано почтовому сервису. В демо почта не
подключена, поэтому всегда `false`, а интерфейс просит сохранить квитанцию.

---

## Доставка, промокоды, рассылка, служебное

| Метод и путь | Описание |
|---|---|
| `GET /shipping` | все страны доставки с тарифной зоной |
| `GET /shipping/:country` | для страны: зона, способы доставки (перевозчик, цена, срок) и запрещённые категории |
| `GET /promo/:code` | проверка промокода; `404`, если код не существует |
| `POST /newsletter` | `{ email }` → `201` для новой подписки, `200` для существующей; в ответе `promoCode: "WELCOME10"` |
| `GET /health` | `{ ok: true, time }` |

```bash
curl http://localhost:3001/api/shipping/FR
# {"country":"FR","zone":2,"options":[{"id":"standard","carrier":"DHL / DPD","price":790,"days":[3,6]}, …],"restrictedCategories":[]}
```

## Тарифы доставки

| Способ | Зона 1 (DE, AT, NL, BE, LU) | Зона 2 (остальные 22 страны ЕС) |
|---|---|---|
| Стандарт, DHL / DPD | 4,90 €, 2–4 раб. дня | 7,90 €, 3–6 раб. дней |
| Экспресс, DHL Express | 12,90 €, 1–2 дня | 16,90 €, 2–3 дня |
| Постамат / пункт выдачи | 3,90 €, 2–4 дня | 6,90 €, 3–6 дней |

Стандартная доставка бесплатна при сумме товаров от 49 €. Для экспресса и постамата в этом случае платится только
разница со стандартной доставкой, но не меньше нуля.
