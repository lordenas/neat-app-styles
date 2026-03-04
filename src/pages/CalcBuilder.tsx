import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CustomCalculator, CalcField, CalcPage, loadCalculators, saveCalculator,
} from "@/types/custom-calc";
import { BuilderCanvas } from "@/components/calc-builder/BuilderCanvas";
import { BuilderPreview } from "@/components/calc-builder/BuilderPreview";
import { FieldSettingsPanel } from "@/components/calc-builder/FieldSettingsPanel";
import { PageManager } from "@/components/calc-builder/PageManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Save, Eye, ArrowLeft, Copy, ExternalLink,
  Calculator, Globe, Lock, Layers, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function nanoid(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function makeDefaultPage(): CalcPage {
  return { id: nanoid(12), title: "Страница 1", orderIndex: 0, autoAdvance: null };
}

function makeNew(): CustomCalculator {
  const firstPage = makeDefaultPage();
  return {
    id: nanoid(16),
    slug: nanoid(8),
    title: "Новый калькулятор",
    description: "",
    pages: [firstPage],
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
      if (found) {
        // Migrate legacy calculators without pages
        if (!found.pages || found.pages.length === 0) {
          const firstPage = makeDefaultPage();
          return {
            ...found,
            pages: [firstPage],
            fields: found.fields.map((f) => ({ ...f, pageId: firstPage.id })),
          };
        }
        return found;
      }
    }
    return makeNew();
  });

  const [saved, setSaved] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [tab, setTab] = useState<"builder" | "preview">("builder");
  const [activePage, setActivePage] = useState(0);
  const [leftTab, setLeftTab] = useState<"field" | "pages">("field");

  const pages = calculator.pages ?? [makeDefaultPage()];
  const activepageObj = pages[activePage];

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

  // Page management
  const handlePagesChange = (newPages: CalcPage[]) => {
    setCalculator((c) => ({ ...c, pages: newPages }));
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    const deletedId = pages[pageIndex].id;
    const prevPage = pages[pageIndex > 0 ? pageIndex - 1 : 1];
    setCalculator((c) => ({
      ...c,
      pages: (c.pages ?? []).filter((_, i) => i !== pageIndex).map((p, i) => ({ ...p, orderIndex: i })),
      // Move fields from deleted page to the adjacent page
      fields: c.fields.map((f) =>
        f.pageId === deletedId ? { ...f, pageId: prevPage.id } : f
      ),
    }));
    setActivePage(Math.max(0, pageIndex - 1));
  };

  // Fields for current page only (in the canvas)
  const fieldsForPage = calculator.fields.filter(
    (f) => (f.pageId ?? pages[0]?.id) === activepageObj?.id
  );
  const fieldsForPageCalc: CustomCalculator = {
    ...calculator,
    fields: fieldsForPage,
  };

  const handleCanvasChange = (updated: CustomCalculator) => {
    // Assign pageId to new fields (those without pageId or with old page)
    const newFields = updated.fields.map((f) =>
      !f.pageId ? { ...f, pageId: activepageObj?.id } : f
    );
    // Merge: keep fields from other pages + updated page fields
    const otherPageFields = calculator.fields.filter(
      (f) => (f.pageId ?? pages[0]?.id) !== activepageObj?.id
    );
    setCalculator((c) => ({
      ...c,
      ...updated,
      fields: [...otherPageFields, ...newFields],
    }));
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

        {/* Left panel — field settings + pages */}
        <aside className="w-80 shrink-0 border-r bg-card flex flex-col overflow-hidden">
          {/* Left panel tabs */}
          <div className="flex shrink-0 border-b">
            <button
              onClick={() => setLeftTab("field")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                leftTab === "field"
                  ? "text-foreground border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calculator className="h-3.5 w-3.5" />
              Поле
            </button>
            <button
              onClick={() => setLeftTab("pages")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
                leftTab === "pages"
                  ? "text-foreground border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Страницы
              {pages.length > 1 && (
                <span className="ml-0.5 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0">{pages.length}</span>
              )}
            </button>
          </div>

          {leftTab === "field" ? (
            <FieldSettingsPanel
              field={selectedField}
              allFields={calculator.fields}
              pages={pages}
              onChange={updateSelectedField}
              onDelete={deleteSelectedField}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <PageManager
                pages={pages}
                fields={calculator.fields}
                activePage={activePage}
                onPagesChange={handlePagesChange}
                onActivePage={(idx) => {
                  setActivePage(idx);
                  setSelectedFieldId(null);
                }}
                onDeletePage={handleDeletePage}
              />
            </div>
          )}
        </aside>

        {/* Canvas / preview — scrollable */}
        <main className="flex-1 overflow-y-auto">
          {tab === "builder" ? (
            <div className="p-6 space-y-4 max-w-5xl">
              {/* Page indicator */}
              {pages.length > 1 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {pages.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setActivePage(i)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          i === activePage
                            ? "w-6 bg-primary"
                            : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activepageObj?.title || `Страница ${activePage + 1}`} ({activePage + 1} / {pages.length})
                  </span>
                </div>
              )}

              <Input
                value={calculator.description ?? ""}
                onChange={(e) => setCalculator((c) => ({ ...c, description: e.target.value }))}
                placeholder="Описание (необязательно)"
                className="text-sm max-w-xl"
              />
              <BuilderCanvas
                calculator={fieldsForPageCalc}
                onChange={handleCanvasChange}
                selectedFieldId={selectedFieldId}
                onSelectField={(fid) => {
                  setSelectedFieldId(fid);
                  if (fid) setLeftTab("field");
                }}
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
