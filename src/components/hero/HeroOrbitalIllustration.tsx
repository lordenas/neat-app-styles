import { memo, useEffect, useRef, useState } from "react";
import { PiggyBank, Receipt, Home, Car, Scale, Percent } from "lucide-react";
import type { HeroIllustrationProps } from "./types";

// Орбитальные параметры: radX — горизонтальный радиус, radY — вертикальный (сжатая эллипс)
const SATELLITES = [
  { label: "НДС",     value: "240 000 ₽", radX: 95,  radY: 38, angle0: 0,   speed: 0.38, colorVar: "--primary"    },
  { label: "Ипотека", value: "42 380 ₽",  radX: 130, radY: 50, angle0: 72,  speed: 0.27, colorVar: "--success"    },
  { label: "НДФЛ",    value: "110 500 ₽", radX: 160, radY: 60, angle0: 144, speed: 0.20, colorVar: "--warning"    },
  { label: "Пени",    value: "8 250 ₽",   radX: 115, radY: 44, angle0: 216, speed: 0.31, colorVar: "--destructive"},
  { label: "Депозит", value: "+12.4%",    radX: 145, radY: 54, angle0: 288, speed: 0.22, colorVar: "--primary"    },
] as const;

const ICONS: Record<string, React.ReactNode> = {
  "НДС":     <Percent className="h-3.5 w-3.5" />,
  "Ипотека": <Home    className="h-3.5 w-3.5" />,
  "НДФЛ":    <Receipt className="h-3.5 w-3.5" />,
  "Пени":    <Scale   className="h-3.5 w-3.5" />,
  "Депозит": <PiggyBank className="h-3.5 w-3.5" />,
};

const TICKER_NUMS = ["1 200 000 ₽", "42 380 ₽", "110 500 ₽", "300 000 ₽", "850 000 ₽"];

// Конвертируем deg/s (angle0 в градусах) в рад для вычислений
function degToRad(d: number) { return (d * Math.PI) / 180; }

// Центрирует карточку спутника: wrapper — нулевой div в центре; карточка абсолютно по transform
const SatCard = memo(({ label, value, colorVar, x, y, chipRef }: {
  label: string; value: string; colorVar: string;
  x: number; y: number;
  chipRef: (el: HTMLDivElement | null) => void;
}) => (
  <div
    className="absolute"
    style={{ left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none" }}
  >
    <div
      ref={chipRef}
      className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shadow-md"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        background: "hsl(var(--card) / 0.92)",
        backdropFilter: "blur(12px)",
        borderColor: `hsl(var(${colorVar}) / 0.35)`,
        boxShadow: `0 4px 16px hsl(var(${colorVar}) / 0.12)`,
        whiteSpace: "nowrap",
        pointerEvents: "auto",
      }}
    >
      <div
        className="p-1 rounded-lg shrink-0"
        style={{
          background: `hsl(var(${colorVar}) / 0.12)`,
          color: `hsl(var(${colorVar}))`,
        }}
      >
        {ICONS[label]}
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-[11px] font-bold tabular-nums" style={{ color: `hsl(var(${colorVar}))` }}>{value}</p>
      </div>
    </div>
  </div>
));

function CenterTicker() {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let i = 0;
    const el = spanRef.current;
    if (!el) return;
    const tick = () => {
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = TICKER_NUMS[i % TICKER_NUMS.length];
        el.style.opacity = "1";
        i++;
      }, 280);
    };
    tick();
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      ref={spanRef}
      className="tabular-nums text-xs font-bold text-primary"
      style={{ transition: "opacity 0.28s ease", display: "inline-block", minWidth: 100 }}
    />
  );
}

export function HeroOrbitalIllustration({ parallax, chipRefs }: HeroIllustrationProps) {
  // Animate angles via RAF
  const [angles, setAngles] = useState(() =>
    SATELLITES.map((s) => degToRad(s.angle0))
  );
  const lastTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const step = (now: number) => {
      if (lastTime.current !== null) {
        const dt = Math.min((now - lastTime.current) / 1000, 0.05); // cap at 50ms
        setAngles((prev) =>
          prev.map((a, i) => a + SATELLITES[i].speed * dt)
        );
      }
      lastTime.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute x,y per satellite
  const positions = angles.map((a, i) => ({
    x: Math.cos(a) * SATELLITES[i].radX,
    y: Math.sin(a) * SATELLITES[i].radY,
  }));

  return (
    <div
      className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-600"
      style={{ minHeight: 480, width: "100%", maxWidth: 500 }}
      aria-hidden="true"
    >
      {/* Ambient blobs */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-success/6 blur-2xl bottom-8 left-8 pointer-events-none" />

      {/* 3D tilt wrapper */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: `rotateY(${parallax.x * 0.35}deg) rotateX(${parallax.y * 0.28}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.14s ease-out",
          minHeight: 440,
        }}
      >

        {/* SVG orbit rings */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 500 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ pointerEvents: "none" }}
        >
          {SATELLITES.map((sat, i) => (
            <ellipse
              key={i}
              cx="250"
              cy="220"
              rx={sat.radX}
              ry={sat.radY}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="text-border"
            />
          ))}
        </svg>

        {/* Pulse rings */}
        {[64, 112, 160].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/10"
            style={{
              width: size, height: size,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              animation: `pulse ${2.2 + i * 0.9}s ease-in-out infinite`,
              animationDelay: `${i * 0.45}s`,
            }}
          />
        ))}

        {/* Center orb */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center z-10"
          style={{
            width: 100, height: 100,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--card) / 0.95))",
            backdropFilter: "blur(20px)",
            border: "1.5px solid hsl(var(--primary) / 0.3)",
            boxShadow: "0 0 40px hsl(var(--primary) / 0.18), 0 0 12px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--background) / 0.5)",
          }}
        >
          <span
            className="text-3xl font-black text-primary"
            style={{ textShadow: "0 0 18px hsl(var(--primary) / 0.45)", lineHeight: 1 }}
          >
            ₽
          </span>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">расчёт</p>
        </div>

        {/* Result ticker card */}
        <div
          className="absolute rounded-xl border px-3 py-2 flex items-center gap-2 z-10"
          style={{
            bottom: "8%", left: "50%",
            transform: "translateX(-50%)",
            background: "hsl(var(--card) / 0.88)",
            backdropFilter: "blur(14px)",
            borderColor: "hsl(var(--border) / 0.5)",
            boxShadow: "0 4px 20px hsl(var(--primary) / 0.08)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <p className="text-[10px] text-muted-foreground">Результат:</p>
          <CenterTicker />
        </div>

        {/* Orbiting satellite cards */}
        {SATELLITES.map((sat, i) => (
          <SatCard
            key={i}
            label={sat.label}
            value={sat.value}
            colorVar={sat.colorVar}
            x={positions[i].x}
            y={positions[i].y}
            chipRef={(el) => { chipRefs.current[i] = el; }}
          />
        ))}
      </div>
    </div>
  );
}
