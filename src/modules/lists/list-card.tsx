import { ImageOff } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ListLikeButton } from "./list-like-button";
import { formatActivityDate } from "@/common/utils/date-formats";
import type { ListWithCreator } from "@/common/types/lists";

type ListCardProps = {
  list: ListWithCreator;
};

export const ListCard = ({ list }: ListCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate({ to: "/$username/lists/$listSlug", params: { username: list.user_username, listSlug: list.slug } })
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
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {list.description}
          </p>
        )}
        <p className="text-muted-foreground mt-0.5 text-xs">
          {t("lists.by")}{" "}
          {list.user_username ? (
            <Link
              to="/$username"
              params={{ username: list.user_username }}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-foreground font-medium transition-colors"
            >
              @{list.user_username}
            </Link>
          ) : (
            list.user_name || "—"
          )}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {list.species_count} {t("lists.species")} ·{" "}
          {formatActivityDate(list.created_at)}
        </p>
      </div>

      <div className="shrink-0">
        <ListLikeButton
          listId={list.id}
          isLiked={list.is_liked}
          likesCount={list.likes_count}
          size="sm"
        />
      </div>
    </div>
  );
};
