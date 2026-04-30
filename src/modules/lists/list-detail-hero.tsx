import {
  ImageOff,
  ListTree,
  Lock,
  Loader2,
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
import { inatImageUrl } from "@/common/utils/image-size";
import { formatActivityDate } from "@/common/utils/date-formats";
import type { ListWithCreator } from "@/common/types/lists";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { getAppUrl } from "@/common/utils/base-url";
import { getListSlugParam } from "@/common/utils/list-url";

export type SpeciesFilter = "all" | "known" | "unknown";

type ListDetailHeroProps = {
  list: ListWithCreator;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  speciesFilter?: SpeciesFilter;
  onFilterChange?: (filter: SpeciesFilter) => void;
  onOpenInTree?: () => void;
  openingInTree?: boolean;
};

export const ListDetailHero = ({
  list,
  isOwner,
  onEdit,
  onDelete,
  speciesFilter = "all",
  onFilterChange,
  onOpenInTree,
  openingInTree = false,
}: ListDetailHeroProps) => {
  const { t } = useTranslation();

  const knownCount = list.known_count ?? 0;
  const totalCount = list.species_count;
  const pct = totalCount > 0 ? (knownCount / totalCount) * 100 : 0;
  const listSlug = getListSlugParam(list.title);

  const handleShare = async () => {
    const url = getAppUrl(`/${list.user_username}/lists/${listSlug}`);
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
      <div className="relative -mx-4 overflow-x-hidden md:-mx-20">
        <div className="bg-background relative h-76 overflow-hidden sm:h-88 md:h-100">
          {list.cover_image_url ? (
            <>
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${inatImageUrl(list.cover_image_url, "large")})`,
                }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 110% 120% at 50% 52%, transparent 0%, transparent 24%, color-mix(in oklab, var(--background) 12%, transparent) 44%, color-mix(in oklab, var(--background) 42%, transparent) 62%, color-mix(in oklab, var(--background) 78%, transparent) 80%, var(--background) 96%)",
                }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
                style={{
                  background:
                    "linear-gradient(to top, var(--background) 0%, color-mix(in oklab, var(--background) 90%, transparent) 20%, color-mix(in oklab, var(--background) 60%, transparent) 50%, color-mix(in oklab, var(--background) 25%, transparent) 75%, transparent 100%)",
                }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-24"
                style={{
                  background:
                    "linear-gradient(to right, var(--background) 0%, color-mix(in oklab, var(--background) 60%, transparent) 50%, transparent 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-24"
                style={{
                  background:
                    "linear-gradient(to left, var(--background) 0%, color-mix(in oklab, var(--background) 60%, transparent) 50%, transparent 100%)",
                }}
              />
            </>
          ) : (
            <div className="bg-muted flex size-full items-center justify-center">
              <ImageOff className="text-muted-foreground size-16 opacity-30" />
            </div>
          )}

          {!list.is_public && (
            <div className="bg-background/80 absolute top-18 left-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm sm:top-20 sm:left-4">
              <Lock className="size-3" />
              {t("lists.visibilityPrivate")}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-7xl space-y-4 sm:-mt-12 md:-mt-14">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="border-border size-7 shrink-0 border">
                <AvatarImage src={list.user_avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {(list.user_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground min-w-0 truncate text-sm">
                {t("lists.by")}{" "}
                {list.user_username ? (
                  <Link
                    to="/$username"
                    params={{ username: list.user_username }}
                    className="hover:text-foreground inline-block max-w-full truncate align-bottom font-medium transition-colors"
                  >
                    @{list.user_username}
                  </Link>
                ) : (
                  list.user_name || "-"
                )}
              </span>
            </div>

            <div className="text-muted-foreground pl-0.5 text-xs">
              Atualizada {"\u00b7"}{" "}
              {formatActivityDate(list.updated_at || list.created_at)}
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-1.5">
            {list.is_public && (
              <>
                <ListLikeButton
                  listId={list.id}
                  isLiked={list.is_liked}
                  likesCount={list.likes_count}
                  size="sm"
                  username={list.user_username}
                  listSlug={listSlug}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex h-8 min-w-0 gap-2 px-2.5"
                  onClick={handleShare}
                  aria-label={t("lists.shareLabel")}
                >
                  <Share2 className="size-4" />
                </Button>
              </>
            )}

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

        <div className="flex flex-col gap-4 py-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex justify-between">
              <h1 className="min-w-0 text-xl font-bold sm:text-2xl">
                {list.title}
              </h1>
              {onOpenInTree && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex h-8 min-w-0 gap-2 px-2.5"
                  onClick={onOpenInTree}
                  disabled={openingInTree || list.species_count === 0}
                  aria-label={t("lists.openInTree")}
                >
                  {openingInTree ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ListTree className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {openingInTree
                      ? "Construindo árvore..."
                      : t("lists.openInTree")}
                  </span>
                </Button>
              )}
            </div>
            {list.description && (
              <p className="text-muted-foreground line-clamp-3 text-sm sm:line-clamp-2">
                {list.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {onFilterChange && (
            <div className="flex flex-wrap gap-1">
              {(["all", "known", "unknown"] as SpeciesFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    speciesFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t(`lists.filter${f.charAt(0).toUpperCase()}${f.slice(1)}`)}
                </button>
              ))}
            </div>
          )}
          <div className="w-full">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="text-muted-foreground min-w-0 text-xs">
                {knownCount}/{totalCount} {t("lists.knownSpecies")}
              </p>
              <span className="shrink-0 text-lg font-bold tabular-nums">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
