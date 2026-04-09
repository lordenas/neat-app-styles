import { CalcPage, CalcField, VisibilityConfig } from "@/types/custom-calc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConditionEditor } from "./ConditionEditor";
import { PageRoutesEditor } from "./PageRoutesEditor";
import {
  Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Zap, GitBranch,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { uuid } from "@/lib/uuid";

interface PageManagerProps {
  pages: CalcPage[];
  fields: CalcField[];
  activePage: number;
  onPagesChange: (pages: CalcPage[]) => void;
  onActivePage: (index: number) => void;
  onDeletePage: (pageIndex: number) => void;
}

export function PageManager({
  pages, fields, activePage, onPagesChange, onActivePage, onDeletePage,
}: PageManagerProps) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  // Track which sub-section is open per page: "auto" | "routes"
  const [openSection, setOpenSection] = useState<Record<string, "auto" | "routes" | null>>({});

  const toggleSection = (pageId: string, section: "auto" | "routes") => {
    setOpenSection((prev) => ({
      ...prev,
      [pageId]: prev[pageId] === section ? null : section,
    }));
  };

  const addPage = () => {
    const newPage: CalcPage = {
      id: uuid(),
      title: `Страница ${pages.length + 1}`,
      orderIndex: pages.length,
      autoAdvance: null,
      routes: [],
    };
    onPagesChange([...pages, newPage]);
    onActivePage(pages.length);
  };

  const updatePage = (id: string, partial: Partial<CalcPage>) => {
    onPagesChange(pages.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  };

  const fieldCount = (pageId: string) =>
    fields.filter((f) => f.pageId === pageId || (!f.pageId && pageId === pages[0]?.id)).length;

  return (
    <div className="space-y-1">
      {pages.map((page, idx) => {
        const isActive = idx === activePage;
        const isExpanded = expandedPage === page.id;
        const hasAutoAdvance = (page.autoAdvance?.rules?.length ?? 0) > 0;
        const hasRoutes = (page.routes?.length ?? 0) > 0;
        const count = fieldCount(page.id);
        const activeSection = openSection[page.id] ?? null;

        return (
          <div key={page.id}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground"
              )}
              onClick={() => onActivePage(idx)}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-50 shrink-0" />

              <span className={cn(
                "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {idx + 1}
              </span>

              <span className="flex-1 text-xs font-medium truncate">
                {page.title || `Страница ${idx + 1}`}
              </span>

              {hasAutoAdvance && (
                <Zap className="h-3 w-3 text-foreground opacity-60 shrink-0" />
              )}
              {hasRoutes && (
                <GitBranch className="h-3 w-3 text-primary/70 shrink-0" />
              )}

              <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                {count}
              </Badge>

              <button
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded hover:text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedPage(isExpanded ? null : page.id);
                }}
              >
                {isExpanded
                  ? <ChevronDown className="h-3 w-3" />
                  : <ChevronRight className="h-3 w-3" />}
              </button>

              {pages.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(idx);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Expanded settings */}
            {isExpanded && (
              <div className="ml-7 mr-1 mb-2 space-y-3 border-l-2 border-border pl-3 pt-2">
                {/* Page title */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Название страницы
                  </Label>
                  <Input
                    inputSize="sm"
                    value={page.title ?? ""}
                    onChange={(e) => updatePage(page.id, { title: e.target.value })}
                    placeholder={`Страница ${idx + 1}`}
                  />
                </div>

                {/* ── Auto-advance ── */}
                <div className="space-y-1.5">
                  <button
                    className="flex items-center gap-2 w-full text-left"
                    onClick={() => toggleSection(page.id, "auto")}
                  >
                    <div className="flex items-center gap-1.5 flex-1">
                      <Zap className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Авто-переход на следующую</span>
                      {hasAutoAdvance && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {page.autoAdvance!.rules.length} усл.
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      activeSection === "auto" && "rotate-180"
                    )} />
                  </button>

                  {activeSection === "auto" && (
                    <div className="pt-1 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasAutoAdvance}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updatePage(page.id, { autoAdvance: { rules: [], logic: "AND" } });
                            } else {
                              updatePage(page.id, { autoAdvance: null });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-muted-foreground">Включить авто-переход</span>
                      </label>
                      {hasAutoAdvance && (
                        <>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            При выполнении условий — автоматически перейти на <strong>следующую</strong> страницу.
                          </p>
                          <ConditionEditor
                            visibility={page.autoAdvance ?? null}
                            onChange={(v: VisibilityConfig | null) => updatePage(page.id, { autoAdvance: v })}
                            otherFields={fields}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Conditional routes ── */}
                <div className="space-y-1.5">
                  <button
                    className="flex items-center gap-2 w-full text-left"
                    onClick={() => toggleSection(page.id, "routes")}
                  >
                    <div className="flex items-center gap-1.5 flex-1">
                      <GitBranch className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Переходы на страницу</span>
                      {hasRoutes && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {page.routes!.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      activeSection === "routes" && "rotate-180"
                    )} />
                  </button>

                  {activeSection === "routes" && (
                    <div className="pt-1 space-y-2">
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        Если условие выполнено — перейти на выбранную страницу. Проверяются сверху вниз, первое совпадение wins.
                      </p>
                      <PageRoutesEditor
                        page={page}
                        pages={pages}
                        fields={fields}
                        onChange={(routes) => updatePage(page.id, { routes })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="w-full h-7 text-xs gap-1.5 text-muted-foreground justify-start"
        onClick={addPage}
      >
        <Plus className="h-3.5 w-3.5" />
        Добавить страницу
      </Button>
    </div>
  );
}
