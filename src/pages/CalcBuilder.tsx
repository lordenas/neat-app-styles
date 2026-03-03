import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CustomCalculator, loadCalculators, saveCalculator, deleteCalculator,
} from "@/types/custom-calc";
import { BuilderCanvas } from "@/components/calc-builder/BuilderCanvas";
import { BuilderPreview } from "@/components/calc-builder/BuilderPreview";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save, Eye, Trash2, Plus, ArrowLeft, Copy, ExternalLink,
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
  const [listOpen, setListOpen] = useState(false);
  const [calcList, setCalcList] = useState<CustomCalculator[]>([]);

  useEffect(() => {
    setCalcList(loadCalculators());
  }, []);

  const handleSave = () => {
    const updated = { ...calculator, updatedAt: new Date().toISOString() };
    setCalculator(updated);
    saveCalculator(updated);
    setCalcList(loadCalculators());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({ title: "Сохранено", description: `Калькулятор «${updated.title}» сохранён локально.` });
  };

  const handleDelete = (calcId: string) => {
    deleteCalculator(calcId);
    setCalcList(loadCalculators());
    if (calcId === calculator.id) {
      navigate("/calc-builder");
      setCalculator(makeNew());
    }
    toast({ title: "Удалено" });
  };

  const handleNew = () => {
    navigate("/calc-builder");
    setCalculator(makeNew());
  };

  const handleOpen = (calc: CustomCalculator) => {
    setCalculator(calc);
    navigate(`/calc-builder/${calc.id}`);
    setListOpen(false);
  };

  const copyPlayerLink = () => {
    const url = `${window.location.origin}/c/${calculator.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Ссылка скопирована", description: url });
  };

  const playerUrl = `/c/${calculator.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Top bar */}
      <div className="border-b bg-card sticky top-[57px] z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Назад
          </Button>

          <Separator orientation="vertical" className="h-5" />

          {/* Title */}
          <Input
            value={calculator.title}
            onChange={(e) => setCalculator((c) => ({ ...c, title: e.target.value }))}
            className="h-8 text-sm font-medium border-0 shadow-none bg-transparent focus-visible:ring-0 w-64 px-1"
            placeholder="Название калькулятора"
          />

          <div className="ml-auto flex items-center gap-2">
            {/* Public toggle */}
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

            {/* Copy link */}
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copyPlayerLink}>
              <Copy className="h-3.5 w-3.5" />
              Ссылка
            </Button>

            {/* Open player */}
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => window.open(playerUrl, "_blank")}>
              <ExternalLink className="h-3.5 w-3.5" />
              Открыть
            </Button>

            <Button size="sm" className="gap-1.5" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              {saved ? "Сохранено ✓" : "Сохранить"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        {/* Sidebar — calculator list */}
        <aside className="w-60 border-r bg-card hidden md:flex flex-col py-4 px-3 gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Калькуляторы</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNew}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {calcList.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-3">Нет сохранённых калькуляторов</p>
            ) : (
              calcList.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
                    c.id === calculator.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleOpen(c)}
                >
                  <Calculator className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate text-xs">{c.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full" onClick={handleNew}>
            <Plus className="h-3.5 w-3.5" />
            Новый
          </Button>
        </aside>

        {/* Main area */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Tabs defaultValue="builder" className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="builder" className="gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Редактор
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Превью
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4 mt-0">
              <Input
                value={calculator.description ?? ""}
                onChange={(e) => setCalculator((c) => ({ ...c, description: e.target.value }))}
                placeholder="Описание (необязательно)"
                className="text-sm"
              />
              <BuilderCanvas calculator={calculator} onChange={setCalculator} />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 bg-card shadow-sm">
                <h3 className="text-lg font-bold mb-1">{calculator.title}</h3>
                {calculator.description && (
                  <p className="text-sm text-muted-foreground mb-4">{calculator.description}</p>
                )}
                <BuilderPreview calculator={calculator} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
