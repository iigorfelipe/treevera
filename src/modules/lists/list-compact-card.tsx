import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { formatActivityDate } from "@/common/utils/date-formats";
import { slugify } from "@/common/utils/slugify";
import type { ListWithCreator } from "@/common/types/lists";
import { ListCoverCollage } from "./list-cover-collage";
import { ListLikeButton } from "./list-like-button";

type ListCompactCardProps = {
  list: ListWithCreator;
};

export const ListCompactCard = ({ list }: ListCompactCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listSlug = list.slug || slugify(list.title);

  const handleOpenList = () => {
    if (!list.user_username) return;
    navigate({
      to: "/$username/lists/$listSlug",
      params: { username: list.user_username, listSlug },
    });
  };

  const userLabel = list.user_username
    ? `@${list.user_username}`
    : list.user_name || "-";
  const fallback = (list.user_name || list.user_username || "?")
    .slice(0, 1)
    .toUpperCase();

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
        <h3 className="text-primary line-clamp-2 text-sm font-semibold transition-colors group-hover:underline">
          {list.title}
        </h3>

        {list.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-sm leading-5">
            {list.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="border-border size-6 border">
              <AvatarImage src={list.user_avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">
                {fallback}
              </AvatarFallback>
            </Avatar>

            {list.user_username ? (
              <Link
                to="/$username"
                params={{ username: list.user_username }}
                onClick={(event) => event.stopPropagation()}
                className="text-muted-foreground hover:text-foreground truncate text-xs transition-colors"
              >
                {userLabel}
              </Link>
            ) : (
              <span className="text-muted-foreground truncate text-xs">
                {userLabel}
              </span>
            )}
          </div>

          <ListLikeButton
            listId={list.id}
            isLiked={list.is_liked}
            likesCount={list.likes_count}
            size="sm"
            username={list.user_username}
            listSlug={listSlug}
          />
        </div>

        <p className="text-muted-foreground mt-3 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>
    </div>
  );
};
