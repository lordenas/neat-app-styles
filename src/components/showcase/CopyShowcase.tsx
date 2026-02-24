import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      icon={copied ? <Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
      aria-label={copied ? "Скопировано" : `Копировать ${label ?? ""}`}
    >
      {copied ? "Скопировано" : (label ?? "Копировать")}
    </Button>
  );
}

function CopyInline({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 max-w-md">
      <code className="flex-1 text-sm font-mono truncate">{text}</code>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "shrink-0 p-1.5 rounded-md transition-colors",
          copied
            ? "text-[hsl(var(--success))]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label={copied ? "Скопировано" : "Копировать"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function CopyShowcase() {
  return (
    <div className="space-y-6">
      {/* Button variant */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Кнопка</p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text="50 109 ₽" label="платёж" />
          <CopyButton text="https://example.com/credit-calculator" label="ссылку" />
        </div>
      </div>

      {/* Inline variant */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Строка с копированием</p>
        <div className="space-y-2">
          <CopyInline text="npm install @radix-ui/react-accordion" />
          <CopyInline text="https://neat-app-styles.lovable.app/credit-calculator" />
        </div>
      </div>
    </div>
  );
}
