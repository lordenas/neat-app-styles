import * as React from "react";
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Shared Types ────────────────────────────────────────────

/**
 * Файл, управляемый загрузчиком.
 * Содержит исходный `File`, прогресс загрузки и опциональное превью.
 */
export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
}

/**
 * Общие пропсы для всех вариантов FileUpload.
 *
 * Поддерживает **контролируемый** (`value` + `onChange`) и **неконтролируемый** режимы.
 * Для интеграции с react-hook-form используй `value` и `onChange`:
 *
 * ```tsx
 * <Controller
 *   control={control}
 *   name="files"
 *   render={({ field }) => (
 *     <FileUploadDropzone {...field} accept="image/*" maxSizeMB={5} />
 *   )}
 * />
 * ```
 *
 * @prop value - Контролируемое значение: массив `File`. Если передан — компонент управляется извне.
 * @prop onChange - Колбэк при изменении (совместим с react-hook-form `field.onChange`).
 * @prop onFilesChange - Устаревший алиас для `onChange`. Если переданы оба — вызываются оба.
 * @prop accept - MIME-типы / расширения для `<input accept>` и валидации.
 * @prop acceptLabel - Человекочитаемая подпись допустимых форматов.
 * @prop maxSizeMB - Макс. размер одного файла в мегабайтах (по умолчанию 10).
 * @prop multiple - Разрешить выбор нескольких файлов (по умолчанию `true`).
 * @prop disabled - Заблокировать взаимодействие.
 * @prop className - Дополнительные CSS-классы на корневой элемент.
 */
export interface FileUploadBaseProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  /** @deprecated Используй `onChange` */
  onFilesChange?: (files: File[]) => void;
  accept?: string | string[];
  acceptLabel?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /** react-hook-form: вызывается при blur */
  onBlur?: () => void;
  /** react-hook-form: имя поля */
  name?: string;
  /** Сообщение об ошибке. Отображается под компонентом. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
  /** id для связки aria-describedby с ошибкой */
  id?: string;
}

// ─── Utilities ───────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
  if (type.includes("pdf") || type.includes("document")) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

function parseAccept(accept: string | string[]): string[] {
  if (Array.isArray(accept)) return accept;
  return accept.split(",").map((s) => s.trim()).filter(Boolean);
}

function toInputAccept(types: string[]): string {
  return types.map((t) => (t.endsWith("/") ? `${t}*` : t)).join(",");
}

function validateFile(file: File, types: string[], maxBytes: number, acceptLabel: string): string | null {
  const typeOk = types.some((t) => {
    if (t.startsWith(".")) return file.name.toLowerCase().endsWith(t);
    if (t.endsWith("/")) return file.type.startsWith(t);
    return file.type === t;
  });
  if (!typeOk) return `«${file.name}» — неподдерживаемый формат. Допустимы: ${acceptLabel}`;
  if (file.size > maxBytes) return `«${file.name}» (${formatFileSize(file.size)}) превышает лимит ${formatFileSize(maxBytes)}`;
  return null;
}

function filterValidFiles(fileList: FileList, types: string[], maxBytes: number, acceptLabel: string): File[] {
  const valid: File[] = [];
  for (const file of Array.from(fileList)) {
    const error = validateFile(file, types, maxBytes, acceptLabel);
    if (error) toast({ title: "Файл отклонён", description: error, variant: "destructive" });
    else valid.push(file);
  }
  return valid;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function simulateUpload(fileId: string, setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 25 + 10;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)));
  }, 300);
}

// ─── Hook: shared validation ─────────────────────────────────

function useFileUploadConfig(props: FileUploadBaseProps) {
  const { accept = "image/,.pdf", acceptLabel, maxSizeMB = 10, multiple = true } = props;
  const types = React.useMemo(() => parseAccept(accept), [accept]);
  const inputAccept = React.useMemo(() => toInputAccept(types), [types]);
  const label = acceptLabel ?? types.join(", ");
  const maxBytes = maxSizeMB * 1024 * 1024;
  const validate = React.useCallback(
    (fileList: FileList) => filterValidFiles(fileList, types, maxBytes, label),
    [types, maxBytes, label]
  );
  return { types, inputAccept, label, maxBytes, maxSizeMB, multiple, validate };
}

/** Notify both onChange and legacy onFilesChange */
function useNotify(onChange?: (files: File[]) => void, onFilesChange?: (files: File[]) => void) {
  return React.useCallback((files: File[]) => {
    onChange?.(files);
    onFilesChange?.(files);
  }, [onChange, onFilesChange]);
}

/** Controlled/uncontrolled file list with UploadedFile wrappers */
function useFileList(valueProp: File[] | undefined, notify: (files: File[]) => void) {
  const [internal, setInternal] = React.useState<UploadedFile[]>([]);
  const isControlled = valueProp !== undefined;

  // Sync internal state from controlled value
  const prevValueRef = React.useRef<File[]>();
  React.useEffect(() => {
    if (!isControlled) return;
    if (prevValueRef.current === valueProp) return;
    prevValueRef.current = valueProp;

    setInternal((prev) => {
      // Keep existing entries that match, add new ones, remove deleted
      const existingMap = new Map(prev.map((u) => [u.file, u]));
      const next: UploadedFile[] = valueProp.map((file) => {
        const existing = existingMap.get(file);
        if (existing) return existing;
        return {
          id: makeId(),
          file,
          progress: 100,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        };
      });
      // Revoke previews for removed files
      for (const u of prev) {
        if (!valueProp.includes(u.file) && u.preview) URL.revokeObjectURL(u.preview);
      }
      return next;
    });
  }, [isControlled, valueProp]);

  const files = internal;

  const addFiles = React.useCallback((validFiles: File[], withProgress = false) => {
    const newEntries: UploadedFile[] = validFiles.map((file) => ({
      id: makeId(),
      file,
      progress: withProgress ? 0 : 100,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    setInternal((prev) => {
      const next = [...prev, ...newEntries];
      notify(next.map((f) => f.file));
      return next;
    });

    return newEntries;
  }, [notify]);

  const removeFile = React.useCallback((id: string) => {
    setInternal((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      const next = prev.filter((x) => x.id !== id);
      notify(next.map((f) => f.file));
      return next;
    });
  }, [notify]);

  const setFileProgress = React.useCallback((id: string, progress: number) => {
    setInternal((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)));
  }, []);

  return { files, addFiles, removeFile, setInternal, setFileProgress };
}

// ═══════════════════════════════════════════════════════════════
// 1. FileUploadDropzone
// ═══════════════════════════════════════════════════════════════

/**
 * Загрузчик файлов с областью Drag & Drop, превью и прогресс-баром.
 * Поддерживает контролируемый (`value`/`onChange`) и неконтролируемый режимы.
 *
 * @example
 * ```tsx
 * // Неконтролируемый
 * <FileUploadDropzone accept="image/*,.pdf" maxSizeMB={10} onChange={(files) => console.log(files)} />
 *
 * // Контролируемый (react-hook-form)
 * <Controller name="docs" control={control}
 *   render={({ field }) => <FileUploadDropzone {...field} accept="image/*,.pdf" />}
 * />
 * ```
 */
export interface FileUploadDropzoneProps extends FileUploadBaseProps {}

const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  ({ value, onChange, onFilesChange, onBlur, name, disabled, className, error, id, ...rest }, ref) => {
    const { inputAccept, label, maxSizeMB, multiple, validate } = useFileUploadConfig(rest);
    const notify = useNotify(onChange, onFilesChange);
    const { files, addFiles, removeFile, setInternal } = useFileList(value, notify);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const errorId = error !== undefined && id ? `${id}-err` : undefined;

    const handleAdd = React.useCallback((fileList: FileList) => {
      const valid = validate(fileList);
      if (!valid.length) return;
      const entries = addFiles(valid, true);
      entries.forEach((f) => simulateUpload(f.id, setInternal));
    }, [validate, addFiles, setInternal]);

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <div
          onDragOver={(e) => { if (disabled) return; e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setIsDragging(false);
            if (!disabled && e.dataTransfer.files.length) handleAdd(e.dataTransfer.files);
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Перетащите файлы или <span className="text-primary underline underline-offset-2">выберите</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label} до {maxSizeMB} MB</p>
          </div>
          <input
            ref={inputRef} type="file" multiple={multiple} className="hidden"
            accept={inputAccept} disabled={disabled} name={name} id={id}
            onBlur={onBlur}
            onChange={(e) => { if (e.target.files?.length) handleAdd(e.target.files); e.target.value = ""; }}
          />
        </div>

        {error !== undefined && (
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        )}

        {files.length > 0 && (
          <ul className="space-y-2" role="list" aria-label="Загруженные файлы">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                {f.preview ? (
                  <img src={f.preview} alt={f.file.name} className="h-10 w-10 rounded object-cover shrink-0" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted shrink-0">
                    {getFileIcon(f.file.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{f.file.name}</p>
                    <button onClick={() => removeFile(f.id)}
                      className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded-sm transition-colors"
                      aria-label={`Удалить ${f.file.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={f.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {f.progress >= 100 ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> : `${Math.round(f.progress)}%`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatFileSize(f.file.size)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileUploadDropzone.displayName = "FileUploadDropzone";

// ═══════════════════════════════════════════════════════════════
// 2. FileUploadButton
// ═══════════════════════════════════════════════════════════════

/**
 * Компактный загрузчик: кнопка со списком файлов.
 * Поддерживает контролируемый (`value`/`onChange`) и неконтролируемый режимы.
 *
 * @example
 * ```tsx
 * <Controller name="attachments" control={control}
 *   render={({ field }) => <FileUploadButton {...field} accept={["image/", ".pdf"]} />}
 * />
 * ```
 */
export interface FileUploadButtonProps extends FileUploadBaseProps {
  /** Текст кнопки (по умолчанию «Выбрать файлы») */
  buttonLabel?: string;
}

const FileUploadButton = React.forwardRef<HTMLDivElement, FileUploadButtonProps>(
  ({ value, onChange, onFilesChange, onBlur, name, disabled, className, buttonLabel = "Выбрать файлы", ...rest }, ref) => {
    const { inputAccept, multiple, validate } = useFileUploadConfig(rest);
    const notify = useNotify(onChange, onFilesChange);
    const { files, addFiles, removeFile } = useFileList(value, notify);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleAdd = React.useCallback((fileList: FileList) => {
      const valid = validate(fileList);
      if (!valid.length) return;
      addFiles(valid);
    }, [validate, addFiles]);

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Upload />} disabled={disabled}
            onClick={() => inputRef.current?.click()}>
            {buttonLabel}
          </Button>
          {files.length > 0 && <span className="text-xs text-muted-foreground">{files.length} файл(ов)</span>}
          <input ref={inputRef} type="file" multiple={multiple} className="hidden"
            accept={inputAccept} disabled={disabled} name={name} onBlur={onBlur}
            onChange={(e) => { if (e.target.files?.length) handleAdd(e.target.files); e.target.value = ""; }} />
        </div>

        {files.length > 0 && (
          <ul className="space-y-1" role="list" aria-label="Выбранные файлы">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors group">
                <span className="text-muted-foreground shrink-0">{getFileIcon(f.file.type)}</span>
                <span className="truncate flex-1">{f.file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(f.file.size)}</span>
                <button onClick={() => removeFile(f.id)}
                  className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-sm shrink-0"
                  aria-label={`Удалить ${f.file.name}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FileUploadButton.displayName = "FileUploadButton";

// ═══════════════════════════════════════════════════════════════
// 3. FileUploadAvatar
// ═══════════════════════════════════════════════════════════════

/**
 * Квадратная зона (96×96) для загрузки одного изображения.
 * Поддерживает контролируемый (`value`/`onChange`) и неконтролируемый режимы.
 * В контролируемом режиме `value` — массив с одним `File` или пустой.
 *
 * @example
 * ```tsx
 * <Controller name="avatar" control={control}
 *   render={({ field }) => <FileUploadAvatar {...field} accept="image/png,image/jpeg" maxSizeMB={5} />}
 * />
 * ```
 */
export interface FileUploadAvatarProps extends Omit<FileUploadBaseProps, "multiple"> {
  label?: string;
}

const FileUploadAvatar = React.forwardRef<HTMLDivElement, FileUploadAvatarProps>(
  ({ value, onChange, onFilesChange, onBlur, name, disabled, className, error, id, label: textLabel = "Загрузите изображение", ...rest }, ref) => {
    const { inputAccept, label, maxSizeMB, validate } = useFileUploadConfig({ ...rest, multiple: false });
    const notify = useNotify(onChange, onFilesChange);
    const [preview, setPreview] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const errorId = error !== undefined && id ? `${id}-err` : undefined;

    // Sync preview from controlled value
    React.useEffect(() => {
      if (value === undefined) return;
      if (value.length === 0) {
        if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
      } else {
        const file = value[0];
        if (file && (!preview || !preview.startsWith("blob:"))) {
          setPreview(URL.createObjectURL(file));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleFile = React.useCallback((fileList: FileList) => {
      const valid = validate(fileList);
      if (!valid.length) return;
      const file = valid[0];
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
      notify([file]);
    }, [validate, notify, preview]);

    const handleRemove = React.useCallback(() => {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      notify([]);
    }, [preview, notify]);

    return (
      <div ref={ref} className={cn("space-y-1", className)}>
        <div className="flex items-center gap-4">
          <div
            onClick={() => !disabled && inputRef.current?.click()}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors overflow-hidden",
              preview ? "border-transparent" : "border-border hover:border-primary/50 hover:bg-muted/50",
              error && !preview && "border-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {preview ? (
              <>
                <img src={preview} alt="Превью" className="h-full w-full object-cover" />
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
            <input ref={inputRef} type="file" className="hidden" accept={inputAccept}
              disabled={disabled} name={name} id={id} onBlur={onBlur}
              onChange={(e) => { if (e.target.files?.length) handleFile(e.target.files); e.target.value = ""; }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-foreground">{textLabel}</p>
            <p className="text-xs text-muted-foreground">{label} до {maxSizeMB} MB</p>
            {preview && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleRemove} disabled={disabled}>
                Удалить
              </Button>
            )}
          </div>
        </div>
        {error !== undefined && (
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        )}
      </div>
    );
  }
);
FileUploadAvatar.displayName = "FileUploadAvatar";

// ─── Exports ─────────────────────────────────────────────────

export { FileUploadDropzone, FileUploadButton, FileUploadAvatar };
