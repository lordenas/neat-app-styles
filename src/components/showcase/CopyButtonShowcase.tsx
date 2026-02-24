import { CopyButton } from "@/components/ui/copy-button";
import { Label } from "@/components/ui/label";

export function CopyButtonShowcase() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Только иконка</Label>
        <div className="flex gap-2">
          <CopyButton value="Скопированный текст" />
          <CopyButton value="npm install react" variant="ghost" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>С текстом</Label>
        <div className="flex gap-2">
          <CopyButton value="50 109 ₽" label="Скопировать сумму" />
          <CopyButton value="https://example.com" label="Ссылка" variant="secondary" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Инлайн использование</Label>
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 max-w-md">
          <code className="flex-1 text-sm font-mono truncate">npm install @radix-ui/react-dialog</code>
          <CopyButton value="npm install @radix-ui/react-dialog" variant="ghost" />
        </div>
      </div>
    </div>
  );
}
