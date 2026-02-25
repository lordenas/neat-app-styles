import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { HelpCircle, Search, Calculator, Shield, Globe, Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  // Калькуляторы
  {
    question: "Насколько точны расчёты CalcHub?",
    answer: "Мы используем банковские формулы, одобренные финансовыми регуляторами. Результаты совпадают с расчётами ведущих банков с точностью до копейки. Каждый калькулятор проходит валидацию на реальных примерах.",
    category: "Калькуляторы",
  },
  {
    question: "Чем аннуитетный платёж отличается от дифференцированного?",
    answer: "При аннуитетном платеже вы платите одинаковую сумму каждый месяц — это удобно для планирования бюджета. При дифференцированном платеже сумма постепенно уменьшается, и общая переплата по кредиту будет меньше. Наш калькулятор покажет разницу для вашего случая.",
    category: "Калькуляторы",
  },
  {
    question: "Можно ли рассчитать досрочное погашение?",
    answer: "Да, кредитный калькулятор поддерживает расчёт досрочных погашений. Вы можете добавить разовые или регулярные досрочные платежи и увидеть, как это повлияет на срок кредита и общую переплату.",
    category: "Калькуляторы",
  },
  {
    question: "Учитывает ли калькулятор комиссии и страховки?",
    answer: "Базовый расчёт включает только проценты по кредиту. Для получения полной стоимости кредита (ПСК) рекомендуем добавить известные вам комиссии и страховые платежи в поле дополнительных расходов.",
    category: "Калькуляторы",
  },
  {
    question: "Как сравнить предложения разных банков?",
    answer: "Сделайте расчёт для каждого предложения с соответствующими параметрами (сумма, ставка, срок) и сравните итоговую переплату и ежемесячный платёж. Обращайте внимание на ПСК — она учитывает скрытые расходы.",
    category: "Калькуляторы",
  },
  // Безопасность
  {
    question: "Безопасно ли вводить финансовые данные?",
    answer: "Абсолютно безопасно. Все расчёты выполняются локально в вашем браузере — данные не отправляются на сервер, не сохраняются и не передаются третьим лицам. Вы можете убедиться в этом, отключив интернет после загрузки страницы.",
    category: "Безопасность",
  },
  {
    question: "Собираете ли вы персональные данные?",
    answer: "Нет. CalcHub не требует регистрации и не собирает персональные данные. Мы используем только анонимную аналитику для улучшения сервиса.",
    category: "Безопасность",
  },
  {
    question: "Нужна ли регистрация для использования калькуляторов?",
    answer: "Нет, все калькуляторы полностью бесплатны и доступны без регистрации. Просто откройте нужный калькулятор и начните расчёт.",
    category: "Безопасность",
  },
  // Страны и языки
  {
    question: "Как CalcHub учитывает особенности моей страны?",
    answer: "Мы адаптируем формулы под налоговое законодательство, процентные ставки и финансовые стандарты каждой из 20+ поддерживаемых стран. Выберите свою страну в шапке сайта для получения локализованных расчётов.",
    category: "Страны и языки",
  },
  {
    question: "Какие страны поддерживаются?",
    answer: "CalcHub поддерживает более 20 стран: Россия, США, Великобритания, Германия, Франция, Испания, Польша, Украина, Казахстан, Бразилия, Индия, Иран, ОАЭ, Саудовская Аравия и другие. Мы постоянно добавляем новые.",
    category: "Страны и языки",
  },
  {
    question: "На каких языках доступен CalcHub?",
    answer: "Сайт доступен на 12 языках: русский, английский, немецкий, французский, испанский, португальский, польский, украинский, нидерландский, шведский, арабский и фарси. Переключатель языка находится в шапке сайта.",
    category: "Страны и языки",
  },
  // Технические вопросы
  {
    question: "Можно ли использовать CalcHub на мобильном телефоне?",
    answer: "Да, CalcHub полностью адаптирован для мобильных устройств. Все калькуляторы работают одинаково хорошо на смартфонах, планшетах и компьютерах.",
    category: "Технические",
  },
  {
    question: "Калькулятор не загружается — что делать?",
    answer: "Попробуйте: 1) Обновить страницу (Ctrl+F5). 2) Очистить кэш браузера. 3) Попробовать другой браузер. Мы поддерживаем Chrome, Firefox, Safari и Edge последних версий. Если проблема сохраняется — напишите нам через форму обратной связи.",
    category: "Технические",
  },
  {
    question: "Можно ли сохранить или распечатать результат?",
    answer: "Сейчас вы можете использовать встроенную функцию печати браузера (Ctrl+P) для сохранения результата в PDF. В будущем мы планируем добавить экспорт в Excel и прямое сохранение в личном кабинете.",
    category: "Технические",
  },
  {
    question: "CalcHub — это бесплатный сервис?",
    answer: "Да, CalcHub полностью бесплатен. Все калькуляторы доступны без ограничений, без рекламы и без скрытых платежей. Мы стремимся сделать финансовую грамотность доступной каждому.",
    category: "Технические",
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  "Калькуляторы": <Calculator className="h-4 w-4" />,
  "Безопасность": <Shield className="h-4 w-4" />,
  "Страны и языки": <Globe className="h-4 w-4" />,
  "Технические": <Wrench className="h-4 w-4" />,
};

const categories = Array.from(new Set(faqItems.map((i) => i.category)));

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = faqItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = categories
    .filter((cat) => !activeCategory || cat === activeCategory)
    .map((cat) => ({
      category: cat,
      items: filtered.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <Helmet>
        <title>FAQ — Частые вопросы о CalcHub</title>
        <meta
          name="description"
          content="Ответы на частые вопросы о калькуляторах CalcHub: точность расчётов, безопасность данных, поддержка стран и языков, технические вопросы."
        />
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 sm:py-16 border-b border-border">
          <div className="container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <HelpCircle className="h-4 w-4" />
              Помощь
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Частые вопросы
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ответы на самые популярные вопросы о CalcHub. Не нашли ответ?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Напишите нам
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-muted/30">
          <div className="container max-w-4xl space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по вопросам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant={!activeCategory ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setActiveCategory(null)}
              >
                Все
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer transition-colors gap-1.5"
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                >
                  {categoryIcons[cat]}
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-10 sm:py-14">
          <div className="container max-w-3xl">
            {grouped.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-muted-foreground">Вопросы не найдены</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory(null);
                  }}
                  className="text-primary text-sm hover:underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {grouped.map(({ category, items }) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {categoryIcons[category]}
                      {category}
                      <span className="text-muted-foreground font-normal">({items.length})</span>
                    </div>
                    <Accordion type="multiple" className="space-y-2">
                      {items.map((item, idx) => (
                        <AccordionItem
                          key={idx}
                          value={`${category}-${idx}`}
                          className="border rounded-lg px-4 bg-card"
                        >
                          <AccordionTrigger className="text-sm text-left hover:no-underline">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}

            <p className="text-center text-muted-foreground text-sm mt-10">
              Показано {filtered.length} из {faqItems.length} вопросов
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 border-t border-border">
          <div className="container max-w-2xl text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Не нашли ответ?</h2>
            <p className="text-muted-foreground text-sm">
              Свяжитесь с нами — мы ответим в течение 24 часов
            </p>
            <Link to="/contact">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
                Написать нам
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
