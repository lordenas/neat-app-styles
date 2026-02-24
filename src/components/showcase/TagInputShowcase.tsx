import { useState } from "react";
import { TagInput } from "@/components/ui/tag-input";
import { Label } from "@/components/ui/label";

export function TagInputShowcase() {
  const [tags1, setTags1] = useState(["React", "TypeScript"]);
  const [tags2, setTags2] = useState(["frontend"]);
  const [tags3, setTags3] = useState<string[]>([]);

  return (
    <div className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label>Навыки</Label>
        <TagInput value={tags1} onChange={setTags1} placeholder="Добавить навык..." />
      </div>

      <div className="space-y-1.5">
        <Label>Категории (макс. 3)</Label>
        <TagInput value={tags2} onChange={setTags2} max={3} placeholder="Добавить категорию..." />
      </div>

      <div className="space-y-1.5">
        <Label>С ошибкой</Label>
        <TagInput
          id="tags-err"
          value={tags3}
          onChange={setTags3}
          error={tags3.length === 0 ? "Добавьте хотя бы один тег" : ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Disabled</Label>
        <TagInput value={["React", "Tailwind"]} onChange={() => {}} disabled />
      </div>
    </div>
  );
}
