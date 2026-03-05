/**
 * Converts an ExampleCalc into a CustomCalculator and saves it to localStorage,
 * then returns the new calculator's ID so the caller can navigate to /calc-builder/:id.
 */
import { type ExampleCalc } from "@/data/example-calculators";
import {
  type CustomCalculator,
  type CalcField,
  type CalcPage,
  saveCalculator,
} from "@/types/custom-calc";
import { transpileCalculateToFormulas } from "@/lib/js-to-calcformula";

function nanoid(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function createBuilderTemplateFromExample(example: ExampleCalc): string {
  const pageId = nanoid(12);
  const calcId = nanoid(16);

  const page: CalcPage = {
    id: pageId,
    title: "Страница 1",
    orderIndex: 0,
    autoAdvance: null,
  };

  const fields: CalcField[] = [];
  let orderIndex = 0;

  // ── Input fields ────────────────────────────────────────────
  for (const f of example.fields) {
    const fieldId = nanoid(8);

    if (f.type === "select" && f.options) {
      fields.push({
        id: fieldId,
        type: "select",
        label: f.label,
        key: f.key,
        orderIndex: orderIndex++,
        rowId: fieldId,
        pageId,
        config: {
          options: f.options.map((o) => ({
            label: o.label,
            value: String(o.value),
            numericValue: o.value,
          })),
          defaultValue: String(f.defaultValue),
          unit: f.unit,
        },
      });
    } else if (f.type === "range") {
      fields.push({
        id: fieldId,
        type: "slider",
        label: f.label,
        key: f.key,
        orderIndex: orderIndex++,
        rowId: fieldId,
        pageId,
        config: {
          min: f.min ?? 0,
          max: f.max ?? 100,
          step: f.step ?? 1,
          defaultValue: f.defaultValue,
          unit: f.unit,
        },
      });
    } else {
      // number
      fields.push({
        id: fieldId,
        type: "number",
        label: f.label,
        key: f.key,
        orderIndex: orderIndex++,
        rowId: fieldId,
        pageId,
        config: {
          min: f.min,
          step: f.step ?? 1,
          defaultValue: f.defaultValue,
          unit: f.unit,
        },
      });
    }
  }

  // ── Result fields ────────────────────────────────────────────
  // We can't auto-convert the JS calculate() function to CalcHub formula syntax,
  // so we insert result fields with a placeholder formula that shows the correct key names.
  for (const r of example.results) {
    const fieldId = nanoid(8);
    // Build a simple default formula referencing the first input key
    const firstKey = example.fields[0]?.key ?? "value";
    const defaultFormula = `{${firstKey}}`;

    fields.push({
      id: fieldId,
      type: "result",
      label: r.label,
      key: r.key,
      orderIndex: orderIndex++,
      rowId: fieldId,
      pageId,
      formula: defaultFormula,
      config: {
        format: r.format === "currency" ? "currency"
          : r.format === "percent" ? "percent"
          : "number",
        hint: `Формула: ${example.formula}`,
      },
    });
  }

  const calculator: CustomCalculator = {
    id: calcId,
    slug: nanoid(8),
    title: example.name,
    description: example.shortDesc,
    pages: [page],
    fields,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveCalculator(calculator);
  return calcId;
}
