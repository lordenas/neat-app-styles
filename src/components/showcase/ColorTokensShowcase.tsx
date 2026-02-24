export function ColorTokensShowcase() {
  const coreColors = [
    { name: "Primary", var: "--primary", fg: "--primary-foreground" },
    { name: "Primary Light", var: "--primary-light", fg: "--primary" },
    { name: "Primary Dark", var: "--primary-dark", fg: "--primary-foreground" },
    { name: "Secondary", var: "--secondary", fg: "--secondary-foreground" },
    { name: "Muted", var: "--muted", fg: "--muted-foreground" },
    { name: "Accent", var: "--accent", fg: "--accent-foreground" },
  ];

  const semanticColors = [
    { name: "Destructive", var: "--destructive", fg: "--destructive-foreground" },
    { name: "Success", var: "--success", fg: "--success-foreground" },
    { name: "Warning", var: "--warning", fg: "--warning-foreground" },
    { name: "Info", var: "--info", fg: "--info-foreground" },
  ];

  const surfaceColors = [
    { name: "Background", var: "--background", fg: "--foreground" },
    { name: "Card", var: "--card", fg: "--card-foreground" },
    { name: "Surface", var: "--surface", fg: "--surface-foreground" },
    { name: "Elevated", var: "--elevated", fg: "--elevated-foreground" },
    { name: "Popover", var: "--popover", fg: "--popover-foreground" },
  ];

  const borderColors = [
    { name: "Border", var: "--border" },
    { name: "Border Strong", var: "--border-strong" },
    { name: "Border Subtle", var: "--border-subtle" },
    { name: "Input", var: "--input" },
    { name: "Ring", var: "--ring" },
  ];

  return (
    <div className="space-y-6">
      {/* Core */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Core</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {coreColors.map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </div>
      </div>

      {/* Semantic */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Semantic</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {semanticColors.map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </div>
      </div>

      {/* Surfaces */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Surfaces</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {surfaceColors.map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </div>
      </div>

      {/* Borders */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Borders</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {borderColors.map((c) => (
            <BorderSwatch key={c.name} name={c.name} var={c.var} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ name, var: cssVar, fg }: { name: string; var: string; fg: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="h-16 rounded-md border flex items-end p-2"
        style={{ backgroundColor: `hsl(var(${cssVar}))` }}
      >
        <span className="text-xs font-medium" style={{ color: `hsl(var(${fg}))` }}>
          {name}
        </span>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
    </div>
  );
}

function BorderSwatch({ name, var: cssVar }: { name: string; var: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="h-16 rounded-md bg-background flex items-end p-2"
        style={{ border: `2px solid hsl(var(${cssVar}))` }}
      >
        <span className="text-xs font-medium text-foreground">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
    </div>
  );
}
