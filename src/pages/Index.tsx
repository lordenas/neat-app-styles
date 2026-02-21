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
import { ModalAlertsShowcase } from "@/components/showcase/ModalAlertsShowcase";
import { ExperienceCalculator } from "@/components/showcase/ExperienceCalculator";
import { FilterForm } from "@/components/showcase/FilterForm";

const navItems = [
  "Typography",
  "Colors",
  "Spacing",
  "Buttons",
  "Inputs",
  "Selects",
  "Slider & Tooltip",
  "Date Picker",
  "Table",
  "Modal & Alerts",
  "Калькулятор стажа",
  "Форма фильтра",
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container max-w-5xl py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">UI Kit</h1>
            <p className="text-xs text-muted-foreground">Строгий минималистичный набор компонентов</p>
          </div>
          <nav className="hidden md:flex gap-1 overflow-x-auto">
            {navItems.slice(0, 6).map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl py-8 space-y-6">
        {/* Design Tokens */}
        <div>
          <h2 className="mb-4">Дизайн-токены</h2>
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
        </div>

        {/* Base Components */}
        <div>
          <h2 className="mb-4">Базовые компоненты</h2>
          <div className="space-y-6">
            <ShowcaseSection title="Buttons" description="Кнопки">
              <ButtonsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Inputs" description="Поля ввода">
              <InputsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Selects" description="Выбор значений">
              <SelectionsShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Slider & Tooltip" description="Ползунок и подсказки">
              <SliderTooltipShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Date Picker" description="Выбор даты">
              <DatePickerShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Table" description="Таблица">
              <TableShowcase />
            </ShowcaseSection>
            <ShowcaseSection title="Modal & Alerts" description="Диалоги и уведомления">
              <ModalAlertsShowcase />
            </ShowcaseSection>
          </div>
        </div>

        {/* Example Scenarios */}
        <div>
          <h2 className="mb-4">Примеры сценариев</h2>
          <div className="space-y-6">
            <ShowcaseSection title="Калькулятор стажа" description="Пример 1">
              <ExperienceCalculator />
            </ShowcaseSection>
            <ShowcaseSection title="Форма фильтра" description="Пример 2">
              <FilterForm />
            </ShowcaseSection>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container max-w-5xl">
          <p className="text-xs text-muted-foreground text-center">
            UI Kit · React + TypeScript + Tailwind CSS + shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
