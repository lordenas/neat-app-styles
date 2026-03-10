import { useState } from "react";
import { Rating } from "@/components/ui/rating";
import { Label } from "@/components/ui/label";

export function RatingShowcase() {
  const [rating1, setRating1] = useState(3);
  const [rating2, setRating2] = useState(3.5);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Интерактивный ({rating1}/5)</Label>
          <Rating value={rating1} onChange={setRating1} />
        </div>
        <div className="space-y-1.5">
          <Label>Половинки ({rating2}/5)</Label>
          <Rating value={rating2} onChange={setRating2} allowHalf />
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Read-only</p>
        <div className="flex flex-wrap items-center gap-4">
          <Rating value={5} readOnly size="sm" />
          <Rating value={3.5} readOnly allowHalf />
          <Rating value={4} readOnly size="lg" />
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Размеры (sm / default / lg)</p>
        <div className="flex flex-wrap items-center gap-4">
          <Rating value={4} readOnly size="sm" />
          <Rating value={4} readOnly size="default" />
          <Rating value={4} readOnly size="lg" />
        </div>
      </div>
    </div>
  );
}
