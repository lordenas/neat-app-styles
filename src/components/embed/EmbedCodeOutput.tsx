import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import type { EmbedConfig } from "@/types/embed";

interface Props {
  config: EmbedConfig;
  iframeUrl: string;
}

function generateIframeCode(config: EmbedConfig, url: string): string {
  const w = typeof config.width === "number" ? `${config.width}px` : config.width;
  return `<iframe
  src="${url}"
  width="${w}"
  height="${config.height}"
  style="border:none; border-radius:${config.borderRadius}px; overflow:hidden;"
  title="CalcHub — ${config.calculatorId}"
  loading="lazy"
  allow="clipboard-write"
></iframe>`;
}

function generateScriptCode(config: EmbedConfig, url: string): string {
  return `<!-- CalcHub Widget -->
<div id="calchub-widget-${config.calculatorId}"></div>
<script>
  (function() {
    var el = document.getElementById('calchub-widget-${config.calculatorId}');
    var iframe = document.createElement('iframe');
    iframe.src = '${url}';
    iframe.width = '${typeof config.width === "number" ? config.width + "px" : config.width}';
    iframe.height = '${config.height}';
    iframe.style.cssText = 'border:none;border-radius:${config.borderRadius}px;overflow:hidden;';
    iframe.title = 'CalcHub — ${config.calculatorId}';
    iframe.loading = 'lazy';
    el.appendChild(iframe);
  })();
</script>`;
}

export function EmbedCodeOutput({ config, iframeUrl }: Props) {
  const [activeTab, setActiveTab] = useState("iframe");

  const iframeCode = generateIframeCode(config, iframeUrl);
  const scriptCode = generateScriptCode(config, iframeUrl);
  const isPro = config.plan === "pro";

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
        <span className="text-sm font-medium">Код для вставки</span>
        {!isPro && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>100 запросов / мес · Free</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 h-8">
            <TabsTrigger value="iframe" className="text-xs h-7 px-3">
              &lt;iframe&gt;
            </TabsTrigger>
            <TabsTrigger value="script" className="text-xs h-7 px-3">
              &lt;script&gt;
            </TabsTrigger>
            <TabsTrigger value="react" className="text-xs h-7 px-3 flex items-center gap-1" disabled={!isPro}>
              React
              {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-0">
            <CodeBlock code={iframeCode} />
          </TabsContent>
          <TabsContent value="script" className="mt-0">
            <CodeBlock code={scriptCode} />
          </TabsContent>
          <TabsContent value="react" className="mt-0">
            <CodeBlock code={`// Pro plan required`} />
          </TabsContent>
        </Tabs>

        {/* Free plan limits info */}
        {!isPro && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Free план</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                  100 встраиваний в месяц · логотип CalcHub · стандартные цвета
                </p>
              </div>
              <Button size="sm" variant="default" className="h-7 text-xs shrink-0">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg border bg-muted/50">
      <div className="absolute right-2 top-2 z-10">
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 pr-12 text-xs leading-relaxed font-mono text-foreground whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}
