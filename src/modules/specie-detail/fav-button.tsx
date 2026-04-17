import { Heart } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

type SpecieFavButtonProps = {
  isFav: boolean;
  onToggle: () => void;
  disabled?: boolean;
  showButton?: boolean;
  favCount?: number;
  specieKey?: number;
};

export const SpecieFavButton = ({
  isFav,
  onToggle,
  disabled = false,
  showButton = true,
  favCount = 0,
  specieKey,
}: SpecieFavButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [optimisticFav, setOptimisticFav] = useState(isFav);
  const [optimisticCount, setOptimisticCount] = useState(favCount);

  useEffect(() => {
    setOptimisticFav(isFav);
  }, [isFav]);

  useEffect(() => {
    setOptimisticCount(favCount);
  }, [favCount]);

  const showCounter = optimisticCount > 0;

  const handleToggle = () => {
    const newFav = !optimisticFav;
    const newCount = newFav
      ? optimisticCount + 1
      : Math.max(optimisticCount - 1, 0);
    setOptimisticFav(newFav);
    setOptimisticCount(newCount);
    onToggle();
  };

  const currentFrom = useRouterState({
    select: (s) => (s.location.search as { from?: unknown } | undefined)?.from,
  });
  const fromSearch = typeof currentFrom === "string" ? currentFrom : undefined;

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!specieKey) return;
    void navigate({
      to: "/specie-detail/$specieKey/likes",
      params: { specieKey: String(specieKey) },
      search: fromSearch ? { from: fromSearch } : {},
    });
  };

  const heartIcon = (
    <Heart
      className={`size-4 transition-colors ${optimisticFav ? "fill-red-500 text-red-500" : ""}`}
    />
  );

  return (
    <div className="flex items-center overflow-hidden">
      {!showButton ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 shrink-0 transition-all ${showCounter ? "rounded-r-none" : ""}`}
              disabled
            >
              {heartIcon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("specieDetail.loginToFav")}</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant={optimisticFav ? "secondary" : "ghost"}
          size="icon"
          className={`h-9 w-9 shrink-0 transition-all ${showCounter ? "rounded-r-none" : ""}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          {heartIcon}
        </Button>
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
              variant={optimisticFav ? "secondary" : "ghost"}
              className={`h-9 rounded-l-none border-l px-2.5 text-xs font-medium tabular-nums ${specieKey ? "cursor-pointer" : "cursor-default"}`}
              onClick={handleCountClick}
              disabled={!specieKey}
            >
              {optimisticCount}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
