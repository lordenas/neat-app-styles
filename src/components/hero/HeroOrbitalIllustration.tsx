import { memo, useEffect, useRef } from "react";
import {
  PiggyBank, Receipt, Home, Car, Scale, Percent,
} from "lucide-react";
import type { HeroIllustrationProps } from "./types";

// Each satellite: label, icon, value, orbit radius, initial angle, speed (deg/s), color token
const SATELLITES = [
  { label: "НДС",      icon: <Percent className="h-3.5 w-3.5" />,   value: "240 000 ₽", orbit: 105, angle0: 0,    speed: 22, color: "var(--primary)"    },
  { label: "Ипотека",  icon: <Home className="h-3.5 w-3.5" />,      value: "42 380 ₽",  orbit: 148, angle0: 72,   speed: 16, color: "var(--success)"    },
  { label: "НДФЛ",     icon: <Receipt className="h-3.5 w-3.5" />,   value: "110 500 ₽", orbit: 185, angle0: 144,  speed: 12, color: "var(--warning)"    },
  { label: "Пени",     icon: <Scale className="h-3.5 w-3.5" />,     value: "8 250 ₽",   orbit: 220, angle0: 216,  speed: 9,  color: "var(--destructive)" },
  { label: "Депозит",  icon: <PiggyBank className="h-3.5 w-3.5" />, value: "+12.4%",    orbit: 255, angle0: 288,  speed: 7,  color: "var(--info)"       },
  { label: "Авто",     icon: <Car className="h-3.5 w-3.5" />,       value: "15.9%",     orbit: 130, angle0: 36,   speed: 19, color: "var(--success)"    },
] as const;

// Ticks count for numeric display in center
const COUNTER_TARGETS = ["1 200 000", "42 380", "110 500", "300 000", "850 000"];

function OrbitalCanvas({
  parallax,
}: {
  parallax: { x: number; y: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    // Resolve CSS vars from document
    function cssColor(token: string) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
      return `hsl(${raw})`;
    }

    let startTime = performance.now();

    function draw(now: number) {
      const elapsed = (now - startTime) / 1000; // seconds

      ctx!.clearRect(0, 0, W, H);

      // ── Orbit rings ──
      SATELLITES.forEach((sat) => {
        ctx!.beginPath();
        ctx!.ellipse(CX, CY, sat.orbit, sat.orbit * 0.38, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = "hsl(var(--border) / 0.25)".replace("var(--border)", cssColor("--border").replace("hsl(", "").replace(")", ""));
        // simpler approach:
        ctx!.strokeStyle = "rgba(128,128,128,0.18)";
        ctx!.lineWidth = 1;
        ctx!.setLineDash([4, 6]);
        ctx!.stroke();
        ctx!.setLineDash([]);
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} width={500} height={440} className="absolute inset-0 w-full h-full" />;
}

// Individual satellite card — pure CSS animation via custom --angle
const SatelliteCard = memo(({
  sat,
  index,
  chipRef,
  chipOffset,
}: {
  sat: typeof SATELLITES[number];
  index: number;
  chipRef: (el: HTMLDivElement | null) => void;
  chipOffset: { x: number; y: number };
}) => {
  // We use CSS custom property animation via inline keyframes trick
  // Instead, use a React-managed angle with requestAnimationFrame at parent level
  // Here we just position via CSS animation defined in index.css
  const duration = 360 / sat.speed; // seconds per full orbit
  const tilt = 0.38; // vertical compression ratio

  return (
    <div
      className="absolute"
      style={{
        // place pivot at center of the illustration (w=500,h=440)
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        // orbit animation via custom CSS animation
        animation: `orbit-${index} ${duration}s linear infinite`,
      }}
    >
      <div
        ref={chipRef}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shadow-lg"
        style={{
          background: "hsl(var(--card)/0.92)",
          backdropFilter: "blur(12px)",
          borderColor: `hsl(${sat.color}/0.35)`,
          boxShadow: `0 4px 16px hsl(${sat.color}/0.15)`,
          translate: `${chipOffset.x}px ${chipOffset.y}px`,
          transition: "translate 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
          whiteSpace: "nowrap",
        }}
      >
        <div className="p-1 rounded-lg" style={{ background: `hsl(${sat.color}/0.12)`, color: `hsl(${sat.color})` }}>
          {sat.icon}
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{sat.label}</p>
          <p className="text-[11px] font-bold tabular-nums" style={{ color: `hsl(${sat.color})` }}>{sat.value}</p>
        </div>
      </div>
    </div>
  );
});

// Animated ticker cycling through numbers
function CenterTicker() {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let i = 0;
    const nums = ["1 200 000", "42 380", "110 500", "300 000", "850 000"];
    const el = spanRef.current;
    if (!el) return;
    const tick = () => {
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = nums[i % nums.length] + " ₽";
        el.style.opacity = "1";
        i++;
      }, 300);
    };
    tick();
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      ref={spanRef}
      className="tabular-nums"
      style={{ transition: "opacity 0.3s ease", display: "inline-block" }}
    />
  );
}

// Generate the @keyframes for orbit animations in a <style> tag
function OrbitStyles() {
  const css = SATELLITES.map((sat, i) => {
    const tilt = 0.38;
    const a0 = (sat.angle0 * Math.PI) / 180;
    // We animate from angle0 to angle0+360
    // x(t) = cos(a0 + t) * r,  y(t) = sin(a0 + t) * r * tilt
    // We'll use a single transform: translate(x, y) at each keyframe step
    const steps = 60;
    const frames = Array.from({ length: steps + 1 }, (_, k) => {
      const frac = k / steps;
      const angle = a0 + frac * Math.PI * 2;
      const x = Math.cos(angle) * sat.orbit;
      const y = Math.sin(angle) * sat.orbit * tilt;
      return `${(frac * 100).toFixed(1)}% { transform: translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)); }`;
    });
    return `@keyframes orbit-${i} {\n${frames.join("\n")}\n}`;
  }).join("\n\n");
  return <style>{css}</style>;
}

// Concentric pulse rings around center
function PulseRings() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${i * 64}px`,
            height: `${i * 64}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderColor: "hsl(var(--primary)/0.15)",
            animation: `pulse ${2 + i * 0.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </>
  );
}

export function HeroOrbitalIllustration({ parallax, chipRefs, chipOffsets }: HeroIllustrationProps) {
  return (
    <div
      className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-600"
      style={{ minHeight: 480, width: 500 }}
      aria-hidden="true"
    >
      <OrbitStyles />

      {/* Ambient glows */}
      <div className="absolute w-80 h-80 rounded-full bg-primary/8 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-success/6 blur-2xl bottom-8 left-8 pointer-events-none" />
      <div className="absolute w-40 h-40 rounded-full bg-warning/5 blur-2xl top-8 right-8 pointer-events-none" />

      {/* 3D tilt wrapper */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotateY(${parallax.x * 0.4}deg) rotateX(${parallax.y * 0.35}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.14s ease-out",
          perspective: "1000px",
        }}
      >
        {/* Orbit rings (dashed ellipses via SVG) */}
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
              rx={sat.orbit}
              ry={sat.orbit * 0.38}
              stroke="hsl(var(--border))"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="5 7"
            />
          ))}
        </svg>

        {/* Pulse rings */}
        <PulseRings />

        {/* Center orb */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            width: 110,
            height: 110,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, hsl(var(--primary)/0.18) 0%, hsl(var(--card)/0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid hsl(var(--primary)/0.3)",
            boxShadow: "0 0 48px hsl(var(--primary)/0.2), 0 0 16px hsl(var(--primary)/0.1), inset 0 1px 0 hsl(var(--background)/0.6)",
          }}
        >
          <span
            className="text-3xl font-black text-primary"
            style={{ textShadow: "0 0 20px hsl(var(--primary)/0.5)", lineHeight: 1 }}
          >
            ₽
          </span>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">калькулятор</p>
        </div>

        {/* Secondary info card — bottom center */}
        <div
          className="absolute rounded-xl border px-3 py-2 flex items-center gap-2"
          style={{
            bottom: "6%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "hsl(var(--card)/0.88)",
            backdropFilter: "blur(14px)",
            borderColor: "hsl(var(--border)/0.6)",
            boxShadow: "0 4px 20px hsl(var(--primary)/0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] text-muted-foreground">Результат:</p>
          <p className="text-xs font-bold text-primary">
            <CenterTicker />
          </p>
        </div>

        {/* Satellite cards */}
        {SATELLITES.map((sat, i) => (
          <SatelliteCard
            key={i}
            sat={sat}
            index={i}
            chipRef={(el) => { chipRefs.current[i] = el; }}
            chipOffset={chipOffsets[i] ?? { x: 0, y: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
