import { memo, useEffect, useRef } from "react";
import type { HeroIllustrationProps } from "./types";

// Floating math symbols
const SYMBOLS = [
  { sym: "+", color: "--success",     x: "8%",  y: "18%", size: 32, delay: "0s",   dur: "3.2s" },
  { sym: "−", color: "--primary",     x: "82%", y: "12%", size: 26, delay: "0.5s", dur: "2.8s" },
  { sym: "×", color: "--warning",     x: "6%",  y: "72%", size: 28, delay: "1.1s", dur: "3.6s" },
  { sym: "÷", color: "--destructive", x: "78%", y: "78%", size: 24, delay: "0.3s", dur: "4s"   },
  { sym: "%", color: "--primary",     x: "88%", y: "48%", size: 20, delay: "0.8s", dur: "3s"   },
  { sym: "=", color: "--success",     x: "3%",  y: "44%", size: 22, delay: "1.4s", dur: "2.6s" },
];

const BUTTONS = [
  // row 1
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "=", "+"],
];

const BTN_ACCENT = new Set(["÷", "×", "−", "+", "="]);

// Notebook lines
const NOTEBOOK_LINES = [28, 44, 60, 76, 92, 108, 124];

const FloatSymbol = memo(({ sym, color, x, y, size, delay, dur }: typeof SYMBOLS[0]) => (
  <div
    className="absolute select-none pointer-events-none font-black"
    style={{
      left: x, top: y,
      fontSize: size,
      color: `hsl(var(${color}))`,
      textShadow: `0 2px 12px hsl(var(${color}) / 0.35)`,
      animation: `heroFloat ${dur} ease-in-out ${delay} infinite`,
      lineHeight: 1,
      userSelect: "none",
    }}
  >
    {sym}
  </div>
));

export function HeroCalc3dIllustration({ parallax }: HeroIllustrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-700"
      style={{ minHeight: 480, width: "100%", maxWidth: 520 }}
      aria-hidden="true"
    >
      {/* Inject float keyframes */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50%       { transform: translateY(-14px) rotate(4deg); }
        }
        @keyframes calcBlink {
          0%, 100% { opacity: 1; }
          48%, 52%  { opacity: 0; }
        }
      `}</style>

      {/* Ambient glow */}
      <div className="absolute w-80 h-80 rounded-full bg-primary/8 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-success/6 blur-2xl bottom-12 right-8 pointer-events-none" />

      {/* Floating symbols */}
      {SYMBOLS.map((s) => <FloatSymbol key={s.sym} {...s} />)}

      {/* 3D tilt wrapper */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: `rotateY(${parallax.x * 0.3}deg) rotateX(${-parallax.y * 0.22}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
          width: 380,
          height: 380,
        }}
      >

        {/* ── NOTEBOOK (back-right) ── */}
        <div
          className="absolute"
          style={{
            width: 175, height: 220,
            top: 50, left: 215,
            transform: "rotateZ(5deg) rotateY(-8deg)",
            transformStyle: "preserve-3d",
            zIndex: 1,
          }}
        >
          {/* Spine / side */}
          <div
            className="absolute inset-y-0 left-0 w-3 rounded-l-md"
            style={{
              background: "hsl(var(--primary))",
              boxShadow: "inset -2px 0 6px hsl(var(--primary) / 0.4)",
            }}
          />
          {/* Pages stack */}
          {[6, 4, 2].map((offset) => (
            <div
              key={offset}
              className="absolute inset-0 rounded-r-xl rounded-l-md"
              style={{
                background: "hsl(var(--card))",
                transform: `translateX(${offset}px) translateY(${offset}px)`,
                border: "1px solid hsl(var(--border))",
              }}
            />
          ))}
          {/* Top page */}
          <div
            className="absolute inset-0 rounded-r-xl rounded-l-md overflow-hidden"
            style={{
              background: "hsl(var(--background))",
              border: "1.5px solid hsl(var(--border))",
              boxShadow: "0 8px 24px hsl(var(--foreground) / 0.08)",
            }}
          >
            {NOTEBOOK_LINES.map((top) => (
              <div
                key={top}
                className="absolute left-8 right-4"
                style={{ top, height: 1.5, background: "hsl(var(--border) / 0.6)", borderRadius: 1 }}
              />
            ))}
            <div className="absolute inset-y-0 left-7 w-px" style={{ background: "hsl(var(--destructive) / 0.25)" }} />
            <svg className="absolute bottom-5 right-5 opacity-60" width={28} height={28} viewBox="0 0 28 28" fill="none">
              <circle cx={14} cy={14} r={12} stroke="hsl(var(--success))" strokeWidth={2} />
              <path d="M8 14 l4 4 l8-8" stroke="hsl(var(--success))" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Spiral rings */}
          {[28, 58, 88, 118, 148].map((top) => (
            <div
              key={top}
              className="absolute"
              style={{
                top, left: -8, width: 16, height: 16,
                borderRadius: "50%",
                border: "2.5px solid hsl(var(--muted-foreground) / 0.5)",
                background: "hsl(var(--card))",
                zIndex: 10,
              }}
            />
          ))}
        </div>

        {/* ── PENCIL — diagonal across the top, fully visible ── */}
        <div
          className="absolute"
          style={{
            width: 14, height: 180,
            /* position the CENTER of the pencil at top-right area */
            top: 20, left: 285,
            transform: "rotateZ(-42deg)",
            transformOrigin: "50% 50%",
            zIndex: 6,
          }}
        >
          {/* Eraser (top) */}
          <div className="absolute top-0 left-0 right-0 h-8 rounded-t-full" style={{ background: "hsl(var(--destructive) / 0.65)" }} />
          {/* Metal band */}
          <div className="absolute top-8 left-0 right-0 h-4" style={{ background: "hsl(var(--muted-foreground) / 0.45)" }} />
          {/* Body */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: 12, bottom: 18,
              background: "linear-gradient(90deg, hsl(var(--success) / 0.85), hsl(var(--success)), hsl(var(--success) / 0.7))",
              boxShadow: "2px 0 8px hsl(var(--success) / 0.25)",
            }}
          />
          {/* Wood cone */}
          <div
            className="absolute"
            style={{
              bottom: 8, left: 0, right: 0, height: 18,
              background: "linear-gradient(90deg, hsl(var(--warning) / 0.9), hsl(var(--warning) / 0.7))",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
          {/* Graphite tip */}
          <div
            className="absolute bottom-0 left-1/2"
            style={{
              transform: "translateX(-50%)",
              width: 4, height: 8,
              background: "hsl(var(--foreground) / 0.6)",
              borderRadius: "0 0 2px 2px",
            }}
          />
        </div>

        {/* ── CALCULATOR (front-left) ── */}
        <div
          className="absolute"
          style={{
            width: 185, height: 230,
            top: 80, left: 40,
            borderRadius: 20,
            background: "linear-gradient(145deg, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.65))",
            boxShadow: `
              0 20px 50px hsl(var(--primary) / 0.35),
              0 6px 16px hsl(var(--foreground) / 0.12),
              inset 0 1px 0 hsl(var(--background) / 0.3)
            `,
            transform: "rotateZ(-4deg) rotateY(8deg)",
            transformStyle: "preserve-3d",
            zIndex: 10,
          }}
        >
          {/* Display */}
          <div
            className="absolute rounded-xl overflow-hidden"
            style={{
              top: 14, left: 14, right: 14, height: 52,
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--background) / 0.85))",
              border: "1.5px solid hsl(var(--primary) / 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              padding: "6px 10px",
            }}
          >
            <span
              className="tabular-nums font-bold text-primary text-base"
              style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
            >
              42 380 ₽
            </span>
            <span
              style={{
                width: 2, height: 18,
                background: "hsl(var(--primary))",
                marginLeft: 2,
                borderRadius: 1,
                animation: "calcBlink 1.1s step-end infinite",
                display: "inline-block",
              }}
            />
          </div>

          {/* Buttons grid */}
          <div
            className="absolute grid gap-2"
            style={{
              top: 78, left: 14, right: 14, bottom: 14,
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
            }}
          >
            {BUTTONS.flat().map((btn, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center rounded-lg text-xs font-bold select-none"
                style={{
                  background: BTN_ACCENT.has(btn)
                    ? "linear-gradient(145deg, hsl(var(--success) / 0.9), hsl(var(--success) / 0.7))"
                    : "linear-gradient(145deg, hsl(var(--background) / 0.88), hsl(var(--card) / 0.7))",
                  color: BTN_ACCENT.has(btn) ? "hsl(var(--success-foreground, var(--background)))" : "hsl(var(--foreground))",
                  boxShadow: "0 2px 4px hsl(var(--foreground) / 0.15), inset 0 1px 0 hsl(var(--background) / 0.4)",
                  fontSize: 11,
                }}
              >
                {btn}
              </div>
            ))}
          </div>

          {/* Side depth */}
          <div
            className="absolute inset-y-4 -right-2 w-2 rounded-r-xl"
            style={{ background: "hsl(var(--primary) / 0.45)", transform: "translateZ(-4px)" }}
          />
          <div
            className="absolute inset-x-4 -bottom-2 h-2 rounded-b-xl"
            style={{ background: "hsl(var(--primary) / 0.35)", transform: "translateZ(-4px)" }}
          />
        </div>

        {/* ── ASTERISK shape (lower-left) ── */}
        <div
          className="absolute font-black select-none"
          style={{
            left: 22, top: 258,
            fontSize: 42,
            color: "hsl(var(--destructive) / 0.75)",
            textShadow: "0 4px 16px hsl(var(--destructive) / 0.3)",
            transform: "rotateZ(-15deg)",
            animation: "heroFloat 4s ease-in-out 0.6s infinite",
            lineHeight: 1,
          }}
        >
          ✱
        </div>

      </div>
    </div>
  );
}
