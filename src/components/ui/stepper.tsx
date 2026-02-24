import * as React from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Статус шага.
 */
export type StepStatus = "upcoming" | "active" | "completed" | "error";

/**
 * Описание одного шага.
 */
export interface StepItem {
  label: string;
  description?: string;
  status?: StepStatus;
}

/**
 * Stepper — пошаговый индикатор прогресса.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { label: "Данные", status: "completed" },
 *     { label: "Оплата", status: "active" },
 *     { label: "Подтверждение", status: "upcoming" },
 *   ]}
 * />
 *
 * <Stepper orientation="vertical" steps={steps} />
 * ```
 *
 * @prop steps - Массив шагов
 * @prop orientation - `"horizontal"` (по умолчанию) | `"vertical"`
 * @prop size - `"sm"` | `"default"`
 */
export interface StepperProps {
  steps: StepItem[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "default";
  className?: string;
}

export function Stepper({ steps, orientation = "horizontal", size = "default", className }: StepperProps) {
  const isVertical = orientation === "vertical";
  const dotSize = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn(isVertical ? "flex flex-col gap-0" : "flex items-start gap-0", className)}>
      {steps.map((step, i) => {
        const status = step.status ?? (i === 0 ? "active" : "upcoming");
        const isLast = i === steps.length - 1;

        return (
          <div
            key={i}
            className={cn(
              isVertical ? "flex gap-3" : "flex flex-col items-center",
              !isLast && (isVertical ? "" : "flex-1"),
            )}
          >
            {/* Dot + connector */}
            <div className={cn(isVertical ? "flex flex-col items-center" : "flex items-center w-full")}>
              {/* Dot */}
              <div
                className={cn(
                  "rounded-full flex items-center justify-center font-medium shrink-0 transition-colors",
                  dotSize,
                  status === "completed" && "bg-primary text-primary-foreground",
                  status === "active" && "border-2 border-primary text-primary bg-background",
                  status === "upcoming" && "border-2 border-muted-foreground/30 text-muted-foreground bg-background",
                  status === "error" && "bg-destructive text-destructive-foreground",
                )}
              >
                {status === "completed" ? (
                  <Check className={iconSize} />
                ) : status === "error" ? (
                  <AlertCircle className={iconSize} />
                ) : (
                  i + 1
                )}
              </div>
              {/* Connector line */}
              {!isLast && (
                isVertical ? (
                  <div className={cn("w-0.5 flex-1 min-h-[24px]", status === "completed" ? "bg-primary" : "bg-border")} />
                ) : (
                  <div className={cn("h-0.5 flex-1 mx-2", status === "completed" ? "bg-primary" : "bg-border")} />
                )
              )}
            </div>
            {/* Label */}
            <div className={cn(isVertical ? "pb-6" : "mt-2 text-center", !isLast && !isVertical && "w-full")}>
              <p className={cn(
                "font-medium leading-tight",
                size === "sm" ? "text-xs" : "text-sm",
                status === "active" && "text-primary",
                status === "upcoming" && "text-muted-foreground",
                status === "error" && "text-destructive",
              )}>
                {step.label}
              </p>
              {step.description && (
                <p className={cn("text-muted-foreground mt-0.5", size === "sm" ? "text-[10px]" : "text-xs")}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
