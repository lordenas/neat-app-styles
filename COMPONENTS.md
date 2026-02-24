# UI Kit — Справочник компонентов

> Полный API-справочник всех UI-компонентов проекта. Импортируй из `@/components/ui/<component>`.
> Все стили используют **HSL-токены** из `index.css`. Хардкод цветов запрещён.

---

## Оглавление

1. [Button](#button)
2. [Input](#input)
3. [Select](#select)
4. [Checkbox](#checkbox)
5. [RadioGroup](#radiogroup)
6. [Switch](#switch)
7. [Slider](#slider)
8. [Label](#label)
9. [Badge](#badge)
10. [Card](#card)
11. [Table](#table)
12. [Tabs](#tabs)
13. [Accordion](#accordion)
14. [Dialog](#dialog)
15. [Popover](#popover)
16. [Tooltip](#tooltip)
17. [DropdownMenu](#dropdownmenu)
18. [Breadcrumb](#breadcrumb)
19. [Calendar](#calendar)
20. [Collapsible](#collapsible)
21. [Alert](#alert)
22. [Separator](#separator)
23. [Progress](#progress)
24. [ScrollArea](#scrollarea)
25. [Skeleton](#skeleton)
26. [Avatar](#avatar)
27. [Паттерны (FormRow, SectionToggle, DatePick)](#паттерны)

---

## Button

**Импорт:** `import { Button } from "@/components/ui/button"`

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `variant` | `"default"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"ghost"` \| `"link"` | `"default"` | Стиль кнопки |
| `size` | `"sm"` \| `"default"` \| `"lg"` \| `"icon"` \| `"icon-sm"` | `"default"` | Размер |
| `icon` | `ReactNode` | — | Иконка перед текстом |
| `asChild` | `boolean` | `false` | Рендерит дочерний элемент вместо `<button>` |

```tsx
<Button>Primary</Button>
<Button variant="outline" size="sm">Outline SM</Button>
<Button variant="ghost" size="icon-sm"><Trash2 /></Button>
<Button variant="destructive">Удалить</Button>
<Button icon={<Calculator />}>С иконкой</Button>
<Button asChild><a href="/link">Ссылка-кнопка</a></Button>
```

**Размеры:** `sm` (h-8, text-xs) → `default` (h-10, text-sm) → `lg` (h-11, text-sm) → `icon` (h-10 w-10) → `icon-sm` (h-8 w-8)

---

## Input

**Импорт:** `import { Input } from "@/components/ui/input"`

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `inputSize` | `"sm"` \| `"default"` | `"default"` | Размер поля |
| `inputStart` | `ReactNode` | — | Элемент в начале поля (иконка/текст) |
| `inputEnd` | `ReactNode` | — | Элемент в конце поля (иконка/текст) |
| `formatNumber` | `boolean` | `false` | Авто-группировка цифр пробелами (1000000 → 1 000 000). В `onChange` — «сырое» значение без пробелов |
| `error` | `string` | — | Сообщение об ошибке под полем. Место зарезервировано даже без ошибки (форма не прыгает). Автоматически добавляет `border-destructive`, `aria-invalid` и `aria-describedby` |

```tsx
<Input placeholder="Введите текст..." />
<Input inputStart={<Search />} placeholder="Поиск..." />
<Input inputEnd={<span className="text-sm font-medium">₽</span>} placeholder="0" />
<Input inputSize="sm" placeholder="Компактное поле" />
<Input formatNumber placeholder="Введите сумму" />
<Input error={errors.name?.message ?? ""} {...register("name")} />
```

**Примечания:**
- При `formatNumber` в `onChange` передаётся числовое значение без пробелов.
- При `error` передавайте пустую строку `""` когда ошибки нет — место под текст будет зарезервировано. Без пропа `error` дополнительный элемент не рендерится.

---

## Select

**Импорт:** `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select"`

```tsx
<Select defaultValue="apple">
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Выберите..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Яблоко</SelectItem>
    <SelectItem value="banana">Банан</SelectItem>
  </SelectContent>
</Select>
```

**Маленький вариант:**
```tsx
<SelectTrigger className="h-8 text-xs w-36">
  <SelectValue />
</SelectTrigger>
```

---

## Checkbox

**Импорт:** `import { Checkbox } from "@/components/ui/checkbox"`

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={val} onCheckedChange={setVal} />
  <Label htmlFor="terms" className="font-normal cursor-pointer text-sm">Принимаю условия</Label>
</div>
```

---

## RadioGroup

**Импорт:** `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`

```tsx
<RadioGroup defaultValue="option1" onValueChange={setValue}
  className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <div className="flex items-center gap-1.5">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1" className="font-normal cursor-pointer text-sm">Вариант 1</Label>
  </div>
  <div className="flex items-center gap-1.5">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2" className="font-normal cursor-pointer text-sm">Вариант 2</Label>
  </div>
</RadioGroup>
```

**Правило:** На мобильных — столбик (`flex-col`), на десктопе — строка (`sm:flex-row`).

---

## Switch

**Импорт:** `import { Switch } from "@/components/ui/switch"`

```tsx
<div className="flex items-center gap-2">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Уведомления</Label>
</div>
```

---

## Slider

**Импорт:** `import { Slider } from "@/components/ui/slider"`

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
<Slider defaultValue={[25, 75]} max={100} step={5} />  {/* Диапазон */}
```

---

## Label

**Импорт:** `import { Label } from "@/components/ui/label"`

```tsx
<Label htmlFor="email">Email</Label>
<Label className="text-sm text-muted-foreground">Метка формы</Label>
```

---

## Badge

**Импорт:** `import { Badge } from "@/components/ui/badge"`

| Variant | Описание |
|---------|----------|
| `default` | Primary фон |
| `secondary` | Нейтральный фон |
| `destructive` | Красный фон |
| `outline` | Только рамка |

```tsx
<Badge>Новый</Badge>
<Badge variant="secondary">Черновик</Badge>
<Badge variant="destructive">Ошибка</Badge>
<Badge variant="outline">v2.0</Badge>
```

---

## Card

**Импорт:** `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание карточки</CardDescription>
  </CardHeader>
  <CardContent>Содержимое</CardContent>
  <CardFooter>
    <Button>Действие</Button>
  </CardFooter>
</Card>
```

**Альтернатива:** CSS-класс `section-card` = `bg-card rounded-md border border-border p-6`

---

## Table

**Импорт:** `import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table"`

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `size` | `"default"` \| `"sm"` | `"default"` | Размер текста |
| `bordered` | `boolean` | `false` | Обводка ячеек |
| `striped` | `boolean` | `false` | Чередование фона строк |
| `hoverable` | `boolean` | `true` | Подсветка при наведении |

```tsx
<div className="rounded-md border relative overflow-auto max-h-[480px]">
  <Table size="sm" striped hoverable>
    <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
      <TableRow>
        <TableHead>Имя</TableHead>
        <TableHead className="text-right">Сумма</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Иван</TableCell>
        <TableCell className="text-right font-mono">10 000</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter className="sticky bottom-0 z-10 bg-card shadow-[0_-1px_0_0_hsl(var(--border))]">
      <TableRow>
        <TableCell>Итого</TableCell>
        <TableCell className="text-right font-mono font-semibold">10 000</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</div>
```

**Правила:** Числа всегда `font-mono text-right`. Sticky header/footer для длинных таблиц.

---

## Tabs

**Импорт:** `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
    <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Контент 1</TabsContent>
  <TabsContent value="tab2">Контент 2</TabsContent>
</Tabs>
```

---

## Accordion

**Импорт:** `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Раздел 1</AccordionTrigger>
    <AccordionContent>Содержимое раздела 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

| Prop | Описание |
|------|----------|
| `type="single"` | Одна секция одновременно |
| `type="multiple"` | Несколько одновременно |
| `collapsible` | Позволяет закрыть все (только для `single`) |

---

## Dialog

**Импорт:** `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"`

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Открыть</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
      <DialogDescription>Описание действия</DialogDescription>
    </DialogHeader>
    <p>Содержимое</p>
    <DialogFooter>
      <Button>Подтвердить</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Popover

**Импорт:** `import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"`

```tsx
<Popover>
  <PopoverTrigger asChild><Button variant="outline">Открыть</Button></PopoverTrigger>
  <PopoverContent>Содержимое поповера</PopoverContent>
</Popover>
```

---

## Tooltip

**Импорт:** `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"`

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Наведи / Тапни</TooltipTrigger>
    <TooltipContent>Текст подсказки</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Мобильные устройства:** Тултип автоматически переключается в режим клика на тач-устройствах. Hover недоступен — открытие/закрытие по тапу.

**Примечание:** `TooltipProvider` нужно оборачивать на верхнем уровне один раз.

---

## DropdownMenu

**Импорт:** `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuRadioGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"`

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">Меню</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Действия</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Редактировать</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Breadcrumb

**Импорт:** `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"`

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Текущая страница</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## Calendar

**Импорт:** `import { Calendar } from "@/components/ui/calendar"`

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
<Calendar mode="range" selected={range} onSelect={setRange} />
```

Основан на `react-day-picker`. Поддерживает `locale` (например `ru` из `date-fns/locale`).

---

## Collapsible

**Импорт:** `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`

```tsx
<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>Раскрыть</CollapsibleTrigger>
  <CollapsibleContent>Скрытое содержимое</CollapsibleContent>
</Collapsible>
```

---

## Alert

**Импорт:** `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"`

| Variant | Описание |
|---------|----------|
| `default` | Нейтральный фон |
| `destructive` | Красная рамка |

```tsx
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Информация</AlertTitle>
  <AlertDescription>Данные обновлены.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Ошибка</AlertTitle>
  <AlertDescription>Не удалось сохранить.</AlertDescription>
</Alert>
```

---

## Separator

**Импорт:** `import { Separator } from "@/components/ui/separator"`

```tsx
<Separator />                                    {/* Горизонтальный */}
<Separator orientation="vertical" className="h-6" />  {/* Вертикальный */}
```

---

## Progress

**Импорт:** `import { Progress } from "@/components/ui/progress"`

```tsx
<Progress value={60} />
<Progress value={100} className="h-2" />
```

---

## ScrollArea

**Импорт:** `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`

```tsx
<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">{/* контент */}</div>
</ScrollArea>

{/* Горизонтальная прокрутка */}
<ScrollArea className="w-96 whitespace-nowrap">
  <div className="flex gap-4">{/* контент */}</div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

---

## Skeleton

**Импорт:** `import { Skeleton } from "@/components/ui/skeleton"`

```tsx
<Skeleton className="h-4 w-48" />
<Skeleton className="h-10 w-full rounded-md" />
```

---

## Avatar

**Импорт:** `import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"`

```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="Имя" />
  <AvatarFallback>ИФ</AvatarFallback>
</Avatar>
```

---

## Паттерны

### FormRow — строка формы

Компактная горизонтальная строка «Метка → Поле ввода». Используется внутри калькуляторов.

```tsx
function FormRow({ label, tooltip, children, className }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 ${className ?? ""}`}>
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

### SectionToggle — сворачиваемая секция

Используется для дополнительных настроек (досрочные погашения, каникулы).

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

### DatePick — выбор даты с маской (мультилокальный)

Поддерживает 7 локалей с умной маской ввода. Режимы: только календарь, ввод+календарь, диапазон, period picker, datetime picker.

**Локали:** RU `дд.мм.гггг`, DE `TT.MM.JJJJ`, UK `dd/mm/yyyy`, US `mm/dd/yyyy`, JP `yyyy/mm/dd`, ISO `yyyy-mm-dd`, FR `jj/mm/aaaa`.

```tsx
// Только календарь
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? formatDateLocale(date, locale) : locale.placeholder}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} locale={locale.fnsLocale} />
  </PopoverContent>
</Popover>

// Ввод с маской + календарь
<DateInputPicker locale={locale} />

// Диапазон дат (два месяца)
<Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} locale={locale.fnsLocale} />

// Period Picker — два отдельных поля (начало — конец)
<PeriodPicker locale={locale} />

// DateTime Picker (дата + время с маской, 24ч/12ч по локали)
<DateTimePicker locale={locale} />
```

**Конфиг локали (DateLocaleConfig):**

| Поле | Тип | Описание |
|------|-----|----------|
| `code` | `string` | Код локали: `"ru"`, `"en-US"`, `"ja"`, `"iso"` |
| `order` | `[DatePart, DatePart, DatePart]` | Порядок: `["day","month","year"]` или `["year","month","day"]` |
| `sep` | `string` | Разделитель: `"."`, `"/"`, `"-"` |
| `placeholder` | `string` | Плейсхолдер: `"дд.мм.гггг"`, `"mm/dd/yyyy"` |
| `fnsLocale` | `Locale` | Локаль date-fns для Calendar |
| `fnsFormat` | `string` | Формат date-fns: `"dd.MM.yyyy"` |
| `use24h` | `boolean` | Формат времени по умолчанию |
| `timePlaceholder` | `string` | Плейсхолдер времени: `"чч:мм"`, `"hh:mm"` |

**Маска:** Умная валидация (дни в месяце, високосные годы). Маска времени сохраняет позицию курсора.

---

### Notifications (Toast)

Библиотека: **Sonner** (`sonner`). Импорт: `import { toast } from "sonner"`

| Тип | Метод | Иконка |
|-----|-------|--------|
| Успех | `toast.success(title, opts)` | `CheckCircle2` — `--success` |
| Ошибка | `toast.error(title, opts)` | `XCircle` — `--destructive` |
| Предупреждение | `toast.warning(title, opts)` | `AlertTriangle` — `--warning` |
| Информация | `toast.info(title, opts)` | `Info` — `--info` |
| Нейтральный | `toast(title, opts)` | — |
| Загрузка | `toast.loading(title)` | Спиннер |

```tsx
toast.success("Сохранено", { description: "Описание действия." });
toast.error("Ошибка", { description: "Что пошло не так." });
toast.warning("Внимание", { description: "Предупреждение." });
toast.info("Подсказка", { description: "Полезная информация." });
toast("Нейтральный", { action: { label: "Открыть", onClick: () => {} } });

// Цепочка Loading → Success
const id = toast.loading("Пересчёт...");
toast.success("Готово!", { id, description: "Пересчитано." });
```

---

### Progress & Stepper

**Progress bar:**
```tsx
import { Progress } from "@/components/ui/progress";
<Progress value={60} className="h-2" />
```

**Stepper** — пошаговый визард с кружками, коннекторами и навигацией:
```tsx
const steps = [
  { label: "Параметры", description: "Сумма, срок" },
  { label: "Результат", description: "График" },
];

{steps.map((s, i) => (
  <div key={i} className="flex-1 flex flex-col items-center">
    {/* Коннектор */}
    {i > 0 && <div className={cn("h-0.5", isCompleted ? "bg-primary" : "bg-border")} />}
    {/* Кружок */}
    <button className={cn(
      "h-8 w-8 rounded-full border-2",
      isCompleted ? "bg-primary border-primary text-primary-foreground"
        : isCurrent ? "border-primary text-primary"
        : "border-border text-muted-foreground"
    )}>
      {isCompleted ? <Check /> : i + 1}
    </button>
    <p className="text-xs mt-1.5">{s.label}</p>
  </div>
))}
```

**Навигация:** Кнопки «Назад» / «Далее» с `disabled` на границах.

---

### Skeleton (паттерны загрузки)

Шаблоны скелетонов для типичных интерфейсов:

```tsx
// Карточка
<div className="section-card space-y-4 max-w-sm">
  <div className="flex items-center gap-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
  <Skeleton className="h-32 w-full rounded-md" />
</div>

// Таблица (header + rows)
{[...Array(4)].map((_, i) => (
  <div key={i} className="flex gap-3">
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-20" />
  </div>
))}

// Форма (label + input)
<div className="space-y-2">
  <Skeleton className="h-3 w-24" />
  <Skeleton className="h-10 w-full rounded-md" />
</div>
```

---

### Copy to Clipboard

Два варианта: кнопка и инлайн-строка.

```tsx
// CopyButton — кнопка с иконкой и текстом
<CopyButton text="50 109 ₽" label="платёж" />
// Props: text (string), label? (string)
// Состояние: copied → "Скопировано" + Check иконка (2 сек)

// CopyInline — строка с кодом и иконкой копирования
<CopyInline text="npm install @radix-ui/react-accordion" />
// Props: text (string)
// Стиль: border bg-muted/50 px-3 py-2 + font-mono code
```

**Логика:** `navigator.clipboard.writeText(text)` → `copied = true` → сброс через 2 сек.

---

### Empty State

Пустое состояние с иконкой, заголовком, описанием и опциональным CTA.

| Prop | Тип | Описание |
|------|-----|----------|
| `icon` | `ReactNode` | Иконка (h-10 w-10) |
| `title` | `string` | Заголовок |
| `description` | `string` | Описание |
| `action` | `ReactNode?` | CTA-кнопка (опционально) |

```tsx
<EmptyState
  icon={<Calculator className="h-10 w-10" />}
  title="Нет расчётов"
  description="Заполните параметры и нажмите «Рассчитать»"
  action={<Button size="sm">Рассчитать</Button>}
/>
```

**Стиль:** `border border-dashed border-border py-12 text-center rounded-md`

---

### Multiselect

Мульти-выбор с Badge-тегами и выпадающим списком.

| Prop | Тип | Описание |
|------|-----|----------|
| `label` | `string` | Метка поля |
| `selected` | `string[]` | Текущие выбранные значения |
| `onSelectedChange` | `(val: string[]) => void` | Колбэк изменения |
| `maxDisplayed` | `number?` | Макс. тегов для отображения, остальные — "Выбрано N элементов" |

```tsx
<Multiselect
  label="Отделы"
  selected={selected}
  onSelectedChange={setSelected}
  maxDisplayed={3}
/>
```

**Фичи:** Badge-теги с X для удаления, ChevronDown-индикатор, закрытие по клику вне, поддержка `maxDisplayed` для свёртки.

---

### Slider + Tooltip

```tsx
<Slider value={value} onValueChange={setValue} max={100} step={1} />
<Slider value={range} onValueChange={setRange} max={100} step={1} />  {/* Диапазон */}
```

Tooltip на мобильных работает по тапу:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span className="underline decoration-dotted cursor-help">Наведите</span>
  </TooltipTrigger>
  <TooltipContent>Подсказка</TooltipContent>
</Tooltip>
```

---

## CSS-утилиты

| Класс | Стили | Использование |
|-------|-------|---------------|
| `.section-card` | `bg-card rounded-md border border-border p-6` | Основная карточка-контейнер |
| `.form-section` | `bg-[hsl(var(--section-bg))] rounded-md p-5` | Блок результатов / подсекция |
| `.table-stripe` | `bg-[hsl(var(--stripe-bg))]` | Чередование строк таблицы |
| `.label-text` | `text-sm font-medium text-foreground` | Заголовок поля |
| `.helper-text` | `text-xs text-muted-foreground mt-1` | Подсказка к полю |
| `.error-text` | `text-xs text-destructive mt-1` | Текст ошибки |

---

## Иконки

Библиотека: **Lucide React** (`lucide-react`)

```tsx
import { Calculator, Search, Trash2, Plus, Info, ChevronDown, ChevronRight, ... } from "lucide-react";
```

Размеры иконок определяются размером кнопки: `sm` → 3.5, `default` → 4, `lg` → 5.

---

## Графики (Recharts)

**Стилизация тултипа:**
```tsx
contentStyle={{
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.75rem",
}}
```

**Цвета данных:**
```
Основной долг / Выгода:  fill="hsl(var(--success))"
Проценты / Переплата:    fill="hsl(var(--destructive))"
```

**Оси:**
```tsx
tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
axisLine={{ stroke: "hsl(var(--border))" }}
```

---

## File Upload

**Импорт:** `import { FileUploadDropzone, FileUploadButton, FileUploadAvatar } from "@/components/ui/file-upload"`

Три переиспользуемых компонента загрузки файлов с встроенной валидацией размера и типа.

### Общие пропсы (`FileUploadBaseProps`)

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `accept` | `string \| string[]` | `"image/,.pdf"` | MIME-типы / расширения |
| `acceptLabel` | `string` | из `accept` | Человекочитаемая подпись |
| `maxSizeMB` | `number` | `10` | Макс. размер файла в MB |
| `multiple` | `boolean` | `true` | Множественный выбор |
| `onFilesChange` | `(files: File[]) => void` | — | Колбэк при изменении |
| `disabled` | `boolean` | `false` | Заблокировать |

### FileUploadDropzone

```tsx
<FileUploadDropzone accept="image/*,.pdf" acceptLabel="PNG, JPG, PDF" maxSizeMB={10} onFilesChange={setFiles} />
```

### FileUploadButton

```tsx
<FileUploadButton accept={["image/", ".pdf"]} maxSizeMB={20} buttonLabel="Загрузить" onFilesChange={setFiles} />
```

### FileUploadAvatar

```tsx
<FileUploadAvatar accept="image/png,image/jpeg" maxSizeMB={5} label="Фото профиля" onFilesChange={setFiles} />
```

**Валидация:** `toast.error` при неподдерживаемом формате или превышении лимита.
