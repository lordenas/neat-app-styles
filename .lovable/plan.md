

## Улучшения UI-Kit -- Раунд 3

### 1. ConfirmDialog: поддержка async `onConfirm` с loading-состоянием

Сейчас `ConfirmDialog` закрывается сразу при клике на "Подтвердить". Если `onConfirm` -- асинхронный (удаление, API-вызов), диалог закрывается до завершения операции, и пользователь не видит обратной связи.

**Файл:** `src/components/ui/confirm-dialog.tsx`
- Сделать `onConfirm` поддерживающим `Promise`: `onConfirm: () => void | Promise<void>`
- При возврате Promise показывать спиннер на кнопке подтверждения и блокировать кнопки
- Закрывать диалог только после успешного resolve
- Добавить внутренний state `loading`

```tsx
// Использование:
<ConfirmDialog
  trigger={<Button variant="destructive">Удалить</Button>}
  title="Удалить запись?"
  onConfirm={async () => {
    await api.deleteItem(id);  // диалог остаётся открытым и показывает спиннер
  }}
/>
```

### 2. Button: вариант `success` для позитивных действий

Есть `destructive` для опасных действий, но нет варианта для "успешных" -- сохранение, подтверждение, оплата. Приходится использовать `default` или кастомные классы.

**Файл:** `src/components/ui/button.tsx`
- Добавить вариант `success: "bg-success text-success-foreground hover:bg-success/90"` в `buttonVariants`

```tsx
<Button variant="success">Оплатить</Button>
<Button variant="success" icon={<Check />}>Сохранено</Button>
```

### 3. Select: добавить `size="lg"` для консистентности с Input

Input и Textarea уже поддерживают `inputSize="lg"`, но SelectTrigger -- только `sm` и `default`. Это создает визуальную несогласованность в формах.

**Файл:** `src/components/ui/select.tsx`
- Добавить вариант `lg` в `SelectTrigger`: `"h-12 px-4 py-3 text-base"`

### 4. Progress: добавить текст значения и `indeterminate` режим

Прогресс-бар не показывает числовое значение, и нет режима "бесконечной" загрузки.

**Файл:** `src/components/ui/progress.tsx`
- Добавить проп `showValue?: boolean` -- отображает "60%" справа от полоски
- Добавить проп `indeterminate?: boolean` -- анимация "бегущей полоски" когда значение неизвестно

```tsx
<Progress value={60} showValue />           // "60%" справа
<Progress indeterminate />                   // бегущая полоска
<Progress indeterminate variant="info" />
```

**Файл:** `src/index.css`
- Добавить keyframes для indeterminate-анимации

### 5. Tooltip: shortcut-проп для быстрого создания

Сейчас Tooltip требует 5 строк кода для простейшего случая. Частый паттерн -- обернуть иконку/кнопку подсказкой.

**Файл:** Новый компонент `src/components/ui/simple-tooltip.tsx`
- Создать обёртку `SimpleTooltip` с пропсами `content` и `children`
- Автоматически оборачивает в `TooltipProvider > Tooltip > TooltipTrigger + TooltipContent`

```tsx
// Было (5 строк):
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button size="icon"><Settings /></Button></TooltipTrigger>
    <TooltipContent>Настройки</TooltipContent>
  </Tooltip>
</TooltipProvider>

// Станет (1 строка):
<SimpleTooltip content="Настройки">
  <Button size="icon"><Settings /></Button>
</SimpleTooltip>
```

### Порядок реализации

1. Button: вариант `success` (минимальное изменение, 1 строка)
2. Select: `size="lg"` (1 строка)
3. SimpleTooltip (новый файл + экспорт из index.ts)
4. Progress: `showValue` + `indeterminate` (CSS + компонент)
5. ConfirmDialog: async `onConfirm` с loading

### Технические детали

**Button success вариант:**
```tsx
// В buttonVariants.variants.variant:
success: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]/90",
```

**Select lg:**
```tsx
// В SelectTrigger, расширить условие inputSize:
inputSize === "sm" ? "h-8 px-2.5 py-1 text-xs" 
  : inputSize === "lg" ? "h-12 px-4 py-3 text-base" 
  : "h-10 px-3 py-2 text-sm"
```

**Progress indeterminate keyframes (src/index.css):**
```css
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

**Progress с showValue:**
```tsx
<div className="flex items-center gap-3">
  <ProgressPrimitive.Root ...>...</ProgressPrimitive.Root>
  {showValue && <span className="text-sm tabular-nums">{value ?? 0}%</span>}
</div>
```

**ConfirmDialog async:**
```tsx
const [loading, setLoading] = React.useState(false);
const handleConfirm = async () => {
  const result = onConfirm();
  if (result instanceof Promise) {
    setLoading(true);
    try { await result; onOpenChange?.(false); }
    finally { setLoading(false); }
  }
};
```

### Обновления документации

- Обновить `COMPONENTS.md` с новыми пропсами
- Обновить `src/components/ui/index.ts` с экспортом `SimpleTooltip`
- Добавить showcase-примеры для каждого нового пропа
