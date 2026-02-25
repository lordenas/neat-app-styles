import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Handshake,
  Code2,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  Landmark,
  PiggyBank,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const benefits = [
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Простая интеграция",
    description: "Встраивайте калькуляторы на ваш сайт через iframe или API за несколько минут.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "20+ стран",
    description: "Калькуляторы адаптированы под законодательство и валюту каждой страны.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Мгновенный расчёт",
    description: "Все вычисления выполняются на стороне клиента — без задержек и серверных запросов.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Безопасность данных",
    description: "Данные клиентов не покидают их браузер. Полное соответствие GDPR.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Аналитика",
    description: "Отслеживайте использование калькуляторов и конверсию в заявки.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "White Label",
    description: "Полная кастомизация: цвета, логотип, валюта и формулы под ваш бренд.",
  },
];

const useCases = [
  {
    icon: <Landmark className="h-6 w-6" />,
    title: "Банки",
    description: "Встроенные калькуляторы на страницах кредитных продуктов для повышения конверсии заявок.",
    metrics: "до +35% конверсии",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Застройщики",
    description: "Ипотечный калькулятор на странице объекта помогает покупателю оценить ежемесячный платёж.",
    metrics: "до +20% заявок",
  },
  {
    icon: <PiggyBank className="h-6 w-6" />,
    title: "Финтех-сервисы",
    description: "API калькуляторов для мобильных приложений и финансовых платформ.",
    metrics: "интеграция за 1 день",
  },
];

const steps = [
  { step: "01", title: "Заявка", description: "Заполните форму — мы свяжемся в течение 24 часов" },
  { step: "02", title: "Обсуждение", description: "Определим формат интеграции и кастомизацию" },
  { step: "03", title: "Интеграция", description: "Подключим калькуляторы к вашему сайту или приложению" },
  { step: "04", title: "Запуск", description: "Тестирование, обучение команды и запуск в продакшен" },
];

export default function Partners() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    website: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({
        title: "Заявка отправлена",
        description: "Мы свяжемся с вами в течение 24 часов.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
      setForm({ company: "", name: "", email: "", website: "", message: "" });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Партнёрская программа — CalcHub</title>
        <meta
          name="description"
          content="Интеграция финансовых калькуляторов CalcHub для банков, застройщиков и финтех-сервисов. White Label, API, iframe — подключение за 1 день."
        />
      </Helmet>

      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 sm:py-24 border-b border-border">
          <div className="container max-w-4xl text-center space-y-6">
            <Badge variant="secondary" className="gap-1.5">
              <Handshake className="h-3.5 w-3.5" />
              Для бизнеса
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Калькуляторы CalcHub
              <br />
              <span className="text-primary">на вашем сайте</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Встраивайте финансовые калькуляторы в свои продукты. Повышайте конверсию,
              улучшайте пользовательский опыт, помогайте клиентам принимать решения.
            </p>
            <a href="#form">
              <Button size="lg" className="gap-2 shadow-md mt-2">
                Оставить заявку
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-14 sm:py-20">
          <div className="container max-w-5xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Почему CalcHub?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Всё необходимое для быстрой и надёжной интеграции финансовых инструментов
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <Card key={b.title} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                      {b.icon}
                    </div>
                    <CardTitle className="text-base">{b.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{b.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-14 sm:py-20 border-y border-border bg-muted/30">
          <div className="container max-w-5xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Кому подходит</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Наши калькуляторы уже помогают бизнесу увеличивать продажи
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((uc) => (
                <Card key={uc.title} className="text-center">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      {uc.icon}
                    </div>
                    <CardTitle className="text-lg">{uc.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription>{uc.description}</CardDescription>
                    <Badge variant="secondary" className="text-xs">
                      {uc.metrics}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-14 sm:py-20">
          <div className="container max-w-4xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Как это работает</h2>
              <p className="text-muted-foreground">От заявки до запуска — 4 простых шага</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.step} className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary/20">{s.step}</div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 mx-auto mt-2 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section id="form" className="py-14 sm:py-20 border-t border-border bg-muted/30 scroll-mt-20">
          <div className="container max-w-xl space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Оставить заявку</h2>
              <p className="text-muted-foreground">
                Заполните форму — мы свяжемся в течение 24 часов
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Компания *</Label>
                      <Input
                        id="company"
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Название компании"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя *</Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ваше имя"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="partner@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Сайт</Label>
                      <Input
                        id="website"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Расскажите о вашем проекте и задачах..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={sending}>
                    <Send className="h-4 w-4" />
                    {sending ? "Отправка..." : "Отправить заявку"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
