import { FileUploadDropzone, FileUploadButton, FileUploadAvatar } from "@/components/ui/file-upload";

/**
 * Showcase компонента File Upload.
 *
 * Демонстрирует три варианта переиспользуемого загрузчика файлов:
 * 1. **FileUploadDropzone** — Drag & Drop зона с превью и прогрессом
 * 2. **FileUploadButton** — компактная кнопка со списком файлов
 * 3. **FileUploadAvatar** — квадратная зона для одного изображения
 *
 * @example
 * ```tsx
 * <FileUploadShowcase />
 * ```
 */
export function FileUploadShowcase() {
  return (
    <div className="space-y-8">
      {/* Drag & Drop */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Drag & Drop зона</h4>
        <FileUploadDropzone
          accept="image/*,.pdf,.doc,.docx"
          acceptLabel="PNG, JPG, PDF, DOC"
          maxSizeMB={10}
          onFilesChange={(files) => console.log("dropzone:", files)}
        />
      </div>

      {/* Button + List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Кнопка + список файлов</h4>
        <FileUploadButton
          accept={["image/", "application/pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", "text/"]}
          acceptLabel="Изображения, PDF, DOC, XLS, TXT"
          maxSizeMB={20}
          onFilesChange={(files) => console.log("button:", files)}
        />
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Аватар / Изображение</h4>
        <FileUploadAvatar
          accept="image/png,image/jpeg,image/webp,image/gif"
          acceptLabel="PNG, JPG, WebP, GIF"
          maxSizeMB={5}
          onFilesChange={(files) => console.log("avatar:", files)}
        />
      </div>
    </div>
  );
}
