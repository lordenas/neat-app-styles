import * as React from "react";
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Showcase компонента File Uploader.
 *
 * Три варианта загрузчика файлов:
 * 1. **Drag & Drop зона** — область перетаскивания с превью и прогрессом
 * 2. **Кнопка + список файлов** — компактная кнопка со списком выбранных файлов
 * 3. **Аватар/Изображение** — квадратная зона для загрузки одного изображения с превью
 *
 * @example
 * ```tsx
 * <FileUploadShowcase />
 * ```
 */

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
  if (type.includes("pdf") || type.includes("document")) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

function simulateUpload(
  fileId: string,
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 25 + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
    }
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
    );
  }, 300);
}

// ─── Drag & Drop Zone ────────────────────────────────────────

function DragDropUploader() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      return { id, file, progress: 0, preview };
    });
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => simulateUpload(f.id, setFiles));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Перетащите файлы или{" "}
            <span className="text-primary underline underline-offset-2">выберите</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, PDF до 10 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2" role="list" aria-label="Загруженные файлы">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="h-10 w-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted shrink-0">
                  {getFileIcon(f.file.type)}
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded-sm transition-colors"
                    aria-label={`Удалить ${f.file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={f.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {f.progress >= 100 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                    ) : (
                      `${Math.round(f.progress)}%`
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(f.file.size)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Button + File List ──────────────────────────────────────

function ButtonFileList() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 100,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={<Upload />}
          onClick={() => inputRef.current?.click()}
        >
          Выбрать файлы
        </Button>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {files.length} файл(ов)
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1" role="list" aria-label="Выбранные файлы">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors group"
            >
              <span className="text-muted-foreground shrink-0">
                {getFileIcon(f.file.type)}
              </span>
              <span className="truncate flex-1">{f.file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatFileSize(f.file.size)}
              </span>
              <button
                onClick={() => removeFile(f.id)}
                className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-sm shrink-0"
                aria-label={`Удалить ${f.file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Avatar / Image Uploader ─────────────────────────────────

function AvatarUploader() {
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          preview
            ? "border-transparent"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Превью"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-background" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
            <span className="text-[10px]">Загрузить</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-foreground">Загрузите изображение</p>
        <p className="text-xs text-muted-foreground">PNG, JPG до 5 MB</p>
        {preview && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Showcase ────────────────────────────────────────────────

export function FileUploadShowcase() {
  return (
    <div className="space-y-8">
      {/* Drag & Drop */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Drag & Drop зона</h4>
        <DragDropUploader />
      </div>

      {/* Button + List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Кнопка + список файлов</h4>
        <ButtonFileList />
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Аватар / Изображение</h4>
        <AvatarUploader />
      </div>
    </div>
  );
}
