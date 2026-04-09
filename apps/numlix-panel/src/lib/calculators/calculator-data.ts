export type CategoryIconName =
  | "DollarSign"
  | "Percent"
  | "TrendingUp"
  | "Building2"
  | "Briefcase"
  | "Home"
  | "Car"
  | "Scale";

export type Category = {
  id: string;
  name: string;
  description: string;
  icon?: CategoryIconName;
};

export type PopularCalculator = {
  id: string;
  name: string;
  description: string;
  category: string;
  uses: number;
  path?: string;
};

export const categories: Category[] = [
  { id: "finance", name: "Finance", description: "Loan, mortgage, and investment calculators", icon: "DollarSign" },
  { id: "taxes", name: "Taxes", description: "Tax calculations and deductions", icon: "Percent" },
  { id: "salary", name: "Salary", description: "Salary and income calculations", icon: "TrendingUp" },
  { id: "investments", name: "Investments", description: "Investment and portfolio analysis", icon: "Building2" },
  { id: "business", name: "Business", description: "Business and accounting tools", icon: "Briefcase" },
  { id: "home", name: "Home & Life", description: "Everyday household calculations", icon: "Home" },
  { id: "automotive", name: "Automotive", description: "Vehicle ownership and insurance calculators", icon: "Car" },
  { id: "legal", name: "Юридические", description: "Юридические расчёты: индексация, алименты, прожиточный минимум", icon: "Scale" },
];

export type CalculatorMetadata = {
  name: string;
  description: string;
  searches: string[];
};

export const calculatorMetadata: Record<string, CalculatorMetadata> = {
  mortgage: {
    name: "Mortgage Calculator",
    description: "Calculate mortgage payments, amortization schedules, and interest with our free mortgage calculator.",
    searches: ["mortgage calculator", "home loan calculator", "mortgage payment calculator"],
  },
  deposit: {
    name: "Калькулятор вкладов",
    description: "Расчёт процентов по вкладу с капитализацией, пополнениями, снятиями и налогом на доход.",
    searches: ["калькулятор вкладов", "калькулятор депозита", "deposit calculator"],
  },
  "credit-early-repayment": {
    name: "Credit Calculator with Early Repayment",
    description: "Calculate loan payments with early repayments, rate changes, and holiday adjustments.",
    searches: ["credit calculator with early repayment", "loan early repayment calculator"],
  },
  refinancing: {
    name: "Refinancing Calculator",
    description: "Calculate refinancing savings: compare current loan payments and interest with new terms.",
    searches: ["refinancing calculator", "loan refinancing calculator"],
  },
  microloan: {
    name: "Microloan Calculator",
    description: "Calculate microloan or payday loan interest, overdue penalties, and total amount to repay.",
    searches: ["microloan calculator", "payday loan calculator"],
  },
  inflation: {
    name: "Inflation Calculator",
    description: "Calculate inflation over a period, price change, and savings depreciation using World Bank data.",
    searches: ["inflation calculator", "inflation rate calculator"],
  },
  vat: {
    name: "VAT Calculator",
    description: "Calculate VAT or sales tax: add tax to amount or exclude tax from amount. Select country for automatic rate.",
    searches: ["VAT calculator", "calculator НДС", "НДС онлайн", "sales tax calculator"],
  },
  ndfl: {
    name: "Калькулятор НДФЛ",
    description: "Бесплатный калькулятор НДФЛ по НК РФ: прогрессивная шкала с 2025 года, все виды дохода.",
    searches: ["калькулятор НДФЛ", "расчёт НДФЛ", "подоходный налог калькулятор"],
  },
  peni: {
    name: "Калькулятор пеней онлайн — расчёт по налогам, ЖКХ и зарплате",
    description: "Бесплатный калькулятор пеней: штраф за просрочку налогов и взносов, пени за коммунальные услуги, компенсация за задержку зарплаты.",
    searches: ["калькулятор пеней", "расчёт пеней", "пени по налогам"],
  },
  "property-deduction": {
    name: "Калькулятор имущественного вычета",
    description: "Расчёт налогового вычета при покупке квартиры: лимит 2 млн ₽, возврат НДФЛ до 260 000 ₽.",
    searches: ["калькулятор имущественного вычета", "налоговый вычет при покупке квартиры"],
  },
  "property-sale-tax": {
    name: "Калькулятор налога с продажи квартиры",
    description: "Расчёт НДФЛ с продажи квартиры: срок владения, вычет 1 млн ₽ или расходы на покупку.",
    searches: ["калькулятор налога с продажи квартиры", "налог с продажи квартиры"],
  },
  "loan-interest": {
    name: "Калькулятор процентов по договору займа",
    description: "Расчёт процентов по займу (ст. 809 ГК РФ): смена ставки, досрочные выплаты, увеличение долга.",
    searches: ["калькулятор процентов по займу", "проценты по договору займа"],
  },
  gk395: {
    name: "Калькулятор процентов по статье 395 ГК РФ",
    description: "Расчёт процентов за пользование чужими средствами по ключевой ставке ЦБ РФ.",
    searches: ["калькулятор 395 ГК РФ", "проценты по 395 ГК"],
  },
  "penalty-contract": {
    name: "Калькулятор неустойки по договору",
    description: "Расчёт неустойки по договору: календарные или рабочие дни, ставка, лимит, исключения.",
    searches: ["калькулятор неустойки", "расчёт неустойки по договору"],
  },
  "penalty-ddu": {
    name: "Калькулятор неустойки по ДДУ",
    description: "Расчёт неустойки по ДДУ (214-ФЗ): физлицо 1/150, юрлицо 1/300 ключевой ставки.",
    searches: ["калькулятор неустойки по ДДУ", "неустойка по ДДУ 214-ФЗ"],
  },
  "unused-vacation": {
    name: "Калькулятор неиспользуемого отпуска",
    description: "Расчёт дней неиспользованного отпуска и компенсации при увольнении по ТК РФ.",
    searches: ["калькулятор неиспользуемого отпуска", "компенсация за неиспользованный отпуск"],
  },
  otpusknye: {
    name: "Калькулятор отпускных",
    description: "Расчёт отпускных по ТК РФ и ПП 922: расчётный период, исключаемые периоды, повышения зарплаты.",
    searches: ["калькулятор отпускных", "расчёт отпускных"],
  },
  osago: {
    name: "Калькулятор ОСАГО",
    description: "Расчёт стоимости полиса ОСАГО по коэффициентам ЦБ РФ.",
    searches: ["калькулятор осаго", "рассчитать осаго онлайн"],
  },
  "transport-tax": {
    name: "Калькулятор транспортного налога",
    description: "Расчёт транспортного налога по региону РФ, виду ТС, мощности и периоду владения.",
    searches: ["калькулятор транспортного налога", "расчёт транспортного налога"],
  },
  "rastamozhka-auto": {
    name: "Калькулятор растаможки автомобилей",
    description: "Расчёт таможенного сбора, пошлины, утильсбора, акциза и НДС при ввозе авто в РФ.",
    searches: ["калькулятор растаможки", "растаможка авто"],
  },
  "auto-loan": {
    name: "Auto Loan Calculator",
    description: "Calculate auto loan monthly payment, total interest, and repayment schedule.",
    searches: ["auto loan calculator", "car loan calculator"],
  },
  "fuel-consumption": {
    name: "Калькулятор расхода топлива",
    description: "Расчёт расхода топлива за поездку и среднего расхода на 100 км.",
    searches: ["калькулятор расхода топлива", "расход топлива на 100 км"],
  },
  "insurance-tenure": {
    name: "Калькулятор страхового стажа",
    description: "Онлайн расчёт страхового стажа по трудовой книжке; больничный 60/80/100%.",
    searches: ["калькулятор стажа", "страховой стаж"],
  },
  "subsistence-minimum": {
    name: "Калькулятор расчёта суммы, кратной прожиточному минимуму",
    description: "Расчёт индексации алиментов по ст. 117 СК РФ: сумма кратная ПМ по региону.",
    searches: ["калькулятор прожиточного минимума", "сумма кратная ПМ"],
  },
  "alimony-indexation": {
    name: "Калькулятор расчёта индексации алиментов (ст. 117 СК РФ)",
    description: "Расчёт индексации алиментов по уровню прожиточного минимума с 01.12.2011.",
    searches: ["калькулятор индексации алиментов", "индексация алиментов ст. 117 СК РФ"],
  },
};

export const calculatorsByCategory: Record<string, { id: string; name: string; description: string; uses: number; path?: string }[]> = {
  finance: [
    { id: "mortgage", name: "Mortgage Calculator", description: "Calculate monthly payments and amortization schedules", uses: 2300000, path: "/mortgage" },
    { id: "credit-early-repayment", name: "Credit Early Repayment Calculator", description: "Plan payments with early repayments and rate changes", uses: 620000, path: "/credit-early-repayment" },
    { id: "refinancing", name: "Refinancing Calculator", description: "Compare current loan with refinancing terms and see savings", uses: 500000, path: "/refinancing" },
    { id: "microloan", name: "Payday Loan Calculator", description: "Calculate microloan interest, overdue penalties, and total repayment", uses: 750000, path: "/microloan" },
    { id: "inflation", name: "Inflation Calculator", description: "Calculate inflation and price change over time", uses: 900000, path: "/inflation" },
    { id: "loan-interest", name: "Калькулятор процентов по займу", description: "Проценты по договору займа (ст. 809 ГК РФ)", uses: 280000, path: "/loan-interest" },
    { id: "deposit", name: "Калькулятор вкладов", description: "Расчёт вклада с капитализацией, пополнениями и снятиями", uses: 800000, path: "/deposit" },
  ],
  taxes: [
    { id: "vat", name: "VAT Calculator", description: "Calculate VAT, add or exclude tax by country", uses: 800000, path: "/vat" },
    { id: "ndfl", name: "Калькулятор НДФЛ", description: "Расчёт НДФЛ с учётом прогрессивной шкалы 2025", uses: 500000, path: "/ndfl" },
    { id: "peni", name: "Калькулятор пеней", description: "Расчёт пеней по налогам, ЖКХ и задержке зарплаты", uses: 400000, path: "/peni" },
    { id: "gk395", name: "Калькулятор процентов по статье 395 ГК РФ", description: "Расчёт процентов за пользование чужими средствами", uses: 200000, path: "/gk395" },
    { id: "penalty-contract", name: "Калькулятор неустойки по договору", description: "Расчёт неустойки: дни, ставка, лимит", uses: 180000, path: "/penalty-contract" },
    { id: "penalty-ddu", name: "Калькулятор неустойки по ДДУ", description: "Расчёт неустойки по ДДУ (214-ФЗ)", uses: 120000, path: "/penalty-ddu" },
    { id: "property-deduction", name: "Калькулятор имущественного вычета", description: "Возврат НДФЛ до 260 000 ₽", uses: 350000, path: "/property-deduction" },
    { id: "property-sale-tax", name: "Калькулятор налога с продажи квартиры", description: "НДФЛ с продажи квартиры", uses: 300000, path: "/property-sale-tax" },
  ],
  salary: [
    { id: "otpusknye", name: "Калькулятор отпускных", description: "Расчёт отпускных по ТК РФ", uses: 300000, path: "/otpusknye" },
    { id: "unused-vacation", name: "Калькулятор неиспользуемого отпуска", description: "Компенсация при увольнении", uses: 250000, path: "/unused-vacation" },
    { id: "insurance-tenure", name: "Калькулятор страхового стажа", description: "Стаж по трудовой книжке", uses: 200000, path: "/insurance-tenure" },
  ],
  investments: [
    { id: "deposit", name: "Калькулятор вкладов", description: "Расчёт вклада с капитализацией", uses: 800000, path: "/deposit" },
  ],
  automotive: [
    { id: "osago", name: "Калькулятор ОСАГО", description: "Стоимость полиса ОСАГО", uses: 220000, path: "/osago" },
    { id: "transport-tax", name: "Калькулятор транспортного налога", description: "Налог на авто по регионам РФ", uses: 240000, path: "/transport-tax" },
    { id: "rastamozhka-auto", name: "Калькулятор растаможки", description: "Пошлины при ввозе авто в РФ", uses: 180000, path: "/rastamozhka-auto" },
    { id: "auto-loan", name: "Auto Loan Calculator", description: "Monthly payment and repayment schedule", uses: 260000, path: "/auto-loan" },
    { id: "fuel-consumption", name: "Калькулятор расхода топлива", description: "Расход на 100 км", uses: 150000, path: "/fuel-consumption" },
  ],
  legal: [
    { id: "subsistence-minimum", name: "Калькулятор суммы кратной ПМ", description: "Индексация алиментов по ст. 117 СК РФ", uses: 120000, path: "/subsistence-minimum" },
    { id: "alimony-indexation", name: "Калькулятор индексации алиментов", description: "По прожиточному минимуму с 2011", uses: 100000, path: "/alimony-indexation" },
  ],
};

const allCountries = ["global", "ru", "us", "uk", "de", "fr", "iran", "pl", "ua", "es", "kz", "br", "in", "by", "uz", "eg", "ae", "sa", "qa", "nl", "se"];

export const calculatorAvailability: Record<string, string[]> = {
  mortgage: allCountries,
  deposit: allCountries,
  "credit-early-repayment": allCountries,
  refinancing: allCountries,
  microloan: allCountries,
  inflation: allCountries,
  vat: allCountries,
  "auto-loan": allCountries,
  "fuel-consumption": allCountries,
  ndfl: ["ru"],
  peni: ["ru"],
  gk395: ["ru"],
  "penalty-contract": ["ru"],
  "penalty-ddu": ["ru"],
  "unused-vacation": ["ru"],
  "insurance-tenure": ["ru"],
  otpusknye: ["ru"],
  "property-deduction": ["ru"],
  "property-sale-tax": ["ru"],
  "loan-interest": ["ru"],
  osago: ["ru"],
  "transport-tax": ["ru"],
  "rastamozhka-auto": ["ru"],
  "subsistence-minimum": ["ru"],
  "alimony-indexation": ["ru"],
};

export const isCalculatorAvailable = (id: string, country: string) => {
  const available = calculatorAvailability[id];
  if (!available) return true;
  return available.includes(country) || available.includes("global");
};

export const getAvailableCalculatorsByCategory = (categoryId: string, country: string) => {
  const calculators = calculatorsByCategory[categoryId] ?? [];
  return calculators.filter((c) => isCalculatorAvailable(c.id, country));
};

export const getAvailableCategories = (country: string) =>
  categories.filter((cat) => {
    const calcs = calculatorsByCategory[cat.id] ?? [];
    return calcs.some((c) => isCalculatorAvailable(c.id, country));
  });
