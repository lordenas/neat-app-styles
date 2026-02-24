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

const team = [
  { name: "Алексей Иванов", role: "Основатель и разработчик", emoji: "👨‍💻" },
  { name: "Мария Петрова", role: "Финансовый аналитик", emoji: "📊" },
  { name: "Дмитрий Сидоров", role: "UX-дизайнер", emoji: "🎨" },
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

      {/* Team */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">Команда</h2>
            <p className="text-muted-foreground">Люди, которые стоят за CalcHub</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map(({ name, role, emoji }) => (
              <Card key={name} className="text-center transition-all duration-200 hover:shadow-md">
                <CardContent className="pt-8 pb-6 space-y-3">
                  <div className="text-5xl">{emoji}</div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
);

export default About;
