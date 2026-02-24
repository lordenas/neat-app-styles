import { ShowcaseSection } from "@/components/showcase/ShowcaseSection";
import { TypographyShowcase } from "@/components/showcase/TypographyShowcase";
import { ColorTokensShowcase } from "@/components/showcase/ColorTokensShowcase";
import { SpacingShowcase } from "@/components/showcase/SpacingShowcase";
import { ButtonsShowcase } from "@/components/showcase/ButtonsShowcase";
import { InputsShowcase } from "@/components/showcase/InputsShowcase";
import { SelectionsShowcase } from "@/components/showcase/SelectionsShowcase";
import { SliderTooltipShowcase } from "@/components/showcase/SliderTooltipShowcase";
import { DatePickerShowcase } from "@/components/showcase/DatePickerShowcase";
import { TableShowcase } from "@/components/showcase/TableShowcase";
import { TabsShowcase } from "@/components/showcase/TabsShowcase";
import { ModalAlertsShowcase } from "@/components/showcase/ModalAlertsShowcase";
import { BreadcrumbLinksShowcase } from "@/components/showcase/BreadcrumbLinksShowcase";
import { CardShowcase } from "@/components/showcase/CardShowcase";
import { ChipsShowcase } from "@/components/showcase/ChipsShowcase";
import { MultiselectShowcase } from "@/components/showcase/MultiselectShowcase";
import { ExperienceCalculator } from "@/components/showcase/ExperienceCalculator";
import { FilterForm } from "@/components/showcase/FilterForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationShowcase } from "@/components/showcase/NotificationShowcase";
import { ProgressShowcase } from "@/components/showcase/ProgressShowcase";
import { SkeletonShowcase } from "@/components/showcase/SkeletonShowcase";
import { AccordionShowcase } from "@/components/showcase/AccordionShowcase";
import { CopyShowcase } from "@/components/showcase/CopyShowcase";
import { EmptyStateShowcase } from "@/components/showcase/EmptyStateShowcase";
import { FileUploadShowcase } from "@/components/showcase/FileUploadShowcase";
import { ValidationFormShowcase } from "@/components/showcase/ValidationFormShowcase";
import { PaginationShowcase } from "@/components/showcase/PaginationShowcase";
import { ComboboxShowcase } from "@/components/showcase/ComboboxShowcase";
import { DateRangePickerShowcase } from "@/components/showcase/DateRangePickerShowcase";
import { StepperShowcase } from "@/components/showcase/StepperShowcase";
import { TimelineShowcase } from "@/components/showcase/TimelineShowcase";
import { StatsCardShowcase } from "@/components/showcase/StatsCardShowcase";
import { CopyButtonShowcase } from "@/components/showcase/CopyButtonShowcase";
import { DropdownEnhancedShowcase } from "@/components/showcase/DropdownEnhancedShowcase";
import { CommandPaletteShowcase } from "@/components/showcase/CommandPaletteShowcase";
import { DataTableShowcase } from "@/components/showcase/DataTableShowcase";
import { AppShellShowcase } from "@/components/showcase/AppShellShowcase";
import { ColorPickerShowcase } from "@/components/showcase/ColorPickerShowcase";
import { ResizablePanelShowcase } from "@/components/showcase/ResizablePanelShowcase";
import { InlineEditShowcase } from "@/components/showcase/InlineEditShowcase";
import { DrawerShowcase } from "@/components/showcase/DrawerShowcase";
import { SheetShowcase } from "@/components/showcase/SheetShowcase";
import { OTPInputShowcase } from "@/components/showcase/OTPInputShowcase";
import { ContextMenuShowcase } from "@/components/showcase/ContextMenuShowcase";
import { HoverCardShowcase } from "@/components/showcase/HoverCardShowcase";

const navGroups = [
  { label: "Токены", items: ["Typography", "Colors", "Spacing"] },
  { label: "Компоненты", items: ["Buttons", "Inputs", "Selects", "Combobox", "Multiselect", "Chips", "Tabs", "Table", "DataTable", "Cards", "Stats Cards", "Date Pickers", "Date Range Picker", "Slider & Tooltip", "Breadcrumbs & Links", "Modal & Alerts", "Dropdown Enhanced", "Context Menu", "Notifications", "Progress & Stepper", "Stepper", "Timeline", "Skeleton", "Accordion", "Copy", "Copy Button", "Empty State", "File Upload", "Pagination", "Command Palette", "Color Picker", "Resizable Panels", "Inline Edit", "OTP Input", "Drawer", "Sheet", "Hover Card", "App Shell"] },
  { label: "Примеры", items: ["Калькулятор", "Фильтр", "Валидация"] },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container max-w-6xl py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">UI Kit</h1>
            <p className="text-xs text-muted-foreground">Строгий минималистичный набор компонентов</p>
          </div>
          <div className="flex items-center gap-2">
            <nav aria-label="Быстрая навигация по компонентам" className="hidden lg:flex gap-0.5 overflow-x-auto">
              {navGroups.flatMap(g => g.items).slice(0, 8).map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-")}`}
                  className="text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
                >
                  {item}
                </a>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="container max-w-6xl py-8 space-y-8">
        {/* Design Tokens */}
        <section aria-labelledby="tokens-heading">
          <h2 id="tokens-heading" className="mb-4">Дизайн-токены</h2>
          <div className="space-y-6">
            <ShowcaseSection title="Typography" description="Типографика">
              <TypographyShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Colors" description="Цветовые токены">
              <ColorTokensShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Spacing" description="Система отступов">
              <SpacingShowcase />
            </ShowcaseSection>
          </div>
        </section>

        {/* Components */}
        <section aria-labelledby="components-heading">
          <h2 id="components-heading" className="mb-4">Компоненты</h2>
          <div className="space-y-6">
            <ShowcaseSection title="Buttons" description="Кнопки с icon и size">
              <ButtonsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Inputs" description="inputStart, inputEnd, inputSize">
              <InputsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Selects" description="Select, Dropdown, Radio, Checkbox, Switch">
              <SelectionsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Combobox" description="Autocomplete с поиском и creatable">
              <ComboboxShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Multiselect" description="Мультивыбор">
              <MultiselectShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Chips" description="Теги / Badge">
              <ChipsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Tabs" description="Вкладки">
              <TabsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Table" description="size, bordered, striped">
              <TableShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Cards" description="Карточки">
              <CardShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Stats Cards" description="Метрики для дашбордов">
              <StatsCardShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Date Pickers" description="Date, Range, Period">
              <DatePickerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Date Range Picker" description="Два календаря + пресеты">
              <DateRangePickerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Slider & Tooltip" description="Ползунок, NumberInput, Kbd, ConfirmDialog, Textarea">
              <SliderTooltipShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Breadcrumbs & Links" description="Навигация и ссылки">
              <BreadcrumbLinksShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Modal & Alerts" description="Диалоги и уведомления">
              <ModalAlertsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Dropdown Enhanced" description="icon, shortcut, destructive">
              <DropdownEnhancedShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Notifications" description="Toast-уведомления (Sonner)">
              <NotificationShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Progress & Stepper" description="Прогресс-бар">
              <ProgressShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Stepper" description="Пошаговый визард">
              <StepperShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Timeline" description="Лента событий">
              <TimelineShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Skeleton" description="Состояния загрузки">
              <SkeletonShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Accordion" description="Раскрывающиеся секции / FAQ">
              <AccordionShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Copy" description="Копирование в буфер обмена">
              <CopyShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Copy Button" description="UI-компонент копирования">
              <CopyButtonShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Empty State" description="Пустые состояния">
              <EmptyStateShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="File Upload" description="Загрузка файлов: Drag & Drop, кнопка, аватар">
              <FileUploadShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Pagination" description="Навигация по страницам">
              <PaginationShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Command Palette" description="Spotlight-поиск ⌘K">
              <CommandPaletteShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="DataTable" description="Составная таблица">
              <DataTableShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Color Picker" description="Выбор цвета">
              <ColorPickerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Resizable Panels" description="Изменяемые панели">
              <ResizablePanelShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="App Shell" description="Sidebar + Layout">
              <AppShellShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Inline Edit" description="Редактирование на месте">
              <InlineEditShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="OTP Input" description="Ввод одноразового кода">
              <OTPInputShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Drawer" description="Нижняя панель (мобильная)">
              <DrawerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Sheet" description="Боковая панель">
              <SheetShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Context Menu" description="Контекстное меню (ПКМ)">
              <ContextMenuShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Hover Card" description="Превью при наведении">
              <HoverCardShowcase />
            </ShowcaseSection>
          </div>
        </section>

        {/* Examples */}
        <section aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="mb-4">Примеры сценариев</h2>
          <div className="space-y-6">
            <ShowcaseSection title="Калькулятор" description="Калькулятор стажа">
              <ExperienceCalculator />
            </ShowcaseSection>
            <ShowcaseSection title="Фильтр" description="Форма фильтра">
              <FilterForm />
            </ShowcaseSection>
            <ShowcaseSection title="Валидация" description="Форма с Yup + react-hook-form">
              <ValidationFormShowcase />
            </ShowcaseSection>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container max-w-6xl">
          <p className="text-xs text-muted-foreground text-center">
            UI Kit · React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
