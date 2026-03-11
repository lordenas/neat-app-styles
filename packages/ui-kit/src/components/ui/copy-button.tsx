import * as React from "react";
import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

/**
 * CopyButton — кнопка копирования текста в буфер обмена с анимацией иконки.
 *
 * @example
 * ```tsx
 * <CopyButton value="npm install react" />
 * <CopyButton value="50 109 ₽" label="Скопировать сумму" variant="outline" />
 * <CopyButton value={code} size="icon-sm" />
 * ```
 *
 * @prop value - Текст для копирования
 * @prop label - Текст кнопки (по умолчанию показывается только иконка)
 * @prop variant - Вариант кнопки (наследуется от Button)
 * @prop size - Размер кнопки (наследуется от Button)
 * @prop duration - Длительность состояния «Скопировано» в мс (по умолчанию 2000)
 */
export interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg" | "icon" | "icon-sm";
  duration?: number;
  className?: string;
}

export function CopyButton({
  value,
  label,
  variant = "outline",
  size,
  duration = 2000,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const effectiveSize = size ?? (label ? "sm" : "icon-sm");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } catch {
      // fallback
    }
  }, [value, duration]);

  const icon = copied ? (
    <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
  ) : (
    <Copy className="h-3.5 w-3.5" />
  );

  return (
    <Button
      variant={variant}
      size={effectiveSize}
      onClick={handleCopy}
      icon={icon}
      aria-label={copied ? "Скопировано" : "Копировать"}
      className={cn(copied && "text-[hsl(var(--success))]", className)}
    >
      {label}
    </Button>
  );
}
