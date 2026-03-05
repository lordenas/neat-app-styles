import { Helmet } from "react-helmet-async";
import { HelpLayout } from "./HelpLayout";

export default function HelpPages() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Многостраничность — База знаний CalcHub</title>
      </Helmet>

      <div className="space-y-8 max-w-2xl">
        <div>
          <p className="text-xs text-muted-foreground mb-1">База знаний → Конструктор</p>
          <h1 className="text-2xl font-bold mb-2">Многостраничные калькуляторы</h1>
          <p className="text-muted-foreground text-sm">
            Разбейте большой калькулятор на несколько шагов. Пользователь заполняет данные постепенно — это повышает конверсию.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Как добавить страницу</h2>
          <ol className="space-y-3 text-sm">
            {[
              "Откройте конструктор и перейдите в раздел «Страницы» (кнопка вверху панели).",
              "Нажмите «+ Добавить страницу» — появится новая пустая страница.",
              "Перетащите нужные поля на каждую страницу или добавляйте их прямо туда.",
              "На последней странице разместите поле «Результат».",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Кнопки навигации</h2>
          <p className="text-sm text-muted-foreground">
            Добавьте поле <strong className="text-foreground">Кнопка</strong> на каждую страницу. В настройках кнопки выберите действие:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Следующая страница", desc: "Автоматически переходит к следующей по порядку странице" },
              { label: "Предыдущая страница", desc: "Возвращает на предыдущую страницу" },
              { label: "Перейти на страницу", desc: "Переход на конкретную страницу по условию" },
              { label: "Сбросить", desc: "Сбрасывает все значения полей и возвращает на первую страницу" },
            ].map(({ label, desc }) => (
              <div key={label} className="border border-border rounded-lg p-3">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Условные переходы</h2>
          <p className="text-sm text-muted-foreground">
            В настройках страницы можно задать условие перехода — калькулятор перейдёт на указанную страницу, если условие выполнено. Это позволяет создавать «ветвящиеся» сценарии.
          </p>
          <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Пример</p>
            <p>Если <code className="font-mono bg-background px-1 rounded text-xs">{"{тип_кредита}"}</code> == 1 → перейти на страницу «Ипотека»</p>
            <p>Если <code className="font-mono bg-background px-1 rounded text-xs">{"{тип_кредита}"}</code> == 2 → перейти на страницу «Потребительский»</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Прогресс-бар</h2>
          <p className="text-sm text-muted-foreground">
            Прогресс-бар и точки-индикаторы отображаются автоматически при наличии 2 и более страниц. Настроить их внешний вид можно в разделе «Тема».
          </p>
        </section>
      </div>
    </HelpLayout>
  );
}
