import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { formatActivityDate } from "@/common/utils/date-formats";
import { slugify } from "@/common/utils/slugify";
import type { ListPreview } from "@/common/types/lists";
import { ListCoverCollage } from "./list-cover-collage";

type ListPreviewCompactCardProps = {
  list: ListPreview;
  username: string;
};

export const ListPreviewCompactCard = ({
  list,
  username,
}: ListPreviewCompactCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenList = () => {
    navigate({
      to: "/$username/lists/$listSlug",
      params: { username, listSlug: list.slug || slugify(list.title) },
    });
  };

  return (
    <div
      onClick={handleOpenList}
      className="group bg-card h-full cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <ListCoverCollage
        title={list.title}
        coverImageUrl={list.cover_image_url}
        coverSpeciesImages={list.cover_species_images}
        className="aspect-5/3 w-full"
      />

      <div className="p-4">
        <div className="flex items-start gap-1.5">
          <h3 className="text-primary line-clamp-2 text-sm font-semibold transition-colors group-hover:underline">
            {list.title}
          </h3>
          {list.is_public === false && (
            <Lock className="text-muted-foreground mt-0.5 size-3 shrink-0" />
          )}
        </div>

        {list.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
            {list.description}
          </p>
        )}

        <p className="text-muted-foreground mt-3 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>
    </div>
  );
};
