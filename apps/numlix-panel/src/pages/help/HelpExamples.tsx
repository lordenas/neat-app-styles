import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HelpLayout } from "./HelpLayout";

const examples = [
  {
    title: "Кредитный калькулятор",
    desc: "Ежемесячный платёж по аннуитетной схеме. Поля: сумма, ставка, срок. Формула аннуитета через pow().",
    fields: ["Число: сумма кредита", "Слайдер: срок (мес)", "Число: ставка %", "Результат: платёж"],
    formula: "{сумма} * ({ставка}/100/12) / (1 - pow(1 + {ставка}/100/12, -{срок}))",
    tag: "Финансы",
  },
  {
    title: "Калькулятор стоимости ремонта",
    desc: "Расчёт бюджета по площади и типу ремонта. Список вариантов с весами: эконом / стандарт / премиум.",
    fields: ["Число: площадь м²", "Список: тип ремонта (вес: 3000/6000/12000)", "Результат: стоимость"],
    formula: "{площадь} * {тип_ремонта}",
    tag: "Строительство",
  },
  {
    title: "Калькулятор НДС",
    desc: "Выделение или начисление НДС. Радиокнопка выбора ставки: 20% или 10%.",
    fields: ["Число: сумма", "Радио: ставка НДС (вес: 20/10)", "Результат: НДС", "Результат: итого с НДС"],
    formula: "round({сумма} * {ставка} / 100, 2)",
    tag: "Налоги",
  },
  {
    title: "Калькулятор скидки",
    desc: "Расчёт цены со скидкой. Показываем поле промокода только при включённом чекбоксе.",
    fields: ["Число: цена", "Число: скидка %", "Чекбокс: применить промокод", "Результат: итого"],
    formula: "{цена} * (1 - {скидка} / 100)",
    tag: "Интернет-магазин",
  },
  {
    title: "Многошаговая форма квиза",
    desc: "3 страницы: контакты → параметры → результат. Условный переход на страницу 3 при сумме > 1млн.",
    fields: ["Стр. 1: имя, телефон + кнопка «Далее»", "Стр. 2: сумма, срок + кнопка «Рассчитать»", "Стр. 3: результат"],
    formula: "if({сумма} >= 1000000, {сумма} * 0.08 / 12, {сумма} * 0.12 / 12)",
    tag: "Квиз",
  },
];

export default function HelpExamples() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Примеры калькуляторов — База знаний CalcHub</title>
        <meta name="description" content="Готовые примеры: кредит, ремонт, НДС, скидка, многошаговый квиз с формулами." />
      </Helmet>

      <div className="space-y-8 max-w-2xl">
        <div>
          <p className="text-xs text-muted-foreground mb-1">База знаний</p>
          <h1 className="text-2xl font-bold mb-2">Готовые примеры</h1>
          <p className="text-muted-foreground text-sm">
            Реальные сценарии с описанием полей и формул — скопируйте подход для своего калькулятора.
          </p>
        </div>

        <div className="space-y-5">
          {examples.map(({ title, desc, fields, formula, tag }) => (
            <div key={title} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded px-1.5 py-0.5 mb-2">
                    {tag}
                  </span>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
              <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Поля</p>
                  <ul className="space-y-1">
                    {fields.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Формула результата</p>
                  <code className="text-xs font-mono bg-muted rounded-lg px-3 py-2 block leading-relaxed break-all">
                    {formula}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            to="/calc-builder"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            Создать свой калькулятор <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </HelpLayout>
  );
}
