import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CustomCalculator, getCalculatorBySlug } from "@/types/custom-calc";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeft } from "lucide-react";

/**
 * Публичный плеер калькулятора по slug.
 *
 * MVP: Загружает калькулятор из localStorage по slug.
 *
 * TODO (бэк): Заменить на запрос к Edge Function:
 *   GET /functions/v1/custom-calc-get?slug=:slug
 *   Возвращает калькулятор, если is_public=true ИЛИ авторизован владелец.
 */
export default function CalcPlayer() {
  const { slug } = useParams<{ slug: string }>();
  const [calculator, setCalculator] = useState<CustomCalculator | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, number | string | boolean>>({});

  useEffect(() => {
    if (!slug) { setNotFound(true); return; }
    const calc = getCalculatorBySlug(slug);
    if (!calc) { setNotFound(true); return; }
    setCalculator(calc);

    // Initialize defaults
    const defaults: Record<string, number | string | boolean> = {};
    for (const field of calc.fields) {
      if (field.type === "result") continue;
      const def = field.config.defaultValue;
      if (def !== undefined) {
        defaults[field.key] = def;
      } else if (field.type === "number" || field.type === "slider") {
        defaults[field.key] = field.config.min ?? 0;
      } else if (field.type === "checkbox") {
        defaults[field.key] = false;
      } else if (field.type === "select" || field.type === "radio") {
        const first = field.config.options?.[0]?.value;
        if (first) defaults[field.key] = first;
      } else {
        defaults[field.key] = "";
      }
    }
    setValues(defaults);
  }, [slug]);

  const onChange = (key: string, value: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Калькулятор не найден</h1>
            <p className="text-muted-foreground text-sm">
              Калькулятор с адресом <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">/c/{slug}</code> не существует или был удалён.
            </p>
            <Button asChild>
              <Link to="/calc-builder">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Создать калькулятор
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!calculator) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Загрузка...</div>
        </main>
      </div>
    );
  }

  const sorted = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calculator className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{calculator.title}</h1>
            </div>
            {calculator.description && (
              <p className="text-muted-foreground text-sm">{calculator.description}</p>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-5">
            {sorted.map((field) => (
              <div
                key={field.id}
                className={field.colSpan === 1 ? "col-span-1" : "col-span-2"}
              >
                <PlayerField
                  field={field}
                  allFields={sorted}
                  values={values}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div className="mt-10 text-center">
            <Link
              to="/calc-builder"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Создайте свой калькулятор →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
