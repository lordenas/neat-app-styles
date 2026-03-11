import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import type { DateRange } from "react-day-picker";

export function DateRangePickerShowcase() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>DateRangePicker с пресетами</Label>
        <DateRangePicker value={range} onValueChange={setRange} />
        {range?.from && range?.to && (
          <p className="helper-text">
            Выбран период: {range.from.toLocaleDateString("ru")} — {range.to.toLocaleDateString("ru")}
          </p>
        )}
      </div>
    </div>
  );
}
