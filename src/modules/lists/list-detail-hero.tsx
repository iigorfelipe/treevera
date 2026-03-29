import { ArrowLeft, ImageOff, Calendar } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { ListLikeButton } from "./list-like-button";
import { useTranslation } from "react-i18next";
import { formatActivityDate } from "@/common/utils/date-formats";
import type { ListWithCreator } from "@/common/types/lists";

type ListDetailHeroProps = {
  list: ListWithCreator;
  onBack: () => void;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const ListDetailHero = ({
  list,
  onBack,
  isOwner,
  onEdit,
  onDelete,
}: ListDetailHeroProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-72">
        {list.cover_image_url ? (
          <img
            src={list.cover_image_url}
            alt={list.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-muted flex size-full items-center justify-center">
            <ImageOff className="text-muted-foreground size-16 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="size-7 border border-white/20">
                <AvatarImage src={list.user_avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {(list.user_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="cursor-pointer text-sm text-white/80 hover:text-white hover:underline">
                {t("lists.by")} @{list.user_name || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Calendar className="size-3" />
              {formatActivityDate(list.created_at)}
            </div>
          </div>

          <h1 className="mb-2 text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {list.title}
          </h1>

          {list.description && (
            <p className="mb-3 line-clamp-2 text-sm text-white/70">
              {list.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <ListLikeButton
              listId={list.id}
              isLiked={list.is_liked}
              likesCount={list.likes_count}
            />

            <span className="text-xs text-white/60">
              {list.species_count} {t("lists.species")}
            </span>

            <div className="flex-1" />

            {isOwner && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/80 hover:text-white"
                onClick={onEdit}
              >
                {t("favSpecies.edit")}
              </Button>
            )}

            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-400 hover:text-red-300"
                onClick={onDelete}
              >
                {t("lists.deleteList")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 left-3 size-8 text-white/80 hover:bg-white/10 hover:text-white"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" />
      </Button>
    </div>
  );
};
