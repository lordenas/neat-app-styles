import { useToast } from "../../hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";

const TOAST_DURATION = 5000;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-3 items-start w-full">
              {icon && (
                <span className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5">
                  {icon}
                </span>
              )}
              <div className="grid gap-0.5 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
            {/* Sonner-style progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-foreground/5 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-foreground/15 animate-[toast-progress_5s_linear_forwards] rounded-b-lg"
                style={{ animationDuration: `${TOAST_DURATION}ms` }}
              />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
