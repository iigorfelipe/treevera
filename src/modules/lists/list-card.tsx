import { ImageOff } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { inatImageUrl } from "@/common/utils/image-size";
import { ListLikeButton } from "./list-like-button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { getListSlugParam } from "@/common/utils/list-url";

export type ListCardData = {
  id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  species_count: number;
  likes_count: number;
  is_public?: boolean;
  slug?: string | null;
  created_at: string;
  user_username: string;
  user_name?: string | null;
  user_avatar_url?: string | null;
  is_liked?: boolean;
};

type ListCardProps = {
  list: ListCardData;
};

export const ListCard = ({ list }: ListCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listSlug = getListSlugParam(list.title);

  return (
    <div
      onClick={() =>
        navigate({
          to: "/$username/lists/$listSlug",
          params: { username: list.user_username, listSlug },
        })
      }
      className="group bg-card flex cursor-pointer items-center gap-4 rounded-xl border p-3 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {list.cover_image_url ? (
          <img
            src={inatImageUrl(list.cover_image_url, "small")}
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
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {list.description}
          </p>
        )}
        <p className="text-muted-foreground mt-0.5 text-xs">
          {t("lists.by")}{" "}
          <Link
            to="/$username"
            params={{ username: list.user_username }}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-foreground font-medium transition-colors"
          >
            @{list.user_username}
          </Link>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>

      <div className="shrink-0">
        <ListLikeButton
          listId={list.id}
          isLiked={list.is_liked ?? false}
          likesCount={list.likes_count}
          size="sm"
          username={list.user_username}
          listSlug={listSlug}
        />
      </div>
    </div>
  );
};
