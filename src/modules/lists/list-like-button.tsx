import { Heart } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useToggleListLike } from "@/hooks/queries/useGetLists";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

type ListLikeButtonProps = {
  listId: string;
  isLiked: boolean;
  likesCount: number;
  size?: "sm" | "default";
  username?: string;
  listSlug?: string;
};

export const ListLikeButton = ({
  listId,
  isLiked,
  likesCount,
  size = "default",
  username,
  listSlug,
}: ListLikeButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const { mutate: toggle } = useToggleListLike(listId, username, listSlug);

  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likesCount);

  useEffect(() => {
    setOptimisticLiked(isLiked);
    setOptimisticCount(likesCount);
  }, [isLiked, likesCount]);

  const canNavigateToLikes = !!username && !!listSlug;
  const showCounter = optimisticCount > 0;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    const newLiked = !optimisticLiked;
    const newCount = newLiked
      ? optimisticCount + 1
      : Math.max(optimisticCount - 1, 0);

    setOptimisticLiked(newLiked);
    setOptimisticCount(newCount);

    toggle();
  };

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canNavigateToLikes) return;
    navigate({
      to: "/$username/lists/$listSlug/likes",
      params: { username, listSlug },
    });
  };

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const heartBtn = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const countBtn = size === "sm" ? "h-8 px-2" : "h-9 px-2.5";

  const heartIcon = (
    <Heart
      className={`${iconSize} transition-colors ${optimisticLiked ? "fill-red-500 text-red-500" : ""}`}
    />
  );

  return (
    <div className="flex items-center overflow-hidden">
      {isAuthenticated ? (
        <Button
          variant={optimisticLiked ? "secondary" : "ghost"}
          size="icon"
          className={`${heartBtn} shrink-0 transition-all ${showCounter ? "rounded-r-none" : ""}`}
          onClick={handleHeartClick}
        >
          {heartIcon}
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${heartBtn} shrink-0 transition-all ${showCounter ? "rounded-r-none" : ""}`}
              disabled
            >
              {heartIcon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("lists.loginToLike")}</TooltipContent>
        </Tooltip>
      )}

      <AnimatePresence>
        {showCounter && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Button
              variant={optimisticLiked ? "secondary" : "ghost"}
              className={`${countBtn} rounded-l-none border-l text-xs font-medium tabular-nums ${canNavigateToLikes ? "cursor-pointer" : "cursor-default"}`}
              onClick={handleCountClick}
              disabled={!canNavigateToLikes}
            >
              {optimisticCount}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
