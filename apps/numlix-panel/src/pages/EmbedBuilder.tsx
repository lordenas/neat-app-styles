import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EmbedBuilderSidebar } from "@/components/embed/EmbedBuilderSidebar";
import { EmbedBuilderPreview } from "@/components/embed/EmbedBuilderPreview";
import { EmbedCodeOutput } from "@/components/embed/EmbedCodeOutput";
import { EmbedPlanBanner } from "@/components/embed/EmbedPlanBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useEmbedWidgets } from "@/hooks/useEmbedWidgets";
import { Save, LogIn, Loader2 } from "lucide-react";
import type { EmbedConfig } from "@/types/embed";

const DEFAULT_CONFIG: EmbedConfig = {
  calculatorId: "mortgage",
  plan: "free",
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: 12,
  fontFamily: "system-ui",
  showLogo: true,
  logoUrl: "",
  currency: "RUB",
  locale: "ru",
  width: "100%",
  height: 600,
  monthlyRequestLimit: 100,
};

export default function EmbedBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { widgets, saveWidget } = useEmbedWidgets();

  const widgetId = searchParams.get("widgetId");

  const [config, setConfig] = useState<EmbedConfig>(DEFAULT_CONFIG);
  const [widgetName, setWidgetName] = useState("Мой виджет");
  const [saving, setSaving] = useState(false);
  const [currentWidgetId, setCurrentWidgetId] = useState<string | undefined>(widgetId ?? undefined);

  // Load existing widget when editing
  useEffect(() => {
    if (widgetId && widgets.length > 0) {
      const found = widgets.find((w) => w.id === widgetId);
      if (found) {
        setConfig(found.config);
        setWidgetName(found.name);
        setCurrentWidgetId(found.id);
      }
    }
  }, [widgetId, widgets]);

  const updateConfig = (patch: Partial<EmbedConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const iframeUrl = useMemo(() => {
    const base = `${window.location.origin}/${config.calculatorId}`;
    const params = new URLSearchParams({
      embed: "1",
      primaryColor: config.primaryColor,
      bgColor: config.backgroundColor,
      textColor: config.textColor,
      radius: String(config.borderRadius),
      currency: config.currency,
      locale: config.locale,
      showLogo: String(config.showLogo),
      ...(config.logoUrl ? { logoUrl: config.logoUrl } : {}),
    });
    return `${base}?${params.toString()}`;
  }, [config]);

  const handleSave = async () => {
    if (!user) { navigate("/auth"); return; }
    setSaving(true);
    const result = await saveWidget(widgetName, config, currentWidgetId);
    if (result && !currentWidgetId) {
      setCurrentWidgetId(result.id);
      navigate(`/embed-builder?widgetId=${result.id}`, { replace: true });
    }
    setSaving(false);
  };

  return (
    <>
      <Helmet>
        <title>Конструктор виджета — CalcHub</title>
        <meta name="description" content="Настройте калькулятор для вставки на свой сайт. Выберите цвета, валюту, логотип и получите готовый код iframe." />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        {/* Page header */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Конструктор виджета</h1>
                <p className="text-muted-foreground text-sm">Настройте калькулятор и получите готовый код для вставки</p>
              </div>

              {/* Name + Save */}
              <div className="flex items-center gap-2">
                <div className="space-y-0">
                  <Label className="sr-only">Название виджета</Label>
                  <Input
                    inputSize="sm"
                    value={widgetName}
                    onChange={(e) => setWidgetName(e.target.value)}
                    placeholder="Название виджета"
                    className="w-44"
                  />
                </div>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 shrink-0">
                  {saving
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : user
                    ? <Save className="h-3.5 w-3.5" />
                    : <LogIn className="h-3.5 w-3.5" />}
                  {currentWidgetId ? "Обновить" : "Сохранить"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <EmbedPlanBanner plan={config.plan} onUpgrade={() => updateConfig({ plan: "pro" })} />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            <aside>
              <EmbedBuilderSidebar config={config} onChange={updateConfig} />
            </aside>
            <div className="space-y-6">
              <EmbedBuilderPreview config={config} iframeUrl={iframeUrl} />
              <EmbedCodeOutput config={config} iframeUrl={iframeUrl} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
