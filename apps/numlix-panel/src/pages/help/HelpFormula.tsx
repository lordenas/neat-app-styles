import { Helmet } from "react-helmet-async";
import { HelpLayout } from "./HelpLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const functions = [
  { name: "round(x, n)", desc: "Округляет x до n знаков после запятой", example: "round({сумма} * 1.13, 2)" },
  { name: "floor(x)", desc: "Округляет вниз до целого", example: "floor({площадь} / 10)" },
  { name: "ceil(x)", desc: "Округляет вверх до целого", example: "ceil({дней} / 30)" },
  { name: "abs(x)", desc: "Возвращает абсолютное значение", example: "abs({долг} - {оплата})" },
  { name: "pow(x, n)", desc: "Возводит x в степень n", example: "pow(1 + {ставка}/100, {лет})" },
  { name: "sqrt(x)", desc: "Квадратный корень", example: "sqrt({площадь})" },
  { name: "min(a, b)", desc: "Возвращает меньшее из двух значений", example: "min({доход}, 5000000)" },
  { name: "max(a, b)", desc: "Возвращает большее из двух значений", example: "max({ежемесячно}, 1000)" },
  { name: "if(условие, a, b)", desc: "Возвращает a если условие истинно, иначе b", example: "if({возраст} >= 18, {цена}, {цена} * 0.5)" },
];

export default function HelpFormula() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Формулы — База знаний CalcHub</title>
        <meta name="description" content="Синтаксис формул, встроенные функции и примеры для конструктора калькуляторов." />
      </Helmet>

      <div className="space-y-8 max-w-2xl">
        <div>
          <p className="text-xs text-muted-foreground mb-1">База знаний → Конструктор</p>
          <h1 className="text-2xl font-bold mb-2">Формулы</h1>
          <p className="text-muted-foreground text-sm">
            Формулы используются в поле «Результат» для автоматического вычисления значений на основе введённых данных.
          </p>
        </div>

        {/* Syntax */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Синтаксис переменных</h2>
          <p className="text-sm text-muted-foreground">
            Чтобы использовать значение поля в формуле, оберните его ключ в фигурные скобки:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <span className="text-primary">{"{сумма}"}</span>
            {" * "}
            <span className="text-primary">{"{ставка}"}</span>
            {" / 100"}
          </div>
          <p className="text-xs text-muted-foreground">
            Ключ поля задаётся в настройках поля (например, <code className="font-mono bg-muted px-1 rounded">сумма</code>, <code className="font-mono bg-muted px-1 rounded">ставка</code>). Ключ должен быть на латинице или кириллице без пробелов.
          </p>
        </section>

        {/* Operators */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Арифметические операторы</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { op: "+", name: "Сложение", ex: "{a} + {b}" },
              { op: "-", name: "Вычитание", ex: "{a} - {b}" },
              { op: "*", name: "Умножение", ex: "{a} * {b}" },
              { op: "/", name: "Деление", ex: "{a} / {b}" },
            ].map(({ op, name, ex }) => (
          <div key={op} className="border border-border rounded-lg p-3 text-center">
                <div className="text-2xl font-mono font-bold text-primary mb-1">{op}</div>
                <p className="text-xs font-medium">{name}</p>
                <code className="text-[10px] text-muted-foreground font-mono">{ex}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Скобки для группировки: <code className="font-mono bg-muted px-1 rounded">{"({a} + {b}) * {c}"}</code>
          </p>
        </section>

        {/* Functions */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Встроенные функции</h2>
          <div className="space-y-0 border border-border rounded-lg overflow-hidden divide-y divide-border">
            {functions.map(({ name, desc, example }) => (
              <div key={name} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-4 py-3">
                <code className="font-mono text-xs text-primary shrink-0 w-44">{name}</code>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{desc}</p>
                  <code className="text-[11px] text-muted-foreground">{example}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* If operator */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Условные выражения — if()</h2>
          <p className="text-sm text-muted-foreground">
            Функция <code className="font-mono bg-muted px-1 rounded">if()</code> позволяет возвращать разные значения в зависимости от условия.
          </p>
          <div className="bg-muted rounded-lg p-4 space-y-3 font-mono text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Простое условие:</p>
              <code>{"if({возраст} >= 18, {цена}, {цена} * 0.5)"}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Вложенные условия:</p>
              <code>{"if({тип} == 1, {a} * 2, if({тип} == 2, {a} * 3, {a}))"}</code>
            </div>
          </div>
          <div className="rounded-lg bg-muted border border-border px-4 py-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Поддерживаемые операторы сравнения:</strong> == &nbsp; != &nbsp; &gt; &nbsp; &lt; &nbsp; &gt;= &nbsp; &lt;=
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Частые вопросы</h2>
          <Accordion type="single" collapsible className="border border-border rounded-lg px-4">
            <AccordionItem value="1">
              <AccordionTrigger className="text-sm">Что значит «ошибка в формуле»?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Формула не может быть вычислена. Проверьте: все ли ключи полей написаны верно, нет ли деления на ноль, закрыты ли все скобки.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="text-sm">Как использовать значение чекбокса в формуле?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Задайте чекбоксу числовой вес в его настройках (например, 1 = отмечен, 0 = не отмечен). Тогда в формуле <code className="font-mono bg-muted px-1 rounded">{"{чекбокс}"}</code> вернёт 1 или 0.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger className="text-sm">Как использовать значение выпадающего списка?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                У каждого варианта списка задайте числовой вес. В формуле <code className="font-mono bg-muted px-1 rounded">{"{список}"}</code> подставит вес выбранного варианта.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </HelpLayout>
  );
}
