import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";
import type { CustomCalculator } from "@/types/custom-calc";

interface Props {
  calc: CustomCalculator | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function getBaseUrl() {
  return window.location.origin;
}

function generateScriptCode(calc: CustomCalculator): string {
  const base = getBaseUrl();
  return `<div class="calchub_${calc.id}"></div>
<script>
  var widgetOptions_${calc.id.replace(/-/g, "_")} = {
    bg_color: "transparent"
  };
  (function() {
    var a = document.createElement("script"), h = "head";
    a.async = true;
    a.src = (document.location.protocol == "https:" ? "https:" : "http:") +
      "://${window.location.host}/widget.js?id=${calc.id}&t=" + Math.floor(new Date() / 18e5);
    document.getElementsByTagName(h)[0].appendChild(a);
  })();
</script>`;
}

function generateIframeCode(calc: CustomCalculator): string {
  const base = getBaseUrl();
  return `<iframe
  src="${base}/c/${calc.slug}"
  width="100%"
  height="600"
  style="border:none; border-radius:12px; overflow:hidden;"
  title="${calc.title}"
  loading="lazy"
  allow="clipboard-write"
></iframe>`;
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

export function EmbedCodeModal({ calc, open, onOpenChange }: Props) {
  const [tab, setTab] = useState("script");

  if (!calc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Код для встройки — {calc.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <span>Вставьте код в любое место вашего сайта.</span>
            <Badge variant="outline" className="text-xs">
              {calc.isPublic ? "Публичный" : "Приватный"}
            </Badge>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-8">
              <TabsTrigger value="script" className="text-xs h-7 px-3">
                &lt;script&gt; — рекомендуется
              </TabsTrigger>
              <TabsTrigger value="iframe" className="text-xs h-7 px-3">
                &lt;iframe&gt;
              </TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-3">
              <CodeBlock code={generateScriptCode(calc)} />
              <p className="text-xs text-muted-foreground mt-2">
                Виджет загружается асинхронно и адаптируется под размер
                контейнера.
              </p>
            </TabsContent>

            <TabsContent value="iframe" className="mt-3">
              <CodeBlock code={generateIframeCode(calc)} />
              <p className="text-xs text-muted-foreground mt-2">
                Простой способ встройки через iframe. Высоту можно изменить
                вручную.
              </p>
            </TabsContent>
          </Tabs>

          {/* Direct link */}
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium mb-1">Прямая ссылка</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
                {getBaseUrl()}/c/{calc.slug}
              </code>
              <CopyButton value={`${getBaseUrl()}/c/${calc.slug}`} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
