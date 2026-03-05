import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CustomCalculator, CalcField, CalcPage, CalcTheme, loadCalculators, saveCalculator,
} from "@/types/custom-calc";
import { BuilderCanvas } from "@/components/calc-builder/BuilderCanvas";
import { BuilderPreview } from "@/components/calc-builder/BuilderPreview";
import { FieldSettingsPanel } from "@/components/calc-builder/FieldSettingsPanel";
import { PageManager } from "@/components/calc-builder/PageManager";
import { ThemePanel } from "@/components/calc-builder/ThemePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Save, Eye, ArrowLeft, Copy, ExternalLink,
  Calculator, Globe, Lock, Layers, ChevronLeft, ChevronRight,
  Undo2, Redo2, Palette, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/useHistory";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";

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

function loadInitial(id?: string): CustomCalculator {
  if (id) {
    const found = loadCalculators().find((c) => c.id === id);
    if (found) {
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
}

export default function CalcBuilder() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    state: calculator,
    setState: setCalculator,
    setStateDirectly,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<CustomCalculator>(loadInitial(id));

  const [saved, setSaved] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [tab, setTab] = useState<"builder" | "preview">("builder");
  const [activePage, setActivePage] = useState(0);
  const [leftTab, setLeftTab] = useState<"field" | "pages" | "theme">("field");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes("Mac");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === "y") || (e.key === "z" && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo]);

  const pages = calculator.pages ?? [makeDefaultPage()];
  const activepageObj = pages[activePage];

  const handleSave = () => {
    const updated = { ...calculator, updatedAt: new Date().toISOString() };
    setStateDirectly(updated);
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
    setCalculator({
      ...calculator,
      fields: calculator.fields.map((f) => (f.id === updated.id ? updated : f)),
    });
  };

  const deleteSelectedField = () => {
    if (!selectedFieldId) return;
    setCalculator({
      ...calculator,
      fields: calculator.fields.filter((f) => f.id !== selectedFieldId),
    });
    setSelectedFieldId(null);
  };

  const handlePagesChange = (newPages: CalcPage[]) => {
    setCalculator({ ...calculator, pages: newPages });
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    const deletedId = pages[pageIndex].id;
    const prevPage = pages[pageIndex > 0 ? pageIndex - 1 : 1];
    setCalculator({
      ...calculator,
      pages: (calculator.pages ?? []).filter((_, i) => i !== pageIndex).map((p, i) => ({ ...p, orderIndex: i })),
      fields: calculator.fields.map((f) =>
        f.pageId === deletedId ? { ...f, pageId: prevPage.id } : f
      ),
    });
    setActivePage(Math.max(0, pageIndex - 1));
  };

  const fieldsForPage = calculator.fields.filter(
    (f) => (f.pageId ?? pages[0]?.id) === activepageObj?.id
  );
  const fieldsForPageCalc: CustomCalculator = {
    ...calculator,
    fields: fieldsForPage,
  };

  const handleCanvasChange = (updated: CustomCalculator) => {
    const newFields = updated.fields.map((f) =>
      !f.pageId ? { ...f, pageId: activepageObj?.id } : f
    );
    const otherPageFields = calculator.fields.filter(
      (f) => (f.pageId ?? pages[0]?.id) !== activepageObj?.id
    );
    setCalculator({
      ...calculator,
      ...updated,
      fields: [...otherPageFields, ...newFields],
    });
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
          onChange={(e) => setCalculator({ ...calculator, title: e.target.value })}
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

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={undo}
            disabled={!canUndo}
            title="Отменить (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={redo}
            disabled={!canRedo}
            title="Повторить (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setCalculator({ ...calculator, isPublic: !calculator.isPublic })}
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
        <aside className="w-96 shrink-0 border-r bg-card flex flex-col overflow-hidden">
          {/* Left panel tabs */}
          <div className="flex shrink-0 border-b">
            {(["field", "pages", "theme"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                  leftTab === t
                    ? "text-foreground border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "field" && <><Calculator className="h-3 w-3" />Поле</>}
                {t === "pages" && (
                  <>
                    <Layers className="h-3 w-3" />
                    Страницы
                    {pages.length > 1 && (
                      <span className="text-[9px] bg-primary text-primary-foreground rounded-full px-1">{pages.length}</span>
                    )}
                  </>
                )}
                {t === "theme" && <><Palette className="h-3 w-3" />Тема</>}
              </button>
            ))}
          </div>

          {leftTab === "field" && (
            <FieldSettingsPanel
              field={selectedField}
              allFields={calculator.fields}
              pages={pages}
              onChange={updateSelectedField}
              onDelete={deleteSelectedField}
            />
          )}
          {leftTab === "pages" && (
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
          {leftTab === "theme" && (
            <ThemePanel
              theme={calculator.theme ?? {}}
              onChange={(theme: CalcTheme) => setCalculator({ ...calculator, theme })}
            />
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
                onChange={(e) => setCalculator({ ...calculator, description: e.target.value })}
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
            <div className="p-6 max-w-2xl space-y-3">
              {/* Dev-only page navigation — outside the calculator card */}
              {pages.length > 1 && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setActivePage((p) => Math.max(0, p - 1))}
                      disabled={activePage === 0}
                    >
                      <ChevronLeft />
                    </Button>
                    <div className="flex items-center gap-1">
                      {pages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActivePage(i)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            i === activePage ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          )}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setActivePage((p) => Math.min(pages.length - 1, p + 1))}
                      disabled={activePage === pages.length - 1}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pages[activePage]?.title || `Страница ${activePage + 1}`} · {activePage + 1} / {pages.length}
                  </span>
                </div>
              )}

              <div className="border rounded-xl p-6 bg-card shadow-sm">
                <h3 className="text-lg font-bold mb-1">{calculator.title}</h3>
                {calculator.description && (
                  <p className="text-sm text-muted-foreground mb-4">{calculator.description}</p>
                )}
                <BuilderPreview
                  calculator={calculator}
                  currentPage={activePage}
                  onNavigatePage={(target) => {
                    if (target === "next") setActivePage((p) => Math.min(pages.length - 1, p + 1));
                    else if (target === "prev") setActivePage((p) => Math.max(0, p - 1));
                    else setActivePage(Math.max(0, Math.min(pages.length - 1, target as number)));
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
