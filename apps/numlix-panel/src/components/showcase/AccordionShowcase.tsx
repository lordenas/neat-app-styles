import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    q: "Насколько точен онлайн-калькулятор кредита?",
    a: "Калькулятор использует стандартные банковские формулы для расчёта аннуитетных и дифференцированных платежей. Результат максимально приближен к реальному графику банка.",
  },
  {
    q: "Что лучше: уменьшать платёж или срок при досрочном погашении?",
    a: "С точки зрения экономии на процентах, уменьшение срока всегда выгоднее. Однако уменьшение платежа даёт больше финансовой гибкости.",
  },
  {
    q: "Как влияют кредитные каникулы на переплату?",
    a: "Во время кредитных каникул проценты продолжают начисляться на остаток долга. Это увеличивает общую переплату и может удлинить срок кредита.",
  },
  {
    q: "Можно ли рассчитать ипотеку с этим калькулятором?",
    a: "Да, калькулятор подходит для расчёта любого кредита с фиксированным графиком — ипотека, потребительский кредит, автокредит.",
  },
];

export function AccordionShowcase() {
  return (
    <div className="space-y-6">
      {/* Single */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Single (одна секция открыта)</p>
        <Accordion type="single" collapsible className="max-w-lg">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Multiple */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Multiple (несколько секций)</p>
        <Accordion type="multiple" defaultValue={["m-0"]} className="max-w-lg">
          {faqItems.slice(0, 3).map((item, i) => (
            <AccordionItem key={i} value={`m-${i}`}>
              <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
