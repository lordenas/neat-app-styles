import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EmbedBuilderSidebar } from "@/components/embed/EmbedBuilderSidebar";
import { EmbedBuilderPreview } from "@/components/embed/EmbedBuilderPreview";
import { EmbedCodeOutput } from "@/components/embed/EmbedCodeOutput";
import { EmbedPlanBanner } from "@/components/embed/EmbedPlanBanner";
import type { EmbedConfig } from "@/types/embed";

const DEFAULT_CONFIG: EmbedConfig = {
  calculatorId: "mortgage",
  plan: "free",
  // Appearance
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: 12,
  fontFamily: "system-ui",
  // Branding
  showLogo: true,
  logoUrl: "",
  // Locale
  currency: "RUB",
  locale: "ru",
  // Dimensions
  width: "100%",
  height: 600,
  // Limits (free tier)
  monthlyRequestLimit: 100,
};

export default function EmbedBuilder() {
  const [config, setConfig] = useState<EmbedConfig>(DEFAULT_CONFIG);

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

  return (
    <>
      <Helmet>
        <title>Embed Widget Builder — CalcHub</title>
        <meta
          name="description"
          content="Настройте калькулятор для вставки на свой сайт. Выберите цвета, валюту, логотип и получите готовый код iframe."
        />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Конструктор виджета
              </h1>
              <p className="text-muted-foreground text-sm">
                Настройте калькулятор и получите готовый код для вставки на сайт
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <EmbedPlanBanner plan={config.plan} onUpgrade={() => updateConfig({ plan: "pro" })} />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-4">
              <EmbedBuilderSidebar config={config} onChange={updateConfig} />
            </aside>

            {/* Right panel: preview + code */}
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
