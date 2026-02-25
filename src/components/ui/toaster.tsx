import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const TOAST_DURATION = 5000;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-3 items-start w-full">
              {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
              <div
                className="h-full bg-foreground/25 animate-[toast-progress_5s_linear_forwards]"
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
