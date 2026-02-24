

## Улучшения UI-Kit

### 1. Баг: дублирование `{...props}` в TabsContent

В `src/components/ui/tabs.tsx` (строки 106-108) `{...props}` написано дважды подряд. Это не вызывает ошибку, но создает лишнюю работу React и может привести к неожиданным проблемам при серверном рендеринге.

**Файл:** `src/components/ui/tabs.tsx`
- Удалить дублирующийся `{...props}` на строке 107
- Вернуть `children` в рендер (сейчас `children` деструктурируется, но не используется)

### 2. Удалить `framer-motion` из зависимостей проекта

`framer-motion` используется только в `ShowcaseSection.tsx` (демо-компонент). Для SSR-проекта лучше убрать эту зависимость из core-библиотеки и заменить на CSS-анимации.

**Файл:** `src/components/showcase/ShowcaseSection.tsx`
- Заменить `motion.div` на обычный `div` с CSS-классами `animate-in fade-in slide-in-from-bottom-3` из `tailwindcss-animate`

**Файл:** `package.json`
- Удалить `framer-motion` из dependencies

### 3. Добавить проп `loading` в Input и Textarea

Кнопка уже поддерживает `loading`, но поля ввода -- нет. Полезно для async-валидации и отправки форм.

**Файл:** `src/components/ui/input.tsx`
- Добавить опциональный проп `loading?: boolean`
- При `loading=true` показывать спиннер `Loader2` в `inputEnd` позиции
- Автоматически ставить `disabled` при loading

### 4. Добавить `size="lg"` для Input и Textarea

Сейчас Input и Textarea поддерживают только `sm` и `default`. Для лендингов и форм калькуляторов нужен крупный размер.

**Файл:** `src/components/ui/input.tsx`
- Добавить вариант `lg: "h-12 px-4 py-3 text-base"` в `inputVariants`

**Файл:** `src/components/ui/textarea.tsx`
- Добавить вариант `lg: "min-h-[120px] text-base"` в `textareaVariants`

### 5. Добавить `dot` вариант для Badge (статус-индикатор)

Часто нужен бейдж с цветной точкой слева для статусов (online/offline, active/inactive).

**Файл:** `src/components/ui/badge.tsx`
- Добавить проп `dot?: boolean` -- рендерит цветной кружок 6x6px перед текстом
- Цвет точки определяется текущим `variant`

### Порядок реализации

1. Исправить баг в TabsContent (критичный, потеря children)
2. Удалить framer-motion и заменить на CSS
3. Добавить `loading` для Input
4. Добавить `size="lg"` для Input/Textarea
5. Добавить `dot` для Badge

### Технические детали

**TabsContent fix:**
```tsx
// Было (строки 99-108):
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 ...", className)}
    {...props}
    {...props}  // <-- дубль
  />

// Станет:
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 ...", className)}
    {...props}
  />
```

**ShowcaseSection CSS замена:**
```tsx
// Было:
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

// Станет:
<div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
```

**Input loading:**
```tsx
// Использование:
<Input loading placeholder="Проверка..." />
<Input loading={isValidating} inputStart={<Mail />} placeholder="Email" />
```

**Badge dot:**
```tsx
// Использование:
<Badge variant="success" dot>Активен</Badge>
<Badge variant="destructive" dot>Офлайн</Badge>
```
