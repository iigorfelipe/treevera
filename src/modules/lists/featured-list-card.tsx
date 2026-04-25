import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ListWithCreator } from "@/common/types/lists";
import { cn } from "@/common/utils/cn";
import { slugify } from "@/common/utils/slugify";
import { ListCoverCollage } from "./list-cover-collage";

type FeaturedListCardProps = {
  list: ListWithCreator;
  editMode?: boolean;
  onRemove?: () => void;
  tone?: "default" | "dark" | "transparent";
  className?: string;
};

export const FeaturedListCard = ({
  list,
  editMode = false,
  onRemove,
  tone = "default",
  className,
}: FeaturedListCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listSlug = list.slug || slugify(list.title);
  const isDark = tone === "dark";
  const isTransparent = tone === "transparent";

  return (
    <div
      onClick={() => {
        if (editMode) return;
        navigate({
          to: "/$username/lists/$listSlug",
          params: { username: list.user_username, listSlug },
        });
      }}
      className={cn(
        "group relative flex h-full cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isDark && "border-white/10 bg-white/4 text-white hover:bg-white/[0.07]",
        isTransparent &&
          "border-border text-foreground hover:border-foreground/20 bg-transparent",
        !isDark && !isTransparent && "bg-card",
        className,
      )}
    >
      <ListCoverCollage
        title={list.title}
        coverImageUrl={list.cover_image_url}
        coverSpeciesImages={list.cover_species_images}
        className="size-14 shrink-0 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "line-clamp-1 text-sm font-semibold group-hover:underline",
            isDark ? "text-white" : "text-primary",
            isTransparent && "text-foreground",
          )}
        >
          {list.title}
        </h3>
        <div className="mt-0.5 min-h-8">
          {list.description && (
            <p
              className={cn(
                "line-clamp-2 text-xs leading-4",
                isDark ? "text-white/55" : "text-muted-foreground",
              )}
            >
              {list.description}
            </p>
          )}
        </div>
        <span
          className={cn(
            "mt-1 block text-xs",
            isDark ? "text-white/45" : "text-muted-foreground",
          )}
        >
          {list.species_count} {t("lists.species")}
        </span>
      </div>
      {editMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full shadow-sm"
          aria-label={t("lists.featuredRemove")}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
};
