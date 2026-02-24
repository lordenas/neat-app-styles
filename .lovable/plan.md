

## Анализ оптимизации размера билда

### Найденные проблемы

#### 1. Дублирование валидационных библиотек: `yup` + `zod`
- **zod** (~13 KB gzip) — не используется нигде в коде (0 импортов), но стоит в зависимостях
- **yup** (~15 KB gzip) — используется только в одном файле (`ValidationFormShowcase.tsx`)
- **Рекомендация**: удалить `zod` полностью. При желании можно и `yup` заменить на ручную валидацию, чтобы убрать ещё одну зависимость

#### 2. `@tanstack/react-query` (~12 KB gzip) — не используется
- Импортируется только в `App.tsx` для создания провайдера `QueryClientProvider`
- Нигде в проекте нет вызовов `useQuery`, `useMutation` и т.д.
- **Рекомендация**: удалить библиотеку и убрать провайдер из `App.tsx`

#### 3. `@hookform/resolvers` (~2 KB) — можно убрать вместе с yup
- Используется только в `ValidationFormShowcase.tsx` как мост между react-hook-form и yup
- Если заменить yup на ручную валидацию — resolvers тоже не нужен

#### 4. `recharts` (~150 KB gzip) — самая тяжёлая зависимость
- Используется в 2 местах: `CreditCalculator.tsx` и `ChartsShowcase.tsx`
- Это showcase-проект, поэтому графики могут быть оправданы
- **Рекомендация**: если графики не критичны — удалить. Если нужны — оставить, но загружать лениво через `React.lazy`

#### 5. `react-day-picker` + `date-fns` (~30 KB gzip суммарно)
- Используются в Calendar/DatePicker компонентах — это легитимное использование
- **Рекомендация**: оставить, но проверить, что не импортируются полные локали (только нужные)

#### 6. `react-helmet-async` (~3 KB gzip)
- Используется для SEO-тегов на 2 страницах
- Оправданное использование, оставить

### План действий (по приоритету)

#### Шаг 1 — Удалить неиспользуемый `zod`
- Убрать из `package.json`
- Нет кода для чистки

#### Шаг 2 — Удалить неиспользуемый `@tanstack/react-query`
- Убрать из `package.json`
- Удалить `QueryClient` / `QueryClientProvider` из `App.tsx`

#### Шаг 3 — Заменить `yup` на ручную валидацию в `ValidationFormShowcase.tsx`
- Переписать схему валидации на нативный `react-hook-form` (встроенные правила `required`, `minLength`, `pattern`)
- Удалить `yup` и `@hookform/resolvers` из `package.json`

#### Шаг 4 (опционально) — Ленивая загрузка recharts
- Страницы `CreditCalculator` и `Showcase` уже lazy — recharts подтянется только при их посещении, так что это уже оптимизировано

### Ожидаемая экономия

| Зависимость | Размер (gzip) | Статус |
|---|---|---|
| zod | ~13 KB | Удалить (0 использований) |
| @tanstack/react-query | ~12 KB | Удалить (только провайдер) |
| yup + @hookform/resolvers | ~17 KB | Заменить на нативную валидацию |
| **Итого** | **~42 KB** | |

### Технические детали

- `App.tsx`: убрать импорт `QueryClient`, `QueryClientProvider` и обёртку
- `ValidationFormShowcase.tsx`: переписать с `yupResolver` на встроенные правила `react-hook-form` (`register("field", { required: "...", minLength: ... })`)
- `package.json`: удалить `zod`, `@tanstack/react-query`, `yup`, `@hookform/resolvers`
