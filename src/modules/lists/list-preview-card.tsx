import { ImageOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { formatActivityDate } from "@/common/utils/date-formats";
import { slugify } from "@/common/utils/slugify";
import type { ListPreview } from "@/common/types/lists";

type ListPreviewCardProps = {
  list: ListPreview;
  username: string;
};

export const ListPreviewCard = ({ list, username }: ListPreviewCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate({
          to: "/$username/lists/$listSlug",
          params: { username, listSlug: list.slug || slugify(list.title) },
        })
      }
      className="group bg-card flex cursor-pointer items-center gap-4 rounded-xl border p-3 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {list.cover_image_url ? (
          <img
            src={list.cover_image_url}
            alt={list.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ImageOff className="text-muted-foreground size-8" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
          {list.title}
        </h3>
        {list.description && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {list.description}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>
    </div>
  );
};
