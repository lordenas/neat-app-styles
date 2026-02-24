import { Stepper, type StepItem } from "@/components/ui/stepper";
import { Label } from "@/components/ui/label";

const stepsH: StepItem[] = [
  { label: "Данные", description: "Личная информация", status: "completed" },
  { label: "Оплата", description: "Способ оплаты", status: "active" },
  { label: "Доставка", description: "Адрес доставки", status: "upcoming" },
  { label: "Подтверждение", status: "upcoming" },
];

const stepsError: StepItem[] = [
  { label: "Загрузка", status: "completed" },
  { label: "Проверка", status: "error" },
  { label: "Публикация", status: "upcoming" },
];

export function StepperShowcase() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>Горизонтальный</Label>
        <Stepper steps={stepsH} />
      </div>
      <div className="space-y-2">
        <Label>Горизонтальный (sm) с ошибкой</Label>
        <Stepper steps={stepsError} size="sm" />
      </div>
      <div className="space-y-2">
        <Label>Вертикальный</Label>
        <Stepper steps={stepsH} orientation="vertical" />
      </div>
    </div>
  );
}
