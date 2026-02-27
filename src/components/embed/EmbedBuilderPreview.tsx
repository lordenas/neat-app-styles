import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EmbedConfig } from "@/types/embed";
import { cn } from "@/lib/utils";

interface Props {
  config: EmbedConfig;
  iframeUrl: string;
}

type Device = "desktop" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  mobile: "375px",
};

export function EmbedBuilderPreview({ config, iframeUrl }: Props) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
        <span className="text-sm font-medium text-foreground">Предпросмотр</span>
        <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
          {(["desktop", "mobile"] as Device[]).map((d) => (
            <Button
              key={d}
              variant={device === d ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setDevice(d)}
              aria-label={d}
            >
              {d === "desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Browser chrome mockup */}
      <div className="bg-muted/20 p-4">
        <div
          className={cn(
            "mx-auto transition-all duration-300 rounded-xl overflow-hidden border shadow-md",
            device === "mobile" ? "max-w-[375px]" : "w-full",
          )}
          style={{
            background: config.backgroundColor,
          }}
        >
            {/* Fake browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--warning,48_96%_53%)/0.7)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success,142_71%_45%)/0.5)]" />
            <div className="flex-1 mx-2 rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground font-mono truncate">
              yoursite.com/calculators
            </div>
          </div>

          {/* Iframe placeholder */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: `${Math.min(config.height, 540)}px` }}
          >
            <iframe
              key={iframeUrl}
              src={iframeUrl}
              title="Calculator preview"
              className="w-full h-full border-0"
              style={{
                width: DEVICE_WIDTHS[device],
                height: `${config.height}px`,
                transform: device === "mobile" ? "none" : "none",
                borderRadius: `${config.borderRadius}px`,
              }}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />

            {/* Watermark for free */}
            {config.showLogo && (
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <div className="flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm border px-2 py-1 shadow-sm">
                  <span className="text-[10px] font-semibold text-primary">CalcHub</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="border-t px-4 py-2 flex items-center justify-between bg-muted/20">
        <span className="text-xs text-muted-foreground">
          {config.width} × {config.height}px
        </span>
        <span className="text-xs text-muted-foreground">
          {device === "desktop" ? "Desktop" : "Mobile 375px"}
        </span>
      </div>
    </div>
  );
}
