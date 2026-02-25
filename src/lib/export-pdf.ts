import jsPDF from "jspdf";

interface ScheduleRow {
  n: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  early: number;
  balance: number;
}

interface PdfExportData {
  title?: string;
  summary: { label: string; value: string }[];
  debtBreakdown: { principal: number; interest: number };
  schedule: ScheduleRow[];
  totals: { payment: number; principal: number; interest: number; early: number };
}

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export async function exportCalculationPdf(data: PdfExportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  // --- Title ---
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 50);
  doc.text(data.title || "Кредитный калькулятор — Результаты", margin, y + 6);
  y += 14;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // --- Summary cards ---
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const cols = 3;
  const cellW = contentW / cols;

  data.summary.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = margin + col * cellW;
    const cy = y + row * 16;

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, cx + 2, cy + 4);

    doc.setFontSize(11);
    doc.setTextColor(30, 30, 50);
    doc.text(item.value, cx + 2, cy + 10);
  });

  y += Math.ceil(data.summary.length / cols) * 16 + 4;

  // --- Pie chart as text breakdown ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 50);
  doc.text("Структура выплат", margin, y + 4);
  y += 10;

  const total = data.debtBreakdown.principal + data.debtBreakdown.interest;
  const principalPct = ((data.debtBreakdown.principal / total) * 100).toFixed(1);
  const interestPct = ((data.debtBreakdown.interest / total) * 100).toFixed(1);

  // Principal bar
  const barH = 8;
  const principalW = (data.debtBreakdown.principal / total) * contentW;

  doc.setFillColor(76, 175, 80); // green
  doc.rect(margin, y, principalW, barH, "F");
  doc.setFillColor(239, 83, 80); // red
  doc.rect(margin + principalW, y, contentW - principalW, barH, "F");
  y += barH + 4;

  doc.setFontSize(8);
  doc.setTextColor(76, 175, 80);
  doc.text(`● Основной долг: ${fmt(data.debtBreakdown.principal)} ₽ (${principalPct}%)`, margin, y + 3);
  doc.setTextColor(239, 83, 80);
  doc.text(`● Проценты: ${fmt(data.debtBreakdown.interest)} ₽ (${interestPct}%)`, margin + contentW / 2, y + 3);
  y += 10;

  // --- Schedule table ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 50);
  doc.text("График погашения", margin, y + 4);
  y += 10;

  const headers = ["#", "Дата", "Платёж", "Осн. долг", "Проценты", "Досрочн.", "Остаток"];
  const colWidths = [8, 22, 26, 26, 26, 22, contentW - 130];

  // Header row
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  let hx = margin;
  headers.forEach((h, i) => {
    doc.text(h, hx + 1, y + 5);
    hx += colWidths[i];
  });
  y += 8;

  // Data rows
  doc.setFontSize(7);
  data.schedule.forEach((row, idx) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentW, 6, "F");
    }

    let rx = margin;
    doc.setTextColor(100, 100, 100);
    doc.text(String(row.n), rx + 1, y + 4); rx += colWidths[0];
    doc.setTextColor(50, 50, 50);
    doc.text(row.date, rx + 1, y + 4); rx += colWidths[1];
    doc.text(fmt(row.payment), rx + 1, y + 4); rx += colWidths[2];
    doc.setTextColor(76, 175, 80);
    doc.text(fmt(row.principal), rx + 1, y + 4); rx += colWidths[3];
    doc.setTextColor(239, 83, 80);
    doc.text(fmt(row.interest), rx + 1, y + 4); rx += colWidths[4];
    doc.setTextColor(row.early > 0 ? 76 : 150, row.early > 0 ? 175 : 150, row.early > 0 ? 80 : 150);
    doc.text(row.early > 0 ? fmt(row.early) : "—", rx + 1, y + 4); rx += colWidths[5];
    doc.setTextColor(50, 50, 50);
    doc.text(fmt(row.balance), rx + 1, y + 4);

    y += 6;
  });

  // Totals row
  if (y > 270) { doc.addPage(); y = margin; }
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setFontSize(7);
  doc.setTextColor(30, 30, 50);
  let tx = margin;
  doc.text("Итого", tx + 1, y + 5); tx += colWidths[0] + colWidths[1];
  doc.text(fmt(data.totals.payment), tx + 1, y + 5); tx += colWidths[2];
  doc.setTextColor(76, 175, 80);
  doc.text(fmt(data.totals.principal), tx + 1, y + 5); tx += colWidths[3];
  doc.setTextColor(239, 83, 80);
  doc.text(fmt(data.totals.interest), tx + 1, y + 5); tx += colWidths[4];
  doc.setTextColor(76, 175, 80);
  doc.text(fmt(data.totals.early), tx + 1, y + 5);
  y += 12;

  // --- Footer ---
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`CalcHub — ${new Date().toLocaleDateString("ru")}`, margin, doc.internal.pageSize.getHeight() - 8);

  doc.save(`CalcHub_${new Date().toISOString().slice(0, 10)}.pdf`);
}
