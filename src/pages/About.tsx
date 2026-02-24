import { Helmet } from "react-helmet-async";
import { Users, Globe, Calculator, Shield, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const values = [
  {
    icon: <Calculator className="h-6 w-6" />,
    title: "Точность",
    description: "Все калькуляторы учитывают актуальные ставки, комиссии и особенности законодательства каждой страны.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Доступность",
    description: "Бесплатные инструменты на 12 языках для пользователей из 20+ стран мира.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Конфиденциальность",
    description: "Все расчёты происходят в вашем браузере. Мы не собираем и не храним персональные данные.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Простота",
    description: "Понятный интерфейс без лишних деталей — сосредоточьтесь на решении, а не на инструменте.",
  },
];

const stats = [
  { value: "50+", label: "Калькуляторов" },
  { value: "20+", label: "Стран" },
  { value: "12", label: "Языков" },
  { value: "100%", label: "Бесплатно" },
];


const About = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>О проекте — CalcHub</title>
      <meta name="description" content="CalcHub — бесплатная платформа финансовых калькуляторов для 20+ стран. Узнайте о нашей миссии и команде." />
      <link rel="canonical" href="https://neat-app-styles.lovable.app/about" />
    </Helmet>

    <SiteHeader />

    <main id="main-content">
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
        <div className="container max-w-4xl text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            О <span className="text-primary">проекте</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CalcHub — это бесплатная платформа финансовых калькуляторов, которая помогает людям
            по всему миру принимать осознанные финансовые решения.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-b border-border">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-4xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Наша миссия</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
            Мы верим, что каждый человек заслуживает доступа к качественным финансовым инструментам —
            независимо от страны, языка или уровня дохода. Наша цель — сделать финансовое планирование
            простым, прозрачным и доступным для всех.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-[hsl(var(--section-bg))]">
        <div className="container max-w-4xl space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Наши ценности</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map(({ icon, title, description }) => (
              <Card key={title} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="pt-6 flex gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-10 pb-10 text-center space-y-5">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Calculator className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Автоматизация расчётов любой сложности</h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Нужен индивидуальный калькулятор для вашего бизнеса или нестандартная финансовая модель?
                Мы разработаем решение под ваши задачи — от простых формул до сложных многофакторных расчётов.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Обратиться к нам
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
);

export default About;
