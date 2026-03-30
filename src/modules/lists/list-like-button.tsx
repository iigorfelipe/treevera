import { Heart } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useToggleListLike } from "@/hooks/queries/useGetLists";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useTranslation } from "react-i18next";
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
};

export const ListLikeButton = ({
  listId,
  isLiked,
  likesCount,
  size = "default",
}: ListLikeButtonProps) => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const { mutate: toggle, isPending } = useToggleListLike(listId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggle();
  };

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const btnSize = size === "sm" ? "h-8 gap-1.5 px-2.5" : "h-9 gap-2 px-3";

  if (!isAuthenticated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={btnSize} disabled>
            <Heart className={iconSize} />
            <span className="text-xs">{likesCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("lists.loginToLike")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={isLiked ? "secondary" : "ghost"}
      size="sm"
      className={btnSize}
      onClick={handleClick}
      disabled={isPending}
    >
      <Heart
        className={`${iconSize} transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span className="text-xs">{likesCount}</span>
    </Button>
  );
};
