import { Button } from "@/common/components/ui/button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Images, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useSpecieInfo } from "@/hooks/use-specie-info";
import { useTranslation } from "react-i18next";

const SpecieItem = ({
  specieKey,
  date,
}: {
  specieKey: number;
  date: string;
}) => {
  const { specieName, familyName, isLoading } = useSpecieInfo(specieKey);

  if (isLoading) {
    return (
      <div className="-mx-2 border-b px-2 py-2 last:border-0">
        <div className="bg-muted mb-1 h-4 w-32 animate-pulse rounded" />
        <div className="bg-muted h-3 w-24 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="-mx-2 flex items-center justify-between border-b px-2 py-2 last:border-0">
      <div className="flex items-center gap-2">
        <div>
          <div className="text-xs font-medium italic">{specieName}</div>
          <div className="text-muted-foreground text-xs">{familyName}</div>
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
  const userDb = useAtomValue(authStore.userDb);
  const navigate = useNavigate();

  const seenSpecies = userDb?.game_info?.seen_species ?? [];

  if (!userDb || !userDb.game_info) return null;

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
          {t("seenSpecies.openGallery")} <ChevronRight className="ml-1 size-3" />
        </Button>
      </div>

      {!seenSpecies.length ? (
        <div className="text-muted-foreground py-8 text-center">
          <Images className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">{t("seenSpecies.emptyTitle")}</div>
          <div className="text-xs">{t("seenSpecies.emptyHint")}</div>
        </div>
      ) : (
        seenSpecies
          .slice()
          .reverse()
          .slice(0, 4)
          .map((species) => (
            <SpecieItem
              key={species.key}
              specieKey={species.key}
              date={species.date}
            />
          ))
      )}
    </div>
  );
};
