import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Plus, Hash, Eye, Share2, Code2, ArrowRight,
  CheckCircle2, Sliders, List, Type, Calculator
} from "lucide-react";
import { HelpLayout } from "./HelpLayout";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Создайте новый калькулятор",
    desc: "Перейдите в Конструктор и нажмите кнопку «Новый калькулятор». Задайте название — например, «Расчёт стоимости ремонта».",
    cta: { label: "Открыть конструктор", to: "/calc-list" },
    visual: <StepVisualNew />,
  },
  {
    number: "02",
    title: "Добавьте поля ввода",
    desc: "Нажмите «+ Добавить поле» и выберите нужный тип. Для числовых данных используйте «Число» или «Слайдер», для вариантов — «Список».",
    visual: <StepVisualFields />,
  },
  {
    number: "03",
    title: "Напишите формулу результата",
    desc: "Добавьте поле «Результат» и введите формулу. Используйте {имя_поля} для переменных: например, {площадь} * {цена_за_м2}.",
    cta: { label: "Справка по формулам", to: "/help/formula" },
    visual: <StepVisualFormula />,
  },
  {
    number: "04",
    title: "Проверьте в превью",
    desc: "Переключитесь на вкладку «Превью» в редакторе. Введите тестовые данные и убедитесь, что формула считает правильно.",
    visual: <StepVisualPreview />,
  },
  {
    number: "05",
    title: "Сохраните и поделитесь",
    desc: "Нажмите «Сохранить». Вы получите прямую ссылку на калькулятор (/c/ваш-слаг) и код для встройки на сайт.",
    cta: { label: "Мои калькуляторы", to: "/calc-list" },
    visual: <StepVisualShare />,
  },
];

const tips = [
  {
    icon: Sliders,
    title: "Используйте слайдеры",
    desc: "Слайдеры удобнее для параметров с известным диапазоном — пользователи реже ошибаются.",
  },
  {
    icon: List,
    title: "Именуйте переменные латиницей",
    desc: "Имена полей (ключи) лучше писать латиницей или транслитом: `price`, `area`, `rate`.",
  },
  {
    icon: Hash,
    title: "Используйте round()",
    desc: "Оборачивайте результаты в round(expr, 2) чтобы избегать длинных дробей.",
  },
  {
    icon: Type,
    title: "Добавьте подсказки",
    desc: "Заполните поле «Подсказка» у каждого инпута — пользователям будет понятнее.",
  },
];

export default function HelpGettingStarted() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Быстрый старт — База знаний CalcHub</title>
        <meta name="description" content="Пошаговый гайд по созданию первого калькулятора в конструкторе CalcHub." />
      </Helmet>

      <div className="space-y-12">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
            <CheckCircle2 className="h-3 w-3" /> Быстрый старт
          </div>
          <h1 className="text-2xl font-bold mb-2">Создайте первый калькулятор за 5 шагов</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            От пустого проекта до рабочего виджета — пошаговое руководство с иллюстрациями интерфейса.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-6 md:gap-8",
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Text */}
              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/20 leading-none font-mono">{step.number}</span>
                  <h2 className="text-base font-semibold">{step.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {step.cta && (
                  <Link
                    to={step.cta.to}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
                  >
                    {step.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* Visual */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  {step.visual}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div>
          <h2 className="font-semibold mb-4">Советы для начинающих</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
                <div className="bg-primary/10 rounded-lg p-2 h-fit shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="border border-border rounded-xl p-5 bg-muted/20">
          <h2 className="font-semibold mb-3">Что дальше?</h2>
          <div className="flex flex-col gap-2">
            {[
              { to: "/help/formula", label: "Изучите все функции формул", icon: Hash },
              { to: "/help/fields", label: "Обзор всех типов полей", icon: Calculator },
              { to: "/help/logic", label: "Условная логика: скрывайте поля динамически", icon: Eye },
              { to: "/help/examples", label: "Готовые примеры калькуляторов", icon: Code2 },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="group-hover:underline">{label}</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HelpLayout>
  );
}

/* ─── UI Illustrations ─── */

function MockHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>
      <span className="text-xs text-muted-foreground ml-1 font-mono">{title}</span>
    </div>
  );
}

function StepVisualNew() {
  return (
    <div>
      <MockHeader title="CalcHub — Мои калькуляторы" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Мои калькуляторы</span>
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-lg font-medium">
            <Plus className="h-3 w-3" />
            Новый
          </div>
        </div>
        <div className="border border-dashed border-primary/40 rounded-lg p-3 text-center bg-primary/5">
          <Plus className="h-5 w-5 text-primary/50 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Создайте первый калькулятор</p>
        </div>
        <div className="space-y-1.5">
          {["Кредитный калькулятор", "Расчёт НДС"].map((name) => (
            <div key={name} className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <Calculator className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVisualFields() {
  const fields = [
    { icon: Hash, label: "Площадь, м²", type: "Число", value: "45" },
    { icon: Sliders, label: "Цена за м²", type: "Слайдер", value: "3 500 ₽" },
    { icon: List, label: "Класс отделки", type: "Список", value: "Стандарт" },
  ];
  return (
    <div>
      <MockHeader title="Конструктор — поля" />
      <div className="p-4 space-y-2">
        {fields.map(({ icon: Icon, label, type, value }) => (
          <div key={label} className="border border-border rounded-lg p-2.5 flex items-center gap-2.5 bg-background">
            <div className="bg-primary/10 rounded p-1 shrink-0">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{label}</p>
              <p className="text-[10px] text-muted-foreground">{type}</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono shrink-0">{value}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
          <Plus className="h-3 w-3" /> Добавить поле
        </div>
      </div>
    </div>
  );
}

function StepVisualFormula() {
  return (
    <div>
      <MockHeader title="Поле: Результат" />
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Формула</p>
          <div className="bg-muted rounded-lg p-2.5 font-mono text-xs border border-border">
            <span className="text-blue-500">{"{"}</span>
            <span className="text-foreground">площадь</span>
            <span className="text-blue-500">{"}"}</span>
            <span className="text-muted-foreground"> * </span>
            <span className="text-blue-500">{"{"}</span>
            <span className="text-foreground">цена_за_м2</span>
            <span className="text-blue-500">{"}"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Доступные переменные:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {["{площадь}", "{цена_за_м2}", "{отделка}"].map((v) => (
            <span key={v} className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {v}
            </span>
          ))}
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-xs text-green-700 dark:text-green-400">
          ✓ Формула корректна
        </div>
      </div>
    </div>
  );
}

function StepVisualPreview() {
  return (
    <div>
      <MockHeader title="Превью калькулятора" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Площадь, м²</label>
            <div className="border border-border rounded-md px-2.5 py-1.5 text-xs font-mono bg-background">45</div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Цена за м²</label>
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary rounded-full" />
              </div>
              <div className="text-xs font-mono text-right">3 500 ₽</div>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[10px] text-muted-foreground mb-0.5">Итого</p>
          <p className="text-lg font-bold text-primary">157 500 ₽</p>
        </div>
      </div>
    </div>
  );
}

function StepVisualShare() {
  return (
    <div>
      <MockHeader title="Поделиться калькулятором" />
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Прямая ссылка</p>
          <div className="flex items-center gap-2 border border-border rounded-lg px-2.5 py-1.5 bg-muted/50">
            <Share2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground truncate">calcapp.ru/c/remont</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Код для встройки</p>
          <div className="bg-muted rounded-lg p-2 font-mono text-[9px] text-muted-foreground border border-border leading-relaxed">
            {"<"}iframe src="..."{"/>"}<br />
            {"  "}width="100%"<br />
            {"  "}height="400px"
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg font-medium w-fit">
          <Code2 className="h-3 w-3" /> Копировать код
        </div>
      </div>
    </div>
  );
}
