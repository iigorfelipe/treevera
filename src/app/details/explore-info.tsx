import { useState, useEffect } from "react";
import { CardInfo } from "@/modules/explore/card";
import { Explorer } from "@/modules/explore/explorer";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTranslation } from "react-i18next";
import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";

export const ExploreInfo = () => {
  const { t } = useTranslation();
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { toggleNode } = useTreeNavigation();
  const scrollThenNavigate = useScrollThenNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = exploreInfos.length;

  useEffect(() => {
    const id = setTimeout(() => setCurrentIndex((i) => (i + 1) % total), 7000);
    return () => clearTimeout(id);
  }, [currentIndex, total]);

  if (!challengeMode && expandedNodes.length) return <CardInfo />;

  const current = exploreInfos[currentIndex];

  return (
    <Explorer
      bgImg={current.bgImg}
      alt={current.kingdomName}
      onCardClick={() =>
        scrollThenNavigate(() => toggleNode(current.kingdomKey))
      }
      kingdomLabel={t("explore.kingdom")}
      kingdomName={current.kingdomName}
      primaryColor={current.primaryColor}
      slideKey={currentIndex}
      badge={t("explore.kingdom")}
      title={current.kingdomName}
      description={current.description}
      mainGroupsLabel={t("explore.mainGroups")}
      mainGroups={current.mainGroups
        .slice(0, 3)
        .map((g) => ({ groupName: g.groupName }))}
      total={total}
      currentIndex={currentIndex}
      stopPropagation
      onPrev={() => setCurrentIndex((i) => (i - 1 + total) % total)}
      onNext={() => setCurrentIndex((i) => (i + 1) % total)}
      onDotClick={setCurrentIndex}
    />
  );
};
