import { Image } from "@/common/components/image";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useSpecieInfo } from "@/hooks/use-specie-info";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyFavCard } from "./empty-card";

export const FilledFavCard = ({
  specieKey,
  editMode,
  onClick,
  onRemove,
  dragHandleProps,
}: {
  specieKey: number;
  editMode: boolean;
  onClick: () => void;
  onRemove: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const {
    specieName,
    familyName,
    isLoading: isLoadingInfo,
  } = useSpecieInfo(specieKey);
  const { t } = useTranslation();
  const resolvedName =
    !isLoadingInfo && specieName !== "—" ? specieName : undefined;
  const { data: imageData, isLoading: isLoadingImage } = useGetSpecieImage(
    specieKey,
    resolvedName,
  );

  const isLoading = isLoadingInfo || isLoadingImage;

  return (
    <div className="group relative">
      {isLoading ? (
        <div className="bg-accent flex aspect-3/4 w-full animate-pulse items-center justify-center overflow-hidden rounded-xl">
          <Loader className="size-5 animate-spin" />
        </div>
      ) : imageData?.imgUrl ? (
        <>
          <figure
            onClick={onClick}
            className={`relative aspect-3/4 w-full cursor-pointer overflow-hidden rounded-xl shadow-sm transition-all duration-300 ease-out ${
              editMode
                ? "ring-primary/40 ring-2 brightness-75 hover:brightness-90"
                : "group-hover:shadow-lg"
            }`}
          >
            <Image
              src={imageData.imgUrl}
              alt={specieName}
              loading="lazy"
              className={`size-full object-cover transition-transform duration-500 ease-out ${
                editMode ? "" : "group-hover:scale-110"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-3 pt-8 pb-3">
              <p className="truncate text-xs leading-tight font-semibold text-white">
                {specieName}
              </p>
              <p className="truncate text-xs text-white/70 italic">
                {familyName}
              </p>
            </div>

            {editMode && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {t("favSpecies.replace")}
                </span>
              </div>
            )}
          </figure>

          {editMode && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="bg-destructive hover:bg-destructive/80 absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center rounded-full text-white shadow-md transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}

          {editMode && dragHandleProps && (
            <div
              {...dragHandleProps}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragHandleProps.onPointerDown?.(
                  e as React.PointerEvent<HTMLDivElement>,
                );
              }}
              className="absolute right-1 bottom-2 z-10 flex -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-black/40 px-2 py-0.5 text-white transition-colors hover:bg-black/60 active:cursor-grabbing"
            >
              <GripVertical className="size-3.5" />
            </div>
          )}

          {!editMode && (
            <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <div className="bg-popover ring-border overflow-hidden rounded-xl shadow-2xl ring-1">
                <img
                  src={imageData.imgUrl}
                  alt={specieName}
                  className="block max-h-56 max-w-56 object-contain"
                />
              </div>
              <div className="border-t-popover mx-auto h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent" />
            </div>
          )}
        </>
      ) : (
        <EmptyFavCard
          editMode={editMode}
          onAdd={editMode ? onClick : undefined}
        />
      )}
    </div>
  );
};

export const SortableFilledCard = (
  props: React.ComponentProps<typeof FilledFavCard>,
) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(props.specieKey),
    disabled: !props.editMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FilledFavCard
        {...props}
        dragHandleProps={
          props.editMode ? { ...attributes, ...listeners } : undefined
        }
      />
    </div>
  );
};
