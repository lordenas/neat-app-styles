
## План: Монетизация конструктора калькуляторов (3 тарифа + Stripe)

### Итоговые лимиты тарифов
```
                 Базовый ($5)   Стандарт ($10)   Про ($20)
Форм (calc)          5               20             ∞
Страниц/calc         2                5             ∞
Лог. ветвления       ✗               ✓             ✓
Email-уведомл.       ✓ (лимит)       ✓             ✓
SMS                  ✗               ✗             ✓
Telegram             ✓ (лимит)       ✓             ✓
Чат с поддержкой     ✗               ✗             ✓
```

---

### Шаг 1 — Включить Stripe
Подключим Stripe через встроенную интеграцию. Создадим 3 продукта с ежемесячными подписками: Basic ($5), Standard ($10), Pro ($20).

### Шаг 2 — Таблица подписок в БД (миграция)
```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free', -- 'free' | 'basic' | 'standard' | 'pro'
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: user видит только свою строку
```

### Шаг 3 — Hook `usePlan` (фронтенд)
Хук читает план пользователя из таблицы `subscriptions`. Возвращает:
- `plan`: 'free' | 'basic' | 'standard' | 'pro'
- `limits`: `{ maxCalcs, maxPages, canUseBranching, hasChatSupport }`
- `isLimitReached(type)`: проверка перед созданием

### Шаг 4 — Блокировка в конструкторе
- **CalcList** (`/calc-list`): кнопка «Новый» — при достижении лимита форм → заблокировать + показать модальное окно апгрейда
- **CalcBuilder** (`/calc-builder`): добавление страниц — при достижении лимита → заблокировать кнопку «+ Страница» + показать модальное окно
- **FieldSettingsPanel**: условия/ветвления (`condition`) — для Basic/Free скрыть опцию или показать lock-badge

### Шаг 5 — Страница `/pricing`
Новая публичная страница с таблицей сравнения тарифов. При клике «Подключить» → редирект на Stripe Checkout (через Edge Function `create-checkout-session`).

### Шаг 6 — Edge Functions
- `create-checkout-session` — создаёт Stripe Checkout Session и возвращает URL
- `stripe-webhook` — обрабатывает `checkout.session.completed` и `customer.subscription.deleted`, обновляет `subscriptions` в БД

### Шаг 7 — Блок тарифа в Dashboard
В `/dashboard` добавить карточку «Ваш тариф» с текущим планом, датой следующего списания и кнопкой «Управлять / Апгрейд».

### Шаг 8 — UpgradeModal (переиспользуемый компонент)
Модальное окно с кратким описанием причины блокировки, сравнением текущего и следующего тарифа и кнопкой «Перейти на [план]» → `/pricing`.

---

### Порядок реализации
1. `stripe--enable_stripe` (запрос ключа)
2. Миграция БД (таблица `subscriptions`)
3. Hook `usePlan`
4. Edge Functions (`create-checkout-session`, `stripe-webhook`)
5. Страница `/pricing`
6. Блокировки в CalcList + CalcBuilder + FieldSettingsPanel
7. `UpgradeModal`
8. Блок в Dashboard

### Важные замечания
- `localStorage` для калькуляторов остаётся — лимиты проверяются только на фронтенде через количество элементов в localStorage и план из БД
- Пользователи без аккаунта (`free`) имеют 0 форм — конструктор только для авторизованных
- Stripe Webhook требует настройки `STRIPE_WEBHOOK_SECRET` через secrets
