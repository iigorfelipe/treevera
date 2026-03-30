import { ImageOff, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { ListLikeButton } from "./list-like-button";
import { useTranslation } from "react-i18next";
import { formatActivityDate } from "@/common/utils/date-formats";
import type { ListWithCreator } from "@/common/types/lists";

type ListDetailHeroProps = {
  list: ListWithCreator;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const ListDetailHero = ({
  list,
  isOwner,
  onEdit,
  onDelete,
}: ListDetailHeroProps) => {
  const { t } = useTranslation();

  const knownCount = list.known_count ?? 0;
  const totalCount = list.species_count;
  const pct = totalCount > 0 ? (knownCount / totalCount) * 100 : 0;

  return (
    <div>
      <div className="relative h-52 w-full overflow-hidden sm:h-64 md:h-72">
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
        <div className="from-background absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
      </div>

      <div className="px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="border-border size-7 border">
                <AvatarImage src={list.user_avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {(list.user_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-sm">
                Lista criada {t("lists.by")} {list.user_name || "—"}
              </span>
            </div>

            <div className="flex items-center">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="size-3" />
                Atualizada em:{" "}
                {formatActivityDate(list.updated_at || list.created_at)}
              </div>

              {isOwner && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 size-4" />
                        {t("favSpecies.edit")}
                      </DropdownMenuItem>
                    )}
                    {onEdit && onDelete && <DropdownMenuSeparator />}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t("lists.deleteList")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="my-5 border-t" />

          <h1 className="text-xl font-bold sm:text-2xl">{list.title}</h1>

          {list.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {list.description}
            </p>
          )}

          <div className="flex items-center gap-2 pt-5">
            <ListLikeButton
              listId={list.id}
              isLiked={list.is_liked}
              likesCount={list.likes_count}
            />

            <div className="ml-auto flex min-w-0 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground mb-1 truncate text-xs">
                  {knownCount}/{totalCount} {t("lists.knownSpecies")}
                </p>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="mt-auto shrink-0 text-sm font-bold tabular-nums">
                {pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
