import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  X, ChevronRight, ChevronLeft, Sparkles,
  LayoutTemplate, Sliders, Eye, Save, BookOpen,
} from "lucide-react";

const TOUR_KEY = "calc_builder_tour_done";

export type TourStep = {
  target: string; // CSS selector or "center"
  title: string;
  description: string;
  icon?: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
};

const STEPS: TourStep[] = [
  {
    target: "center",
    title: "Добро пожаловать в конструктор! 🎉",
    description:
      "Здесь вы создаёте собственные калькуляторы без кода. Давайте за 30 секунд разберём интерфейс.",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    placement: "bottom",
  },
  {
    target: "[data-tour='title']",
    title: "Название калькулятора",
    description:
      "Кликните сюда, чтобы задать название. Оно будет отображаться пользователям.",
    icon: <LayoutTemplate className="h-5 w-5 text-primary" />,
    placement: "bottom",
  },
  {
    target: "[data-tour='tab-switcher']",
    title: "Редактор и Превью",
    description:
      "Переключайтесь между режимами: «Редактор» для добавления полей, «Превью» — чтобы увидеть калькулятор глазами пользователя.",
    icon: <Eye className="h-5 w-5 text-primary" />,
    placement: "bottom",
  },
  {
    target: "[data-tour='left-panel']",
    title: "Панель настроек",
    description:
      "Три вкладки: «Поле» — настройки выделенного поля, «Страницы» — управление шагами, «Тема» — цвета и шрифты.",
    icon: <Sliders className="h-5 w-5 text-primary" />,
    placement: "right",
  },
  {
    target: "[data-tour='canvas']",
    title: "Холст — сюда добавляются поля",
    description:
      "Нажмите «+ Добавить поле» чтобы выбрать тип: число, слайдер, список, результат и др. Перетаскивайте поля для изменения порядка.",
    icon: <LayoutTemplate className="h-5 w-5 text-primary" />,
    placement: "top",
  },
  {
    target: "[data-tour='save-btn']",
    title: "Сохранение и публикация",
    description:
      "Сохраните калькулятор и переключите режим «Приватный → Публичный». После этого поделитесь ссылкой — она уже работает!",
    icon: <Save className="h-5 w-5 text-primary" />,
    placement: "bottom",
  },
  {
    target: "center",
    title: "Вы готовы! 🚀",
    description:
      "Начните с нажатия «+ Добавить поле». Подробная документация — в разделе Помощь.",
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    placement: "bottom",
  },
];

// ── Spotlight overlay ──────────────────────────────────────────────────────────

type Rect = { top: number; left: number; width: number; height: number };

function getRect(selector: string): Rect | null {
  if (selector === "center") return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const PAD = 8;

function SpotlightOverlay({ rect }: { rect: Rect | null }) {
  if (!rect) {
    // Full-screen dim without cutout
    return (
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ background: "hsl(var(--foreground) / 0.55)" }}
      />
    );
  }

  const { top, left, width, height } = rect;
  const r = PAD;

  return (
    <svg
      className="fixed inset-0 z-[9998] pointer-events-none"
      width="100vw"
      height="100vh"
      style={{ width: "100vw", height: "100vh" }}
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            x={left - PAD}
            y={top - PAD}
            width={width + PAD * 2}
            height={height + PAD * 2}
            rx={r}
            ry={r}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="hsl(var(--foreground) / 0.55)"
        mask="url(#spotlight-mask)"
      />
      {/* Highlight border */}
      <rect
        x={left - PAD}
        y={top - PAD}
        width={width + PAD * 2}
        height={height + PAD * 2}
        rx={r}
        ry={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        opacity="0.9"
      />
    </svg>
  );
}

// ── Tooltip card ───────────────────────────────────────────────────────────────

type TooltipPos = { top?: number; bottom?: number; left?: number; right?: number; transform?: string };

function getTooltipPos(rect: Rect | null, placement: TourStep["placement"], tooltipW = 320, tooltipH = 180): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) {
    // Centered
    return {
      top: vh / 2 - tooltipH / 2,
      left: vw / 2 - tooltipW / 2,
    };
  }

  const margin = 16;

  if (placement === "bottom") {
    return {
      top: Math.min(rect.top + rect.height + PAD + margin, vh - tooltipH - 8),
      left: Math.max(8, Math.min(rect.left + rect.width / 2 - tooltipW / 2, vw - tooltipW - 8)),
    };
  }
  if (placement === "top") {
    return {
      top: Math.max(8, rect.top - PAD - margin - tooltipH),
      left: Math.max(8, Math.min(rect.left + rect.width / 2 - tooltipW / 2, vw - tooltipW - 8)),
    };
  }
  if (placement === "right") {
    return {
      top: Math.max(8, Math.min(rect.top + rect.height / 2 - tooltipH / 2, vh - tooltipH - 8)),
      left: Math.min(rect.left + rect.width + PAD + margin, vw - tooltipW - 8),
    };
  }
  if (placement === "left") {
    return {
      top: Math.max(8, Math.min(rect.top + rect.height / 2 - tooltipH / 2, vh - tooltipH - 8)),
      left: Math.max(8, rect.left - PAD - margin - tooltipW),
    };
  }

  return {
    top: vh / 2 - tooltipH / 2,
    left: vw / 2 - tooltipW / 2,
  };
}

// ── Main component ─────────────────────────────────────────────────────────────

interface OnboardingTourProps {
  /** Force the tour to show regardless of localStorage */
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ forceShow, onComplete }: OnboardingTourProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pos, setPos] = useState<TooltipPos>({});
  const rafRef = useRef<number | null>(null);

  // Show on first visit
  useEffect(() => {
    if (forceShow || !localStorage.getItem(TOUR_KEY)) {
      // Small delay so CalcBuilder mounts its DOM targets
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const updatePosition = useCallback(() => {
    const currentStep = STEPS[step];
    const r = getRect(currentStep.target);
    setRect(r);
    setPos(getTooltipPos(r, currentStep.placement));
  }, [step]);

  useEffect(() => {
    if (!active) return;
    updatePosition();

    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, updatePosition]);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setActive(false);
    onComplete?.();
  }, [onComplete]);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!active) return null;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return createPortal(
    <>
      {/* Spotlight */}
      <SpotlightOverlay rect={rect} />

      {/* Click-blocker (prevents interaction with page while tour is active) */}
      <div className="fixed inset-0 z-[9999] pointer-events-auto" onClick={(e) => e.stopPropagation()} />

      {/* Tooltip card */}
      <div
        className={cn(
          "fixed z-[10000] w-80 rounded-xl border bg-card shadow-xl overflow-hidden",
          "pointer-events-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-0">
          <div className="flex items-center gap-2">
            {currentStep.icon}
            <span className="text-sm font-semibold text-foreground leading-tight">{currentStep.title}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {step + 1}/{STEPS.length}
            </span>
            <button
              onClick={finish}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <p className="px-4 pt-2 pb-4 text-sm text-muted-foreground leading-relaxed">
          {currentStep.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-4 pt-0 gap-3">
          {/* Step dots */}
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === step
                    ? "w-4 h-1.5 bg-primary"
                    : i < step
                      ? "w-1.5 h-1.5 bg-primary/40 hover:bg-primary/60"
                      : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!isFirst && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={prev}>
                <ChevronLeft className="h-3.5 w-3.5" />
                Назад
              </Button>
            )}
            <Button size="sm" className="h-7 text-xs gap-1" onClick={next}>
              {isLast ? "Начать!" : "Далее"}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/** Hook to programmatically restart the tour */
export function useOnboardingTour() {
  const [forceShow, setForceShow] = useState(false);

  const startTour = () => {
    localStorage.removeItem(TOUR_KEY);
    setForceShow(true);
  };

  const onComplete = () => setForceShow(false);

  return { forceShow, startTour, onComplete };
}
