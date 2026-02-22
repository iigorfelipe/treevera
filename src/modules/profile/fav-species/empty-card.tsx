import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EmptyFavCard = ({
  editMode,
  onAdd,
}: {
  editMode: boolean;
  onAdd?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={editMode ? onAdd : undefined}
      className={`border-border bg-muted flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
        editMode
          ? "hover:border-primary/60 hover:bg-primary/5 cursor-pointer"
          : ""
      }`}
    >
      <div className="text-center">
        <Plus
          className={`mx-auto mb-2 h-8 w-8 transition-colors ${
            editMode ? "text-primary/60" : "text-muted-foreground/40"
          }`}
        />
        <div
          className={`text-xs transition-colors ${
            editMode
              ? "text-primary/70 font-medium"
              : "text-muted-foreground/70"
          }`}
        >
          {t("favSpecies.addFavorite")}
        </div>
      </div>
    </div>
  );
};
