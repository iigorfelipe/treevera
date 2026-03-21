import type { FavSpecies } from "@/common/types/user";
import { Plus } from "lucide-react";

export const PickerItem = ({
  specieKey,
  specieName,
  familyName,
  imgUrl,
  onSelect,
}: {
  specieKey: number;
  specieName: string | null;
  familyName: string | null;
  imgUrl: string | null;
  onSelect: (data: FavSpecies) => void;
}) => {
  const displayImgUrl = imgUrl ?? "";

  const handleClick = () => {
    onSelect({
      key: specieKey,
      name: specieName ?? "",
      img: displayImgUrl,
      family: familyName ?? "",
    });
  };

  return (
    <button
      onClick={handleClick}
      className="hover:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors"
    >
      <div className="bg-muted size-12 shrink-0 overflow-hidden rounded-lg">
        {displayImgUrl ? (
          <img
            src={displayImgUrl}
            alt={specieName ?? ""}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Plus className="text-muted-foreground size-4" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{specieName}</p>
        <p className="text-muted-foreground truncate text-xs italic">
          {familyName}
        </p>
      </div>
      <Plus className="text-muted-foreground size-4 shrink-0" />
    </button>
  );
};
