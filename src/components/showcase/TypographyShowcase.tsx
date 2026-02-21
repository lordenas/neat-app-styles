export function TypographyShowcase() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1>Заголовок H1 — 30px Bold</h1>
        <h2>Заголовок H2 — 24px Semibold</h2>
        <h3>Заголовок H3 — 20px Semibold</h3>
        <h4>Заголовок H4 — 18px Medium</h4>
        <h5>Заголовок H5 — 16px Medium</h5>
        <h6>Заголовок H6 — 14px Medium</h6>
      </div>
      <div className="space-y-1">
        <p className="text-base">Основной текст (16px) — Используется для параграфов и описаний.</p>
        <p className="text-sm text-muted-foreground">Вспомогательный текст (14px) — Подсказки, метки, пояснения.</p>
        <p className="text-xs text-muted-foreground">Мелкий текст (12px) — Подписи, сноски, вспомогательная информация.</p>
      </div>
    </div>
  );
}
