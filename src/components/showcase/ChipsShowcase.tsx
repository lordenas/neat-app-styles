import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const allChips = ["React", "TypeScript", "Tailwind", "shadcn/ui", "Vite", "Node.js", "PostgreSQL", "Docker"];

export function ChipsShowcase() {
  const [selected, setSelected] = useState<string[]>(["React", "TypeScript", "Tailwind"]);

  const remove = (chip: string) => setSelected((prev) => prev.filter((c) => c !== chip));
  const add = (chip: string) => setSelected((prev) => [...prev, chip]);

  const available = allChips.filter((c) => !selected.includes(c));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Варианты Badge/Chip</p>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Выбранные (удаляемые)</p>
        <div className="flex flex-wrap gap-2">
          {selected.map((chip) => (
            <Badge
              key={chip}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/60 transition-colors"
              onClick={() => remove(chip)}
            >
              {chip}
              <X className="h-3 w-3" />
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
