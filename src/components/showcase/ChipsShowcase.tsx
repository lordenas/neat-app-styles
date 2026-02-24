import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Shield } from "lucide-react";

const allChips = ["React", "TypeScript", "Tailwind", "shadcn/ui", "Vite", "Node.js", "PostgreSQL", "Docker"];

export function ChipsShowcase() {
  const [selected, setSelected] = useState<string[]>(["React", "TypeScript", "Tailwind"]);

  const remove = (chip: string) => setSelected((prev) => prev.filter((c) => c !== chip));
  const add = (chip: string) => setSelected((prev) => [...prev, chip]);

  const available = allChips.filter((c) => !selected.includes(c));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Размеры (size)</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="default">Default</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Варианты Badge/Chip</p>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Размеры × варианты</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" variant="success" icon={<Shield />}>SM Success</Badge>
          <Badge size="default" variant="warning" icon={<Zap />}>Default Warning</Badge>
          <Badge size="lg" variant="info" icon={<Star />}>LG Info</Badge>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">С иконкой (icon)</p>
        <div className="flex flex-wrap gap-2">
          <Badge icon={<Star />}>Избранное</Badge>
          <Badge variant="warning" icon={<Zap />}>Быстрый</Badge>
          <Badge variant="success" icon={<Shield />}>Защищён</Badge>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Удаляемые (onDismiss)</p>
        <div className="flex flex-wrap gap-2">
          {selected.map((chip) => (
            <Badge
              key={chip}
              variant="secondary"
              onDismiss={() => remove(chip)}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>

      {available.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Доступные</p>
          <div className="flex flex-wrap gap-2">
            {available.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => add(chip)}
              >
                + {chip}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
