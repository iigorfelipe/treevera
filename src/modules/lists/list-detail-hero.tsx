import {
  ImageOff,
  Lock,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
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
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

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

  const handleShare = async () => {
    const url = `${window.location.origin}/treevera/${list.user_username}/lists/${list.slug}`;
    const title = list.title;
    const text = t("lists.shareText", { name: list.title });

    if (navigator.share) {
      try {
        await navigator.share({ title, url, text });
      } catch {
        //
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast(t("lists.shareCopied"));
    }
  };

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

        {!list.is_public && (
          <div className="bg-background/80 absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            <Lock className="size-3" />
            {t("lists.visibilityPrivate")}
          </div>
        )}
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
                {t("lists.by")}{" "}
                {list.user_username ? (
                  <Link
                    to="/$username"
                    params={{ username: list.user_username }}
                    className="hover:text-foreground font-medium transition-colors"
                  >
                    @{list.user_username}
                  </Link>
                ) : (
                  list.user_name || "—"
                )}
              </span>
            </div>

            <div className="flex items-center">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                Atualizada ·{" "}
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

          <div className="flex justify-between gap-5 border-t py-5">
            <div className="flex w-full flex-col gap-px">
              <h1 className="text-xl font-bold sm:text-2xl">{list.title}</h1>

              {list.description && (
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {list.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              {list.is_public && (
                <ListLikeButton
                  listId={list.id}
                  isLiked={list.is_liked}
                  likesCount={list.likes_count}
                  username={list.user_username}
                  listSlug={list.slug}
                />
              )}
              <div className="flex w-full gap-2">
                <div className="min-w-0">
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
                <span className="shrink-0 text-lg font-bold tabular-nums">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {list.is_public && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              {t("lists.shareLabel")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
