import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  TrendingDown,
  Shield,
  Target,
  AlertTriangle,
} from "lucide-react";

import heroImage from "@/assets/seo-credit-hero.jpg";
import comparisonImage from "@/assets/seo-credit-comparison.jpg";
import paymentTypesImage from "@/assets/seo-payment-types.jpg";

export function CreditCalculatorSeoContent() {
  return (
    <article className="space-y-10 pt-4">
      {/* ── Intro ── */}
      <section className="section-card space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Кредитный калькулятор онлайн: полное руководство</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Кредитный калькулятор с досрочным погашением — это инструмент, который позволяет точно
          рассчитать ежемесячный платёж, переплату по кредиту и составить график погашения с учётом
          изменения ставки, досрочных платежей и кредитных каникул. Наш калькулятор помогает
          принимать осознанные финансовые решения.
        </p>
        <img
          src={heroImage}
          alt="График погашения кредита — визуализация ежемесячных платежей"
          className="rounded-lg border border-border-subtle w-full max-w-2xl"
          loading="lazy"
        />
      </section>

      {/* ── What is it ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Что такое кредитный калькулятор и зачем он нужен?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Target className="h-5 w-5 text-primary" />,
              title: "Точный расчёт",
              text: "Узнайте ежемесячный платёж, общую переплату и эффективную процентную ставку по вашему кредиту до подписания договора.",
            },
            {
              icon: <TrendingDown className="h-5 w-5 text-[hsl(var(--success))]" />,
              title: "Оптимизация расходов",
              text: "Смоделируйте разные сценарии досрочного погашения и выберите стратегию, которая сэкономит больше на процентах.",
            },
            {
              icon: <Shield className="h-5 w-5 text-[hsl(var(--info))]" />,
              title: "Финансовая защита",
              text: "Оцените риски: кредитные каникулы, изменение ставки, разный тип платежа — всё в одном инструменте.",
            },
          ].map((item) => (
            <div key={item.title} className="form-section space-y-2">
              <div className="flex items-center gap-2">
                {item.icon}
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Payment types ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Аннуитетные vs дифференцированные платежи</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          Выбор типа платежа существенно влияет на общую переплату по кредиту. Понимание разницы
          между ними поможет принять правильное решение.
        </p>
        <img
          src={paymentTypesImage}
          alt="Сравнение аннуитетных и дифференцированных платежей по кредиту"
          className="rounded-lg border border-border-subtle w-full max-w-2xl"
          loading="lazy"
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="section-card space-y-3">
            <h3 className="text-sm font-semibold">Аннуитетные платежи</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">•</span> Фиксированная сумма каждый месяц</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Удобно планировать бюджет</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Больше переплата за весь срок</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Первое время почти все деньги идут на проценты</li>
            </ul>
          </div>
          <div className="section-card space-y-3">
            <h3 className="text-sm font-semibold">Дифференцированные платежи</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-[hsl(var(--success))]">•</span> Платёж уменьшается со временем</li>
              <li className="flex gap-2"><span className="text-[hsl(var(--success))]">•</span> Меньше общая переплата</li>
              <li className="flex gap-2"><span className="text-[hsl(var(--success))]">•</span> Основной долг гасится равномерно</li>
              <li className="flex gap-2"><span className="text-[hsl(var(--warning))]">•</span> Первые платежи значительно выше</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Good / Bad examples ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[hsl(var(--warning))]" />
          Примеры: как брать кредит правильно
        </h2>
        <img
          src={comparisonImage}
          alt="Сравнение: правильный и неправильный подход к оформлению кредита"
          className="rounded-lg border border-border-subtle w-full max-w-2xl"
          loading="lazy"
        />
        <div className="grid md:grid-cols-2 gap-4">
          {/* Bad */}
          <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">❌ Плохой пример</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Ситуация:</strong> Иван берёт ипотеку 10 000 000 ₽ на 30 лет под 12% годовых, аннуитетный платёж.</p>
              <ul className="space-y-1 pl-4">
                <li>• Ежемесячный платёж: <span className="font-mono font-medium text-destructive">102 861 ₽</span></li>
                <li>• Переплата: <span className="font-mono font-medium text-destructive">27 029 960 ₽</span></li>
                <li>• Итого выплачено: <span className="font-mono font-medium">37 029 960 ₽</span></li>
              </ul>
              <div className="flex items-start gap-1.5 mt-2 p-2 rounded bg-destructive/10">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs">Иван не планирует досрочных погашений и переплатит <strong>270%</strong> от суммы кредита!</p>
              </div>
            </div>
          </div>

          {/* Good */}
          <div className="rounded-lg border-2 border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
              <h3 className="text-sm font-semibold text-[hsl(var(--success))]">✅ Хороший пример</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Ситуация:</strong> Мария берёт тот же кредит, но с досрочными погашениями по 30 000 ₽/мес. с первого года.</p>
              <ul className="space-y-1 pl-4">
                <li>• Ежемесячный платёж: <span className="font-mono font-medium">102 861 ₽</span> + 30 000 ₽ досрочно</li>
                <li>• Переплата: <span className="font-mono font-medium text-[hsl(var(--success))]">9 812 000 ₽</span></li>
                <li>• Срок сокращён до <span className="font-mono font-medium text-[hsl(var(--success))]">13 лет</span></li>
              </ul>
              <div className="flex items-start gap-1.5 mt-2 p-2 rounded bg-[hsl(var(--success))]/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                <p className="text-xs">Мария экономит <strong>17 217 960 ₽</strong> и сокращает срок на 17 лет!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Step by step ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Как пользоваться кредитным калькулятором</h2>
        <div className="space-y-3">
          {[
            { step: 1, title: "Введите сумму и срок кредита", desc: "Укажите сумму кредита в рублях и желаемый срок — в годах или месяцах. Эти параметры определяют базовый ежемесячный платёж." },
            { step: 2, title: "Укажите процентную ставку", desc: "Введите годовую процентную ставку. Если ставка меняется во время действия договора — добавьте изменения через «+ Изменение ставки»." },
            { step: 3, title: "Выберите тип платежей", desc: "Аннуитетные — фиксированные платежи, дифференцированные — убывающие. Сравните оба варианта для выбора оптимального." },
            { step: 4, title: "Добавьте досрочные погашения", desc: "Раскройте блок «Досрочные погашения» и укажите суммы, периодичность и тип пересчёта (уменьшение платежа или срока)." },
            { step: 5, title: "Нажмите «Рассчитать»", desc: "Получите подробный график погашения, сумму переплаты и экономию от досрочных платежей." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {item.step}
              </div>
              <div className="space-y-0.5 pt-1">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Tips ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">💡 Советы по снижению переплаты</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { title: "Досрочное погашение в первые годы", text: "Наибольший эффект от досрочных платежей достигается в первые 3–5 лет, когда основная часть платежа уходит на проценты." },
            { title: "Уменьшайте срок, а не платёж", text: "При досрочном погашении выбирайте «уменьшить срок» — это сэкономит больше на процентах, чем снижение ежемесячного платежа." },
            { title: "Рефинансирование", text: "Если ставки на рынке снизились — рассмотрите рефинансирование. Разница даже в 1–2% может сэкономить сотни тысяч рублей." },
            { title: "Избегайте максимальных сроков", text: "Кредит на 30 лет vs 15 лет: переплата может отличаться в 2–3 раза. Берите минимально комфортный срок." },
          ].map((tip) => (
            <div key={tip.title} className="form-section space-y-1.5">
              <h3 className="text-sm font-medium">{tip.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── FAQ ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Часто задаваемые вопросы</h2>
        <Accordion type="multiple" className="w-full">
          {[
            {
              q: "Насколько точен онлайн-калькулятор кредита?",
              a: "Наш калькулятор использует стандартные банковские формулы для расчёта аннуитетных и дифференцированных платежей. Результат максимально приближен к реальному графику банка, но может незначительно отличаться из-за округления и особенностей конкретного банка.",
            },
            {
              q: "Что лучше: уменьшать платёж или срок при досрочном погашении?",
              a: "С точки зрения экономии на процентах, уменьшение срока всегда выгоднее. Однако уменьшение платежа даёт больше финансовой гибкости. Идеальная стратегия — уменьшить срок, а освободившиеся деньги снова направить на досрочное погашение.",
            },
            {
              q: "Как влияют кредитные каникулы на переплату?",
              a: "Во время кредитных каникул проценты продолжают начисляться на остаток долга. Это увеличивает общую переплату и может удлинить срок кредита. Используйте каникулы только в крайнем случае.",
            },
            {
              q: "Можно ли рассчитать ипотеку с этим калькулятором?",
              a: "Да, калькулятор подходит для расчёта любого кредита с фиксированным графиком — ипотека, потребительский кредит, автокредит. Вы можете моделировать изменение ставки, досрочные погашения и каникулы.",
            },
            {
              q: "Зачем нужна функция «изменение ставки»?",
              a: "Многие кредиты имеют плавающую ставку или предполагают пересмотр условий. Функция позволяет задать конкретную дату и новую ставку, чтобы увидеть, как это повлияет на платежи и переплату.",
            },
            {
              q: "Как рассчитать, сколько можно сэкономить на досрочных погашениях?",
              a: "Сделайте два расчёта: один без досрочных платежей, второй — с ними. Сравните итоговые суммы переплаты. Разница покажет вашу экономию. Наш калькулятор показывает итоговую экономию автоматически.",
            },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── Closing SEO text ── */}
      <section className="form-section space-y-3">
        <h2 className="text-base font-semibold">Рассчитайте кредит прямо сейчас</h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
          Используйте наш бесплатный кредитный калькулятор с досрочным погашением для точного расчёта
          ипотеки, потребительского или автокредита. Введите параметры выше, добавьте досрочные платежи
          и получите подробный график погашения с суммой экономии. Калькулятор поддерживает аннуитетные
          и дифференцированные платежи, изменение процентной ставки, кредитные каникулы и перенос
          платежей с выходных дней.
        </p>
      </section>
    </article>
  );
}
