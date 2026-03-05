import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────

type RepairType = "cosmetic" | "standard" | "premium";

const REPAIR_TYPES: { value: RepairType; label: string; pricePerM2: number; desc: string }[] = [
  { value: "cosmetic", label: "Косметический", pricePerM2: 3000, desc: "Покраска, обои, плинтус" },
  { value: "standard", label: "Стандарт", pricePerM2: 6500, desc: "Полная отделка под ключ" },
  { value: "premium", label: "Премиум", pricePerM2: 14000, desc: "Дизайнерские материалы" },
];

const ROOMS = [
  { value: 1, label: "1-комн." },
  { value: 2, label: "2-комн." },
  { value: 3, label: "3-комн." },
  { value: 4, label: "4+ комн." },
];

const DEFAULT_AREAS: Record<number, number> = { 1: 38, 2: 56, 3: 76, 4: 95 };

// ── Component ─────────────────────────────────────────────────

export function DemoCalcSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState(2);
  const [area, setArea] = useState(56);
  const [repairType, setRepairType] = useState<RepairType>("standard");
  const [withMaterials, setWithMaterials] = useState(true);
  const [calculated, setCalculated] = useState(false);

  const handleRoomsChange = (r: number) => {
    setRooms(r);
    setArea(DEFAULT_AREAS[r]);
    setCalculated(false);
  };

  const selected = REPAIR_TYPES.find((r) => r.value === repairType)!;
  const materialsMultiplier = withMaterials ? 1.65 : 1;
  const total = Math.round(area * selected.pricePerM2 * materialsMultiplier / 1000) * 1000;

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-1.5 text-xs px-3 py-1">
            <Zap className="h-3 w-3 text-primary" />
            Живое демо
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Попробуй прямо сейчас
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Вот так работает калькулятор созданный в конструкторе.
            Этот — расчёт стоимости ремонта квартиры.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Calculator card ─────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Title bar */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/50" />
                <div className="h-3 w-3 rounded-full bg-warning/50" />
                <div className="h-3 w-3 rounded-full bg-success/50" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Калькулятор стоимости ремонта</span>
            </div>

            <div className="p-6 space-y-6">

              {/* Rooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Количество комнат</label>
                <div className="grid grid-cols-4 gap-2">
                  {ROOMS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRoomsChange(r.value)}
                      className={cn(
                        "rounded-lg border py-2.5 text-sm font-medium transition-all",
                        rooms === r.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Площадь помещения</label>
                  <span className="text-sm font-bold text-primary">{area} м²</span>
                </div>
                <Slider
                  value={[area]}
                  onValueChange={([v]) => { setArea(v); setCalculated(false); }}
                  min={20}
                  max={200}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20 м²</span>
                  <span>200 м²</span>
                </div>
              </div>

              {/* Repair type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Вид ремонта</label>
                <div className="grid grid-cols-3 gap-2">
                  {REPAIR_TYPES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => { setRepairType(r.value); setCalculated(false); }}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        repairType === r.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-semibold",
                        repairType === r.value ? "text-primary" : "text-foreground"
                      )}>
                        {r.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* With materials toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Включить материалы?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Да, с материалами", value: true },
                    { label: "Только работа", value: false },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => { setWithMaterials(opt.value); setCalculated(false); }}
                      className={cn(
                        "rounded-lg border py-2.5 text-sm font-medium transition-all",
                        withMaterials === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate button */}
              <Button
                className="w-full gap-2"
                onClick={() => setCalculated(true)}
              >
                Рассчитать стоимость
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Result */}
              <div className={cn(
                "rounded-xl border p-4 transition-all duration-300",
                calculated
                  ? "border-primary/30 bg-primary/5 opacity-100 translate-y-0"
                  : "border-border bg-muted/30 opacity-40"
              )}>
                <p className="text-xs text-muted-foreground mb-1">Стоимость ремонта</p>
                <p className="text-3xl font-extrabold text-primary">
                  {calculated
                    ? total.toLocaleString("ru-RU") + " ₽"
                    : "—"
                  }
                </p>
                {calculated && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {area} м² · {selected.label.toLowerCase()} ·{" "}
                    {withMaterials ? "с материалами" : "только работа"} ·{" "}
                    {selected.pricePerM2.toLocaleString("ru-RU")} ₽/м²
                    {withMaterials ? " × 1.65" : ""}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* ── Right side: explanation ─────────────────────── */}
          <div className="space-y-8 lg:pt-4">
            <div>
              <h3 className="text-xl font-bold mb-3">Что ты видишь — то и создаёшь</h3>
              <p className="text-muted-foreground leading-relaxed">
                Этот калькулятор собран из стандартных блоков конструктора. Никакого кода —
                только визуальная настройка полей и простые формулы.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Кнопки-переключатели",
                  desc: "Поле типа «Радио» с горизонтальной ориентацией. Варианты задаёшь сам, каждому — числовое значение для формул.",
                },
                {
                  step: "2",
                  title: "Слайдер площади",
                  desc: "Поле «Слайдер» с min=20, max=200, step=1. Автоматически подставляет {area} в формулу.",
                },
                {
                  step: "3",
                  title: "Формула результата",
                  desc: "round({area} * {price_m2} * {materials}, -3) — стандартный синтаксис. Результат обновляется мгновенно.",
                },
                {
                  step: "4",
                  title: "Кнопка «Рассчитать»",
                  desc: "Поле «Кнопка» с действием «Рассчитать» — показывает результат только после нажатия.",
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate(user ? "/calc-builder" : "/auth")}
            >
              Создать такой же
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
