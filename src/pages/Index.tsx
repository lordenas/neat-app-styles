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

const navGroups = [
  { label: "Токены", items: ["Typography", "Colors", "Spacing"] },
  { label: "Компоненты", items: ["Buttons", "Inputs", "Selects", "Multiselect", "Chips", "Tabs", "Table", "Cards", "Date Pickers", "Slider & Tooltip", "Breadcrumbs & Links", "Modal & Alerts", "Notifications", "Progress & Stepper", "Skeleton", "Accordion", "Copy", "Empty State", "File Upload"] },
  { label: "Примеры", items: ["Калькулятор", "Фильтр"] },
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
            <ShowcaseSection title="Date Pickers" description="Date, Range, Period">
              <DatePickerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Slider & Tooltip" description="Ползунок и подсказки">
              <SliderTooltipShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Breadcrumbs & Links" description="Навигация и ссылки">
              <BreadcrumbLinksShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Modal & Alerts" description="Диалоги и уведомления">
              <ModalAlertsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Notifications" description="Toast-уведомления (Sonner)">
              <NotificationShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Progress & Stepper" description="Прогресс-бар и пошаговый визард">
              <ProgressShowcase />
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
            <ShowcaseSection title="Empty State" description="Пустые состояния">
              <EmptyStateShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="File Upload" description="Загрузка файлов: Drag & Drop, кнопка, аватар">
              <FileUploadShowcase />
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
