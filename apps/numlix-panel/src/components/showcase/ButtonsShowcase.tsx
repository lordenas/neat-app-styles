import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Plus, Trash2, Download, Search, Settings, ArrowRight, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export function ButtonsShowcase() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Варианты</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Размеры (size)</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon-sm"><Settings /></Button>
          <Button size="icon"><Settings /></Button>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">С иконками (icon prop)</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Plus />}>Добавить</Button>
          <Button icon={<Download />} variant="outline">Скачать</Button>
          <Button icon={<Trash2 />} variant="destructive" size="sm">Удалить</Button>
          <Button icon={<Search />} variant="secondary">Поиск</Button>
          <Button variant="outline">
            Далее <ArrowRight />
          </Button>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Состояния</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button disabled variant="secondary">Disabled</Button>
          <Button loading>Загрузка...</Button>
          <Button loading variant="outline">Сохранение</Button>
          <Button loading variant="secondary" size="sm">SM loading</Button>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">ButtonGroup</p>
        <div className="flex flex-wrap items-center gap-4">
          <ButtonGroup>
            <Button variant="outline">Левая</Button>
            <Button variant="outline">Центр</Button>
            <Button variant="outline">Правая</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon-sm"><Bold /></Button>
            <Button variant="outline" size="icon-sm"><Italic /></Button>
            <Button variant="outline" size="icon-sm"><Underline /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon-sm"><AlignLeft /></Button>
            <Button variant="outline" size="icon-sm"><AlignCenter /></Button>
            <Button variant="outline" size="icon-sm"><AlignRight /></Button>
          </ButtonGroup>
        </div>
        <div className="flex flex-wrap items-start gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Вертикальная</p>
            <ButtonGroup orientation="vertical">
              <Button variant="outline" size="sm">Верх</Button>
              <Button variant="outline" size="sm">Центр</Button>
              <Button variant="outline" size="sm">Низ</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
