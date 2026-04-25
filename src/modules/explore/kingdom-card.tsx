import { AnimatePresence, motion } from "framer-motion";

import type { ExploreInfo } from "@/common/types/tree-atoms";
import { cn } from "@/common/utils/cn";

type KingdomGroup = ExploreInfo["mainGroups"][number];

interface KingdomCardItemProps {
  item: ExploreInfo;
  kingdomLabel: string;
  mainGroupsLabel: string;
  onSelect: () => void;
  onGroupSelect: (pathNode: KingdomGroup["pathNode"]) => void;
  active?: boolean;
  compressed?: boolean;
  onActiveChange?: (active: boolean) => void;
  className?: string;
}

export const KingdomCardItem = ({
  item,
  kingdomLabel,
  mainGroupsLabel,
  onSelect,
  onGroupSelect,
  active = false,
  compressed = false,
  onActiveChange,
  className,
}: KingdomCardItemProps) => {
  return (
    <motion.div
      layout
      transition={{
        layout: { type: "spring", stiffness: 360, damping: 34, duration: 0.5 },
      }}
      onMouseEnter={() => onActiveChange?.(true)}
      onFocus={() => onActiveChange?.(true)}
      className={cn(
        "group @container/kingdom-card relative flex w-full cursor-pointer overflow-hidden bg-black rounded-md text-left text-white shadow-sm will-change-transform hover:shadow-2xl",
        active && "z-10",
        className,
      )}
    >
      <img
        src={item.bgImg}
        alt={item.kingdomName}
        className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />

      <button
        type="button"
        aria-label={`${kingdomLabel} ${item.kingdomName}`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: item.primaryColor }}
        onClick={onSelect}
      />

      <div
        className={cn(
          "pointer-events-none relative z-20 flex h-full w-full flex-col",
          compressed
            ? "p-3 @[240px]/kingdom-card:p-4"
            : active
              ? "p-4 @[240px]/kingdom-card:p-5 @[340px]/kingdom-card:p-6"
              : "p-4 @[240px]/kingdom-card:p-5 @[340px]/kingdom-card:p-7",
        )}
      >
        <span
          className={cn(
            "w-fit rounded-full font-bold text-white uppercase",
            compressed ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]",
          )}
          style={{ backgroundColor: item.primaryColor }}
        >
          {kingdomLabel}
        </span>

        <motion.div
          layout
          className={cn(
            "mt-auto",
            compressed ? "pt-3" : active ? "pt-4" : "pt-6",
          )}
        >
          <motion.h2
            layout
            className={cn(
              "leading-none font-black text-white",
              compressed
                ? "text-base @[240px]/kingdom-card:text-lg"
                : "text-xl @[240px]/kingdom-card:text-2xl",
            )}
          >
            {item.kingdomName}
          </motion.h2>

          <AnimatePresence initial={false}>
            {active && (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0, y: 8 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: 4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto overflow-hidden"
              >
                <p className="mt-2 max-w-md text-sm leading-5 font-semibold text-white/75">
                  {item.description}
                </p>

                <div className="mt-3">
                  <p className="text-[8px] font-bold text-white/45 uppercase">
                    {mainGroupsLabel}:
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.mainGroups.slice(0, 3).map((group) => (
                      <button
                        key={group.groupName}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onGroupSelect(group.pathNode);
                        }}
                        className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-left text-xs font-bold backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          color: item.primaryColor,
                          outlineColor: item.primaryColor,
                        }}
                      >
                        {group.groupName}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
