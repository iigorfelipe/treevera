// import { useAtomValue } from "jotai";
// import { useTranslation } from "react-i18next";

import type { ExploreInfo } from "@/common/types/tree-atoms";
import { cn } from "@/common/utils/cn";
// import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";
// import { useTreeNavigation } from "@/hooks/use-tree-navigation";
// import { treeAtom } from "@/store/tree";

interface KingdomCardItemProps {
  item: ExploreInfo;
  kingdomLabel: string;
  onSelect: () => void;
  className?: string;
}

export const KingdomCardItem = ({
  item,
  kingdomLabel,
  onSelect,
  className,
}: KingdomCardItemProps) => (
  <button
    type="button"
    aria-label={`${kingdomLabel} ${item.kingdomName}`}
    className={cn(
      "group relative flex w-full cursor-pointer overflow-hidden bg-black text-left text-white shadow-sm transition duration-300 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2",
      className,
    )}
    style={{ outlineColor: item.primaryColor }}
    onClick={onSelect}
  >
    <img
      src={item.bgImg}
      alt={item.kingdomName}
      className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
      loading="lazy"
    />

    <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/55 to-black/20" />
    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />

    <div className={cn("relative z-10 flex h-full w-full flex-col p-5 sm:p-7")}>
      <span
        className={cn(
          "w-fit rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase",
        )}
        style={{ backgroundColor: item.primaryColor }}
      >
        {kingdomLabel}
      </span>

      <h2 className={cn("pt-3 text-2xl leading-none font-black text-white")}>
        {item.kingdomName}
      </h2>
      {/* <div
        className={cn(
          "mt-auto flex flex-col pt-8",
          size === "compact" ? "gap-3" : "gap-4",
        )}
      >
        <div>
          <p
            className={cn(
              "mt-3 max-w-md pr-2 font-semibold text-white/75",
              size === "compact" ? "text-sm leading-5" : "text-base leading-6",
            )}
          >
            {item.description}
          </p>
        </div>

        <div>
          <p
            className={cn(
              "font-bold text-white/45 uppercase",
              size === "compact" ? "text-[8px]" : "text-[10px]",
            )}
          >
            {mainGroupsLabel}:
          </p>

          <div
            className={cn(
              "mt-2 flex flex-wrap",
              size === "compact" ? "gap-1.5" : "gap-3",
            )}
          >
            {item.mainGroups.slice(0, 3).map((group) => (
              <span
                key={group.groupName}
                className={cn(
                  "rounded-lg border border-white/10 bg-white/10 font-bold backdrop-blur-sm",
                  size === "compact"
                    ? "px-2 py-1 text-[9px]"
                    : "px-3 py-2 text-sm",
                )}
                style={{ color: item.primaryColor }}
              >
                {group.groupName}
              </span>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  </button>
);

// export const KingdomCard = () => {
//   const { t } = useTranslation();
//   const exploreInfos = useAtomValue(treeAtom.exploreInfos);
//   const { toggleNode } = useTreeNavigation();
//   const scrollThenNavigate = useScrollThenNavigate();

//   return (
//     <section className="min-h-screen bg-transparent px-4 py-6 sm:px-6 md:px-8">
//       <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
//         {exploreInfos.map((item) => (
//           <KingdomCardItem
//             key={item.kingdomKey}
//             item={item}
//             kingdomLabel={t("explore.kingdom")}
//             onSelect={() =>
//               scrollThenNavigate(() => toggleNode(item.kingdomKey))
//             }
//           />
//         ))}
//       </div>
//     </section>
//   );
// };
