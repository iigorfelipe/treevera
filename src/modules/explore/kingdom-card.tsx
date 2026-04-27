import { memo, useCallback } from "react";

import type { ExploreInfo } from "@/common/types/tree-atoms";
import { cn } from "@/common/utils/cn";

type KingdomGroup = ExploreInfo["mainGroups"][number];

const MAX_VISIBLE_GROUPS = 3;

interface KingdomCardItemProps {
  item: ExploreInfo;
  active: boolean;
  kingdomLabel: string;
  mainGroupsLabel: string;
  onSelect: (kingdomKey: ExploreInfo["kingdomKey"]) => void;
  onGroupSelect: (pathNode: KingdomGroup["pathNode"]) => void;
  description?: string;
  onActivate: (kingdomKey: ExploreInfo["kingdomKey"]) => void;
  className?: string;
}

const KingdomCardItemComponent = ({
  item,
  active,
  kingdomLabel,
  mainGroupsLabel,
  onSelect,
  onGroupSelect,
  description,
  onActivate,
  className,
}: KingdomCardItemProps) => {
  const handleActivate = useCallback(
    () => onActivate(item.kingdomKey),
    [item.kingdomKey, onActivate],
  );

  const handleSelect = useCallback(
    () => onSelect(item.kingdomKey),
    [item.kingdomKey, onSelect],
  );

  return (
    <article
      onMouseEnter={handleActivate}
      onFocus={handleActivate}
      className={cn(
        "group @container/kingdom-card relative min-w-0 cursor-pointer overflow-hidden bg-black text-left text-white shadow-sm transition-[height,flex,box-shadow,opacity] duration-300 ease-out hover:shadow-2xl",
        active ? "z-10 opacity-100" : "opacity-90 hover:opacity-100",
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
        onClick={handleSelect}
      />

      <div
        className={cn(
          "pointer-events-none relative z-20 flex h-full w-full flex-col",
          active
            ? "p-5 @[320px]/kingdom-card:p-6"
            : "items-center justify-end p-2 @[90px]/kingdom-card:items-start @[120px]/kingdom-card:p-3",
        )}
      >
        {active && (
          <span
            className="w-fit rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase"
            style={{ backgroundColor: item.primaryColor }}
          >
            {kingdomLabel}
          </span>
        )}

        <div className="mt-auto">
          {!active && (
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className="size-8 rounded-md object-contain @[90px]/kingdom-card:hidden"
            />
          )}

          <h2
            className={cn(
              "font-black wrap-break-word text-white",
              active
                ? "text-2xl leading-none @[320px]/kingdom-card:text-3xl"
                : "hidden text-xs leading-tight @[90px]/kingdom-card:block @[120px]/kingdom-card:text-sm @[160px]/kingdom-card:text-lg",
            )}
          >
            {item.kingdomName}
          </h2>

          {active && (
            <div className="pointer-events-auto mt-3">
              <p className="max-w-md text-sm leading-5 font-semibold text-white/75">
                {description ?? item.description}
              </p>

              <div className="mt-4">
                <p className="text-[8px] font-bold text-white/45 uppercase">
                  {mainGroupsLabel}:
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.mainGroups.slice(0, MAX_VISIBLE_GROUPS).map((group) => (
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
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export const KingdomCardItem = memo(KingdomCardItemComponent);
