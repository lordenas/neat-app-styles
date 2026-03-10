import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/ui/color-picker";
import { calculatorsByCategory } from "@/lib/calculators/calculator-data";
import type { EmbedConfig } from "@/types/embed";
import { Palette, Calculator, Globe, Maximize2, Image } from "lucide-react";

const ALL_CALCULATORS = Object.values(calculatorsByCategory)
  .flat()
  .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
  .map((c) => ({ id: c.id, name: c.name, path: c.path }));

const CURRENCIES = [
  { value: "RUB", label: "₽ Рубль" },
  { value: "USD", label: "$ Доллар" },
  { value: "EUR", label: "€ Евро" },
  { value: "GBP", label: "£ Фунт" },
];

const LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const FONTS = [
  { value: "system-ui", label: "System UI" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "monospace", label: "Monospace" },
];

interface Props {
  config: EmbedConfig;
  onChange: (patch: Partial<EmbedConfig>) => void;
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </div>
  );
}

export function EmbedBuilderSidebar({ config, onChange }: Props) {
  const isPro = config.plan === "pro";

  return (
    <div className="rounded-xl border bg-card shadow-sm divide-y divide-border">
      {/* Calculator */}
      <div className="p-4 space-y-3">
        <SectionTitle icon={Calculator}>Калькулятор</SectionTitle>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Тип</Label>
          <Select value={config.calculatorId} onValueChange={(v) => onChange({ calculatorId: v })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {ALL_CALCULATORS.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-sm">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appearance */}
      <div className="p-4 space-y-4">
        <SectionTitle icon={Palette}>Внешний вид</SectionTitle>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Акцент</Label>
            <ColorPicker
              value={config.primaryColor}
              onChange={(v) => onChange({ primaryColor: v })}
              size="sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Фон</Label>
            <ColorPicker
              value={config.backgroundColor}
              onChange={(v) => onChange({ backgroundColor: v })}
              size="sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Текст</Label>
          <ColorPicker
            value={config.textColor}
            onChange={(v) => onChange({ textColor: v })}
            size="sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Скругление углов</Label>
            <span className="text-xs font-mono text-muted-foreground">{config.borderRadius}px</span>
          </div>
          <Slider
            min={0}
            max={24}
            step={1}
            value={[config.borderRadius]}
            onValueChange={([v]) => onChange({ borderRadius: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Шрифт</Label>
          <Select value={config.fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-sm">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Locale */}
      <div className="p-4 space-y-3">
        <SectionTitle icon={Globe}>Язык и валюта</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Язык</Label>
            <Select value={config.locale} onValueChange={(v) => onChange({ locale: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-sm">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Валюта</Label>
            <Select value={config.currency} onValueChange={(v) => onChange({ currency: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="p-4 space-y-3">
        <SectionTitle icon={Maximize2}>Размеры</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ширина</Label>
            <Input
              inputSize="sm"
              value={String(config.width)}
              onChange={(e) => onChange({ width: e.target.value })}
              placeholder="100%"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Высота (px)</Label>
            <Input
              inputSize="sm"
              type="number"
              value={config.height}
              onChange={(e) => onChange({ height: Number(e.target.value) })}
              placeholder="600"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="p-4 space-y-3">
        <SectionTitle icon={Image}>Брендинг</SectionTitle>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Логотип CalcHub</Label>
            <p className="text-xs text-muted-foreground">
              {isPro ? "Pro: можно скрыть" : "Free: отображается всегда"}
            </p>
          </div>
          <Switch
            checked={config.showLogo}
            onCheckedChange={(v) => isPro && onChange({ showLogo: v })}
            disabled={!isPro}
          />
        </div>

        {isPro && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL вашего логотипа</Label>
            <Input
              inputSize="sm"
              value={config.logoUrl}
              onChange={(e) => onChange({ logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        )}
      </div>
    </div>
  );
}
