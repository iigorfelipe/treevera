import { useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/common/utils/cn";
import { inatImageUrl } from "@/common/utils/image-size";

const COVER_SLOTS = 3;

type ListCoverCollageProps = {
  title: string;
  coverImageUrl?: string | null;
  coverSpeciesImages?: (string | null)[] | null;
  className?: string;
};

export const ListCoverCollage = ({
  title,
  coverImageUrl,
  coverSpeciesImages,
  className,
}: ListCoverCollageProps) => {
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const speciesImages = useMemo(
    () =>
      Array.from(
        { length: COVER_SLOTS },
        (_, index) => coverSpeciesImages?.[index] ?? null,
      ),
    [coverSpeciesImages],
  );
  const hasSpeciesImages = !!coverSpeciesImages?.length;
  const imageKey = hasSpeciesImages
    ? speciesImages.join("|")
    : (coverImageUrl ?? "");

  const [prevImageKey, setPrevImageKey] = useState(imageKey);
  if (prevImageKey !== imageKey) {
    setPrevImageKey(imageKey);
    setBrokenImages({});
  }

  const markBroken = (index: number) => {
    setBrokenImages((current) => ({ ...current, [index]: true }));
  };

  const renderImageSlot = (
    imageUrl: string | null,
    index: number,
    slotClassName?: string,
  ) => {
    if (imageUrl && !brokenImages[index]) {
      return (
        <img
          src={inatImageUrl(imageUrl, "small")}
          alt={title}
          className={cn(
            "size-full object-cover transition-transform duration-500 group-hover:scale-105",
            slotClassName,
          )}
          loading="lazy"
          onError={() => markBroken(index)}
        />
      );
    }

    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground flex size-full items-center justify-center",
          slotClassName,
        )}
      >
        <ImageOff className="size-6 opacity-50" />
      </div>
    );
  };

  if (hasSpeciesImages) {
    return (
      <div className={cn("bg-muted flex overflow-hidden", className)}>
        {speciesImages.map((imageUrl, index) => (
          <div
            key={`${imageUrl ?? "empty"}-${index}`}
            className="min-w-0 flex-1 overflow-hidden"
          >
            {renderImageSlot(imageUrl, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("bg-muted overflow-hidden", className)}>
      {coverImageUrl
        ? renderImageSlot(coverImageUrl, 0)
        : renderImageSlot(null, 0)}
    </div>
  );
};
