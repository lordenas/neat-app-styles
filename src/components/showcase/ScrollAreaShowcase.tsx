import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const tags = Array.from({ length: 20 }, (_, i) => `Тег ${i + 1}`);
const items = Array.from({ length: 30 }, (_, i) => `Элемент списка ${i + 1}`);

export function ScrollAreaShowcase() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Vertical */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Вертикальная прокрутка (h-48)</p>
          <ScrollArea className="h-48 rounded-md border">
            <div className="p-4">
              {items.map((item, i) => (
                <div key={i}>
                  <p className="text-sm">{item}</p>
                  {i < items.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Inside card */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Внутри карточки с фиксированной высотой</p>
          <div className="rounded-md border bg-card p-4">
            <p className="text-sm font-medium mb-2">Уведомления</p>
            <ScrollArea className="h-36">
              <div className="space-y-2 pr-3">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground">Уведомление #{i + 1} — новое событие</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Horizontal */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Горизонтальная прокрутка</p>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex gap-2 p-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="shrink-0">
                {tag}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
