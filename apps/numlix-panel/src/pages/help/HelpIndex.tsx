import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Hash, Layers, FileCode, Zap, ArrowRight } from "lucide-react";
import { HelpLayout } from "./HelpLayout";

const cards = [
  {
    icon: Layers,
    title: "Типы полей",
    desc: "Число, слайдер, список, чекбокс, текст, изображение и другие поля с настройками.",
    path: "/help/fields",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Hash,
    title: "Формулы",
    desc: "Синтаксис {переменных}, встроенные функции round(), if(), min(), max() и операторы.",
    path: "/help/formula",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: FileCode,
    title: "Многостраничность",
    desc: "Создание шагов, прогресс-бар, условные переходы между страницами.",
    path: "/help/pages",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Условная логика",
    desc: "Скрывайте и показывайте поля в зависимости от значений других полей.",
    path: "/help/logic",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export default function HelpIndex() {
  return (
    <HelpLayout>
      <Helmet>
        <title>База знаний — CalcHub</title>
        <meta name="description" content="Документация и инструкции по работе с конструктором калькуляторов CalcHub." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">База знаний</h1>
          <p className="text-muted-foreground">
            Всё что нужно знать для создания калькуляторов — от первого поля до сложных формул и многостраничных сценариев.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ icon: Icon, title, desc, path, color, bg }) => (
            <Link
              key={path}
              to={path}
              className="group flex gap-4 p-4 border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all bg-card"
            >
              <div className={`${bg} rounded-lg p-2.5 h-fit`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{title}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="border border-border rounded-xl p-5 bg-muted/30">
          <h2 className="font-semibold mb-3">Быстрый старт</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Перейдите в <Link to="/calc-builder" className="text-primary hover:underline">Конструктор</Link> и нажмите «Новый калькулятор»</li>
            <li>Добавьте поля: числовые вводы, слайдеры или выпадающие списки</li>
            <li>Добавьте поле <strong className="text-foreground">Результат</strong> и напишите формулу, например <code className="font-mono bg-muted px-1 rounded text-xs">{"{"+"сумма"+"}"} * {"{"+"ставка"+"}"} / 100</code></li>
            <li>Сохраните и поделитесь ссылкой или встройте виджет на сайт</li>
          </ol>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Примеры готовых калькуляторов</h2>
          <Link
            to="/help/examples"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Смотреть все примеры <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </HelpLayout>
  );
}
