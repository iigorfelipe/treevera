import type { FavSpecies } from "@/common/types/user";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useSpecieInfo } from "@/hooks/use-specie-info";
import { Plus } from "lucide-react";

export const PickerItem = ({
  specieKey,
  onSelect,
}: {
  specieKey: number;
  onSelect: (data: FavSpecies) => void;
}) => {
  const { specieName, familyName, isLoading: infoLoading } =
    useSpecieInfo(specieKey);
  const resolvedName =
    !infoLoading && specieName !== "—" ? specieName : undefined;
  const { data: imageData, isLoading: imgLoading } = useGetSpecieImage(
    specieKey,
    resolvedName,
  );
  const isLoading = infoLoading || imgLoading;

  const handleClick = () => {
    if (isLoading) return;
    onSelect({
      key: specieKey,
      name: specieName,
      img: imageData?.imgUrl ?? "",
      family: familyName,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="hover:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors disabled:opacity-50"
    >
      <div className="bg-muted size-12 shrink-0 overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="size-full animate-pulse" />
        ) : imageData?.imgUrl ? (
          <img
            src={imageData.imgUrl}
            alt={specieName}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Plus className="text-muted-foreground size-4" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {isLoading ? (
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        ) : (
          <>
            <p className="truncate text-sm font-medium">{specieName}</p>
            <p className="text-muted-foreground truncate text-xs italic">
              {familyName}
            </p>
          </>
        )}
      </div>
      <Plus className="text-muted-foreground size-4 shrink-0" />
    </button>
  );
};
