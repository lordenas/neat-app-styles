import fs from "node:fs/promises";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");
const outDir = path.join(publicDir, "og");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function createSvg(title, subtitle) {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const safeSubtitle = subtitle.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg width=\"1200\" height=\"630\" viewBox=\"0 0 1200 630\" xmlns=\"http://www.w3.org/2000/svg\">
  <defs>
    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"#0f172a\"/>
      <stop offset=\"100%\" stop-color=\"#1e293b\"/>
    </linearGradient>
  </defs>
  <rect width=\"1200\" height=\"630\" fill=\"url(#bg)\" />
  <text x=\"80\" y=\"300\" fill=\"#ffffff\" font-family=\"Inter, Arial, sans-serif\" font-size=\"64\" font-weight=\"700\">${safeTitle}</text>
  <text x=\"80\" y=\"370\" fill=\"#cbd5e1\" font-family=\"Inter, Arial, sans-serif\" font-size=\"32\">${safeSubtitle}</text>
</svg>`;
}

const pages = [
  ["default", "Numlix", "Калькуляторы и финансовые сервисы"],
  ["vat", "Калькулятор НДС", "Numlix"],
  ["ndfl", "Калькулятор НДФЛ", "Numlix"],
  ["deposit", "Калькулятор вклада", "Numlix"],
];

await ensureDir(outDir);

for (const [slug, title, subtitle] of pages) {
  const svg = createSvg(title, subtitle);
  await fs.writeFile(path.join(outDir, `${slug}-ru.svg`), svg, "utf-8");
}

console.log(`Generated ${pages.length} OG templates in ${outDir}`);
