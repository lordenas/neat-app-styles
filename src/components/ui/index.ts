/**
 * UI Kit — Barrel-файл
 *
 * Реэкспорт всех UI-компонентов из единой точки входа.
 * Импорт: `import { Button, Input, Card, ... } from "@/components/ui"`
 */

/** Кнопка с вариантами и размерами */
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

/** Группа кнопок с объединёнными границами */
export { ButtonGroup } from "./button-group";
export type { ButtonGroupProps } from "./button-group";

/** Текстовое поле с иконками и форматированием чисел */
export { Input, inputVariants } from "./input";
export type { InputProps } from "./input";

/** Подпись к полю */
export { Label } from "./label";

/** Метка/чип для статусов */
export { Badge, badgeVariants } from "./badge";

/** Флажок */
export { Checkbox } from "./checkbox";

/** Переключатель вкл/выкл */
export { Switch } from "./switch";

/** Ползунок для числовых значений */
export { Slider } from "./slider";

/** Радиокнопки */
export { RadioGroup, RadioGroupItem } from "./radio-group";

/** Выпадающий список */
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select";

/** Карточка-контейнер */
export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";

/** Таблица с вариантами (size, bordered, striped, hoverable) */
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";

/** Вкладки */
export { Tabs, TabsList, tabsListVariants, TabsTrigger, TabsContent } from "./tabs";

/** Аккордеон — сворачиваемые секции */
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

/** Модальное окно */
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

/** Всплывающий контейнер по клику */
export { Popover, PopoverTrigger, PopoverContent } from "./popover";

/** Всплывающая подсказка при наведении */
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";

/** Выпадающее контекстное меню */
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";

/** Хлебные крошки */
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

/** Календарь (react-day-picker) */
export { Calendar } from "./calendar";

/** Сворачиваемый контейнер */
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";

/** Inline-уведомление */
export { Alert, AlertTitle, AlertDescription, alertVariants } from "./alert";

/** Пагинация */
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

/** Разделитель (линия) */
export { Separator } from "./separator";

/** Прогресс-бар с вариантами */
export { Progress, progressVariants } from "./progress";

/** Область прокрутки с кастомными скроллбарами */
export { ScrollArea, ScrollBar } from "./scroll-area";

/** Заглушка-скелетон загрузки */
export { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar } from "./skeleton";

/** Аватар с размерами и статус-индикатором */
export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from "./avatar";

/** Toggle-переключатель */
export { Toggle, toggleVariants } from "./toggle";

/** Группа Toggle */
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/** Загрузчик файлов — три варианта (dropzone, кнопка, аватар) */
export { FileUploadDropzone, FileUploadButton, FileUploadAvatar } from "./file-upload";
export type { FileUploadBaseProps, FileUploadDropzoneProps, FileUploadButtonProps, FileUploadAvatarProps, UploadedFile } from "./file-upload";

/** Многострочное текстовое поле */
export { Textarea, textareaVariants } from "./textarea";
export type { TextareaProps } from "./textarea";

/** Диалог подтверждения действия */
export { ConfirmDialog } from "./confirm-dialog";
export type { ConfirmDialogProps } from "./confirm-dialog";

/** Числовое поле с кнопками +/- */
export { NumberInput } from "./number-input";
export type { NumberInputProps } from "./number-input";

/** Клавиатурное сочетание */
export { Kbd } from "./kbd";

/** Мульти-выбор с тегами, группировкой и disabled */
export { Multiselect } from "./multiselect";
export type { MultiselectOption, MultiselectProps } from "./multiselect";

/** Автокомплит / Combobox с поиском, creatable и disabled */
export { Combobox } from "./combobox";
export type { ComboboxOption, ComboboxProps } from "./combobox";

/** Выбор диапазона дат с пресетами и двумя календарями */
export { DateRangePicker } from "./date-range-picker";
export type { DateRangePickerProps, DateRangePreset } from "./date-range-picker";

/** Пошаговый индикатор прогресса */
export { Stepper } from "./stepper";
export type { StepperProps, StepItem, StepStatus } from "./stepper";

/** Вертикальная лента событий */
export { Timeline } from "./timeline";
export type { TimelineProps, TimelineItem } from "./timeline";

/** Карточка метрики для дашбордов */
export { StatsCard } from "./stats-card";
export type { StatsCardProps } from "./stats-card";

/** Кнопка копирования с анимацией */
export { CopyButton } from "./copy-button";
export type { CopyButtonProps } from "./copy-button";

/** Обёртка для быстрого создания тултипа */
export { SimpleTooltip } from "./simple-tooltip";
export type { SimpleTooltipProps } from "./simple-tooltip";
