import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardInfo } from "@/modules/explore/card";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTranslation } from "react-i18next";
import { useResponsive } from "@/hooks/use-responsive";

export const ExploreInfo = () => {
  const { t } = useTranslation();
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { toggleNode } = useTreeNavigation();
  const { isMobile } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = exploreInfos.length;

  useEffect(() => {
    const id = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % total);
    }, 7000);
    return () => clearTimeout(id);
  }, [currentIndex, total]);

  if (!challengeMode && expandedNodes.length) return <CardInfo />;

  const current = exploreInfos[currentIndex];

  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  return (
    <div
      className="relative min-h-screen w-full cursor-pointer overflow-hidden bg-black pl-4"
      onClick={() => toggleNode(current.kingdomKey)}
    >
      <img
        key={current.kingdomKey}
        src={current.bgImg}
        alt={current.kingdomName}
        className="animate-fade-in absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

      <div className="absolute top-8 flex items-center gap-3">
        <div
          className="h-5 w-0.5 rounded-full"
          style={{ backgroundColor: current.primaryColor }}
        />
        <span className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
          {t("explore.kingdom")} {current.kingdomName.toUpperCase()}
        </span>
      </div>

      <div
        key={currentIndex}
        className="animate-slide-up absolute bottom-32 max-w-xl space-y-5"
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-widest text-white uppercase"
          style={{ backgroundColor: current.primaryColor }}
        >
          {t("explore.kingdom")}
        </span>

        <h1 className="text-4xl leading-none font-black tracking-tight text-white sm:text-5xl md:text-7xl">
          {current.kingdomName}
        </h1>

        <p className="max-w-sm leading-relaxed text-white/65 sm:text-sm">
          {current.description}
        </p>

        <div className="space-y-1">
          <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase">
            {t("explore.mainGroups")}:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {current.mainGroups.slice(0, 3).map((group, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm"
              >
                <p
                  className="mt-0.5 text-sm font-semibold"
                  style={{ color: current.primaryColor }}
                >
                  {group.groupName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 flex items-center gap-2">
        {exploreInfos.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            className="h-0.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 28 : 12,
              backgroundColor:
                i === currentIndex
                  ? current.primaryColor
                  : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      <div
        className="absolute right-8 bottom-7 flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {!isMobile && (
          <span className="min-w-12 text-right text-sm font-medium text-white/40 tabular-nums">
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        )}

        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full text-black transition"
          style={{ backgroundColor: current.primaryColor }}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
};
