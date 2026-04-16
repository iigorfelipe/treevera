import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/common/utils/cn";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
);

const DialogContent = ({
  className,
  children,
  hideClose,
  overlayClassName,
  hideOverlay,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  hideClose?: boolean;
  overlayClassName?: string;
  hideOverlay?: boolean;
}) => (
  <DialogContentInner
    className={className}
    hideClose={hideClose}
    overlayClassName={overlayClassName}
    hideOverlay={hideOverlay}
    {...props}
  >
    {children}
  </DialogContentInner>
);

const DialogContentInner = ({
  className,
  children,
  hideClose,
  overlayClassName,
  hideOverlay,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  hideClose?: boolean;
  overlayClassName?: string;
  hideOverlay?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <DialogPortal>
      {!hideOverlay && <DialogOverlay className={overlayClassName} />}
      <DialogPrimitive.Content
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 max-h-[90dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-xl duration-200",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <X className="size-4" />
            <span className="sr-only">{t("dialog.close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-1.5 p-6 pb-4", className)} {...props} />
);

const DialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
