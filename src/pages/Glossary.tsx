import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  related?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Аннуитетный платёж",
    definition: "Фиксированный ежемесячный платёж по кредиту, включающий часть основного долга и проценты. Размер платежа одинаков на протяжении всего срока кредита, но соотношение долга и процентов меняется.",
    category: "Кредиты",
    related: ["Дифференцированный платёж", "Тело кредита"],
  },
  {
    term: "Дифференцированный платёж",
    definition: "Способ погашения кредита, при котором основной долг делится равными частями, а проценты начисляются на остаток. Ежемесячный платёж постепенно уменьшается к концу срока.",
    category: "Кредиты",
    related: ["Аннуитетный платёж", "Переплата"],
  },
  {
    term: "ПСК (полная стоимость кредита)",
    definition: "Показатель, выраженный в процентах годовых, отражающий все расходы заёмщика: проценты, комиссии, страховки и другие обязательные платежи. Банки обязаны указывать ПСК в договоре.",
    category: "Кредиты",
    related: ["Процентная ставка", "Эффективная ставка"],
  },
  {
    term: "Процентная ставка",
    definition: "Плата за пользование заёмными средствами, выраженная в процентах годовых. Бывает фиксированной (неизменной) и плавающей (зависящей от ключевой ставки ЦБ).",
    category: "Общие",
    related: ["ПСК (полная стоимость кредита)", "Ключевая ставка"],
  },
  {
    term: "Ключевая ставка",
    definition: "Процентная ставка, по которой центральный банк предоставляет кредиты коммерческим банкам. Влияет на ставки по кредитам и вкладам для населения.",
    category: "Общие",
    related: ["Процентная ставка", "Рефинансирование"],
  },
  {
    term: "Рефинансирование",
    definition: "Получение нового кредита на более выгодных условиях для погашения текущего. Позволяет снизить ставку, изменить срок или объединить несколько кредитов в один.",
    category: "Кредиты",
    related: ["Процентная ставка", "Переплата"],
  },
  {
    term: "Переплата",
    definition: "Разница между общей суммой выплат по кредиту и суммой, взятой в долг. Включает проценты и все дополнительные расходы за весь срок кредитования.",
    category: "Кредиты",
    related: ["ПСК (полная стоимость кредита)", "Аннуитетный платёж"],
  },
  {
    term: "Тело кредита",
    definition: "Сумма основного долга без учёта процентов и комиссий. Это именно та сумма, которую заёмщик получил от банка и должен вернуть.",
    category: "Кредиты",
    related: ["Переплата", "Досрочное погашение"],
  },
  {
    term: "Досрочное погашение",
    definition: "Возврат части или всей суммы кредита раньше установленного срока. Может быть частичным (с уменьшением платежа или срока) или полным. По закону банк не вправе запретить досрочное погашение.",
    category: "Кредиты",
    related: ["Тело кредита", "Переплата"],
  },
  {
    term: "Первоначальный взнос",
    definition: "Часть стоимости недвижимости, которую покупатель оплачивает из собственных средств при оформлении ипотеки. Обычно составляет от 10% до 30% стоимости объекта.",
    category: "Ипотека",
    related: ["Залог", "LTV"],
  },
  {
    term: "LTV (Loan-to-Value)",
    definition: "Соотношение суммы кредита к стоимости залога, выраженное в процентах. Чем ниже LTV, тем меньше риск для банка и тем выгоднее условия для заёмщика.",
    category: "Ипотека",
    related: ["Первоначальный взнос", "Залог"],
  },
  {
    term: "Залог",
    definition: "Имущество, которое заёмщик передаёт банку в качестве обеспечения кредита. При ипотеке залогом выступает приобретаемая недвижимость.",
    category: "Ипотека",
    related: ["Первоначальный взнос", "LTV (Loan-to-Value)"],
  },
  {
    term: "Капитализация процентов",
    definition: "Начисление процентов на ранее начисленные проценты (сложный процент). Увеличивает доходность вклада, так как база для начисления процентов растёт с каждым периодом.",
    category: "Вклады",
    related: ["Эффективная ставка", "Сложный процент"],
  },
  {
    term: "Сложный процент",
    definition: "Процент, который начисляется не только на первоначальную сумму, но и на накопленные проценты за предыдущие периоды. Основа роста вкладов и инвестиций.",
    category: "Вклады",
    related: ["Капитализация процентов", "Эффективная ставка"],
  },
  {
    term: "Эффективная ставка",
    definition: "Реальная доходность вклада или реальная стоимость кредита с учётом капитализации, комиссий и других факторов. Позволяет корректно сравнивать разные предложения банков.",
    category: "Общие",
    related: ["ПСК (полная стоимость кредита)", "Капитализация процентов"],
  },
  {
    term: "НДФЛ",
    definition: "Налог на доходы физических лиц. В России базовая ставка — 13% (15% при доходе свыше 5 млн ₽/год). Удерживается работодателем из зарплаты или уплачивается самостоятельно.",
    category: "Налоги",
    related: ["Налоговый вычет"],
  },
  {
    term: "Налоговый вычет",
    definition: "Сумма, уменьшающая налогооблагаемый доход. Позволяет вернуть часть уплаченного НДФЛ при покупке жилья, оплате обучения, лечения и в других установленных законом случаях.",
    category: "Налоги",
    related: ["НДФЛ"],
  },
  {
    term: "ROI (Return on Investment)",
    definition: "Коэффициент возврата инвестиций, показывающий прибыльность или убыточность вложений. Рассчитывается как отношение чистой прибыли к сумме инвестиций, выраженное в процентах.",
    category: "Бизнес",
    related: ["Рентабельность", "Точка безубыточности"],
  },
  {
    term: "Рентабельность",
    definition: "Относительный показатель экономической эффективности, отражающий степень использования ресурсов. Показывает, сколько прибыли приносит каждый вложенный рубль.",
    category: "Бизнес",
    related: ["ROI (Return on Investment)", "Маржинальность"],
  },
  {
    term: "Маржинальность",
    definition: "Отношение разницы между выручкой и переменными затратами к выручке, выраженное в процентах. Показывает долю выручки, остающуюся после покрытия переменных расходов.",
    category: "Бизнес",
    related: ["Рентабельность", "Точка безубыточности"],
  },
  {
    term: "Точка безубыточности",
    definition: "Объём продаж, при котором доходы равны расходам и прибыль равна нулю. Всё, что продано сверх этого объёма, приносит чистую прибыль.",
    category: "Бизнес",
    related: ["Рентабельность", "Маржинальность"],
  },
];

const categories = ["Все", ...Array.from(new Set(glossaryTerms.map((t) => t.category)))];

const russianAlphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ".split("");

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return glossaryTerms
      .filter((t) => {
        const matchesSearch =
          !search ||
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.definition.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "Все" || t.category === activeCategory;
        const matchesLetter = !activeLetter || t.term[0].toUpperCase() === activeLetter;
        return matchesSearch && matchesCategory && matchesLetter;
      })
      .sort((a, b) => a.term.localeCompare(b.term, "ru"));
  }, [search, activeCategory, activeLetter]);

  const availableLetters = useMemo(() => {
    return new Set(glossaryTerms.map((t) => t.term[0].toUpperCase()));
  }, []);

  return (
    <>
      <Helmet>
        <title>Глоссарий финансовых терминов — CalcHub</title>
        <meta
          name="description"
          content="Словарь финансовых терминов: аннуитет, дифференцированный платёж, ПСК, рефинансирование, капитализация и другие. Простые объяснения сложных понятий."
        />
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 sm:py-16 border-b border-border">
          <div className="container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              {glossaryTerms.length} терминов
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Глоссарий финансовых терминов
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Простые и понятные объяснения финансовых понятий. Используйте поиск или
              алфавитный указатель для навигации.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-muted/30">
          <div className="container max-w-4xl space-y-4">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по терминам..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveLetter(null);
                }}
                className="pl-9"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Alphabet */}
            <div className="flex flex-wrap justify-center gap-1">
              {russianAlphabet.map((letter) => {
                const available = availableLetters.has(letter);
                const isActive = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    disabled={!available}
                    onClick={() => setActiveLetter(isActive ? null : letter)}
                    className={`
                      w-8 h-8 rounded text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-primary text-primary-foreground"
                        : available
                          ? "bg-background text-foreground hover:bg-accent border border-border"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      }
                    `}
                  >
                    {letter}
                  </button>
                );
              })}
              {activeLetter && (
                <button
                  onClick={() => setActiveLetter(null)}
                  className="h-8 px-3 rounded text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Terms */}
        <section className="py-10 sm:py-14">
          <div className="container max-w-4xl">
            {filtered.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-muted-foreground">Термины не найдены</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("Все");
                    setActiveLetter(null);
                  }}
                  className="text-primary text-sm hover:underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((item) => (
                  <Card key={item.term} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg">{item.term}</CardTitle>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.definition}
                      </p>
                      {item.related && item.related.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Связанные:</span>
                          {item.related.map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => {
                                setSearch(r);
                                setActiveCategory("Все");
                                setActiveLetter(null);
                              }}
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <p className="text-center text-muted-foreground text-sm mt-10">
              Показано {filtered.length} из {glossaryTerms.length} терминов
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 border-t border-border">
          <div className="container max-w-2xl text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Примените знания на практике</h2>
            <p className="text-muted-foreground text-sm">
              Используйте наши калькуляторы для точных финансовых расчётов
            </p>
            <Link to="/#categories">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mt-2">
                Перейти к калькуляторам
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
