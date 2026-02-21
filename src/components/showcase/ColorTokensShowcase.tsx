export function ColorTokensShowcase() {
  const colors = [
    { name: "Primary", var: "--primary", fg: "--primary-foreground" },
    { name: "Secondary", var: "--secondary", fg: "--secondary-foreground" },
    { name: "Muted", var: "--muted", fg: "--muted-foreground" },
    { name: "Accent", var: "--accent", fg: "--accent-foreground" },
    { name: "Destructive", var: "--destructive", fg: "--destructive-foreground" },
    { name: "Success", var: "--success", fg: "--success-foreground" },
    { name: "Warning", var: "--warning", fg: "--warning-foreground" },
    { name: "Info", var: "--info", fg: "--info-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {colors.map((c) => (
        <div key={c.name} className="space-y-1.5">
          <div
            className="h-16 rounded-md border flex items-end p-2"
            style={{ backgroundColor: `hsl(var(${c.var}))` }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: `hsl(var(${c.fg}))` }}
            >
              {c.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{c.var}</p>
        </div>
      ))}
    </div>
  );
}
