import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Star, Rocket, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan, PLAN_META } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";

interface Feature {
  label: string;
  basic: string | boolean;
  standard: string | boolean;
  pro: string | boolean;
}

const FEATURES: Feature[] = [
  { label: "Калькуляторов",          basic: "5",     standard: "20",    pro: "∞" },
  { label: "Страниц в калькуляторе", basic: "2",     standard: "5",     pro: "∞" },
  { label: "Логические ветвления",   basic: false,   standard: true,    pro: true },
  { label: "Email-уведомления",      basic: true,    standard: true,    pro: true },
  { label: "Telegram-уведомления",   basic: true,    standard: true,    pro: true },
  { label: "SMS-уведомления",        basic: false,   standard: false,   pro: true },
  { label: "Чат с техподдержкой",    basic: false,   standard: false,   pro: true },
  { label: "Embed-виджеты",          basic: true,    standard: true,    pro: true },
  { label: "API-доступ",             basic: true,    standard: true,    pro: true },
];

const plans = [
  {
    key: "basic" as const,
    name: "Базовый",
    price: 5,
    icon: Zap,
    description: "Для стартапов и небольших проектов",
    popular: false,
    color: "hsl(var(--info))",
    bgColor: "hsl(var(--info) / 0.08)",
    borderColor: "hsl(var(--info) / 0.3)",
  },
  {
    key: "standard" as const,
    name: "Стандарт",
    price: 10,
    icon: Star,
    description: "Для растущих команд и агентств",
    popular: true,
    color: "hsl(var(--primary))",
    bgColor: "hsl(var(--primary) / 0.08)",
    borderColor: "hsl(var(--primary) / 0.4)",
  },
  {
    key: "pro" as const,
    name: "Про",
    price: 20,
    icon: Rocket,
    description: "Для крупных компаний и платформ",
    popular: false,
    color: "hsl(var(--warning))",
    bgColor: "hsl(var(--warning) / 0.08)",
    borderColor: "hsl(var(--warning) / 0.3)",
  },
];

function FeatureValue({ val }: { val: string | boolean }) {
  if (val === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (val === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium">{val}</span>;
}

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan, loading } = usePlan();

  const handleSelectPlan = (planKey: string) => {
    if (!user) { navigate("/auth"); return; }
    // When Stripe is connected, this will redirect to checkout
    // For now, just show a message
    navigate("/dashboard");
  };

  return (
    <>
      <Helmet>
        <title>Тарифы — CalcHub</title>
        <meta name="description" content="Выберите подходящий тариф для работы с конструктором калькуляторов. Базовый, Стандарт или Про — оплата за месяц." />
      </Helmet>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 text-center border-b border-border">
          <div className="container max-w-3xl space-y-4">
            <Badge variant="outline" className="gap-1.5">
              <Zap className="h-3 w-3 text-primary" /> Тарифы и возможности
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              Выберите ваш тариф
            </h1>
            <p className="text-lg text-muted-foreground">
              Начните с бесплатного аккаунта и переходите на платный по мере роста
            </p>
          </div>
        </section>

        {/* Plan cards */}
        <section className="py-14">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
              {plans.map((p) => {
                const Icon = p.icon;
                const isCurrent = !loading && currentPlan === p.key;
                return (
                  <div
                    key={p.key}
                    className={cn(
                      "relative rounded-2xl border-2 p-6 flex flex-col gap-5 transition-shadow",
                      p.popular
                        ? "shadow-lg border-primary/40 bg-primary/5"
                        : "border-border bg-card hover:border-border-strong hover:shadow-md"
                    )}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="shadow-sm">Популярный</Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="outline" className="bg-background text-xs">Ваш тариф</Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ background: p.bgColor }}
                      >
                        <Icon className="h-5 w-5" style={{ color: p.color }} />
                      </div>
                      <div>
                        <p className="font-bold text-base">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-4xl font-extrabold">${p.price}</span>
                      <span className="text-muted-foreground text-sm"> / мес</span>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {FEATURES.filter((f) => f[p.key] !== false).map((f) => (
                        <li key={f.label} className="flex items-center gap-2 text-sm">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            {typeof f[p.key] === "string" && f[p.key] !== "∞"
                              ? `${f[p.key]} — ${f.label.toLowerCase()}`
                              : f[p.key] === "∞"
                              ? `∞ ${f.label.toLowerCase()}`
                              : f.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn("w-full", p.popular ? "" : "variant-outline")}
                      variant={p.popular ? "default" : "outline"}
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(p.key)}
                    >
                      {isCurrent ? "Текущий тариф" : "Выбрать"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/30">
                <h2 className="font-semibold text-base">Подробное сравнение</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground w-1/2">Возможность</th>
                      {plans.map((p) => (
                        <th key={p.key} className="px-4 py-3 font-semibold text-center w-1/6">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map((f, i) => (
                      <tr key={f.label} className={cn("border-b last:border-0", i % 2 === 0 ? "bg-muted/20" : "")}>
                        <td className="px-6 py-3 text-muted-foreground">{f.label}</td>
                        <td className="px-4 py-3 text-center"><FeatureValue val={f.basic} /></td>
                        <td className="px-4 py-3 text-center"><FeatureValue val={f.standard} /></td>
                        <td className="px-4 py-3 text-center"><FeatureValue val={f.pro} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="py-12 border-t border-border bg-muted/20">
          <div className="container max-w-2xl text-center space-y-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Есть вопросы?</h2>
            <p className="text-muted-foreground text-sm">
              Напишите нам — мы поможем выбрать нужный тариф и настроить интеграции.
            </p>
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Написать нам
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
