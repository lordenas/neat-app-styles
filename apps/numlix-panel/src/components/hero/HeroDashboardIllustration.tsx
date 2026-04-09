import { useState, useRef, useEffect, memo } from "react";
import { TrendingUp, PiggyBank, Receipt, Car, Scale } from "lucide-react";
import type { HeroIllustrationProps } from "./types";

const CALC_CYCLES = [
  { label: "НДС 20%", base: "1 200 000 ₽", result: "240 000 ₽", color: "hsl(var(--primary))" },
  { label: "Ипотека", base: "5 000 000 ₽", result: "42 380 ₽/мес", color: "hsl(var(--success))" },
  { label: "НДФЛ 13%", base: "850 000 ₽", result: "110 500 ₽", color: "hsl(var(--warning))" },
  { label: "Пени", base: "300 000 ₽", result: "8 250 ₽", color: "hsl(var(--destructive))" },
];

const HeroCalculator = memo(({ parallax }: { parallax: { x: number; y: number } }) => {
  const [cycleIdx, setCycleIdx] = useState(0);
  const [displayResult, setDisplayResult] = useState(CALC_CYCLES[0].result);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCycleIdx((i) => (i + 1) % CALC_CYCLES.length);
        setIsAnimating(false);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cycle = CALC_CYCLES[cycleIdx];
    if (isAnimating) return;
    let i = 0;
    const target = cycle.result;
    setDisplayResult("");
    const t = setInterval(() => {
      i++;
      setDisplayResult(target.slice(0, i));
      if (i >= target.length) clearInterval(t);
    }, 38);
    return () => clearInterval(t);
  }, [cycleIdx, isAnimating]);

  const cycle = CALC_CYCLES[cycleIdx];

  return (
    <div
      className="col-span-2 row-span-3 rounded-2xl overflow-hidden border flex flex-col"
      style={{
        background: "linear-gradient(160deg, hsl(var(--card)/0.95) 0%, hsl(var(--card)/0.8) 100%)",
        backdropFilter: "blur(20px)",
        borderColor: "hsl(var(--border)/0.8)",
        boxShadow: "0 16px 40px -8px hsl(var(--primary)/0.15), inset 0 1px 0 hsl(var(--background)/0.6)",
      }}
    >
      <div
        className="m-2.5 rounded-xl p-2.5 border"
        style={{
          background: "linear-gradient(135deg, hsl(var(--muted)/0.9) 0%, hsl(var(--muted)/0.6) 100%)",
          borderColor: "hsl(var(--border)/0.5)",
          boxShadow: "inset 0 2px 8px hsl(var(--foreground)/0.06)",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: cycle.color + "22", color: cycle.color }}>
            {cycle.label}
          </span>
          <div className="flex gap-1">
            {CALC_CYCLES.map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i === cycleIdx ? cycle.color : "hsl(var(--border))" }} />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{cycle.base}</p>
        <p className="text-[17px] font-bold tracking-tight mt-0.5 tabular-nums transition-opacity duration-300 overflow-hidden"
          style={{ color: cycle.color, opacity: isAnimating ? 0 : 1, height: "1.5rem", lineHeight: "1.5rem", maxWidth: "100%" }}>
          {displayResult}<span className="animate-pulse opacity-70">|</span>
        </p>
      </div>

      {(() => {
        const btnStyle = (type: "op" | "fn" | "num") => ({
          background: type === "op"
            ? `linear-gradient(135deg, ${cycle.color}, ${cycle.color}cc)`
            : type === "fn"
            ? "hsl(var(--muted)/0.8)"
            : "hsl(var(--secondary)/0.7)",
          color: type === "op" ? "hsl(var(--primary-foreground))" : type === "fn" ? "hsl(var(--muted-foreground))" : "hsl(var(--secondary-foreground))",
          boxShadow: type === "op" ? `0 2px 8px ${cycle.color}44` : "none",
          backdropFilter: "blur(8px)",
        });
        const cls = "rounded-lg flex items-center justify-center text-xs font-semibold select-none cursor-default transition-all duration-150 hover:brightness-110 active:scale-95";
        const opColor = cycle.color;
        const buttons: React.ReactNode[] = [
          <div key="C"  className={cls} style={btnStyle("fn")}>C</div>,
          <div key="pm" className={cls} style={btnStyle("fn")}>±</div>,
          <div key="pc" className={cls} style={btnStyle("fn")}>%</div>,
          <div key="dv" className={cls} style={{ background: `${opColor}22`, color: opColor, border: `1px solid ${opColor}44`, backdropFilter: "blur(8px)" }}>÷</div>,
          <div key="7"  className={cls} style={btnStyle("num")}>7</div>,
          <div key="8"  className={cls} style={btnStyle("num")}>8</div>,
          <div key="9"  className={cls} style={btnStyle("num")}>9</div>,
          <div key="x"  className={cls} style={{ background: `${opColor}22`, color: opColor, border: `1px solid ${opColor}44`, backdropFilter: "blur(8px)" }}>×</div>,
          <div key="4"  className={cls} style={btnStyle("num")}>4</div>,
          <div key="5"  className={cls} style={btnStyle("num")}>5</div>,
          <div key="6"  className={cls} style={btnStyle("num")}>6</div>,
          <div key="mn" className={cls} style={{ background: `${opColor}22`, color: opColor, border: `1px solid ${opColor}44`, backdropFilter: "blur(8px)" }}>−</div>,
          <div key="1"  className={cls} style={btnStyle("num")}>1</div>,
          <div key="2"  className={cls} style={btnStyle("num")}>2</div>,
          <div key="3"  className={cls} style={btnStyle("num")}>3</div>,
          <div key="pl" className={cls} style={{ background: `${opColor}22`, color: opColor, border: `1px solid ${opColor}44`, backdropFilter: "blur(8px)" }}>+</div>,
          <div key="0"  className={`col-span-2 ${cls}`} style={btnStyle("num")}>0</div>,
          <div key="dt" className={cls} style={btnStyle("num")}>.</div>,
          <div key="eq" className={`${cls} font-bold`} style={{ background: `${opColor}22`, color: opColor, border: `1px solid ${opColor}44`, backdropFilter: "blur(8px)" }}>=</div>,
        ];
        return (
          <div className="px-2.5 pb-2.5 flex-1 grid grid-cols-4 gap-1.5" style={{ gridAutoRows: "1fr" }}>
            {buttons}
          </div>
        );
      })()}
    </div>
  );
});

const HeroResultCard = memo(() => (
  <div className="col-span-3 row-span-1 rounded-2xl p-3 border flex items-center gap-3"
    style={{
      background: "linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--card)/0.75) 100%)",
      backdropFilter: "blur(16px)",
      borderColor: "hsl(var(--primary)/0.2)",
      boxShadow: "0 4px 20px hsl(var(--primary)/0.1)",
    }}>
    <div className="p-2 rounded-xl" style={{ background: "hsl(var(--primary)/0.15)" }}>
      <TrendingUp className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Итоговый расчёт</p>
      <p className="text-sm font-bold text-foreground tabular-nums">1 440 000 ₽</p>
    </div>
    <div className="shrink-0">
      <span className="text-xs font-semibold" style={{ color: "hsl(var(--success))", background: "hsl(var(--success)/0.1)", padding: "2px 8px", borderRadius: "8px" }}>+20%</span>
    </div>
  </div>
));

const BAR_DATA = [28, 42, 35, 58, 47, 65, 54, 78, 61, 82];

const HeroBarChart = memo(() => (
  <div className="col-span-3 row-span-1 rounded-2xl p-3 border"
    style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Динамика платежей</p>
    <div className="flex items-end gap-1 h-12">
      {BAR_DATA.map((h, i) => (
        <div key={i} className="flex-1 rounded-t-sm"
          style={{
            height: `${h}%`,
            background: i === BAR_DATA.length - 1 ? "hsl(var(--primary))" : i % 3 === 0 ? "hsl(var(--primary)/0.55)" : "hsl(var(--primary)/0.22)",
            animation: `heroFloat${i % 2 === 0 ? "A" : "B"} ${3 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            boxShadow: i === BAR_DATA.length - 1 ? "0 -2px 8px hsl(var(--primary)/0.4)" : "none",
          }} />
      ))}
    </div>
  </div>
));

const SPARKLINE_POINTS = [30, 38, 33, 50, 44, 60, 52, 72, 65, 80];

const HeroSparkline = memo(() => {
  const w = 120, h = 44;
  const max = Math.max(...SPARKLINE_POINTS), min = Math.min(...SPARKLINE_POINTS);
  const pts = SPARKLINE_POINTS.map((v, i) => [
    (i / (SPARKLINE_POINTS.length - 1)) * w,
    h - ((v - min) / (max - min)) * (h - 8) - 4,
  ] as [number, number]);
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  return (
    <div className="col-span-2 row-span-1 rounded-2xl p-3 border"
      style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Рост</p>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFillD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparkFillD)" />
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts[pts.length - 1] && (
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill="hsl(var(--primary))"
            style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary)/0.8))" }} />
        )}
      </svg>
    </div>
  );
});

const HeroDonut = memo(() => {
  const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r;
  const segments = [
    { pct: 0.6, color: "hsl(var(--primary))", label: "Долг" },
    { pct: 0.27, color: "hsl(var(--success))", label: "%" },
    { pct: 0.13, color: "hsl(var(--warning))", label: "Ком." },
  ];
  let offset = 0;
  return (
    <div className="col-span-1 row-span-1 rounded-2xl p-3 border flex flex-col items-center justify-center"
      style={{ background: "hsl(var(--card)/0.7)", backdropFilter: "blur(16px)", borderColor: "hsl(var(--border)/0.6)" }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        {segments.map((seg, i) => {
          const dash = seg.pct * circ;
          const gap = circ - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth="7"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt" />
          );
          offset += seg.pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r="11" fill="hsl(var(--card))" />
      </svg>
      <div className="mt-1.5 space-y-0.5 w-full">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[7px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const CHIPS = [
  { icon: <PiggyBank className="h-4 w-4 text-primary" />,   label: "Депозит", value: "+12.4%",  top: "2%",    left: "-6%",  animA: true,  delay: "0s"   },
  { icon: <Receipt className="h-4 w-4 text-success" />,     label: "НДС",     value: "20%",     top: "8%",    right: "-8%", animA: false, delay: "0.4s" },
  { icon: <TrendingUp className="h-4 w-4 text-success" />,  label: "Доход",   value: "↑ 8.3%", bottom: "26%", left: "-8%", animA: false, delay: "0.8s" },
  { icon: <Car className="h-4 w-4 text-warning" />,         label: "Авто",    value: "15.9%",  bottom: "10%", right: "-6%",animA: true,  delay: "1.1s" },
  { icon: <Scale className="h-4 w-4 text-destructive" />,   label: "Пени",    value: "×1/300", bottom: "-2%", left: "30%", animA: true,  delay: "1.5s" },
] as const;

export function HeroDashboardIllustration({ parallax, chipRefs, chipOffsets }: HeroIllustrationProps) {
  return (
    <div
      className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-600"
      style={{ minHeight: 500, perspective: "1100px" }}
      aria-hidden="true"
    >
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl -top-10 right-0 pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-success/8 blur-2xl bottom-0 left-0 pointer-events-none" />

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
            background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--background)/0.4) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid hsl(var(--border)/0.6)",
            boxShadow: "0 32px 80px -16px hsl(var(--primary)/0.22), 0 8px 32px -8px hsl(var(--foreground)/0.1)",
            transform: "translateZ(-8px) scale(1.04)",
            borderRadius: "28px",
          }}
        />
        <div className="relative grid grid-cols-5 grid-rows-3 gap-2.5 p-3 w-[420px]">
          <HeroCalculator parallax={parallax} />
          <HeroResultCard />
          <HeroBarChart />
          <HeroSparkline />
          <HeroDonut />
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-14 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

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
              boxShadow: "0 4px 16px hsl(var(--primary)/0.1)",
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
