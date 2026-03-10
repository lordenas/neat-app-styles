import { Helmet } from "react-helmet-async";
import { HelpLayout } from "./HelpLayout";

export default function HelpLogic() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Условная логика — База знаний CalcHub</title>
      </Helmet>

      <div className="space-y-8 max-w-2xl">
        <div>
          <p className="text-xs text-muted-foreground mb-1">База знаний → Конструктор</p>
          <h1 className="text-2xl font-bold mb-2">Условная логика</h1>
          <p className="text-muted-foreground text-sm">
            Показывайте и скрывайте поля динамически в зависимости от значений других полей.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Как настроить</h2>
          <ol className="space-y-3 text-sm">
            {[
              "Выберите поле, которое нужно скрывать/показывать.",
              "В правой панели настроек найдите раздел «Условие видимости».",
              "Выберите поле-триггер, оператор и значение.",
              "Поле будет автоматически скрываться, если условие не выполняется.",
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
          <h2 className="text-lg font-semibold">Операторы условий</h2>
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
            {[
              { op: "==", name: "Равно", ex: "тип == 1" },
              { op: "!=", name: "Не равно", ex: "тип != 0" },
              { op: ">", name: "Больше", ex: "возраст > 18" },
              { op: "<", name: "Меньше", ex: "сумма < 1000000" },
              { op: ">=", name: "Больше или равно", ex: "срок >= 12" },
              { op: "<=", name: "Меньше или равно", ex: "ставка <= 20" },
            ].map(({ op, name, ex }) => (
              <div key={op} className="flex items-center gap-4 px-4 py-2.5">
                <code className="font-mono text-sm text-violet-500 w-8 shrink-0">{op}</code>
                <span className="text-sm flex-1">{name}</span>
                <code className="font-mono text-xs text-muted-foreground">{ex}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Пример сценария</h2>
          <div className="bg-muted rounded-lg p-4 space-y-3 text-sm">
            <div>
              <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">Ипотечный калькулятор</p>
              <p>Поле «Тип недвижимости» = выпадающий список (первичка / вторичка)</p>
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-muted-foreground">
              <p>→ Поле «Материнский капитал» <strong className="text-foreground">показывать</strong>, если тип == «первичка»</p>
              <p>→ Поле «Год постройки» <strong className="text-foreground">показывать</strong>, если тип == «вторичка»</p>
            </div>
          </div>
        </section>
      </div>
    </HelpLayout>
  );
}
