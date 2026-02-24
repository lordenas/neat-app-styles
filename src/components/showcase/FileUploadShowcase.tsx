import * as React from "react";
import { FileUploadDropzone, FileUploadButton, FileUploadAvatar } from "@/components/ui/file-upload";

/**
 * Showcase компонента File Upload.
 *
 * Демонстрирует три варианта в неконтролируемом и контролируемом режимах.
 */
export function FileUploadShowcase() {
  // Controlled state demo
  const [controlledFiles, setControlledFiles] = React.useState<File[]>([]);

  return (
    <div className="space-y-8">
      {/* Drag & Drop — uncontrolled */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Drag & Drop зона</h4>
        <FileUploadDropzone
          accept="image/*,.pdf,.doc,.docx"
          acceptLabel="PNG, JPG, PDF, DOC"
          maxSizeMB={10}
          onChange={(files) => console.log("dropzone:", files)}
        />
      </div>

      {/* Button + List — controlled */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Кнопка + список файлов
          <span className="ml-2 text-xs text-primary font-normal">(controlled: {controlledFiles.length} файлов)</span>
        </h4>
        <FileUploadButton
          value={controlledFiles}
          onChange={setControlledFiles}
          accept={["image/", "application/pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", "text/"]}
          acceptLabel="Изображения, PDF, DOC, XLS, TXT"
          maxSizeMB={20}
        />
      </div>

      {/* Avatar — uncontrolled */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Аватар / Изображение</h4>
        <FileUploadAvatar
          accept="image/png,image/jpeg,image/webp,image/gif"
          acceptLabel="PNG, JPG, WebP, GIF"
          maxSizeMB={5}
          onChange={(files) => console.log("avatar:", files)}
        />
      </div>
    </div>
  );
}
