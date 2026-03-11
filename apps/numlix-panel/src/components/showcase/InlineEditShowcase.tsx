import { useState } from "react";
import { InlineEdit } from "@/components/ui/inline-edit";

export function InlineEditShowcase() {
  const [name, setName] = useState("Иванов Иван");
  const [title, setTitle] = useState("Разработчик");
  const [empty, setEmpty] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Имя сотрудника</p>
          <InlineEdit value={name} onSave={setName} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Должность</p>
          <InlineEdit value={title} onSave={setTitle} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Пустое значение</p>
          <InlineEdit value={empty} onSave={setEmpty} placeholder="Не указано" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Disabled</p>
          <InlineEdit value="Нельзя редактировать" onSave={() => {}} disabled />
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Поле</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Значение (кликните для редактирования)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 text-muted-foreground">ФИО</td>
              <td className="px-3 py-1"><InlineEdit value={name} onSave={setName} inputSize="sm" /></td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 text-muted-foreground">Должность</td>
              <td className="px-3 py-1"><InlineEdit value={title} onSave={setTitle} inputSize="sm" /></td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-muted-foreground">Описание</td>
              <td className="px-3 py-1"><InlineEdit value={empty} onSave={setEmpty} placeholder="Добавить..." inputSize="sm" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="helper-text">
        Клик → поле ввода. <kbd className="px-1 py-0.5 bg-muted rounded border text-xs font-mono">Enter</kbd> — сохранить,{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded border text-xs font-mono">Esc</kbd> — отменить.
      </p>
    </div>
  );
}
