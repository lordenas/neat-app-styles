# Calc Hub Backend (MVP+)

Backend для SaaS-платформы калькуляторов на `NestJS + PostgreSQL + Drizzle ORM`.

## Что реализовано

- REST API with JWT auth (`register/login/refresh/me/logout`) + OAuth endpoints scaffold (`google`, `vk`)
- API keys (`GET/POST/DELETE /api-keys`) with hashed storage
- Основной расчётный endpoint `POST /api/v1/calculate/:calculatorSlug`
- Версионируемые формулы и выбор формулы по `calculator + region + date`
- Сохранённые расчёты, публичные ссылки, сравнение, PDF экспорт
- Подписки/квоты, webhook endpoints (`stripe`, `robokassa`)
- Widget backend logic (origin validation, watermark policy)
- Analytics events and basic reporting endpoints
- Swagger docs at `/docs`

## Требования

- Node.js 22+
- PostgreSQL 16+

## Локальный запуск

1. Скопируйте окружение:

```bash
cp .env.example .env
```

2. Установите зависимости:

```bash
npm install
```

3. Сгенерируйте и примените миграции:

```bash
npm run db:generate
npm run db:migrate
```

4. Заполните стартовые данные:

```bash
npm run db:seed
```

После `db:seed` создается админ-пользователь из `.env`:

- `ADMIN_EMAIL` (по умолчанию `admin@calc-hub.local`)
- `ADMIN_PASSWORD` (по умолчанию `Admin12345!`)

5. Запуск API:

```bash
npm run start:dev
```

## Docker Compose

```bash
docker compose up --build
```

## Тесты и качество

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
```

## Ключевые endpoint'ы

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/api-keys`
- `POST /api/api-keys`
- `DELETE /api/api-keys/:id`
- `POST /api/v1/calculate/:calculatorSlug`
- `POST /api/calculations/save`
- `GET /api/calculations`
- `POST /api/calculations/:id/share`
- `GET /api/public/:token`
- `POST /api/comparisons`
- `GET /api/calculations/:id/pdf`
- `POST /api/payments/stripe/webhook`
- `POST /api/payments/robokassa/webhook`
- `GET /api/v1/calculators`
- `GET /api/v1/calculators/:id`
- `POST /api/v1/calculators`
- `PATCH /api/v1/calculators/:id`
- `DELETE /api/v1/calculators/:id`
- `GET /api/v1/calculators/public/:slug`
- `POST /api/v1/calculators/:calcId/pages`
- `PATCH /api/v1/calculators/:calcId/pages/:pageId`
- `DELETE /api/v1/calculators/:calcId/pages/:pageId`
- `POST /api/v1/calculators/:calcId/fields`
- `PATCH /api/v1/calculators/:calcId/fields/:fieldId`
- `DELETE /api/v1/calculators/:calcId/fields/:fieldId`
- `POST /api/v1/calculators/evaluate`
- `POST /api/v1/calculators/:id/embed-token`
- `GET /api/v1/calculators/:id/embed-token`
- `DELETE /api/v1/calculators/:id/embed-token`
- `POST /api/v1/embed/view`
- `GET /api/v1/leads`
- `POST /api/v1/leads`
- `DELETE /api/v1/leads/:id`
- `GET /api/v1/leads/export.csv`

## AST-DSL формул

Формулы хранятся в `formulas.jsonDefinition` как безопасный AST (без `eval/new Function`).

Обязательные секции:

- `version`: версия DSL документа
- `inputs`: словарь входных полей и их типов
- `variables`: промежуточные вычисляемые переменные
- `lookups`: lookup-таблицы для бизнес-правил
- `outputs`: финальные выходные поля расчёта
- `meta` (опционально): имя/описание

Поддерживаемые узлы выражений:

- `literal`, `input_ref`, `var_ref`, `lookup`
- `unary` (`-`, `!`)
- `binary` (`+ - * / % > < >= <= == != && ||`)
- `if` (тернарная ветка)
- `func` (`min`, `max`, `round`, `abs`, `clamp`, `coalesce`)

Пример (сокращенный):

```json
{
  "version": "1.0.0",
  "inputs": {
    "amount": { "type": "number", "required": true },
    "rate": { "type": "number", "required": true }
  },
  "variables": [
    {
      "name": "tax",
      "expr": {
        "type": "binary",
        "op": "*",
        "left": { "type": "input_ref", "path": "amount" },
        "right": {
          "type": "binary",
          "op": "/",
          "left": { "type": "input_ref", "path": "rate" },
          "right": { "type": "literal", "value": 100 }
        }
      }
    }
  ],
  "lookups": {},
  "outputs": [
    { "key": "tax", "expr": { "type": "var_ref", "name": "tax" } }
  ]
}
```

Безопасная публикация новой версии формулы:

1. Добавить новую запись в `formulas` с новым `version` и `effective_from`.
2. Прогнать валидацию DSL (`FormulaDslValidatorService`) до активации.
3. Оставить старую формулу активной до даты вступления новой.
