import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Calculator,
  Sliders,
  Code2,
  BarChart2,
  Bell,
  Smartphone,
  Zap,
  Check,
  ChevronRight,
  Star,
  Globe,
  Palette,
  GitBranch,
  FileText,
  MousePointerClick,
} from "lucide-react";

// ─── Static Data ─────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Zap,
    title: "Конструктор за 10 минут",
    desc: "Drag-and-drop редактор с готовыми полями. Никакого кода — просто настраивай и публикуй.",
  },
  {
    icon: Sliders,
    title: "Любые формулы",
    desc: "Поддержка математических функций: round, min, max, if, pow. Переменные через {key}.",
  },
  {
    icon: GitBranch,
    title: "Условная логика",
    desc: "Ветвление страниц и полей по условиям. Показывай нужное — скрывай лишнее.",
  },
  {
    icon: Code2,
    title: "Встройка на сайт",
    desc: "Готовый <script> или <iframe>-код. Вставь на любую страницу за 30 секунд.",
  },
  {
    icon: Bell,
    title: "Уведомления",
    desc: "Email и Telegram-уведомления при каждой отправке формы. В реальном времени.",
  },
  {
    icon: Palette,
    title: "Кастомная тема",
    desc: "Цвета, шрифты, радиус скруглений — полное соответствие вашему бренду.",
  },
  {
    icon: Smartphone,
    title: "Адаптивный дизайн",
    desc: "Калькулятор идеально работает на смартфоне, планшете и десктопе.",
  },
  {
    icon: FileText,
    title: "Многостраничность",
    desc: "Разбивай длинные формы на шаги. Прогресс-бар и плавные переходы между страницами.",
  },
];

const FIELD_TYPES = [
  { label: "Число", icon: "123", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Слайдер", icon: "⊶", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "Список", icon: "☰", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Радио", icon: "◉", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { label: "Чекбокс", icon: "✓", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  { label: "Текст", icon: "T", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { label: "Результат", icon: "fx", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Кнопка", icon: "▶", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { label: "HTML", icon: "</>", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { label: "Картинка", icon: "🖼", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
];

const USE_CASES = [
  { emoji: "🏗️", title: "Строительство и ремонт", desc: "Стоимость работ, смета материалов" },
  { emoji: "🚗", title: "Авто и услуги", desc: "Кредит, лизинг, страховка" },
  { emoji: "🏠", title: "Недвижимость", desc: "Ипотека, аренда, оценка" },
  { emoji: "💼", title: "B2B услуги", desc: "Коммерческое предложение, КП" },
  { emoji: "💇", title: "Красота и здоровье", desc: "Стоимость процедур, курс лечения" },
  { emoji: "📚", title: "Образование", desc: "Стоимость обучения, расчёт курса" },
];

const TESTIMONIALS = [
  {
    name: "Алексей Морозов",
    role: "Владелец строительной компании",
    text: "Поток звонков с вопросом «сколько стоит?» сократился на 60%. Клиент сам считает, сам принимает решение. Продажи выросли.",
    stars: 5,
  },
  {
    name: "Марина Козлова",
    role: "Интернет-маркетолог",
    text: "Поведенческие метрики на страницах с калькулятором выросли в 3 раза. Сделала за вечер, встроила на сайт клиента — результат на следующий день.",
    stars: 5,
  },
  {
    name: "Дмитрий Павлов",
    role: "Фрилансер-разработчик",
    text: "Раньше тратил 2-3 дня на самописные калькуляторы. Теперь конструктор закрывает 90% задач. Клиентам нравится — сами правят цены без меня.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "Нужны ли навыки программирования?",
    a: "Нет. Конструктор полностью визуальный: перетаскивайте поля, задавайте формулы в простом синтаксисе {переменная}, настраивайте внешний вид. Никакого кода.",
  },
  {
    q: "Как встроить калькулятор на сайт?",
    a: "После сохранения нажмите «Получить код» в списке калькуляторов. Скопируйте готовый <script> или <iframe> и вставьте в HTML вашего сайта. Работает с WordPress, Tilda, Bitrix и любым другим конструктором.",
  },
  {
    q: "Сколько калькуляторов можно создать бесплатно?",
    a: "На бесплатном тарифе создание калькуляторов недоступно. Тариф «Базовый» позволяет создать 5 калькуляторов с 2 страницами каждый. «Стандарт» — 20 с поддержкой ветвлений. «Про» — без ограничений.",
  },
  {
    q: "Можно ли настроить внешний вид под мой бренд?",
    a: "Да. В панели темы задайте основной цвет, цвет фона, шрифт и радиус скруглений. Калькулятор будет выглядеть как часть вашего сайта.",
  },
  {
    q: "Поддерживаются ли сложные формулы?",
    a: "Да. Используйте переменные {key}, операторы +−×÷, скобки, функции: round(), floor(), ceil(), min(), max(), pow(), sqrt(), if(). Пример: round({сумма} * {ставка} / 100, 2).",
  },
  {
    q: "Как работают уведомления?",
    a: "При отправке формы пользователем вы получаете Email или Telegram-уведомление с данными заявки. Доступно на тарифах «Базовый» и выше.",
  },
];

// ─── Sub-components ───────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-3xl scale-95 opacity-60" />

      {/* Window chrome */}
      <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-warning/60" />
          <div className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">Калькулятор стоимости ремонта</span>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-[180px_1fr] gap-4 min-h-[280px]">
          {/* Left: field list */}
          <div className="space-y-1.5">
            {[
              { label: "Слайдер", active: false },
              { label: "Список", active: true },
              { label: "Чекбокс", active: false },
              { label: "Результат", active: false },
              { label: "Кнопка", active: false },
            ].map((f) => (
              <div
                key={f.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none ${
                  f.active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                <span className="h-4 w-4 rounded bg-muted flex items-center justify-center text-[9px] font-mono shrink-0">
                  {f.label[0]}
                </span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Right: canvas */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Площадь помещения, м²</p>
              <div className="relative h-2 rounded-full bg-muted">
                <div className="absolute left-0 top-0 h-2 w-3/5 rounded-full bg-primary" />
                <div className="absolute top-1/2 left-3/5 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-card shadow" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>10</span><span className="text-primary font-semibold">60 м²</span><span>200</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Тип ремонта</p>
              <div className="grid grid-cols-3 gap-1">
                {["Косметический", "Стандарт", "Премиум"].map((v, i) => (
                  <div
                    key={v}
                    className={`text-[10px] text-center px-2 py-1.5 rounded-md border cursor-pointer ${
                      i === 1
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Стоимость ремонта</p>
                <p className="text-xl font-bold text-primary">324 000 ₽</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function CalcLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCta = () => {
    if (user) navigate("/calc-list");
    else navigate("/auth");
  };

  return (
    <>
      <Helmet>
        <title>Конструктор калькуляторов для сайта — CalcHub</title>
        <meta
          name="description"
          content="Создайте калькулятор для своего сайта без кода за 10 минут. Встройте через script или iframe. Слайдеры, формулы, условная логика, уведомления."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

        {/* ── Navbar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/" className="font-bold text-lg tracking-tight">
              Calc<span className="text-primary">Hub</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#benefits" className="hover:text-foreground transition-colors">Возможности</a>
              <a href="#examples" className="hover:text-foreground transition-colors">Примеры</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Тарифы</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              {user ? (
                <Button size="sm" onClick={() => navigate("/calc-list")}>
                  Мои калькуляторы
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => navigate("/auth")}>Войти</Button>
                  <Button size="sm" onClick={() => navigate("/auth")}>Начать бесплатно</Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative pt-24 pb-16 px-4 overflow-hidden">
          {/* bg blobs */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute top-20 -right-40 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-5 gap-1.5 text-xs px-3 py-1">
                <Zap className="h-3 w-3 text-primary" />
                Без кода — за 10 минут
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
                Калькулятор для сайта —<br />
                <span className="text-primary">создай сам за 10 минут</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Визуальный конструктор с формулами, условной логикой и встройкой на любой сайт.
                Увеличивай конверсию и снижай нагрузку на отдел продаж.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2 text-base px-8" onClick={handleCta}>
                  Создать калькулятор
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base" onClick={() => navigate("/pricing")}>
                  Смотреть тарифы
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Не нужна кредитная карта · Первый калькулятор бесплатно
              </p>
            </div>

            <HeroMockup />
          </div>
        </section>

        {/* ── Stats strip ────────────────────────────────────── */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10+", label: "типов полей" },
              { value: "∞", label: "формул и переменных" },
              { value: "2", label: "формата встройки" },
              { value: "3", label: "варианта уведомлений" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ───────────────────────────────────────── */}
        <section id="benefits" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Всё что нужно — уже внутри</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                От простого числового поля до многостраничной формы с условной логикой
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Field types ────────────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">10 типов полей для любой задачи</h2>
              <p className="text-muted-foreground text-sm">Перетащи нужное поле на холст — настрой за секунды</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {FIELD_TYPES.map((f) => (
                <div
                  key={f.label}
                  className={`flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium ${f.color} bg-background`}
                >
                  <span className="font-mono text-xs">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Три шага до готового виджета</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: MousePointerClick,
                  title: "Создай структуру",
                  desc: "Добавь поля перетаскиванием. Настрой слайдеры, списки, чекбоксы. Задай формулы для результата.",
                },
                {
                  step: "02",
                  icon: Palette,
                  title: "Настрой внешний вид",
                  desc: "Выбери цвета, шрифт и радиус скруглений. Превью обновляется в реальном времени.",
                },
                {
                  step: "03",
                  icon: Code2,
                  title: "Встрой на сайт",
                  desc: "Скопируй готовый <script> или <iframe> и вставь в любое место сайта.",
                },
              ].map((item) => (
                <div key={item.step} className="relative rounded-2xl border border-border bg-card p-6">
                  <span className="absolute top-4 right-4 text-5xl font-black text-muted/30 select-none leading-none">
                    {item.step}
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Embed section ──────────────────────────────────── */}
        <section className="py-20 px-4 bg-muted/20 border-y border-border">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-xs gap-1.5">
                <Globe className="h-3 w-3" /> Встройка на любой сайт
              </Badge>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                Работает везде — Tilda, WordPress, Bitrix и любой HTML
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Один раз создал — встраивай на любое количество страниц и сайтов.
                Код генерируется автоматически.
              </p>
              <ul className="space-y-2">
                {[
                  "<script> — асинхронная загрузка, адаптируется под контейнер",
                  "<iframe> — простая встройка в 2 строки",
                  "Прямая ссылка — делись через соцсети и мессенджеры",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code preview */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">embed-code.html</span>
              </div>
              <pre className="p-5 text-xs font-mono leading-relaxed overflow-x-auto text-foreground">
{`<div class="calchub_abc123"></div>
<script>
  var widgetOptions_abc123 = {
    bg_color: "transparent"
  };
  (function() {
    var a = document.createElement("script");
    a.async = true;
    a.src = "https://calchub.ru/widget.js"
      + "?id=abc123"
      + "&t=" + Math.floor(Date.now()/18e5);
    document.head.appendChild(a);
  })();
</script>`}
              </pre>
            </div>
          </div>
        </section>

        {/* ── Use cases ──────────────────────────────────────── */}
        <section id="examples" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Примеры использования</h2>
              <p className="text-muted-foreground">Калькулятор уместен в любом бизнесе, где есть вопрос «сколько стоит?»</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {USE_CASES.map((u) => (
                <div
                  key={u.title}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4 hover:border-primary/40 transition-colors"
                >
                  <span className="text-3xl mt-0.5">{u.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{u.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-0.5 group-hover:text-primary transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section className="py-20 px-4 bg-muted/20 border-y border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Что говорят пользователи</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-5">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing teaser ─────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Простые тарифы</h2>
            <p className="text-muted-foreground mb-10">Начни бесплатно, расти по мере необходимости</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { plan: "Бесплатный", price: "0 ₽", calcs: "—", pages: "—", highlight: false },
                { plan: "Базовый", price: "5 $/мес", calcs: "5", pages: "2", highlight: false },
                { plan: "Стандарт", price: "10 $/мес", calcs: "20", pages: "5", highlight: true },
                { plan: "Про", price: "20 $/мес", calcs: "∞", pages: "∞", highlight: false },
              ].map((p) => (
                <div
                  key={p.plan}
                  className={`rounded-2xl border p-5 text-left ${
                    p.highlight
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  {p.highlight && (
                    <Badge className="mb-3 text-[10px]">Популярный</Badge>
                  )}
                  <p className="font-bold">{p.plan}</p>
                  <p className={`text-2xl font-extrabold mt-1 mb-3 ${p.highlight ? "text-primary" : ""}`}>
                    {p.price}
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> {p.calcs} калькуляторов</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> {p.pages} страниц</li>
                  </ul>
                </div>
              ))}
            </div>

            <Button variant="outline" className="gap-2" onClick={() => navigate("/pricing")}>
              Сравнить все тарифы
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section id="faq" className="py-20 px-4 bg-muted/20 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Частые вопросы</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-xl px-5 bg-card"
                >
                  <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative rounded-3xl border border-primary/30 bg-primary/5 px-8 py-14 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              <BarChart2 className="h-12 w-12 text-primary mx-auto mb-5 opacity-80" />
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                Готов создать первый калькулятор?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Регистрация занимает 30 секунд. Первый калькулятор уже в списке.
              </p>
              <Button size="lg" className="gap-2 text-base px-10" onClick={handleCta}>
                Начать бесплатно
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="border-t border-border py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link to="/" className="font-bold text-foreground">
              Calc<span className="text-primary">Hub</span>
            </Link>
            <div className="flex gap-6">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Тарифы</Link>
              <Link to="/calc-list" className="hover:text-foreground transition-colors">Мои калькуляторы</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Контакты</Link>
            </div>
            <span>© 2025 CalcHub</span>
          </div>
        </footer>
      </div>
    </>
  );
}
