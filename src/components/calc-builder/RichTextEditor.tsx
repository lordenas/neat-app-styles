import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string; // HTML content
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const PRESET_COLORS = [
  "#000000", "#374151", "#6b7280", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
];

export function RichTextEditor({ value, onChange, placeholder = "Введите текст...", className }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      if (!isUpdatingRef.current) {
        const html = editor.getHTML();
        onChange(html === "<p></p>" ? "" : html);
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[60px] px-2 py-1.5 text-xs [&_a]:text-primary [&_a]:underline",
      },
    },
  });

  // Sync external changes without cursor reset
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = (!value || value === "") ? "" : value;
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    if (normalizedCurrent !== normalized) {
      isUpdatingRef.current = true;
      editor.commands.setContent(normalized || "");
      isUpdatingRef.current = false;
    }
  }, [value, editor]);

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const openLinkInput = () => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href ?? "";
    setLinkUrl(existing);
    setShowLinkInput(true);
  };

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    cn(
      "h-6 w-6 flex items-center justify-center rounded transition-colors shrink-0",
      active
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const currentColor = editor.getAttributes("textStyle").color as string | undefined;

  return (
    <div className={cn("space-y-1", className)}>
    <div className="relative rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-border flex-wrap">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btnClass(editor.isActive("bold"))}>
          <Bold className="h-3 w-3" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btnClass(editor.isActive("italic"))}>
          <Italic className="h-3 w-3" />
        </button>

        <div className="w-px h-4 bg-border mx-0.5" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("left").run(); }} className={btnClass(editor.isActive({ textAlign: "left" }))}>
          <AlignLeft className="h-3 w-3" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("center").run(); }} className={btnClass(editor.isActive({ textAlign: "center" }))}>
          <AlignCenter className="h-3 w-3" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("right").run(); }} className={btnClass(editor.isActive({ textAlign: "right" }))}>
          <AlignRight className="h-3 w-3" />
        </button>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Color picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker((v) => !v); }}
            className={btnClass(!!currentColor)}
            title="Цвет текста"
          >
            <span className="relative flex flex-col items-center gap-px">
              <span className="font-bold text-[10px] leading-none" style={currentColor ? { color: currentColor } : undefined}>A</span>
              <span className="block w-3.5 h-0.5 rounded-full" style={{ backgroundColor: currentColor ?? "hsl(var(--foreground))" }} />
            </span>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg p-2 w-[160px]">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setColor(c).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  defaultValue={currentColor ?? "#000000"}
                  onInput={(e) => {
                    editor.chain().focus().setColor((e.target as HTMLInputElement).value).run();
                  }}
                  className="h-6 w-8 rounded border border-input cursor-pointer p-0.5 bg-background"
                />
                <span className="text-[10px] text-muted-foreground">Свой цвет</span>
                {currentColor && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().unsetColor().run();
                      setShowColorPicker(false);
                    }}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    title="Сбросить"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Link */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); openLinkInput(); }} className={btnClass(editor.isActive("link"))}>
          <LinkIcon className="h-3 w-3" />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetLink().run(); }}
            className="h-6 px-1.5 text-[10px] flex items-center rounded text-destructive hover:bg-destructive/10 transition-colors"
          >
            Убрать
          </button>
        )}
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30">
          <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { setShowLinkInput(false); }
            }}
            placeholder="https://..."
            className="flex-1 text-xs bg-transparent focus:outline-none"
          />
          <button type="button" onClick={applyLink} className="text-[10px] text-primary font-medium hover:underline">
            OK
          </button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
    </div>
    <p className="text-[10px] text-muted-foreground mt-1">Выделите текст для форматирования</p>
  );
}
