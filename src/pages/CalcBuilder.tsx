import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CustomCalculator, CalcField, loadCalculators, saveCalculator,
} from "@/types/custom-calc";
import { BuilderCanvas } from "@/components/calc-builder/BuilderCanvas";
import { BuilderPreview } from "@/components/calc-builder/BuilderPreview";
import { FieldSettingsPanel } from "@/components/calc-builder/FieldSettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save, Eye, ArrowLeft, Copy, ExternalLink,
  Calculator, Globe, Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function nanoid(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function makeNew(): CustomCalculator {
  return {
    id: nanoid(16),
    slug: nanoid(8),
    title: "Новый калькулятор",
    description: "",
    fields: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const TOPBAR_H = 48; // px — top toolbar height
const HEADER_H = 57; // px — site header height
const PANEL_TOP = HEADER_H + TOPBAR_H; // 105px

export default function CalcBuilder() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [calculator, setCalculator] = useState<CustomCalculator>(() => {
    if (id) {
      const found = loadCalculators().find((c) => c.id === id);
      if (found) return found;
    }
    return makeNew();
  });

  const [saved, setSaved] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [tab, setTab] = useState<"builder" | "preview">("builder");

  const handleSave = () => {
    const updated = { ...calculator, updatedAt: new Date().toISOString() };
    setCalculator(updated);
    saveCalculator(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({ title: "Сохранено", description: `Калькулятор «${updated.title}» сохранён локально.` });
  };

  const copyPlayerLink = () => {
    const url = `${window.location.origin}/c/${calculator.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Ссылка скопирована", description: url });
  };

  const selectedField = selectedFieldId
    ? calculator.fields.find((f) => f.id === selectedFieldId) ?? null
    : null;

  const updateSelectedField = (updated: CalcField) => {
    setCalculator((c) => ({
      ...c,
      fields: c.fields.map((f) => (f.id === updated.id ? updated : f)),
    }));
  };

  const deleteSelectedField = () => {
    if (!selectedFieldId) return;
    setCalculator((c) => ({
      ...c,
      fields: c.fields.filter((f) => f.id !== selectedFieldId),
    }));
    setSelectedFieldId(null);
  };

  const playerUrl = `/c/${calculator.slug}`;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* ── Top toolbar ── */}
      <header className="h-12 shrink-0 border-b bg-card flex items-center px-4 gap-3 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate("/calc-list")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Мои калькуляторы
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <Input
          value={calculator.title}
          onChange={(e) => setCalculator((c) => ({ ...c, title: e.target.value }))}
          className="h-8 w-56 text-sm font-medium border-0 shadow-none bg-transparent focus-visible:ring-0 px-1"
          placeholder="Название калькулятора"
        />

        {/* Tab switcher */}
        <div className="flex items-center gap-1 ml-4 bg-muted rounded-lg p-1">
          <button
            onClick={() => setTab("builder")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              tab === "builder"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calculator className="h-3.5 w-3.5" />
            Редактор
          </button>
          <button
            onClick={() => setTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              tab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Превью
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setCalculator((c) => ({ ...c, isPublic: !c.isPublic }))}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors",
              calculator.isPublic
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {calculator.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {calculator.isPublic ? "Публичный" : "Приватный"}
          </button>

          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copyPlayerLink}>
            <Copy className="h-3.5 w-3.5" />
            Ссылка
          </Button>

          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => window.open(playerUrl, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" />
            Открыть
          </Button>

          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            {saved ? "Сохранено ✓" : "Сохранить"}
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left settings panel — fixed width, full remaining height */}
        <aside
          className="w-80 shrink-0 border-r bg-card flex flex-col overflow-hidden"
        >
          <FieldSettingsPanel
            field={selectedField}
            allFields={calculator.fields}
            onChange={updateSelectedField}
            onDelete={deleteSelectedField}
          />
        </aside>

        {/* Canvas / preview — scrollable */}
        <main className="flex-1 overflow-y-auto">
          {tab === "builder" ? (
            <div className="p-6 space-y-4 max-w-5xl">
              <Input
                value={calculator.description ?? ""}
                onChange={(e) => setCalculator((c) => ({ ...c, description: e.target.value }))}
                placeholder="Описание (необязательно)"
                className="text-sm max-w-xl"
              />
              <BuilderCanvas
                calculator={calculator}
                onChange={setCalculator}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
              />
            </div>
          ) : (
            <div className="p-6 max-w-2xl">
              <div className="border rounded-xl p-6 bg-card shadow-sm">
                <h3 className="text-lg font-bold mb-1">{calculator.title}</h3>
                {calculator.description && (
                  <p className="text-sm text-muted-foreground mb-4">{calculator.description}</p>
                )}
                <BuilderPreview calculator={calculator} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
