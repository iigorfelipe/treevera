import { LayoutGrid, List as ListIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/common/utils/cn";

export type ListViewMode = "grid" | "list";

type ListViewToggleProps = {
  value: ListViewMode;
  onChange: (value: ListViewMode) => void;
  size?: "sm" | "default";
  className?: string;
};

export const ListViewToggle = ({
  value,
  onChange,
  size = "sm",
  className,
}: ListViewToggleProps) => {
  const { t } = useTranslation();
  const optionSize = size === "sm" ? "h-8 w-9" : "h-10 w-12";

  const optionClassName = (option: ListViewMode) =>
    cn(
      "flex items-center justify-center transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
      optionSize,
      value === option
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div
      role="radiogroup"
      aria-label={t("lists.viewMode")}
      className={cn(
        "bg-background flex shrink-0 overflow-hidden rounded-lg border shadow-xs",
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "list"}
        aria-label={t("lists.listView")}
        className={optionClassName("list")}
        onClick={() => onChange("list")}
      >
        <ListIcon className="size-4" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "grid"}
        aria-label={t("lists.gridView")}
        className={optionClassName("grid")}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
};
