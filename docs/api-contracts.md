# API Contracts — Custom Calculator Builder

> **Scope**: Эндпоинты для модулей `/calc-list`, `/calc-builder`, `/calc-builder/:id`, `/c/:slug`.  
> **Auth**: NestJS JWT Guard (собственный).  
> **ORM**: Drizzle + PostgreSQL.  
> **Версия API**: `v1`  
> **Base URL**: `https://api.yourdomain.com/v1`

---

## 1. Аутентификация

Все защищённые эндпоинты требуют заголовок:

```
Authorization: Bearer <access_token>
```

NestJS проверяет подпись JWT через `JwtStrategy`. Публичные эндпоинты (плеер `/c/:slug`) не требуют токена.

---

## 2. Drizzle схемы

### 2.1 `calculators`

```ts
// drizzle/schema/calculators.ts
export const calculators = pgTable("calculators", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      uuid("user_id").notNull(),
  slug:        text("slug").unique().notNull(),       // URL-fragment /c/:slug
  title:       text("title").notNull(),
  description: text("description"),
  theme:       jsonb("theme").default({}),            // CalcTheme
  isPublic:    boolean("is_public").default(false),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow(),
});
```

### 2.2 `calc_pages`

```ts
export const calcPages = pgTable("calc_pages", {
  id:            uuid("id").primaryKey().defaultRandom(),
  calculatorId:  uuid("calculator_id").notNull()
                   .references(() => calculators.id, { onDelete: "cascade" }),
  title:         text("title"),
  orderIndex:    integer("order_index").notNull().default(0),
  autoAdvance:   jsonb("auto_advance"),   // VisibilityConfig | null
  routes:        jsonb("routes"),         // PageRoute[]
  createdAt:     timestamp("created_at").defaultNow(),
});
```

### 2.3 `calc_fields`

```ts
export const calcFields = pgTable("calc_fields", {
  id:           uuid("id").primaryKey().defaultRandom(),
  calculatorId: uuid("calculator_id").notNull()
                  .references(() => calculators.id, { onDelete: "cascade" }),
  pageId:       uuid("page_id")
                  .references(() => calcPages.id, { onDelete: "set null" }),
  type:         text("type").notNull(),      // CalcFieldType
  label:        text("label").notNull(),
  key:          text("key").notNull(),       // переменная {key} в формулах
  orderIndex:   integer("order_index").notNull(),
  rowId:        text("row_id").notNull(),    // для grid layout
  config:       jsonb("config").default({}), // CalcFieldConfig
  formula:      text("formula"),            // только для type=result
  visibility:   jsonb("visibility"),        // VisibilityConfig | null
  createdAt:    timestamp("created_at").defaultNow(),
});
```

### 2.4 `embed_tokens`

```ts
export const embedTokens = pgTable("embed_tokens", {
  id:           uuid("id").primaryKey().defaultRandom(),
  calculatorId: uuid("calculator_id").notNull()
                  .references(() => calculators.id, { onDelete: "cascade" }),
  userId:       uuid("user_id").notNull(),
  token:        text("token").unique().notNull(), // генерируется на бэке
  monthlyViews: integer("monthly_views").default(0),
  viewsResetAt: timestamp("views_reset_at").defaultNow(),
  createdAt:    timestamp("created_at").defaultNow(),
  updatedAt:    timestamp("updated_at").defaultNow(),
});
```

---

## 3. Эндпоинты — Calculators

### `GET /calculators`

Список калькуляторов текущего пользователя.

**Auth**: required  
**Query params**:

| Param    | Type    | Default | Description           |
|----------|---------|---------|-----------------------|
| `page`   | number  | 1       | Страница пагинации    |
| `limit`  | number  | 50      | Элементов на странице |

**Response `200`**:

```ts
{
  data: CalcListItem[];
  total: number;
  page: number;
  limit: number;
}

interface CalcListItem {
  id:          string;
  slug:        string;
  title:       string;
  description: string | null;
  isPublic:    boolean;
  fieldsCount: number;  // COUNT(calc_fields)
  pagesCount:  number;  // COUNT(calc_pages)
  createdAt:   string;  // ISO 8601
  updatedAt:   string;
}
```

---

### `GET /calculators/:id`

Полная структура калькулятора (для редактора `/calc-builder/:id`).

**Auth**: required (только владелец)  
**Response `200`**:

```ts
{
  data: CustomCalculator;
}
```

Полный тип `CustomCalculator` описан в разделе 6.

---

### `POST /calculators`

Создать новый калькулятор.

**Auth**: required  
**Body**:

```ts
{
  title:       string;               // required, 1–200 chars
  description?: string;              // optional, max 1000 chars
  isPublic?:   boolean;              // default: false
  theme?:      CalcTheme;
  pages?:      CreatePageDto[];
  fields:      CreateFieldDto[];
}
```

**Response `201`**:

```ts
{
  data: {
    id:   string;
    slug: string;
  }
}
```

**Errors**:
- `403` — лимит плана превышен (план проверяется по `subscriptions.plan`)
- `422` — невалидные данные

---

### `PATCH /calculators/:id`

Обновить калькулятор (upsert pages + fields).

**Auth**: required (только владелец)  
**Body**: Partial тех же полей что и POST, плюс:

```ts
{
  pages?:  UpsertPageDto[];    // полный массив страниц (replace)
  fields?: UpsertFieldDto[];   // полный массив полей (replace)
}
```

> **Стратегия**: бэк удаляет существующие pages/fields, вставляет новые в одной транзакции.

**Response `200`**:

```ts
{
  data: {
    id:        string;
    updatedAt: string;
  }
}
```

---

### `DELETE /calculators/:id`

Удалить калькулятор (cascade на pages, fields, embed_tokens).

**Auth**: required (только владелец)  
**Response `204`**: no content

---

### `GET /calculators/public/:slug`

Публичный плеер — получить калькулятор по slug.

**Auth**: не требуется (если `is_public = true`)  
**Response `200`**:

```ts
{
  data: CustomCalculator;
}
```

**Errors**:
- `404` — калькулятор не найден или не публичный

---

## 4. Эндпоинты — Pages

> Страницы управляются через `PATCH /calculators/:id` (массовый upsert).  
> Отдельные эндпоинты используются для partial-обновления без пересохранения всего калькулятора.

### `POST /calculators/:calcId/pages`

Добавить страницу.

**Auth**: required (владелец)  
**Body**:

```ts
{
  title?:       string;
  orderIndex:   number;
  autoAdvance?: VisibilityConfig | null;
  routes?:      PageRouteDto[];
}
```

**Response `201`**: `{ data: { id: string } }`

---

### `PATCH /calculators/:calcId/pages/:pageId`

Обновить страницу.

**Auth**: required  
**Body**: Partial `CreatePageDto`  
**Response `200`**: `{ data: { id: string, updatedAt: string } }`

---

### `DELETE /calculators/:calcId/pages/:pageId`

Удалить страницу (cascade на fields).

**Auth**: required  
**Response `204`**

---

## 5. Эндпоинты — Fields

> Аналогично Pages — поля обычно обновляются через `PATCH /calculators/:id`.  
> Ниже отдельные эндпоинты для оптимистичных обновлений.

### `POST /calculators/:calcId/fields`

**Auth**: required  
**Body**:

```ts
{
  pageId?:     string;
  type:        CalcFieldType;
  label:       string;
  key:         string;              // уникален в рамках калькулятора
  orderIndex:  number;
  rowId:       string;
  config:      CalcFieldConfig;
  formula?:    string;
  visibility?: VisibilityConfig | null;
}
```

**Response `201`**: `{ data: { id: string } }`

---

### `PATCH /calculators/:calcId/fields/:fieldId`

Partial update поля (например, только `orderIndex` при drag-and-drop).

**Auth**: required  
**Body**: Partial `CreateFieldDto`  
**Response `200`**: `{ data: { id: string } }`

---

### `DELETE /calculators/:calcId/fields/:fieldId`

**Auth**: required  
**Response `204`**

---

## 6. Эндпоинты — Embed

### `POST /calculators/:id/embed-token`

Сгенерировать токен встройки для калькулятора.

**Auth**: required (владелец)  
**Response `201`**:

```ts
{
  data: {
    token:     string;   // uuid или random hex
    scriptUrl: string;   // https://yourdomain.com/widget.js?id=:id&t=...
    iframeUrl: string;   // https://yourdomain.com/c/:slug
  }
}
```

---

### `GET /calculators/:id/embed-token`

Получить текущий токен (или `null` если не создан).

**Auth**: required  
**Response `200`**: `{ data: EmbedToken | null }`

```ts
interface EmbedToken {
  token:        string;
  monthlyViews: number;
  viewsResetAt: string;
  createdAt:    string;
}
```

---

### `DELETE /calculators/:id/embed-token`

Инвалидировать токен (ранее встроенный виджет перестанет работать).

**Auth**: required  
**Response `204`**

---

### `POST /embed/view` (public)

Трекинг просмотра виджета. Вызывается `widget.js` при каждом рендере.

**Auth**: не требуется  
**Body**:

```ts
{
  token:    string;   // embed token
  referrer: string;   // document.referrer
}
```

**Response `200`**: `{ ok: true }` или `{ ok: false, reason: "limit_exceeded" }`

> Бэк инкрементирует `embed_tokens.monthly_views`. Если превышен лимит плана — возвращает `limit_exceeded` (виджет может показать заглушку).

---

## 7. Эндпоинты — Formula Evaluation

### `POST /calculators/evaluate`

Безопасное вычисление формулы на сервере (mathjs sandbox).

**Auth**: required  
**Body**:

```ts
{
  formula: string;                     // "round({amount} * {rate} / 100, 2)"
  values:  Record<string, number>;     // { amount: 500000, rate: 15.5 }
}
```

**Response `200`**:

```ts
{ result: number }
// или при ошибке:
{ error: string }   // "Unknown variable: xyz"
```

**Назначение**: валидация формул в редакторе (`/calc-builder`), серверная страховка перед сохранением.

---

## 8. DTO-типы (сводная таблица)

```ts
// Страница (Create / Upsert)
interface UpsertPageDto {
  id?:          string;             // если есть — update, иначе insert
  title?:       string;
  orderIndex:   number;
  autoAdvance?: VisibilityConfig | null;
  routes?:      PageRouteDto[];
}

// Маршрут страницы
interface PageRouteDto {
  id?:             string;
  condition:       VisibilityConfig;
  targetPageIndex: number;
}

// Поле (Create / Upsert)
interface UpsertFieldDto {
  id?:         string;             // если есть — update, иначе insert
  pageId?:     string;
  type:        CalcFieldType;
  label:       string;
  key:         string;
  orderIndex:  number;
  rowId:       string;
  config:      CalcFieldConfig;
  formula?:    string;
  visibility?: VisibilityConfig | null;
}

// Полный калькулятор (response)
interface CustomCalculator {
  id:          string;
  slug:        string;
  title:       string;
  description: string | null;
  isPublic:    boolean;
  theme:       CalcTheme;
  pages:       CalcPage[];
  fields:      CalcField[];
  createdAt:   string;
  updatedAt:   string;
}
```

---

## 9. Коды ошибок

| HTTP | Code                  | Описание                                  |
|------|-----------------------|-------------------------------------------|
| 400  | `VALIDATION_ERROR`    | Невалидные данные в body                  |
| 401  | `UNAUTHORIZED`        | Токен отсутствует или истёк               |
| 403  | `FORBIDDEN`           | Нет прав (не владелец)                    |
| 403  | `PLAN_LIMIT_EXCEEDED` | Превышен лимит плана (кол-во калькуляторов, страниц) |
| 404  | `NOT_FOUND`           | Ресурс не найден или не публичный         |
| 409  | `SLUG_CONFLICT`       | Slug уже занят                            |
| 422  | `FORMULA_ERROR`       | Невалидная формула                        |

**Формат ошибки**:

```ts
{
  statusCode: number;
  code:       string;
  message:    string;
  details?:   Record<string, string[]>;  // поля валидации
}
```

---

## 10. Лимиты по планам

| Plan       | `maxCalcs` | `maxPages` | `canUseBranching` |
|------------|-----------|------------|-------------------|
| `free`     | 0         | —          | false             |
| `basic`    | 5         | 2          | false             |
| `standard` | 20        | 5          | true              |
| `pro`      | unlimited | unlimited  | true              |

Лимиты проверяются в NestJS guard/interceptor перед `POST /calculators` и `POST /calculators/:id/pages`.  
Текущий план берётся из таблицы `subscriptions` по `userId`.

---

## 11. Фронтенд — точки замены localStorage

| Функция (localStorage)          | Замена (HTTP)                          |
|---------------------------------|----------------------------------------|
| `loadCalculators()`             | `GET /calculators`                     |
| `getCalculatorById(id)`         | `GET /calculators/:id`                 |
| `getCalculatorBySlug(slug)`     | `GET /calculators/public/:slug`        |
| `saveCalculator(calc)` (create) | `POST /calculators`                    |
| `saveCalculator(calc)` (update) | `PATCH /calculators/:id`               |
| `deleteCalculator(id)`          | `DELETE /calculators/:id`              |
| embed code generation           | `POST /calculators/:id/embed-token`    |
