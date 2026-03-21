import { Button } from "@/common/components/ui/button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { Images, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useGetRecentSeenSpecies } from "@/hooks/queries/useGetUserSeenSpecies";

const SpecieItem = ({
  canonicalName,
  family,
  date,
}: {
  canonicalName: string | null;
  family: string | null;
  date: string;
}) => {
  return (
    <div className="-mx-2 flex items-center justify-between border-b px-2 py-2 last:border-0">
      <div className="flex items-center gap-2">
        <div>
          <div className="text-xs font-medium italic">{canonicalName}</div>
          <div className="text-muted-foreground text-xs">{family}</div>
        </div>
      </div>
      <div className="text-muted-foreground shrink-0 text-xs">
        {formatActivityDate(date)}
      </div>
    </div>
  );
};

export const SpeciesGalleryPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: seenSpecies = [], isLoading } = useGetRecentSeenSpecies(4);

  if (isLoading) return null;

  const handleOpenGallery = () => {
    navigate({ to: "/profile/species-gallery" });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>{t("seenSpecies.title")}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 px-2 text-xs"
          disabled={!seenSpecies.length}
          onClick={handleOpenGallery}
        >
          {t("seenSpecies.openGallery")}{" "}
          <ChevronRight className="ml-1 size-3" />
        </Button>
      </div>

      {!seenSpecies.length ? (
        <div className="text-muted-foreground py-8 text-center">
          <Images className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {t("seenSpecies.emptyTitle")}
          </div>
          <div className="text-xs">{t("seenSpecies.emptyHint")}</div>
        </div>
      ) : (
        seenSpecies.map((species) => (
            <SpecieItem
              key={species.gbif_key}
              canonicalName={species.canonical_name}
              family={species.family}
              date={species.seen_at}
            />
          ))
      )}
    </div>
  );
};
