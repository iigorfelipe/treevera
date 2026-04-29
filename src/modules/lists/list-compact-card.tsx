import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { formatActivityDate } from "@/common/utils/date-formats";
import { getListSlugParam } from "@/common/utils/list-url";
import type { ListCardData } from "./list-card";
import { ListCoverCollage } from "./list-cover-collage";
import { ListLikeButton } from "./list-like-button";

type ListCompactCardProps = {
  list: ListCardData & { cover_species_images?: (string | null)[] | null };
};

export const ListCompactCard = ({ list }: ListCompactCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listSlug = getListSlugParam(list.title);

  const handleOpenList = () => {
    navigate({
      to: "/$username/lists/$listSlug",
      params: { username: list.user_username, listSlug },
    });
  };

  const creatorName = list.user_name ?? list.user_username;
  const fallback = creatorName.slice(0, 1).toUpperCase();

  return (
    <div
      onClick={handleOpenList}
      className="group bg-card flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <ListCoverCollage
        title={list.title}
        coverImageUrl={list.cover_image_url ?? null}
        coverSpeciesImages={list.cover_species_images}
        className="aspect-5/3 w-full"
      />

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-primary line-clamp-2 text-sm font-semibold transition-colors group-hover:underline">
          {list.title}
        </h3>

        <div className="mt-1 min-h-10">
          {list.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-5">
              {list.description}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="border-border size-6 border">
              <AvatarImage src={list.user_avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {fallback}
              </AvatarFallback>
            </Avatar>

            <Link
              to="/$username"
              params={{ username: list.user_username }}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground truncate text-xs transition-colors"
            >
              @{list.user_username}
            </Link>
          </div>

          <ListLikeButton
            listId={list.id}
            isLiked={list.is_liked ?? false}
            likesCount={list.likes_count}
            size="sm"
            username={list.user_username}
            listSlug={listSlug}
          />
        </div>

        <p className="text-muted-foreground mt-auto pt-3 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>
    </div>
  );
};
