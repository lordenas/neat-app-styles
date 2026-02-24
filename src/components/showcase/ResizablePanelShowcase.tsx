import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function ResizablePanelShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Горизонтальный split-view</p>
        <div className="rounded-lg border overflow-hidden" style={{ height: 240 }}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={15}>
              <div className="h-full p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Sidebar</p>
                <div className="space-y-1.5">
                  {["index.tsx", "App.tsx", "main.ts", "utils.ts"].map((f) => (
                    <div key={f} className="text-xs px-2 py-1 rounded hover:bg-muted cursor-pointer">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <div className="h-full p-4">
                <p className="text-xs text-muted-foreground mb-2">Editor</p>
                <pre className="text-xs font-mono text-muted-foreground">
{`function App() {
  return (
    <div>Hello World</div>
  );
}`}
                </pre>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Вложенные панели (горизонт + вертикаль)</p>
        <div className="rounded-lg border overflow-hidden" style={{ height: 280 }}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full p-4 bg-muted/20">
                <p className="text-sm font-medium mb-1">Панель A</p>
                <p className="text-xs text-muted-foreground">Перетаскивайте разделитель →</p>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={20}>
                  <div className="h-full p-4">
                    <p className="text-sm font-medium mb-1">Панель B</p>
                    <p className="text-xs text-muted-foreground">Верхняя</p>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="h-full p-4 bg-muted/20">
                    <p className="text-sm font-medium mb-1">Панель C</p>
                    <p className="text-xs text-muted-foreground">Нижняя</p>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <p className="helper-text">
        Импорт: <code className="text-xs bg-muted px-1 py-0.5 rounded">ResizablePanelGroup</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">ResizablePanel</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">ResizableHandle</code>.
        Prop <code className="text-xs bg-muted px-1 py-0.5 rounded">withHandle</code> добавляет визуальный маркер.
      </p>
    </div>
  );
}
