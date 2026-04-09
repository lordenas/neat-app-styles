import { Helmet } from "react-helmet-async";
import { HelpLayout } from "./HelpLayout";

const fields = [
  {
    type: "Число (Input)",
    icon: "🔢",
    desc: "Поле ввода числового значения. Поддерживает min, max, шаг и суффикс (например, «₽», «%», «м²»).",
    use: "Сумма кредита, площадь, возраст",
  },
  {
    type: "Слайдер",
    icon: "🎚️",
    desc: "Визуальный ползунок для выбора числа в диапазоне. Удобен на мобильных устройствах.",
    use: "Срок кредита, количество товара",
  },
  {
    type: "Выпадающий список (Select)",
    icon: "📋",
    desc: "Список вариантов. Каждому варианту можно задать числовой вес для использования в формуле.",
    use: "Тип продукта, регион, категория",
  },
  {
    type: "Радиокнопка (Radio)",
    icon: "⚪",
    desc: "Выбор одного варианта из нескольких. Аналогично Select, поддерживает числовые веса.",
    use: "Тип расчёта, тариф",
  },
  {
    type: "Чекбокс",
    icon: "☑️",
    desc: "Переключатель да/нет. Можно задать вес: 1 (отмечен) / 0 (не отмечен). Поддерживает несколько вариантов.",
    use: "Дополнительные опции, скидки",
  },
  {
    type: "Текст (Label)",
    icon: "📝",
    desc: "Статический текст с Rich Text форматированием. Поддерживает вставку переменных {key} для отображения значений.",
    use: "Пояснения, подписи, динамические подсказки",
  },
  {
    type: "Результат",
    icon: "✅",
    desc: "Поле для отображения результата вычисления. Содержит формулу, суффикс и форматирование числа.",
    use: "Итоговая сумма, ежемесячный платёж",
  },
  {
    type: "Изображение",
    icon: "🖼️",
    desc: "Вставка изображения по URL. Полезно для иллюстраций, логотипов, инфографики.",
    use: "Иллюстрации к шагам",
  },
  {
    type: "HTML",
    icon: "🌐",
    desc: "Произвольный HTML-код. Позволяет вставить любой контент — таблицы, иконки, внешние виджеты.",
    use: "Кастомное оформление, таблицы",
  },
  {
    type: "Кнопка",
    icon: "🔘",
    desc: "Кнопка для перехода между страницами многостраничного калькулятора.",
    use: "Шаги: «Далее», «Назад», «Рассчитать»",
  },
];

export default function HelpFields() {
  return (
    <HelpLayout>
      <Helmet>
        <title>Типы полей — База знаний CalcHub</title>
        <meta name="description" content="Описание всех типов полей конструктора калькуляторов: число, слайдер, список, чекбокс, результат и другие." />
      </Helmet>

      <div className="space-y-8 max-w-2xl">
        <div>
          <p className="text-xs text-muted-foreground mb-1">База знаний → Конструктор</p>
          <h1 className="text-2xl font-bold mb-2">Типы полей</h1>
          <p className="text-muted-foreground text-sm">
            Каждое поле имеет уникальный <strong>ключ</strong> — идентификатор, который используется в формулах. Ключ задаётся в настройках поля.
          </p>
        </div>

        <div className="space-y-3">
          {fields.map(({ type, icon, desc, use }) => (
            <div key={type} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
              <div className="text-2xl shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{type}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">Применение:</span> {use}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
          <p className="font-medium mb-1">Совет</p>
          <p className="text-muted-foreground text-xs">
            Ключ поля лучше задавать латиницей или понятной кириллицей без пробелов: <code className="font-mono bg-muted px-1 rounded">summa</code>, <code className="font-mono bg-muted px-1 rounded">stavka</code>, <code className="font-mono bg-muted px-1 rounded">срок</code>. Это упростит написание формул.
          </p>
        </div>
      </div>
    </HelpLayout>
  );
}
