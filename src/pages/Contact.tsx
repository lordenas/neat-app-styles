import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const contactInfo = [
  { icon: <Mail className="h-5 w-5" />, label: "Email", value: "support@calchub.app" },
  { icon: <MessageSquare className="h-5 w-5" />, label: "Telegram", value: "@calchub_support" },
  { icon: <MapPin className="h-5 w-5" />, label: "Адрес", value: "Москва, Россия" },
];

const faqs = [
  { q: "Калькуляторы бесплатные?", a: "Да, все калькуляторы полностью бесплатны и без ограничений по количеству расчётов." },
  { q: "Насколько точны результаты?", a: "Мы используем актуальные формулы и методики расчёта. Однако результаты носят информационный характер — для точных расчётов обратитесь в банк." },
  { q: "Вы собираете мои данные?", a: "Нет. Все расчёты происходят в вашем браузере. Мы не отправляем и не храним введённые данные на сервере." },
  { q: "Можно предложить новый калькулятор?", a: "Конечно! Напишите нам через форму обратной связи или на email. Мы рассмотрим все предложения." },
  { q: "Поддерживаете ли вы мой язык?", a: "Сейчас доступны русский и английский. Мы постоянно добавляем новые языки — следите за обновлениями." },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const message = (data.get("message") as string)?.trim();

    if (!name || !email || !message) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Некорректный email", variant: "destructive" });
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
    toast({ title: "Сообщение отправлено", description: "Мы ответим в ближайшее время." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Контакты — CalcHub</title>
        <meta name="description" content="Свяжитесь с командой CalcHub. Форма обратной связи, email и ответы на частые вопросы." />
        <link rel="canonical" href="https://neat-app-styles.lovable.app/contact" />
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
          <div className="container max-w-4xl text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Свяжитесь <span className="text-primary">с нами</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Есть вопрос, предложение или нашли ошибку? Напишите нам — мы ответим.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl">
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Form */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="pt-6">
                    {submitted ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="mx-auto h-14 w-14 rounded-full bg-success/10 flex items-center justify-center text-success">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold">Спасибо за обращение!</h3>
                        <p className="text-sm text-muted-foreground">Мы получили ваше сообщение и ответим в ближайшее время.</p>
                        <Button variant="outline" onClick={() => setSubmitted(false)}>
                          Отправить ещё
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                          <Label htmlFor="ct-name">Имя *</Label>
                          <Input
                            id="ct-name"
                            name="name"
                            placeholder="Иван"
                            className="mt-1.5"
                            maxLength={100}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ct-email">Email *</Label>
                          <Input
                            id="ct-email"
                            name="email"
                            type="email"
                            placeholder="ivan@example.com"
                            className="mt-1.5"
                            maxLength={255}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ct-message">Сообщение *</Label>
                          <Textarea
                            id="ct-message"
                            name="message"
                            placeholder="Опишите ваш вопрос или предложение..."
                            className="mt-1.5 min-h-[120px]"
                            maxLength={2000}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={sending}>
                          <Send className="h-4 w-4" />
                          {sending ? "Отправка..." : "Отправить"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact info */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold">Контактная информация</h2>
                <div className="space-y-4">
                  {contactInfo.map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Обычное время ответа — 24 часа в рабочие дни.
                    Для срочных вопросов пишите в Telegram.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Частые вопросы</h2>
              <p className="text-muted-foreground">Ответы на популярные вопросы о сервисе</p>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map(({ q, a }, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border rounded-lg px-5">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline text-left">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Contact;
