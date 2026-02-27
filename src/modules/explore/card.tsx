import { curiosidades } from "@/common/utils/dataFake";
import { capitalizar } from "@/common/utils/string";
import { getKingdomImages } from "@/common/utils/tree/ranks";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { useMemo, useState, useEffect } from "react";
import { Route, ChevronLeft, ChevronRight } from "lucide-react";
import { authStore } from "@/store/auth/atoms";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTranslation } from "react-i18next";
import type { Kingdom, Rank } from "@/common/types/api";

const RANK_PT: Partial<Record<Rank, string>> = {
  KINGDOM: "Reino",
  PHYLUM: "Filo",
  CLASS: "Classe",
  ORDER: "Ordem",
  FAMILY: "Família",
  GENUS: "Gênero",
  SPECIES: "Espécie",
};

export const CardInfo = () => {
  const { t } = useTranslation();
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const userDb = useAtomValue(authStore.userDb);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { navigateToNodes } = useTreeNavigation();

  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedData = exploreInfos.find(
    (item) => item.kingdomKey === expandedNodes[0]?.key,
  );

  const currentRank = expandedNodes[expandedNodes.length - 1]?.rank as Rank;

  const currentName = useMemo(() => {
    if (!selectedData) return "";
    if (currentRank === "KINGDOM") return selectedData.kingdomName;
    return (
      expandedNodes[expandedNodes.length - 1]?.name ?? capitalizar(currentRank)
    );
  }, [expandedNodes, selectedData, currentRank]);

  const slides = useMemo(() => {
    if (!selectedData) return [];
    if (expandedNodes.length === 1) {
      return curiosidades.KINGDOM[expandedNodes[0].key] ?? [];
    }
    const entry = curiosidades[currentRank as keyof typeof curiosidades];
    return Array.isArray(entry) ? entry : [];
  }, [expandedNodes, selectedData, currentRank]);

  const total = slides.length;

  useEffect(() => {
    if (!total) return;
    const id = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % total);
    }, 6000);
    return () => clearTimeout(id);
  }, [currentIndex, total]);

  const kingdomImages = useMemo(
    () =>
      selectedData
        ? getKingdomImages(selectedData.kingdomName.toLowerCase() as Kingdom)
        : [],
    [selectedData],
  );

  const shortcuts = useMemo(() => {
    if (!userDb?.game_info?.shortcuts) return null;
    const kingdom = selectedData?.kingdomName.toLocaleLowerCase() as "animalia";
    return userDb.game_info.shortcuts[kingdom];
  }, [selectedData?.kingdomName, userDb]);

  if (!selectedData || !slides.length) return null;

  const currentBgImg = kingdomImages[currentIndex % kingdomImages.length];

  const rankLabel = RANK_PT[currentRank] ?? capitalizar(currentRank);

  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        key={currentBgImg}
        src={currentBgImg}
        alt={selectedData.kingdomName}
        className="animate-fade-in absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div
          className="h-5 w-0.5 rounded-full"
          style={{ backgroundColor: selectedData.primaryColor }}
        />
        <span className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
          {t("explore.kingdom")} {selectedData.kingdomName.toUpperCase()}
        </span>
      </div>

      <div
        key={currentIndex}
        className="animate-slide-up absolute bottom-32 left-8 max-w-xl space-y-5 md:left-14"
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-widest text-white uppercase"
          style={{ backgroundColor: selectedData.primaryColor }}
        >
          {rankLabel}
        </span>

        <h1 className="text-5xl leading-none font-black tracking-tight text-white md:text-7xl">
          {currentName}
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-white/65">
          {slides[currentIndex]}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          {selectedData.mainGroups.slice(0, 3).map((group, i) => (
            <button
              key={i}
              onClick={() => navigateToNodes(group.pathNode)}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white/20"
            >
              <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase">
                {t("explore.mainGroups")}
              </p>
              <p
                className="mt-0.5 text-sm font-semibold"
                style={{ color: selectedData.primaryColor }}
              >
                {group.groupName}
              </p>
            </button>
          ))}
        </div>

        {shortcuts && (
          <div className="flex flex-wrap gap-2">
            {shortcuts
              .filter(({ nodes }) => nodes[0].key === selectedData.kingdomKey)
              .map(({ name, nodes }, i) => (
                <button
                  key={i}
                  onClick={() => navigateToNodes(nodes, true)}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Route className="size-3 scale-x-[-1]" />
                  {name}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-8 flex items-center gap-2 md:left-14">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="h-0.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 28 : 12,
              backgroundColor:
                i === currentIndex
                  ? selectedData.primaryColor
                  : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      <div className="absolute right-8 bottom-7 flex items-center gap-3">
        <span className="min-w-12 text-right text-sm font-medium text-white/40 tabular-nums">
          {String(currentIndex + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full text-black transition"
          style={{ backgroundColor: selectedData.primaryColor }}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
};
