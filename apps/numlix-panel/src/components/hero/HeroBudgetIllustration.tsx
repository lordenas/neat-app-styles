import { memo } from "react";
import { CreditCard, Wallet, Plane, Car, ShoppingCart } from "lucide-react";
import type { HeroIllustrationProps } from "./types";

const INCOME = 120000;
const EXPENSES = 84500;
const SAVINGS = 35500;
const SAVINGS_PCT = Math.round((SAVINGS / INCOME) * 100);
const SPENT_PCT = Math.round((EXPENSES / INCOME) * 100);

const CATEGORIES = [
  { label: "Ипотека",   amount: "32 000 ₽", pct: 38, color: "hsl(var(--primary))" },
  { label: "Авто",      amount: "18 500 ₽", pct: 22, color: "hsl(var(--warning))" },
  { label: "Продукты",  amount: "14 000 ₽", pct: 17, color: "hsl(var(--success))" },
  { label: "Путешествия", amount: "12 000 ₽", pct: 14, color: "hsl(var(--info))" },
  { label: "Прочее",    amount: "8 000 ₽",  pct: 9,  color: "hsl(var(--muted-foreground))" },
] as const;

// Savings gauge ring (SVG donut arc)
const SavingsGauge = memo(() => {
  const r = 22, cx = 30, cy = 30, circ = 2 * Math.PI * r;
  const filled = (SAVINGS_PCT / 100) * circ;
  return (
    <div className="col-span-1 row-span-1 rounded-2xl p-3 border flex flex-col items-center justify-center gap-1"
      style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="hsl(var(--success))" strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px hsl(var(--success)/0.6))" }} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontWeight="bold" fill="hsl(var(--foreground))">
          {SAVINGS_PCT}%
        </text>
      </svg>
      <p className="text-[8px] text-muted-foreground uppercase tracking-widest text-center">Накоплено</p>
    </div>
  );
});

// Sparkline for net worth trend
const NETWORTH_PTS = [55, 58, 54, 62, 60, 68, 65, 74, 70, 82];

const NetWorthSparkline = memo(() => {
  const w = 120, h = 36;
  const max = Math.max(...NETWORTH_PTS), min = Math.min(...NETWORTH_PTS);
  const pts = NETWORTH_PTS.map((v, i) => [
    (i / (NETWORTH_PTS.length - 1)) * w,
    h - ((v - min) / (max - min)) * (h - 8) - 4,
  ] as [number, number]);
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  return (
    <div className="col-span-3 row-span-1 rounded-2xl p-3 border"
      style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Капитал</p>
        <span className="text-[9px] font-semibold" style={{ color: "hsl(var(--success))" }}>↑ 8.4%</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFillB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparkFillB)" />
        <path d={pathD} fill="none" stroke="hsl(var(--success))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts[pts.length - 1] && (
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill="hsl(var(--success))"
            style={{ filter: "drop-shadow(0 0 4px hsl(var(--success)/0.8))" }} />
        )}
      </svg>
    </div>
  );
});

// Budget main card
const BudgetMainCard = memo(() => {
  return (
    <div className="col-span-2 row-span-2 rounded-2xl p-3.5 border flex flex-col gap-2.5"
      style={{
        background: "linear-gradient(160deg, hsl(var(--card)/0.95) 0%, hsl(var(--card)/0.8) 100%)",
        backdropFilter: "blur(20px)",
        borderColor: "hsl(var(--border)/0.8)",
        boxShadow: "0 16px 40px -8px hsl(var(--success)/0.12), inset 0 1px 0 hsl(var(--background)/0.6)",
      }}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Бюджет месяца</p>

      {/* Income / Expense row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2" style={{ background: "hsl(var(--success)/0.1)", border: "1px solid hsl(var(--success)/0.2)" }}>
          <p className="text-[8px] text-muted-foreground mb-0.5">Доходы</p>
          <p className="text-xs font-bold tabular-nums" style={{ color: "hsl(var(--success))" }}>120 000 ₽</p>
        </div>
        <div className="rounded-xl p-2" style={{ background: "hsl(var(--destructive)/0.08)", border: "1px solid hsl(var(--destructive)/0.2)" }}>
          <p className="text-[8px] text-muted-foreground mb-0.5">Расходы</p>
          <p className="text-xs font-bold tabular-nums text-destructive">84 500 ₽</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[8px] text-muted-foreground">Использовано</span>
          <span className="text-[8px] font-semibold text-foreground">{SPENT_PCT}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${SPENT_PCT}%`,
              background: `linear-gradient(90deg, hsl(var(--success)), hsl(var(--warning)))`,
              boxShadow: "0 0 6px hsl(var(--warning)/0.5)",
            }} />
        </div>
      </div>

      {/* Savings line */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t" style={{ borderColor: "hsl(var(--border)/0.4)" }}>
        <span className="text-[8px] text-muted-foreground">Остаток / сбережения</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "hsl(var(--primary))" }}>35 500 ₽</span>
      </div>
    </div>
  );
});

// Category breakdown
const CategoryBreakdown = memo(() => {
  return (
    <div className="col-span-2 row-span-1 rounded-2xl p-3 border"
      style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Категории</p>
      <div className="space-y-1">
        {CATEGORIES.slice(0, 4).map((cat) => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
              <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
            </div>
            <span className="text-[7px] text-muted-foreground w-14 text-right tabular-nums">{cat.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// 3 stat mini-tiles
const STAT_TILES = [
  { label: "НДФЛ", value: "13%", color: "hsl(var(--warning))" },
  { label: "Ипотека", value: "8.5%", color: "hsl(var(--primary))" },
  { label: "Вклад", value: "16%", color: "hsl(var(--success))" },
] as const;

const StatTiles = memo(() => (
  <>
    {STAT_TILES.map((tile) => (
      <div key={tile.label}
        className="col-span-1 row-span-1 rounded-2xl p-2.5 border flex flex-col items-center justify-center gap-0.5"
        style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
        <p className="text-sm font-bold tabular-nums" style={{ color: tile.color }}>{tile.value}</p>
        <p className="text-[7px] text-muted-foreground">{tile.label}</p>
      </div>
    ))}
  </>
));

const CHIPS = [
  { icon: <CreditCard className="h-4 w-4 text-primary" />,  label: "Кредит",     value: "18 500 ₽",  top: "2%",    left: "-6%",   animA: true,  delay: "0s"   },
  { icon: <Wallet className="h-4 w-4 text-success" />,      label: "Накопления", value: "+29.6%",    top: "8%",    right: "-8%",  animA: false, delay: "0.4s" },
  { icon: <Plane className="h-4 w-4 text-info" />,          label: "Отпуск",     value: "12 000 ₽",  bottom: "26%", left: "-8%",  animA: false, delay: "0.8s" },
  { icon: <Car className="h-4 w-4 text-warning" />,         label: "Авто",       value: "18 500 ₽",  bottom: "10%", right: "-6%", animA: true,  delay: "1.1s" },
  { icon: <ShoppingCart className="h-4 w-4 text-destructive" />, label: "Налог", value: "11 050 ₽",  bottom: "-2%", left: "30%",  animA: true,  delay: "1.5s" },
] as const;

export function HeroBudgetIllustration({ parallax, chipRefs, chipOffsets }: HeroIllustrationProps) {
  return (
    <div
      className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-600"
      style={{ minHeight: 500, perspective: "1100px" }}
      aria-hidden="true"
    >
      <div className="absolute w-72 h-72 rounded-full bg-success/8 blur-3xl -top-10 right-0 pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-primary/8 blur-2xl bottom-0 left-0 pointer-events-none" />

      <div
        className="relative z-10"
        style={{
          transform: `rotateY(${-12 + parallax.x * 0.55}deg) rotateX(${4 + parallax.y * 0.45}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.14s ease-out",
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--success)/0.07) 0%, hsl(var(--background)/0.4) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid hsl(var(--border)/0.6)",
            boxShadow: "0 32px 80px -16px hsl(var(--success)/0.18), 0 8px 32px -8px hsl(var(--foreground)/0.1)",
            transform: "translateZ(-8px) scale(1.04)",
            borderRadius: "28px",
          }}
        />

        {/* Grid: 5 cols × 3 rows */}
        <div className="relative grid grid-cols-5 grid-rows-3 gap-2.5 p-3 w-[420px]">
          {/* col 1-2, rows 1-2: Budget main card */}
          <BudgetMainCard />

          {/* col 3, rows 1-2: Savings gauge */}
          <SavingsGauge />

          {/* col 4-5, row 1: Net worth sparkline */}
          <NetWorthSparkline />

          {/* col 1-2, row 3: Category breakdown */}
          <CategoryBreakdown />

          {/* col 3, row 3: empty filler so gauge aligns */}
          <div className="col-span-1 row-span-1" />

          {/* col 4-5, row 2: 3 stat tiles – but they're 3 × col1 so we span per tile */}
          {/* Actually put them in row 3, cols 3-5 */}
          <StatTiles />
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-14 bg-success/10 blur-3xl rounded-full pointer-events-none" />

      {CHIPS.map((fc, i) => {
        const off = chipOffsets[i] ?? { x: 0, y: 0 };
        return (
          <div
            key={i}
            ref={(el) => { chipRefs.current[i] = el; }}
            className="absolute z-20 flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg"
            style={{
              top: (fc as any).top,
              bottom: (fc as any).bottom,
              left: (fc as any).left,
              right: (fc as any).right,
              background: "hsl(var(--card)/0.85)",
              backdropFilter: "blur(12px)",
              borderColor: "hsl(var(--border)/0.7)",
              boxShadow: "0 4px 16px hsl(var(--success)/0.1)",
              animation: `heroFloat${fc.animA ? "A" : "B"} ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: fc.delay,
              translate: `${off.x}px ${off.y}px`,
              transition: "translate 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div className="p-1.5 rounded-lg bg-primary/10">{fc.icon}</div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{fc.label}</p>
              <p className="text-xs font-semibold text-foreground">{fc.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
