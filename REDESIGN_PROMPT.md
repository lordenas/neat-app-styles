# Промпт для редизайна калькуляторов

> ⚠️ **ГЛАВНОЕ ПРАВИЛО: Редизайн — это ТОЛЬКО визуальная переработка. Не трогай логику расчётов, состояние (useState), обработчики событий, формулы и любой бизнес-код. Меняй только разметку (JSX), классы (Tailwind), стили и компоновку.**

---

## 1. Философия дизайна

Строгий минимализм для финансовых калькуляторов, вдохновлённый [calcus.ru](https://calcus.ru). Ключевые принципы:

- **Чистота**: Много воздуха, никакого визуального шума
- **Иерархия**: Чёткое разделение на секции, метки мягче контента
- **Компактность форм**: Горизонтальные строки `Label → Input`, не вертикальные стеки
- **Тонкие линии**: Разделители через `<Separator />`, границы 1px
- **Шрифт**: Inter (system-ui fallback), моноширинный для чисел (`font-mono`)

---

## 2. Цветовая палитра (HSL-токены)

Все цвета берутся из CSS-переменных. **Никогда не используй хардкод цветов** (`text-red-500`, `bg-blue-100`). Используй только семантические токены:

```
Фон страницы:     bg-background          (210 20% 98%)
Фон карточек:     bg-card                (0 0% 100%)
Фон секций:       bg-[hsl(var(--section-bg))]  (210 20% 96%)
Текст основной:   text-foreground        (220 20% 10%)
Текст мягкий:     text-muted-foreground  (215 12% 50%)
Акцент/Primary:   text-primary           (214 65% 45%) — синий
Ошибка/Проценты:  text-destructive       (0 65% 55%)  — красный
Успех/Основной долг: text-[hsl(var(--success))]  (145 55% 42%) — зелёный
Предупреждение:   text-[hsl(var(--warning))]     (38 90% 55%)
Рамки:            border-border          (214 20% 88%)
```

### Цветовая кодировка в результатах
- 🟢 **Зелёный** (`--success`): основной долг, досрочные погашения, выгода
- 🔴 **Красный** (`--destructive`): проценты, переплата
- ⚪ **Нейтральный** (`text-foreground`): итого, платёж, остаток

---

## 3. Структура страницы

```
┌─────────────────────────────────────────────────┐
│  Breadcrumb: Главная > Название калькулятора     │
│  <h1> Название калькулятора </h1>                │
├─────────────────────────────┬───────────────────┤
│  Основной контент (flex-1)  │  Сайдбар (w-72)   │
│  ┌───────────────────────┐  │  ┌─────────────┐  │
│  │  section-card: Форма  │  │  │  Реклама     │  │
│  └───────────────────────┘  │  ├─────────────┤  │
│  ┌───────────────────────┐  │  │  Связанные   │  │
│  │  section-card: Итоги  │  │  │  калькуляторы│  │
│  └───────────────────────┘  │  └─────────────┘  │
├─────────────────────────────┴───────────────────┤
│  Footer                                          │
└─────────────────────────────────────────────────┘
```

### Адаптивность
```tsx
// Контейнер
<main className="container max-w-5xl py-6 space-y-5">

// Двухколоночный макет
<div className="flex flex-col lg:flex-row gap-6 items-start">
  <div className="flex-1 min-w-0 space-y-5">
    {/* Основной контент */}
  </div>
  <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6">
    {/* Сайдбар */}
  </aside>
</div>
```

### Контейнер — отступы
```
Мобильные:  padding 1rem
Планшеты:  padding 1.5rem  
Десктоп:   padding 2rem
```

---

## 4. Компоненты и паттерны

### 4.1 Карточка-секция
```tsx
<div className="section-card space-y-5">
  {/* Содержимое */}
</div>
```
CSS-класс: `bg-card rounded-md border border-border p-6`

### 4.2 Строка формы (FormRow)
Компактная горизонтальная строка «Метка → Поле ввода»:

```tsx
function FormRow({ label, tooltip, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
      <div className="sm:w-48 shrink-0 flex items-center gap-1 sm:justify-end sm:pt-2">
        <Label className="text-sm text-muted-foreground text-right">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
```

**Правила FormRow:**
- Метка справа (`text-right`, `sm:justify-end`), мягкий цвет (`text-muted-foreground`)
- Ширина метки фиксированная: `sm:w-48`
- На мобильных — стек (вертикально), на десктопе — строка
- Tooltip через иконку `<Info />` рядом с меткой

### 4.3 Сворачиваемая секция (SectionToggle)
Для дополнительных опций (досрочные погашения, каникулы и т.д.):

```tsx
function SectionToggle({ title, icon, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 w-full text-left group py-1">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary">
            {title}
          </span>
          {count > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pt-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### 4.4 Блок результатов
Сетка метрик:

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  <div className="form-section space-y-1">
    <p className="text-xs text-muted-foreground">Метка</p>
    <p className="text-lg font-semibold font-mono">Значение</p>
    {/* Опциональная подпись */}
    <p className="text-xs text-muted-foreground">Подсказка</p>
  </div>
</div>
```
CSS `form-section`: `bg-[hsl(var(--section-bg))] rounded-md p-5`

### 4.5 Таблица графика
```tsx
<div className="rounded-md border relative overflow-auto max-h-[480px]">
  <Table size="sm" striped hoverable>
    <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
      ...
    </TableHeader>
    <TableBody>...</TableBody>
    <TableFooter className="sticky bottom-0 z-10 bg-card shadow-[0_-1px_0_0_hsl(var(--border))]">
      ...
    </TableFooter>
  </Table>
</div>
```

**Правила таблицы:**
- `size="sm"` — компактные ячейки
- `striped` — чередование фона строк
- `hoverable` — подсветка при наведении
- Sticky header и footer
- Числа: `font-mono text-xs text-right`
- Цвета: основной долг зелёный, проценты красный

### 4.6 Графики (Recharts)
```tsx
// Стиль тултипа
contentStyle={{
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.75rem",
}}

// Цвета
fill="hsl(var(--success))"       // основной долг
fill="hsl(var(--destructive))"   // проценты

// Оси
tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
axisLine={{ stroke: "hsl(var(--border))" }}
```

---

## 5. Типографика

| Элемент | Класс |
|---------|-------|
| Заголовок страницы (h1) | `text-2xl font-bold tracking-tight` |
| Заголовок секции (h2) | `text-lg font-semibold` |
| Подзаголовок (h3) | `text-sm font-medium` |
| Метка формы | `text-sm text-muted-foreground` |
| Подсказка | `text-xs text-muted-foreground` |
| Числовое значение | `text-lg font-semibold font-mono` |
| Числа в таблице | `font-mono text-xs` |
| Текст ошибки | `text-xs text-destructive` |

---

## 6. Компоненты UI-kit

### Input
```tsx
// Базовый
<Input placeholder="Введите текст..." />

// С иконками
<Input inputStart={<Search />} placeholder="Поиск..." />
<Input inputEnd={<span className="text-sm font-medium">₽</span>} placeholder="0" />

// Маленький
<Input inputSize="sm" placeholder="Компактное поле" />

// Форматирование чисел (1000000 → 1 000 000)
<Input formatNumber placeholder="Введите сумму" />
```

### Button
```tsx
<Button>Primary</Button>
<Button variant="outline" size="sm">Outline SM</Button>
<Button variant="ghost" size="icon-sm"><Trash2 /></Button>
<Button icon={<Calculator />}>С иконкой</Button>
```
Размеры: `sm` (h-8) | `default` (h-10) | `lg` (h-11) | `icon` | `icon-sm`
Варианты: `default` | `destructive` | `outline` | `secondary` | `ghost` | `link`

### Select
```tsx
<Select defaultValue="years">
  <SelectTrigger className="w-28">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="years">лет</SelectItem>
    <SelectItem value="months">месяцев</SelectItem>
  </SelectContent>
</Select>
```

### RadioGroup
```tsx
<RadioGroup defaultValue="annuity" className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <div className="flex items-center gap-1.5">
    <RadioGroupItem value="annuity" id="annuity" />
    <Label htmlFor="annuity" className="font-normal cursor-pointer text-sm">Аннуитетные</Label>
  </div>
</RadioGroup>
```
На мобильных — столбик, на десктопе — строка.

### Checkbox
```tsx
<div className="flex items-center gap-2">
  <Checkbox id="option" checked={val} onCheckedChange={setVal} />
  <Label htmlFor="option" className="font-normal cursor-pointer text-sm">Текст опции</Label>
</div>
```

---

## 7. Интервалы и отступы

| Уровень | Класс | Использование |
|---------|-------|---------------|
| Между секциями | `space-y-5` | Карточки, крупные блоки |
| Внутри секции | `space-y-4` | Поля формы |
| Между элементами строки | `gap-2` | Инпуты в одной строке |
| Padding карточки | `p-6` | `.section-card` |
| Padding секции формы | `p-5` | `.form-section` |

---

## 8. Разделители

```tsx
// Горизонтальный — между логическими блоками внутри карточки
<Separator />

// Между секциями формы и опциями
<Separator />
```

---

## 9. Хлебные крошки

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link to="/">Главная</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Название калькулятора</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## 10. Сайдбар

```tsx
<aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6">
  {/* Рекламный блок */}
  <div className="section-card">
    <p className="text-xs text-muted-foreground mb-2">Реклама</p>
    <div className="rounded-md bg-muted/50 border border-dashed border-border-subtle 
                    flex items-center justify-center h-60">
      <span className="text-xs text-muted-foreground">Рекламный блок</span>
    </div>
  </div>

  {/* Навигация */}
  <div className="section-card space-y-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      Категория
    </p>
    <nav className="space-y-1">
      <a href="#" className="block text-sm text-foreground hover:text-primary transition-colors py-1">
        Ссылка
      </a>
    </nav>
  </div>
</aside>
```

---

## 11. Чеклист редизайна

При редизайне каждого калькулятора проверь:

- [ ] Двухколоночный макет (контент + сайдбар)
- [ ] Хлебные крошки вверху
- [ ] `<h1>` — заголовок страницы
- [ ] Форма в `section-card` с `FormRow` для каждого поля
- [ ] Метки выровнены вправо с фиксированной шириной
- [ ] Числовые инпуты с `formatNumber` где нужно
- [ ] Единицы измерения через `inputEnd`
- [ ] Опции через `Checkbox` под `<Separator />`
- [ ] Доп. секции через `SectionToggle` (Collapsible)
- [ ] Кнопка «Рассчитать» с иконкой
- [ ] Результаты в сетке `grid-cols-2 md:grid-cols-3`
- [ ] Цветовая кодировка (зелёный/красный)
- [ ] Таблица: sticky header/footer, striped, размер sm
- [ ] Числа моноширинным шрифтом
- [ ] Графики Recharts со стилями токенов
- [ ] Мобильная адаптация: RadioGroup в столбик, сайдбар внизу
- [ ] **Логика и расчёты НЕ ИЗМЕНЕНЫ**

---

## 12. Пример минимального калькулятора

```tsx
export default function MyCalculator() {
  // ← Вся логика остаётся как есть, не трогать
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-5xl py-6 space-y-5">
        <Breadcrumb>...</Breadcrumb>
        <h1 className="text-2xl font-bold tracking-tight">Название</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-5">
            
            {/* Форма */}
            <div className="section-card space-y-5">
              <div className="space-y-4">
                <FormRow label="Параметр 1">
                  <Input formatNumber inputEnd={<span className="text-sm font-medium">₽</span>} />
                </FormRow>
                <FormRow label="Параметр 2">
                  <Input type="text" className="max-w-20" />
                </FormRow>
              </div>
              <Separator />
              <div className="flex items-center gap-3 sm:pl-52">
                <Button icon={<Calculator />}>Рассчитать</Button>
              </div>
            </div>
            
            {/* Результаты */}
            <div className="section-card space-y-5">
              <h2 className="text-lg font-semibold">Результаты</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-section space-y-1">
                  <p className="text-xs text-muted-foreground">Метка</p>
                  <p className="text-lg font-semibold font-mono">Значение</p>
                </div>
              </div>
            </div>
          </div>
          
          <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6">
            {/* Сайдбар */}
          </aside>
        </div>
      </main>
    </div>
  );
}
```
