import { capitalizar } from "@/common/utils/string";
import { getKingdomImages } from "@/common/utils/tree/ranks";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { useMemo, useState, useEffect } from "react";
import { Route } from "lucide-react";
import { authStore } from "@/store/auth/atoms";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTranslation } from "react-i18next";
import type { Kingdom, Rank } from "@/common/types/api";
import { curiosidades } from "@/common/utils/dataFake";
import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";
import { Explorer } from "./explorer";

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
  const scrollThenNavigate = useScrollThenNavigate();

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
    const id = setTimeout(() => setCurrentIndex((i) => (i + 1) % total), 6000);
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

  const shortcutsSection = shortcuts && (
    <div className="space-y-1">
      <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase">
        Seus {t("shortcuts.title")}:
      </p>
      <div className="flex flex-wrap gap-2">
        {shortcuts
          .filter(({ nodes }) => nodes[0].key === selectedData.kingdomKey)
          .map(({ name, nodes }, i) => (
            <button
              key={i}
              onClick={() => scrollThenNavigate(() => navigateToNodes(nodes, true))}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/20"
            >
              <Route className="size-3 scale-x-[-1]" />
              {name}
            </button>
          ))}
      </div>
    </div>
  );

  return (
    <Explorer
      bgImg={currentBgImg}
      alt={selectedData.kingdomName}
      kingdomLabel={t("explore.kingdom")}
      kingdomName={selectedData.kingdomName}
      primaryColor={selectedData.primaryColor}
      slideKey={currentIndex}
      badge={rankLabel}
      title={currentName}
      description={slides[currentIndex]}
      mainGroupsLabel={t("explore.mainGroups")}
      mainGroups={selectedData.mainGroups.slice(0, 3).map((g) => ({
        groupName: g.groupName,
        onClick: () => scrollThenNavigate(() => navigateToNodes(g.pathNode)),
      }))}
      extra={shortcutsSection}
      total={total}
      currentIndex={currentIndex}
      onPrev={() => setCurrentIndex((i) => (i - 1 + total) % total)}
      onNext={() => setCurrentIndex((i) => (i + 1) % total)}
      onDotClick={setCurrentIndex}
    />
  );
};
