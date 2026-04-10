import { useEffect, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";

export const CardInfoPopup = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <CircleHelp className="size-4" />
      </button>
      {open && (
        <div className="bg-background absolute top-6 right-0 z-50 w-64 rounded-xl border p-3 shadow-md">
          <p className="text-muted-foreground text-sm">{text}</p>
        </div>
      )}
    </div>
  );
};
