// ─── Types ───────────────────────────────────────────────────────────────────

export type ExampleCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  calcCount: number;
};

export type ExampleCalcField = {
  key: string;
  label: string;
  type: "number" | "select" | "range";
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: number }[];
};

export type ExampleCalcResult = {
  key: string;
  label: string;
  format: "currency" | "number" | "percent" | "text";
  highlight?: boolean;
};

export type ExampleCalc = {
  slug: string;
  categorySlug: string;
  name: string;
  shortDesc: string;
  description: string;
  keywords: string[];
  fields: ExampleCalcField[];
  results: ExampleCalcResult[];
  calculate: (inputs: Record<string, number>) => Record<string, number | string>;
  formula: string;
  seoTitle: string;
  seoDescription: string;
  faq: { q: string; a: string }[];
  embedNote: string;
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const exampleCategories: ExampleCategory[] = [
  {
    slug: "finance",
    name: "Финансы",
    description: "Проценты, скидки, вклады, кредиты — самые популярные финансовые расчёты",
    icon: "💰",
    color: "emerald",
    calcCount: 4,
  },
  {
    slug: "business",
    name: "Бизнес",
    description: "Маржа, наценка, точка безубыточности — для предпринимателей",
    icon: "📊",
    color: "blue",
    calcCount: 4,
  },
  {
    slug: "auto",
    name: "Авто",
    description: "Расход топлива, стоимость поездки, окупаемость автомобиля",
    icon: "🚗",
    color: "orange",
    calcCount: 3,
  },
  {
    slug: "construction",
    name: "Ремонт и стройка",
    description: "Площадь, обои, краска, стоимость ремонта — для дома и офиса",
    icon: "🏗️",
    color: "amber",
    calcCount: 4,
  },
  {
    slug: "health",
    name: "Здоровье",
    description: "ИМТ, норма калорий, идеальный вес — полезные расчёты",
    icon: "❤️",
    color: "rose",
    calcCount: 3,
  },
  {
    slug: "everyday",
    name: "Повседневное",
    description: "Чаевые, конвертер единиц, разделить счёт — на каждый день",
    icon: "🧮",
    color: "violet",
    calcCount: 3,
  },
];

// ─── Calculators ─────────────────────────────────────────────────────────────

const ru = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n);

const ruCur = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

export const exampleCalcs: ExampleCalc[] = [
  // ── Finance ──────────────────────────────────────────────────────────────
  {
    slug: "percent-of-number",
    categorySlug: "finance",
    name: "Процент от числа",
    shortDesc: "Мгновенно вычислить X% от любой суммы",
    description:
      "Калькулятор процента от числа помогает быстро найти долю от любой суммы — скидку, налог, комиссию или долю в бюджете.",
    keywords: ["процент от числа", "вычислить процент", "сколько процентов", "калькулятор процентов онлайн"],
    fields: [
      { key: "number", label: "Число", type: "number", defaultValue: 10000, min: 0, unit: "" },
      { key: "percent", label: "Процент (%)", type: "range", defaultValue: 15, min: 0, max: 100, step: 0.5, unit: "%" },
    ],
    results: [
      { key: "result", label: "Результат", format: "number", highlight: true },
      { key: "remainder", label: "Остаток", format: "number" },
    ],
    calculate: ({ number, percent }) => {
      const result = (number * percent) / 100;
      return { result: Math.round(result * 100) / 100, remainder: Math.round((number - result) * 100) / 100 };
    },
    formula: "Результат = Число × Процент ÷ 100",
    seoTitle: "Калькулятор процента от числа онлайн — вычислить X% от суммы",
    seoDescription:
      "Калькулятор процента от числа онлайн. Введите число и процент — мгновенно получите результат. Бесплатно, без регистрации. Можно встроить на сайт.",
    faq: [
      { q: "Как найти процент от числа?", a: "Умножьте число на процент и разделите на 100. Например, 15% от 10 000 = 10 000 × 15 ÷ 100 = 1 500." },
      { q: "Как посчитать остаток после вычета процента?", a: "Вычтите результат из исходного числа: Остаток = Число − (Число × Процент ÷ 100)." },
      { q: "Можно ли встроить этот калькулятор на свой сайт?", a: "Да! Создайте аналогичный калькулятор в конструкторе CalcHub и получите iframe-код для вставки." },
    ],
    embedNote: "Этот калькулятор — отличный пример для встройки: он лёгкий, универсальный и нужен любой аудитории.",
  },
  {
    slug: "discount",
    categorySlug: "finance",
    name: "Калькулятор скидки",
    shortDesc: "Цена со скидкой и размер экономии",
    description:
      "Рассчитайте итоговую цену товара со скидкой и узнайте, сколько вы экономите. Подходит для интернет-магазинов, акций и распродаж.",
    keywords: ["калькулятор скидки", "цена со скидкой", "сколько сэкономлю", "расчёт скидки онлайн"],
    fields: [
      { key: "price", label: "Цена товара (₽)", type: "number", defaultValue: 5000, min: 0, unit: "₽" },
      { key: "discount", label: "Скидка (%)", type: "range", defaultValue: 20, min: 0, max: 90, step: 1, unit: "%" },
    ],
    results: [
      { key: "finalPrice", label: "Цена со скидкой", format: "currency", highlight: true },
      { key: "saving", label: "Экономия", format: "currency" },
    ],
    calculate: ({ price, discount }) => {
      const saving = Math.round((price * discount) / 100);
      const finalPrice = price - saving;
      return { finalPrice, saving };
    },
    formula: "Цена со скидкой = Цена × (1 − Скидка ÷ 100)",
    seoTitle: "Калькулятор скидки онлайн — посчитать цену со скидкой",
    seoDescription:
      "Калькулятор скидки онлайн: введите цену и процент скидки — получите итоговую стоимость и размер экономии. Встраивается на сайт интернет-магазина.",
    faq: [
      { q: "Как посчитать цену со скидкой?", a: "Умножьте цену на (100 − скидка) и разделите на 100. Например, скидка 20% от 5 000 ₽: 5 000 × 80 ÷ 100 = 4 000 ₽." },
      { q: "Как узнать размер скидки в рублях?", a: "Умножьте цену на процент скидки и разделите на 100." },
      { q: "Для чего встраивать такой калькулятор?", a: "Калькулятор скидки увеличивает конверсию интернет-магазина — покупатель сразу видит выгоду." },
    ],
    embedNote: "Идеально для сайтов интернет-магазинов, маркетплейсов и акционных страниц.",
  },
  {
    slug: "simple-interest",
    categorySlug: "finance",
    name: "Простые проценты по вкладу",
    shortDesc: "Сколько заработаете на вкладе без капитализации",
    description:
      "Рассчитайте доход по банковскому вкладу с простыми процентами — без капитализации. Укажите сумму, ставку и срок.",
    keywords: ["проценты по вкладу", "доход по вкладу", "простые проценты калькулятор", "вклад онлайн расчёт"],
    fields: [
      { key: "principal", label: "Сумма вклада (₽)", type: "number", defaultValue: 100000, min: 1000, unit: "₽" },
      { key: "rate", label: "Ставка (% годовых)", type: "range", defaultValue: 12, min: 1, max: 25, step: 0.5, unit: "%" },
      { key: "months", label: "Срок (месяцев)", type: "range", defaultValue: 12, min: 1, max: 60, step: 1, unit: "мес" },
    ],
    results: [
      { key: "interest", label: "Доход", format: "currency", highlight: true },
      { key: "total", label: "Итого с вкладом", format: "currency" },
    ],
    calculate: ({ principal, rate, months }) => {
      const interest = Math.round((principal * rate * months) / 1200);
      return { interest, total: principal + interest };
    },
    formula: "Доход = Сумма × Ставка × Срок(мес) ÷ 1200",
    seoTitle: "Калькулятор простых процентов по вкладу онлайн",
    seoDescription:
      "Онлайн-калькулятор дохода по банковскому вкладу с простыми процентами. Введите сумму, ставку и срок — получите итоговый доход.",
    faq: [
      { q: "Что такое простые проценты?", a: "Простые проценты начисляются только на первоначальную сумму вклада, без учёта ранее начисленных процентов." },
      { q: "Чем простые проценты отличаются от сложных?", a: "При сложных процентах (капитализации) начисленные проценты прибавляются к телу вклада и сами начинают приносить доход." },
      { q: "Как встроить калькулятор вклада на сайт банка?", a: "Создайте шаблон в CalcHub с нужными полями, настройте брендинг и скопируйте iframe-код." },
    ],
    embedNote: "Отличный виджет для сайтов банков, финтех-сервисов и финансовых блогов.",
  },
  {
    slug: "tip-splitter",
    categorySlug: "finance",
    name: "Разделить счёт и чаевые",
    shortDesc: "Поровну разделить ресторанный счёт с чаевыми",
    description:
      "Рассчитайте сумму на каждого человека с учётом чаевых. Просто введите сумму счёта, процент чаевых и число гостей.",
    keywords: ["разделить счёт", "чаевые калькулятор", "сколько платить в ресторане", "счёт на двоих"],
    fields: [
      { key: "bill", label: "Сумма счёта (₽)", type: "number", defaultValue: 3000, min: 0, unit: "₽" },
      { key: "tip", label: "Чаевые (%)", type: "range", defaultValue: 10, min: 0, max: 30, step: 1, unit: "%" },
      { key: "people", label: "Кол-во человек", type: "range", defaultValue: 3, min: 1, max: 20, step: 1, unit: "чел" },
    ],
    results: [
      { key: "perPerson", label: "С каждого", format: "currency", highlight: true },
      { key: "tipTotal", label: "Итого чаевые", format: "currency" },
      { key: "total", label: "Всего с чаевыми", format: "currency" },
    ],
    calculate: ({ bill, tip, people }) => {
      const tipTotal = Math.round((bill * tip) / 100);
      const total = bill + tipTotal;
      const perPerson = Math.round(total / people);
      return { perPerson, tipTotal, total };
    },
    formula: "С каждого = (Счёт + Счёт × Чаевые ÷ 100) ÷ Кол-во",
    seoTitle: "Калькулятор чаевых и раздела счёта онлайн",
    seoDescription:
      "Калькулятор чаевых: посчитайте сумму на каждого с учётом tip-процента. Идеально для ресторанов и кафе.",
    faq: [
      { q: "Какие стандартные чаевые в России?", a: "Обычно оставляют 5–15% от суммы счёта. В дорогих заведениях принято 10–15%." },
      { q: "Как разделить счёт если у всех разные заказы?", a: "Этот калькулятор делит поровну. Если нужно разделить персонально — удобнее использовать конструктор форм CalcHub." },
    ],
    embedNote: "Популярный виджет для ресторанных сайтов, приложений для путешественников и lifestyle-блогов.",
  },

  // ── Business ─────────────────────────────────────────────────────────────
  {
    slug: "margin",
    categorySlug: "business",
    name: "Калькулятор маржи",
    shortDesc: "Рентабельность и маржа прибыли",
    description:
      "Рассчитайте маржу прибыли — долю дохода в выручке. Незаменим для анализа бизнеса, ценообразования и оценки рентабельности.",
    keywords: ["калькулятор маржи", "маржа прибыли", "рентабельность расчёт", "маржинальность онлайн"],
    fields: [
      { key: "revenue", label: "Выручка (₽)", type: "number", defaultValue: 500000, min: 0, unit: "₽" },
      { key: "cost", label: "Себестоимость (₽)", type: "number", defaultValue: 300000, min: 0, unit: "₽" },
    ],
    results: [
      { key: "profit", label: "Прибыль", format: "currency", highlight: true },
      { key: "margin", label: "Маржа", format: "percent" },
      { key: "markup", label: "Наценка", format: "percent" },
    ],
    calculate: ({ revenue, cost }) => {
      if (revenue <= 0) return { profit: 0, margin: 0, markup: 0 };
      const profit = revenue - cost;
      const margin = cost > 0 ? Math.round((profit / revenue) * 10000) / 100 : 100;
      const markup = cost > 0 ? Math.round((profit / cost) * 10000) / 100 : 0;
      return { profit, margin, markup };
    },
    formula: "Маржа = (Выручка − Себестоимость) ÷ Выручка × 100%",
    seoTitle: "Калькулятор маржи прибыли онлайн — считать маржинальность бизнеса",
    seoDescription:
      "Онлайн-калькулятор маржи прибыли и наценки. Введите выручку и себестоимость — получите маржинальность в процентах.",
    faq: [
      { q: "Чем маржа отличается от наценки?", a: "Маржа — доля прибыли в выручке. Наценка — доля прибыли в себестоимости. При прибыли 200 ₽ и себестоимости 300 ₽ из 500 ₽: маржа = 40%, наценка = 66.7%." },
      { q: "Какая маржа считается хорошей?", a: "Зависит от отрасли. Торговля: 10–30%. Услуги: 30–60%. SaaS: 60–80%." },
    ],
    embedNote: "Обязательный виджет для бухгалтерских сайтов, бизнес-инструментов и финансовых аналитиков.",
  },
  {
    slug: "markup",
    categorySlug: "business",
    name: "Калькулятор наценки",
    shortDesc: "Цена продажи при заданной наценке",
    description:
      "Введите закупочную цену и желаемую наценку — калькулятор мгновенно покажет цену продажи и размер прибыли.",
    keywords: ["калькулятор наценки", "цена с наценкой", "как посчитать наценку", "наценка на товар"],
    fields: [
      { key: "costPrice", label: "Себестоимость (₽)", type: "number", defaultValue: 1000, min: 0, unit: "₽" },
      { key: "markup", label: "Наценка (%)", type: "range", defaultValue: 50, min: 0, max: 500, step: 5, unit: "%" },
    ],
    results: [
      { key: "sellPrice", label: "Цена продажи", format: "currency", highlight: true },
      { key: "profit", label: "Прибыль", format: "currency" },
      { key: "margin", label: "Маржа", format: "percent" },
    ],
    calculate: ({ costPrice, markup }) => {
      const profit = Math.round((costPrice * markup) / 100);
      const sellPrice = costPrice + profit;
      const margin = sellPrice > 0 ? Math.round((profit / sellPrice) * 10000) / 100 : 0;
      return { sellPrice, profit, margin };
    },
    formula: "Цена = Себестоимость × (1 + Наценка ÷ 100)",
    seoTitle: "Калькулятор наценки на товар онлайн — цена продажи с наценкой",
    seoDescription:
      "Калькулятор наценки: укажите себестоимость и желаемую наценку — получите цену продажи и прибыль. Для интернет-магазинов и торговли.",
    faq: [
      { q: "Как правильно рассчитать наценку?", a: "Наценка = (Цена − Себестоимость) ÷ Себестоимость × 100%. Например: (1500 − 1000) ÷ 1000 × 100 = 50%." },
      { q: "Какая наценка нормальная для розницы?", a: "В розничной торговле наценка обычно составляет 30–100%, в онлайн-продажах — 50–200%." },
    ],
    embedNote: "Полезен для B2B-платформ, оптовых поставщиков и интернет-магазинов.",
  },
  {
    slug: "break-even",
    categorySlug: "business",
    name: "Точка безубыточности",
    shortDesc: "Сколько нужно продать чтобы выйти в ноль",
    description:
      "Рассчитайте точку безубыточности — минимальный объём продаж, при котором бизнес покрывает все расходы и не уходит в минус.",
    keywords: ["точка безубыточности", "BEP калькулятор", "сколько надо продать", "окупаемость расчёт"],
    fields: [
      { key: "fixedCosts", label: "Постоянные расходы (₽/мес)", type: "number", defaultValue: 100000, min: 0, unit: "₽" },
      { key: "price", label: "Цена единицы (₽)", type: "number", defaultValue: 2000, min: 1, unit: "₽" },
      { key: "varCost", label: "Переменные расходы на единицу (₽)", type: "number", defaultValue: 800, min: 0, unit: "₽" },
    ],
    results: [
      { key: "units", label: "Единиц для безубыточности", format: "number", highlight: true },
      { key: "revenue", label: "Выручка для безубыточности", format: "currency" },
      { key: "contribution", label: "Вклад на покрытие (на ед.)", format: "currency" },
    ],
    calculate: ({ fixedCosts, price, varCost }) => {
      const contribution = price - varCost;
      if (contribution <= 0) return { units: 0, revenue: 0, contribution: 0 };
      const units = Math.ceil(fixedCosts / contribution);
      return { units, revenue: units * price, contribution };
    },
    formula: "Точка = Постоянные расходы ÷ (Цена − Переменные расходы)",
    seoTitle: "Калькулятор точки безубыточности онлайн — расчёт BEP для бизнеса",
    seoDescription:
      "Онлайн-расчёт точки безубыточности (BEP). Введите постоянные расходы, цену и себестоимость — узнайте минимальный объём продаж.",
    faq: [
      { q: "Что такое точка безубыточности?", a: "Это объём продаж, при котором доходы равны расходам — бизнес не получает прибыли, но и не несёт убытков." },
      { q: "Как снизить точку безубыточности?", a: "Сократить постоянные расходы, повысить цену или снизить переменные затраты на единицу продукции." },
    ],
    embedNote: "Нужен бизнес-консультантам, стартапам и финансовым блогерам.",
  },
  {
    slug: "roi",
    categorySlug: "business",
    name: "Калькулятор ROI",
    shortDesc: "Возврат инвестиций в процентах",
    description:
      "ROI (Return on Investment) — ключевой показатель эффективности вложений. Рассчитайте его за секунды.",
    keywords: ["ROI калькулятор", "возврат инвестиций", "рентабельность инвестиций", "считать ROI онлайн"],
    fields: [
      { key: "invested", label: "Сумма инвестиций (₽)", type: "number", defaultValue: 200000, min: 1, unit: "₽" },
      { key: "returned", label: "Полученный доход (₽)", type: "number", defaultValue: 280000, min: 0, unit: "₽" },
    ],
    results: [
      { key: "roi", label: "ROI", format: "percent", highlight: true },
      { key: "netProfit", label: "Чистая прибыль", format: "currency" },
      { key: "multiplier", label: "Мультипликатор", format: "number" },
    ],
    calculate: ({ invested, returned }) => {
      if (invested <= 0) return { roi: 0, netProfit: 0, multiplier: 0 };
      const netProfit = returned - invested;
      const roi = Math.round((netProfit / invested) * 10000) / 100;
      const multiplier = Math.round((returned / invested) * 100) / 100;
      return { roi, netProfit, multiplier };
    },
    formula: "ROI = (Доход − Инвестиции) ÷ Инвестиции × 100%",
    seoTitle: "Калькулятор ROI онлайн — считать возврат инвестиций",
    seoDescription:
      "Калькулятор ROI: введите сумму инвестиций и доход — мгновенно получите процент возврата. Для маркетологов, инвесторов и предпринимателей.",
    faq: [
      { q: "Что такое ROI?", a: "ROI (Return on Investment) — показатель, сколько прибыли принесли инвестиции в процентах от вложенной суммы." },
      { q: "Какой ROI считается хорошим?", a: "Зависит от сферы. В маркетинге — 200–400%. В недвижимости — 8–12% годовых. В стартапах — от 100%." },
    ],
    embedNote: "Обязательный виджет для инвестиционных сайтов, агентств и маркетинговых платформ.",
  },

  // ── Auto ─────────────────────────────────────────────────────────────────
  {
    slug: "fuel-cost",
    categorySlug: "auto",
    name: "Стоимость поездки",
    shortDesc: "Сколько стоит доехать из А в Б",
    description:
      "Рассчитайте стоимость поездки на автомобиле с учётом расстояния, расхода топлива и цены за литр.",
    keywords: ["стоимость поездки", "сколько стоит дорога", "расход топлива на поездку", "калькулятор бензина"],
    fields: [
      { key: "distance", label: "Расстояние (км)", type: "number", defaultValue: 500, min: 1, unit: "км" },
      { key: "consumption", label: "Расход (л/100 км)", type: "range", defaultValue: 9, min: 3, max: 25, step: 0.5, unit: "л" },
      { key: "fuelPrice", label: "Цена топлива (₽/л)", type: "number", defaultValue: 55, min: 1, unit: "₽" },
    ],
    results: [
      { key: "tripCost", label: "Стоимость поездки", format: "currency", highlight: true },
      { key: "litersNeeded", label: "Топлива нужно", format: "number" },
      { key: "costPerKm", label: "Стоимость км", format: "currency" },
    ],
    calculate: ({ distance, consumption, fuelPrice }) => {
      const litersNeeded = Math.round((distance * consumption) / 100 * 100) / 100;
      const tripCost = Math.round(litersNeeded * fuelPrice);
      const costPerKm = Math.round((tripCost / distance) * 100) / 100;
      return { tripCost, litersNeeded, costPerKm };
    },
    formula: "Стоимость = Расстояние × Расход ÷ 100 × Цена топлива",
    seoTitle: "Калькулятор стоимости поездки на машине онлайн",
    seoDescription:
      "Посчитайте стоимость поездки на автомобиле: введите расстояние, расход топлива и цену бензина. Быстро, точно, бесплатно.",
    faq: [
      { q: "Как посчитать сколько бензина нужно на дорогу?", a: "Умножьте расстояние на расход (л/100 км) и разделите на 100." },
      { q: "Что выгоднее — машина или поезд?", a: "Используйте этот калькулятор для расчёта автомобиля и сравните с ценой билетов на общественный транспорт." },
    ],
    embedNote: "Идеально для навигационных сервисов, автомобильных порталов и туристических сайтов.",
  },
  {
    slug: "car-payback",
    categorySlug: "auto",
    name: "Окупаемость автомобиля",
    shortDesc: "За сколько лет окупится покупка авто",
    description:
      "Рассчитайте, через сколько лет автомобиль окупит себя, если вы экономите на такси или общественном транспорте.",
    keywords: ["окупаемость автомобиля", "выгодно ли покупать машину", "машина vs такси", "расчёт авто"],
    fields: [
      { key: "carCost", label: "Стоимость авто (₽)", type: "number", defaultValue: 1500000, min: 0, unit: "₽" },
      { key: "monthlyFuel", label: "Расходы на топливо в месяц (₽)", type: "number", defaultValue: 5000, min: 0, unit: "₽" },
      { key: "monthlyMaintenance", label: "Обслуживание в месяц (₽)", type: "number", defaultValue: 3000, min: 0, unit: "₽" },
      { key: "monthlyTaxi", label: "Альтернатива: такси/транспорт (₽/мес)", type: "number", defaultValue: 15000, min: 0, unit: "₽" },
    ],
    results: [
      { key: "paybackYears", label: "Окупаемость", format: "number", highlight: true },
      { key: "monthlySaving", label: "Экономия в месяц", format: "currency" },
      { key: "yearlyCarCost", label: "Расходы на авто в год", format: "currency" },
    ],
    calculate: ({ carCost, monthlyFuel, monthlyMaintenance, monthlyTaxi }) => {
      const monthlyCar = monthlyFuel + monthlyMaintenance;
      const monthlySaving = monthlyTaxi - monthlyCar;
      if (monthlySaving <= 0) return { paybackYears: 999, monthlySaving, yearlyCarCost: monthlyCar * 12 };
      const paybackMonths = carCost / monthlySaving;
      const paybackYears = Math.round((paybackMonths / 12) * 10) / 10;
      return { paybackYears, monthlySaving, yearlyCarCost: monthlyCar * 12 };
    },
    formula: "Окупаемость = Стоимость авто ÷ (Такси − Расходы на авто) в месяц",
    seoTitle: "Калькулятор окупаемости автомобиля — выгодно ли купить машину",
    seoDescription:
      "Посчитайте, через сколько лет окупится автомобиль в сравнении с расходами на такси. Учитывает топливо и обслуживание.",
    faq: [
      { q: "Выгодно ли покупать машину вместо такси?", a: "Зависит от интенсивности использования. Если ездите каждый день, авто обычно окупается за 3–7 лет." },
      { q: "Что учитывать при расчёте?", a: "Топливо, страховку (ОСАГО/КАСКО), обслуживание, парковку, амортизацию и кредитные платежи если берёте в кредит." },
    ],
    embedNote: "Отличный контент-виджет для автомобильных дилеров и финансовых блогов.",
  },
  {
    slug: "tire-size",
    categorySlug: "auto",
    name: "Калькулятор размера шин",
    shortDesc: "Диаметр и ширина колеса по маркировке",
    description:
      "Декодируйте маркировку шины и узнайте её диаметр, ширину профиля и совместимость с вашим автомобилем.",
    keywords: ["размер шин калькулятор", "маркировка шин", "диаметр шины", "ширина профиля шины"],
    fields: [
      { key: "width", label: "Ширина шины (мм)", type: "number", defaultValue: 205, min: 135, max: 335, unit: "мм" },
      { key: "profile", label: "Профиль (%)", type: "range", defaultValue: 55, min: 30, max: 80, step: 5, unit: "%" },
      { key: "rim", label: "Диаметр диска (дюймы)", type: "range", defaultValue: 16, min: 13, max: 22, step: 1, unit: '"' },
    ],
    results: [
      { key: "outerDiameter", label: "Внешний диаметр (мм)", format: "number", highlight: true },
      { key: "sectionHeight", label: "Высота профиля (мм)", format: "number" },
      { key: "circumference", label: "Длина окружности (мм)", format: "number" },
    ],
    calculate: ({ width, profile, rim }) => {
      const sectionHeight = Math.round((width * profile) / 100);
      const rimMm = rim * 25.4;
      const outerDiameter = Math.round(rimMm + 2 * sectionHeight);
      const circumference = Math.round(outerDiameter * Math.PI);
      return { outerDiameter, sectionHeight, circumference };
    },
    formula: "Внешний диаметр = Диск (мм) + 2 × Высота профиля",
    seoTitle: "Калькулятор размера шин онлайн — маркировка и диаметр колёс",
    seoDescription:
      "Калькулятор размера шин: введите маркировку — ширину, профиль и диаметр диска — получите полные характеристики колеса.",
    faq: [
      { q: "Что означает маркировка 205/55 R16?", a: "205 — ширина шины в мм, 55 — высота профиля в % от ширины, R16 — диаметр диска в дюймах." },
      { q: "Можно ли ставить шины другого размера?", a: "Допускается отклонение ±3% внешнего диаметра от штатного. Обязательно проверьте совместимость." },
    ],
    embedNote: "Необходим на сайтах шинных магазинов и автозапчастей.",
  },

  // ── Construction ─────────────────────────────────────────────────────────
  {
    slug: "room-area",
    categorySlug: "construction",
    name: "Площадь комнаты",
    shortDesc: "Площадь и периметр прямоугольной комнаты",
    description:
      "Вычислите площадь и периметр комнаты прямоугольной формы. Поможет купить правильное количество материалов для ремонта.",
    keywords: ["площадь комнаты", "калькулятор площади", "периметр комнаты", "площадь пола"],
    fields: [
      { key: "length", label: "Длина (м)", type: "number", defaultValue: 5, min: 0.5, step: 0.1, unit: "м" },
      { key: "width", label: "Ширина (м)", type: "number", defaultValue: 4, min: 0.5, step: 0.1, unit: "м" },
      { key: "height", label: "Высота потолка (м)", type: "number", defaultValue: 2.7, min: 1.5, step: 0.1, unit: "м" },
    ],
    results: [
      { key: "area", label: "Площадь пола", format: "number", highlight: true },
      { key: "wallArea", label: "Площадь стен", format: "number" },
      { key: "perimeter", label: "Периметр", format: "number" },
    ],
    calculate: ({ length, width, height }) => {
      const area = Math.round(length * width * 100) / 100;
      const perimeter = Math.round(2 * (length + width) * 100) / 100;
      const wallArea = Math.round(perimeter * height * 100) / 100;
      return { area, wallArea, perimeter };
    },
    formula: "Площадь = Длина × Ширина",
    seoTitle: "Калькулятор площади комнаты онлайн — посчитать м² пола и стен",
    seoDescription:
      "Рассчитайте площадь комнаты, площадь стен и периметр. Введите длину, ширину и высоту потолка — получите точный результат.",
    faq: [
      { q: "Как посчитать площадь квартиры самостоятельно?", a: "Измерьте каждую комнату и просуммируйте площади. Для прямоугольной комнаты площадь = длина × ширина." },
      { q: "Зачем знать площадь стен?", a: "Для расчёта количества обоев, краски, штукатурки или облицовочного материала." },
    ],
    embedNote: "Идеален для сайтов строительных магазинов, дизайн-студий и агентств недвижимости.",
  },
  {
    slug: "wallpaper",
    categorySlug: "construction",
    name: "Калькулятор обоев",
    shortDesc: "Сколько рулонов обоев нужно на комнату",
    description:
      "Рассчитайте необходимое количество рулонов обоев для вашей комнаты с учётом дверей, окон и высоты потолка.",
    keywords: ["калькулятор обоев", "сколько рулонов обоев", "расчёт обоев на комнату", "обои онлайн"],
    fields: [
      { key: "roomLength", label: "Длина комнаты (м)", type: "number", defaultValue: 5, min: 1, step: 0.1, unit: "м" },
      { key: "roomWidth", label: "Ширина комнаты (м)", type: "number", defaultValue: 4, min: 1, step: 0.1, unit: "м" },
      { key: "ceilingHeight", label: "Высота потолка (м)", type: "number", defaultValue: 2.7, min: 2, step: 0.1, unit: "м" },
      { key: "doors", label: "Кол-во дверей", type: "range", defaultValue: 1, min: 0, max: 5, step: 1, unit: "шт" },
      { key: "windows", label: "Кол-во окон", type: "range", defaultValue: 1, min: 0, max: 6, step: 1, unit: "шт" },
    ],
    results: [
      { key: "rolls", label: "Рулонов нужно", format: "number", highlight: true },
      { key: "netArea", label: "Площадь под обои (м²)", format: "number" },
    ],
    calculate: ({ roomLength, roomWidth, ceilingHeight, doors, windows }) => {
      const perimeter = 2 * (roomLength + roomWidth);
      const grossArea = perimeter * ceilingHeight;
      const doorArea = doors * 2.0; // avg 2 m² per door
      const windowArea = windows * 1.5; // avg 1.5 m² per window
      const netArea = Math.round((grossArea - doorArea - windowArea) * 100) / 100;
      // Standard roll: 10.05m long × 0.53m wide ≈ 5.33 m²
      const rollArea = 5.33;
      const rolls = Math.ceil(netArea / rollArea);
      return { rolls, netArea };
    },
    formula: "Рулоны = (Периметр × Высота − Двери − Окна) ÷ Площадь рулона",
    seoTitle: "Калькулятор обоев онлайн — сколько рулонов нужно на комнату",
    seoDescription:
      "Рассчитайте количество рулонов обоев онлайн. Укажите размеры комнаты, число дверей и окон — получите точный расчёт.",
    faq: [
      { q: "Какого размера стандартный рулон обоев?", a: "Стандартный рулон: 10,05 м × 0,53 м. Площадь ≈ 5,3 м². Есть рулоны шириной 1,06 м — площадь ≈ 10,6 м²." },
      { q: "Нужно ли брать запас?", a: "Рекомендуется брать на 1–2 рулона больше на случай подгонки рисунка и ошибок при поклейке." },
    ],
    embedNote: "Топовый виджет для строительных магазинов и DIY-платформ.",
  },
  {
    slug: "paint",
    categorySlug: "construction",
    name: "Расход краски",
    shortDesc: "Сколько банок краски нужно на стены",
    description:
      "Рассчитайте необходимое количество краски для покраски стен или потолка с учётом числа слоёв и расхода.",
    keywords: ["расход краски", "сколько краски нужно", "калькулятор краски", "расчёт краски онлайн"],
    fields: [
      { key: "area", label: "Площадь (м²)", type: "number", defaultValue: 40, min: 1, unit: "м²" },
      { key: "layers", label: "Кол-во слоёв", type: "range", defaultValue: 2, min: 1, max: 4, step: 1, unit: "сл" },
      { key: "coverage", label: "Расход (м²/л)", type: "range", defaultValue: 10, min: 4, max: 16, step: 1, unit: "м²/л" },
      { key: "canSize", label: "Объём банки (л)", type: "range", defaultValue: 5, min: 1, max: 20, step: 1, unit: "л" },
    ],
    results: [
      { key: "cans", label: "Банок нужно", format: "number", highlight: true },
      { key: "liters", label: "Краски (литров)", format: "number" },
    ],
    calculate: ({ area, layers, coverage, canSize }) => {
      const liters = Math.ceil((area * layers) / coverage * 10) / 10;
      const cans = Math.ceil(liters / canSize);
      return { cans, liters };
    },
    formula: "Литров = Площадь × Слои ÷ Расход (м²/л)",
    seoTitle: "Калькулятор расхода краски онлайн — сколько краски нужно на стены",
    seoDescription:
      "Рассчитайте количество краски для ремонта: укажите площадь, число слоёв и расход — получите количество банок.",
    faq: [
      { q: "Сколько краски нужно на 1 м²?", a: "Зависит от типа краски. Обычно 100–200 мл/м² на слой (расход 5–10 м²/л). Матовые краски расходуются больше." },
      { q: "Сколько слоёв нужно красить?", a: "Обычно 2 слоя. Если красите поверх тёмного цвета — 3 слоя. Грунтовка снижает общий расход краски." },
    ],
    embedNote: "Ключевой виджет для строительных магазинов и сайтов с красками.",
  },
  {
    slug: "renovation-cost",
    categorySlug: "construction",
    name: "Стоимость ремонта",
    shortDesc: "Бюджет ремонта по площади и типу",
    description:
      "Оцените бюджет ремонта квартиры или офиса. Выберите тип ремонта и введите площадь — получите диапазон стоимости.",
    keywords: ["стоимость ремонта", "калькулятор ремонта", "бюджет ремонта квартиры", "ремонт цена расчёт"],
    fields: [
      { key: "area", label: "Площадь (м²)", type: "number", defaultValue: 50, min: 10, unit: "м²" },
      {
        key: "type",
        label: "Тип ремонта",
        type: "select",
        defaultValue: 5000,
        options: [
          { label: "Косметический", value: 3000 },
          { label: "Стандартный", value: 6000 },
          { label: "Евроремонт", value: 12000 },
          { label: "Дизайнерский", value: 25000 },
        ],
      },
    ],
    results: [
      { key: "totalCost", label: "Ориентировочный бюджет", format: "currency", highlight: true },
      { key: "perSqm", label: "Стоимость м²", format: "currency" },
    ],
    calculate: ({ area, type }) => {
      const perSqm = type;
      const totalCost = Math.round(area * perSqm);
      return { totalCost, perSqm };
    },
    formula: "Стоимость = Площадь × Цена за м²",
    seoTitle: "Калькулятор стоимости ремонта квартиры онлайн",
    seoDescription:
      "Рассчитайте стоимость ремонта: укажите площадь и тип ремонта — получите ориентировочный бюджет. Для квартиры, офиса, дома.",
    faq: [
      { q: "Сколько стоит ремонт в 2024 году?", a: "Косметический: от 2 000 ₽/м², стандартный: от 5 000 ₽/м², евроремонт: от 10 000 ₽/м², дизайнерский: от 20 000 ₽/м²." },
      { q: "Что входит в стоимость ремонта?", a: "Работы, материалы, транспортировка и вывоз мусора. Стоимость мебели не входит." },
    ],
    embedNote: "Обязательный виджет для строительных компаний, дизайн-студий и порталов недвижимости.",
  },

  // ── Health ────────────────────────────────────────────────────────────────
  {
    slug: "bmi",
    categorySlug: "health",
    name: "Индекс массы тела (ИМТ)",
    shortDesc: "Нормальный ли у вас вес для вашего роста",
    description:
      "Рассчитайте ИМТ (индекс массы тела) и определите, соответствует ли ваш вес норме по международной классификации ВОЗ.",
    keywords: ["калькулятор ИМТ", "индекс массы тела", "нормальный вес", "ИМТ онлайн"],
    fields: [
      { key: "weight", label: "Вес (кг)", type: "number", defaultValue: 75, min: 30, max: 300, unit: "кг" },
      { key: "height", label: "Рост (см)", type: "number", defaultValue: 175, min: 100, max: 250, unit: "см" },
    ],
    results: [
      { key: "bmi", label: "ИМТ", format: "number", highlight: true },
      { key: "idealMin", label: "Идеальный вес (min)", format: "number" },
      { key: "idealMax", label: "Идеальный вес (max)", format: "number" },
    ],
    calculate: ({ weight, height }) => {
      const heightM = height / 100;
      const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
      const idealMin = Math.round(18.5 * heightM * heightM * 10) / 10;
      const idealMax = Math.round(24.9 * heightM * heightM * 10) / 10;
      return { bmi, idealMin, idealMax };
    },
    formula: "ИМТ = Вес (кг) ÷ Рост² (м)",
    seoTitle: "Калькулятор ИМТ онлайн — индекс массы тела для мужчин и женщин",
    seoDescription:
      "Рассчитайте ИМТ (индекс массы тела) онлайн. Узнайте норма ли ваш вес по классификации ВОЗ и ваш идеальный диапазон веса.",
    faq: [
      { q: "Что такое ИМТ?", a: "Индекс массы тела (ИМТ) — соотношение веса (кг) и квадрата роста (м²). Норма: 18,5–24,9." },
      { q: "Какой ИМТ считается нормальным?", a: "По ВОЗ: дефицит веса <18,5; норма 18,5–24,9; избыток 25–29,9; ожирение ≥30." },
      { q: "Применим ли ИМТ для спортсменов?", a: "ИМТ не учитывает состав тела. У атлетов с развитой мышечной массой ИМТ может быть завышен без реального избытка жира." },
    ],
    embedNote: "Популярный виджет для медицинских сайтов, фитнес-приложений и диетологических порталов.",
  },
  {
    slug: "calories",
    categorySlug: "health",
    name: "Суточная норма калорий",
    shortDesc: "Сколько калорий нужно в день",
    description:
      "Рассчитайте дневную норму калорий на основе пола, возраста, веса, роста и уровня активности по формуле Харриса–Бенедикта.",
    keywords: ["норма калорий", "суточная норма калорий", "калькулятор калорий", "TDEE онлайн"],
    fields: [
      { key: "weight", label: "Вес (кг)", type: "number", defaultValue: 75, min: 30, max: 200, unit: "кг" },
      { key: "height", label: "Рост (см)", type: "number", defaultValue: 175, min: 100, max: 250, unit: "см" },
      { key: "age", label: "Возраст (лет)", type: "number", defaultValue: 30, min: 10, max: 100, unit: "лет" },
      {
        key: "activity",
        label: "Уровень активности",
        type: "select",
        defaultValue: 1.55,
        options: [
          { label: "Сидячий образ жизни", value: 1.2 },
          { label: "Лёгкая активность", value: 1.375 },
          { label: "Умеренная активность", value: 1.55 },
          { label: "Высокая активность", value: 1.725 },
          { label: "Очень высокая активность", value: 1.9 },
        ],
      },
    ],
    results: [
      { key: "tdee", label: "Норма калорий/день", format: "number", highlight: true },
      { key: "bmr", label: "Базовый обмен (BMR)", format: "number" },
      { key: "forLoss", label: "Для похудения (−500)", format: "number" },
    ],
    calculate: ({ weight, height, age, activity }) => {
      // Harris-Benedict (мужской вариант для простоты; можно добавить пол)
      const bmr = Math.round(88.36 + 13.4 * weight + 4.8 * height - 5.7 * age);
      const tdee = Math.round(bmr * activity);
      const forLoss = Math.max(tdee - 500, 1200);
      return { tdee, bmr, forLoss };
    },
    formula: "TDEE = BMR × Коэффициент активности",
    seoTitle: "Калькулятор суточной нормы калорий онлайн — TDEE и BMR",
    seoDescription:
      "Рассчитайте суточную норму калорий по формуле Харриса–Бенедикта. Введите вес, рост, возраст и уровень активности.",
    faq: [
      { q: "Что такое BMR и TDEE?", a: "BMR — базальный метаболизм (калории в покое). TDEE — дневная норма с учётом активности." },
      { q: "На сколько снижать калории для похудения?", a: "Безопасный дефицит — 300–500 ккал в день. Это даёт потерю 0,3–0,5 кг в неделю." },
    ],
    embedNote: "Любимый виджет фитнес-блогеров, диетологов и спортивных приложений.",
  },
  {
    slug: "ideal-weight",
    categorySlug: "health",
    name: "Идеальный вес",
    shortDesc: "Ваш идеальный вес по нескольким формулам",
    description:
      "Рассчитайте идеальный вес по популярным формулам: Брока, Лоренца и ИМТ-нормы — и посмотрите среднее значение.",
    keywords: ["идеальный вес", "калькулятор идеального веса", "норма веса по росту", "вес по формуле Брока"],
    fields: [
      { key: "height", label: "Рост (см)", type: "number", defaultValue: 175, min: 100, max: 250, unit: "см" },
    ],
    results: [
      { key: "brock", label: "По формуле Брока", format: "number", highlight: true },
      { key: "lorenz", label: "По формуле Лоренца", format: "number" },
      { key: "bmiNorm", label: "По ИМТ-норме (18.5–24.9)", format: "number" },
    ],
    calculate: ({ height }) => {
      const brock = Math.round(height - 110);
      const lorenz = Math.round((height - 100) - (height - 150) / 4);
      const heightM = height / 100;
      const bmiNorm = Math.round(21.75 * heightM * heightM * 10) / 10; // mid of 18.5-24.9
      return { brock, lorenz, bmiNorm };
    },
    formula: "Брок: Рост (см) − 110 (для женщин) / −100 (для мужчин)",
    seoTitle: "Калькулятор идеального веса онлайн по росту — формулы Брока и Лоренца",
    seoDescription:
      "Рассчитайте идеальный вес по формулам Брока и Лоренца. Введите рост — получите рекомендуемый диапазон веса.",
    faq: [
      { q: "Какая формула идеального веса точнее?", a: "Единой «точной» формулы нет. Брока — упрощённая, Лоренц учитывает рост точнее. ВОЗ рекомендует использовать ИМТ 18,5–24,9." },
      { q: "Учитывает ли калькулятор пол?", a: "Базовая формула Брока: вес = рост − 110 (женщины) или рост − 100 (мужчины). Наш расчёт использует усреднённую версию." },
    ],
    embedNote: "Популярен на медицинских, фитнес- и нутрициологических сайтах.",
  },

  // ── Everyday ─────────────────────────────────────────────────────────────
  {
    slug: "age",
    categorySlug: "everyday",
    name: "Калькулятор возраста",
    shortDesc: "Точный возраст в годах, месяцах и днях",
    description:
      "Введите дату рождения — узнайте точный возраст в годах, месяцах и днях, а также до следующего дня рождения.",
    keywords: ["калькулятор возраста", "сколько мне лет", "возраст по дате рождения", "дней до дня рождения"],
    fields: [
      { key: "birthYear", label: "Год рождения", type: "number", defaultValue: 1990, min: 1900, max: 2024, unit: "" },
      { key: "birthMonth", label: "Месяц рождения (1–12)", type: "range", defaultValue: 6, min: 1, max: 12, step: 1, unit: "" },
      { key: "birthDay", label: "День рождения (1–31)", type: "range", defaultValue: 15, min: 1, max: 31, step: 1, unit: "" },
    ],
    results: [
      { key: "years", label: "Полных лет", format: "number", highlight: true },
      { key: "months", label: "Месяцев всего", format: "number" },
      { key: "daysToBirthday", label: "Дней до дня рождения", format: "number" },
    ],
    calculate: ({ birthYear, birthMonth, birthDay }) => {
      const today = new Date();
      const birth = new Date(birthYear, birthMonth - 1, birthDay);
      let years = today.getFullYear() - birth.getFullYear();
      let m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      const months = years * 12 + today.getMonth() - birth.getMonth();
      const nextBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
      if (nextBirthday <= today) nextBirthday.setFullYear(today.getFullYear() + 1);
      const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);
      return { years: Math.max(0, years), months: Math.max(0, months), daysToBirthday };
    },
    formula: "Возраст = Текущая дата − Дата рождения",
    seoTitle: "Калькулятор возраста онлайн — точный возраст по дате рождения",
    seoDescription:
      "Рассчитайте точный возраст в годах, месяцах и днях. Введите дату рождения — также покажет дней до следующего дня рождения.",
    faq: [
      { q: "Как посчитать точный возраст?", a: "Вычтите дату рождения из текущей даты. Не забудьте учесть, прошёл ли день рождения в этом году." },
      { q: "Зачем считать дни до дня рождения?", a: "Для планирования поздравлений, создания таймеров обратного отсчёта или просто из любопытства." },
    ],
    embedNote: "Один из самых популярных виджетов — встречается на гороскопных, HR и event-сайтах.",
  },
  {
    slug: "unit-converter",
    categorySlug: "everyday",
    name: "Конвертер длины",
    shortDesc: "Метры, футы, дюймы, сантиметры",
    description:
      "Конвертируйте единицы длины: метры в футы, сантиметры в дюймы, километры в мили и обратно.",
    keywords: ["конвертер длины", "метры в футы", "сантиметры в дюймы", "перевести единицы"],
    fields: [
      { key: "meters", label: "Метры (м)", type: "number", defaultValue: 1, min: 0, step: 0.001, unit: "м" },
    ],
    results: [
      { key: "cm", label: "Сантиметры", format: "number", highlight: true },
      { key: "feet", label: "Футы", format: "number" },
      { key: "inches", label: "Дюймы", format: "number" },
      { key: "km", label: "Километры", format: "number" },
    ],
    calculate: ({ meters }) => {
      return {
        cm: Math.round(meters * 100 * 100) / 100,
        feet: Math.round(meters * 3.28084 * 1000) / 1000,
        inches: Math.round(meters * 39.3701 * 100) / 100,
        km: Math.round(meters / 1000 * 1000000) / 1000000,
      };
    },
    formula: "1 м = 100 см = 3.281 фут = 39.37 дюйма",
    seoTitle: "Конвертер длины онлайн — метры в футы, дюймы, сантиметры",
    seoDescription:
      "Конвертер единиц длины: переводите метры в футы, дюймы, сантиметры и километры онлайн. Быстро и бесплатно.",
    faq: [
      { q: "Сколько сантиметров в 1 метре?", a: "В 1 метре ровно 100 сантиметров." },
      { q: "Как перевести метры в футы?", a: "1 метр = 3,28084 фута. Умножьте метры на 3.28084." },
    ],
    embedNote: "Базовый виджет для международных интернет-магазинов, образовательных сайтов и путешествий.",
  },
  {
    slug: "speed",
    categorySlug: "everyday",
    name: "Калькулятор скорости/времени",
    shortDesc: "Скорость, время или расстояние — найти третье",
    description:
      "Если знаете два из трёх параметров (скорость, время, расстояние) — калькулятор мгновенно вычислит третий.",
    keywords: ["калькулятор скорости", "скорость время расстояние", "рассчитать скорость онлайн", "физика онлайн"],
    fields: [
      { key: "distance", label: "Расстояние (км)", type: "number", defaultValue: 200, min: 0, unit: "км" },
      { key: "speed", label: "Скорость (км/ч)", type: "number", defaultValue: 80, min: 1, unit: "км/ч" },
    ],
    results: [
      { key: "hours", label: "Время (часов)", format: "number", highlight: true },
      { key: "minutes", label: "Время (минут)", format: "number" },
      { key: "minutesPerKm", label: "Мин на км", format: "number" },
    ],
    calculate: ({ distance, speed }) => {
      if (speed <= 0) return { hours: 0, minutes: 0, minutesPerKm: 0 };
      const hours = Math.round((distance / speed) * 100) / 100;
      const minutes = Math.round(hours * 60);
      const minutesPerKm = Math.round((60 / speed) * 100) / 100;
      return { hours, minutes, minutesPerKm };
    },
    formula: "Время = Расстояние ÷ Скорость",
    seoTitle: "Калькулятор скорости, времени и расстояния онлайн",
    seoDescription:
      "Рассчитайте скорость, время или расстояние по двум известным параметрам. Для поездок, спорта и учёбы.",
    faq: [
      { q: "Как посчитать время в пути?", a: "Разделите расстояние на скорость. Например, 200 км ÷ 80 км/ч = 2,5 часа = 2 ч 30 мин." },
      { q: "Как перевести км/ч в м/с?", a: "Умножьте км/ч на 1000 и разделите на 3600. Или просто умножьте на 0,2778." },
    ],
    embedNote: "Полезен для туристических сайтов, спортивных приложений и образовательных порталов.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCalcsByCategory(categorySlug: string) {
  return exampleCalcs.filter((c) => c.categorySlug === categorySlug);
}

export function getCalcBySlug(categorySlug: string, calcSlug: string) {
  return exampleCalcs.find((c) => c.categorySlug === categorySlug && c.slug === calcSlug);
}

export function getCategoryBySlug(slug: string) {
  return exampleCategories.find((c) => c.slug === slug);
}
