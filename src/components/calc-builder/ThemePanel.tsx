import { CalcTheme } from "@/types/custom-calc";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── Presets ───────────────────────────────────────────────────

export interface ThemePreset {
  id: string;
  label: string;
  primary: string;
  bg: string;
  card: string;
  accent: string;
  borderRadius: CalcTheme["borderRadius"];
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    label: "Default",
    primary: "#3b82f6",
    bg: "#f8fafc",
    card: "#ffffff",
    accent: "#eff6ff",
    borderRadius: "md",
  },
  {
    id: "dark",
    label: "Dark",
    primary: "#6366f1",
    bg: "#0f172a",
    card: "#1e293b",
    accent: "#1e293b",
    borderRadius: "md",
  },
  {
    id: "ocean",
    label: "Ocean",
    primary: "#0ea5e9",
    bg: "#f0f9ff",
    card: "#ffffff",
    accent: "#e0f2fe",
    borderRadius: "lg",
  },
  {
    id: "forest",
    label: "Forest",
    primary: "#16a34a",
    bg: "#f0fdf4",
    card: "#ffffff",
    accent: "#dcfce7",
    borderRadius: "md",
  },
  {
    id: "sunset",
    label: "Sunset",
    primary: "#f97316",
    bg: "#fff7ed",
    card: "#ffffff",
    accent: "#ffedd5",
    borderRadius: "lg",
  },
  {
    id: "violet",
    label: "Violet",
    primary: "#7c3aed",
    bg: "#faf5ff",
    card: "#ffffff",
    accent: "#ede9fe",
    borderRadius: "md",
  },
  {
    id: "rose",
    label: "Rose",
    primary: "#e11d48",
    bg: "#fff1f2",
    card: "#ffffff",
    accent: "#ffe4e6",
    borderRadius: "sm",
  },
];

const RADIUS_OPTIONS: { value: CalcTheme["borderRadius"]; label: string }[] = [
  { value: "none", label: "0px" },
  { value: "sm", label: "4px" },
  { value: "md", label: "8px" },
  { value: "lg", label: "16px" },
];

interface ThemePanelProps {
  theme: CalcTheme;
  onChange: (theme: CalcTheme) => void;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Builds inline CSS variable overrides for the player wrapper */
export function buildThemeVars(theme: CalcTheme): React.CSSProperties {
  const vars: Record<string, string> = {};
  if (theme.primaryColor) {
    const hsl = hexToHsl(theme.primaryColor);
    vars["--primary"] = hsl;
    vars["--ring"] = hsl;
  }
  if (theme.bgColor) {
    vars["--background"] = hexToHsl(theme.bgColor);
  }
  // Card background (калькулятор-карточка)
  const cardHex = theme.cardColor ?? theme.bgColor;
  if (cardHex) {
    const cardHsl = hexToHsl(cardHex);
    vars["--card"] = cardHsl;
    // Auto-detect dark card and adjust text/border tokens
    const r = parseInt(cardHex.slice(1, 3), 16);
    const g = parseInt(cardHex.slice(3, 5), 16);
    const b = parseInt(cardHex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum < 0.4) {
      vars["--foreground"] = "210 40% 98%";
      vars["--card-foreground"] = "210 40% 98%";
      vars["--muted"] = hexToHsl(theme.accentColor ?? "#1e293b");
      vars["--muted-foreground"] = "215 20% 65%";
      vars["--border"] = "217 33% 22%";
      vars["--input"] = "217 33% 22%";
      vars["--primary-foreground"] = "222 47% 11%";
    }
  }
  if (theme.accentColor) {
    vars["--accent"] = hexToHsl(theme.accentColor);
    vars["--primary-light"] = hexToHsl(theme.accentColor);
  }
  if (theme.borderRadius) {
    const radMap: Record<string, string> = {
      none: "0px",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "1rem",
    };
    vars["--radius"] = radMap[theme.borderRadius] ?? "0.375rem";
  }
  return vars as React.CSSProperties;
}

export function ThemePanel({ theme, onChange }: ThemePanelProps) {
  const upd = (patch: Partial<CalcTheme>) => onChange({ ...theme, ...patch });

  const activePresetId = THEME_PRESETS.find(
    (p) => p.primary === theme.primaryColor && p.bg === theme.bgColor
  )?.id;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 space-y-5">

      {/* Preset grid */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Пресеты</p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => upd({
                primaryColor: preset.primary,
                bgColor: preset.bg,
                cardColor: preset.card,
                accentColor: preset.accent,
                borderRadius: preset.borderRadius,
              })}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all hover:scale-105",
                activePresetId === preset.id
                  ? "border-primary shadow-sm"
                  : "border-border hover:border-primary/40"
              )}
            >
              {/* Mini preview swatch */}
              <div
                className="w-full h-8 rounded-md flex items-center justify-center gap-1"
                style={{ backgroundColor: preset.bg }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: preset.primary, opacity: 0.3 }}
                />
              </div>
              <span className="text-[10px] font-medium text-foreground">{preset.label}</span>
              {activePresetId === preset.id && (
                <div
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t" />

      {/* Custom colors */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Кастомные цвета</p>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs shrink-0">Основной цвет</Label>
            <ColorPicker
              size="sm"
              value={theme.primaryColor ?? "#3b82f6"}
              onChange={(c) => upd({ primaryColor: c })}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs shrink-0">Фон страницы</Label>
            <ColorPicker
              size="sm"
              value={theme.bgColor ?? "#f8fafc"}
              onChange={(c) => upd({ bgColor: c })}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs shrink-0">Фон калькулятора</Label>
            <ColorPicker
              size="sm"
              value={theme.cardColor ?? theme.bgColor ?? "#ffffff"}
              onChange={(c) => upd({ cardColor: c })}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs shrink-0">Акцентный</Label>
            <ColorPicker
              size="sm"
              value={theme.accentColor ?? "#eff6ff"}
              onChange={(c) => upd({ accentColor: c })}
            />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t" />

      {/* Border radius */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Скругление углов</p>
        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => upd({ borderRadius: value })}
              className={cn(
                "flex-1 h-8 text-xs rounded-md border transition-colors",
                (theme.borderRadius ?? "md") === value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-input bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Visual radius preview */}
        <div className="flex gap-2 mt-1">
          {RADIUS_OPTIONS.map(({ value, label }) => (
            <div
              key={value}
              className="flex-1 h-6 bg-primary/20 border border-primary/30 transition-all"
              style={{
                borderRadius: value === "none" ? 0 : value === "sm" ? 4 : value === "md" ? 8 : 16,
                opacity: (theme.borderRadius ?? "md") === value ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Предпросмотр</p>
        {(() => {
          const bg = theme.bgColor ?? "#ffffff";
          const rx = parseInt(bg.slice(1, 3), 16);
          const gx = parseInt(bg.slice(3, 5), 16);
          const bx = parseInt(bg.slice(5, 7), 16);
          const lum = (0.299 * rx + 0.587 * gx + 0.114 * bx) / 255;
          const isDarkBg = lum < 0.4;
          const rad = theme.borderRadius === "none" ? 0 : theme.borderRadius === "sm" ? 4 : theme.borderRadius === "lg" ? 16 : 8;
          return (
            <div
              className="rounded-lg p-4 border space-y-3 transition-all"
              style={{
                backgroundColor: bg,
                borderColor: `${theme.primaryColor ?? "#3b82f6"}33`,
                borderRadius: rad,
              }}
            >
              <div className="text-xs font-semibold" style={{ color: isDarkBg ? "#f1f5f9" : "#0f172a" }}>Пример поля</div>
              <div
                className="h-8 rounded border px-2 flex items-center text-xs"
                style={{
                  borderColor: `${theme.primaryColor ?? "#3b82f6"}60`,
                  backgroundColor: theme.accentColor ?? "#eff6ff",
                  borderRadius: rad,
                }}
              >
                <span style={{ color: isDarkBg ? "#94a3b8" : "#64748b" }}>1 000 000</span>
              </div>
              <div
                className="h-8 flex items-center justify-center text-xs font-medium text-white rounded cursor-pointer"
                style={{ backgroundColor: theme.primaryColor ?? "#3b82f6", borderRadius: rad }}
              >
                Рассчитать
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
