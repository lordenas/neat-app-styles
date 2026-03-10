import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { Label } from "@/components/ui/label";
import { Package, CreditCard, Truck, CheckCircle } from "lucide-react";

const items: TimelineItem[] = [
  { title: "Заказ создан", description: "Заказ #12345 оформлен", time: "10:00", icon: <Package /> },
  { title: "Оплата получена", description: "Visa •••• 4242", time: "10:05", icon: <CreditCard /> },
  { title: "Передан в доставку", time: "14:30", icon: <Truck /> },
  { title: "Доставлен", description: "Получен клиентом", time: "16:45", icon: <CheckCircle /> },
];

export function TimelineShowcase() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>Default</Label>
        <Timeline items={items} />
      </div>
      <div className="space-y-2">
        <Label>Compact</Label>
        <Timeline items={items} variant="compact" />
      </div>
      <div className="space-y-2">
        <Label>Alternate (зигзаг)</Label>
        <Timeline items={items} variant="alternate" />
      </div>
    </div>
  );
}
