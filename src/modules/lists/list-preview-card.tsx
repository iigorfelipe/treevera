import { ImageOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
          params: { username, listSlug: list.slug },
        })
      }
      className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors"
    >
      <div className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {list.cover_image_url ? (
          <img
            src={list.cover_image_url}
            alt={list.title}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageOff className="text-muted-foreground size-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{list.title}</div>
        <div className="text-muted-foreground text-xs">
          {list.species_count} {t("lists.species")} · {list.likes_count}{" "}
          {t("lists.likes")}
        </div>
      </div>
    </div>
  );
};
