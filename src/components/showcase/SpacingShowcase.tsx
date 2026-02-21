export function SpacingShowcase() {
  const spacings = [
    { name: "4px", class: "w-1 h-4" },
    { name: "8px", class: "w-2 h-4" },
    { name: "12px", class: "w-3 h-4" },
    { name: "16px", class: "w-4 h-4" },
    { name: "24px", class: "w-6 h-4" },
    { name: "32px", class: "w-8 h-4" },
    { name: "48px", class: "w-12 h-4" },
    { name: "64px", class: "w-16 h-4" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Система отступов основана на кратности 4px.</p>
      <div className="space-y-2">
        {spacings.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-10 text-right font-mono">{s.name}</span>
            <div className={`${s.class} bg-primary rounded-sm`} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Breakpoints: <span className="font-mono">320px</span> (mobile) · <span className="font-mono">768px</span> (tablet) · <span className="font-mono">1024px</span> (desktop)</p>
      </div>
    </div>
  );
}
