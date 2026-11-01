import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertEnum, AlertType } from "@/models/alert-model";
import { useAlertStore } from "@/stores/alert-store";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

type ButtonVariant = "destructive" | "warning" | "success" | "default";

const alertStyles: Record<
  AlertType,
  {
    Icon: LucideIcon;
    background: string;
    color: string;
    animation: string;
    button: ButtonVariant;
  }
> = {
  error: {
    Icon: XCircle,
    background: "bg-destructive/10",
    color: "text-destructive",
    animation: "animate-pulse",
    button: "destructive",
  },
  warning: {
    Icon: AlertTriangle,
    background: "bg-warning/10",
    color: "text-warning",
    animation: "animate-bounce",
    button: "warning",
  },
  success: {
    Icon: CheckCircle,
    background: "bg-success/10",
    color: "text-success",
    animation: "animate-bounce",
    button: "success",
  },
  // `primary` is used because the theme may not define an `info` token;
  // swap in bg-info/10 + text-info if you have one.
  info: {
    Icon: Info,
    background: "bg-primary/10",
    color: "text-primary",
    animation: "",
    button: "default",
  },
};

export function ConfirmAlert() {
  const {
    isOpen,
    message,
    description,
    type,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    hideAlert,
  } = useAlertStore();

  // Close first, then run the callback: a callback may open another alert,
  // which must not be hidden by us.
  const handleConfirm = () => {
    hideAlert();
    onConfirm?.();
  };

  const handleCancel = () => {
    hideAlert();
    onCancel?.();
  };

  useEffect(() => {
    if (isOpen && type == AlertEnum.SUCCESS) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, hideAlert]);

  const { Icon, background, color, animation, button } = alertStyles[type];

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-120 data-[state=open]:!zoom-in-0 data-[state=closed]:!zoom-out-0 origin-center duration-400">
        <AlertDialogHeader className="items-center">
          <div
            className={cn(
              "mb-2 mx-auto flex h-16 w-16 items-center justify-center rounded-full",
              background
            )}
          >
            <Icon className={cn("h-9 w-9", color, animation)} />
          </div>
          <AlertDialogTitle className="text-center">{message}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-center">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 sm:justify-center">
          {cancelText && (
            <AlertDialogCancel
              onClick={handleCancel}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            className={buttonVariants({ variant: button, size: "lg" })}
          >
            {confirmText ?? "Okay"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}