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

```tsx
<Input placeholder="Введите текст..." />
<Input inputStart={<Search />} placeholder="Поиск..." />
<Input inputEnd={<span className="text-sm font-medium">₽</span>} placeholder="0" />
<Input inputSize="sm" placeholder="Компактное поле" />
<Input formatNumber placeholder="Введите сумму" />
<Input inputStart={<DollarSign />} inputEnd={<span>USD</span>} placeholder="0.00" />
```

**Примечание:** При `formatNumber` в `onChange` передаётся числовое значение без пробелов.

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
    <TooltipTrigger>Наведи</TooltipTrigger>
    <TooltipContent>Текст подсказки</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

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

### DatePick — выбор даты с маской

Инпут с маской `дд.мм.гггг` + календарь-попапом.

```tsx
<DatePick value={date} onChange={setDate} />
<DatePick small />  {/* Компактный вариант (h-8, w-36) */}
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
