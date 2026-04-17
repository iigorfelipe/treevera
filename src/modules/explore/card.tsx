import { useMemo, useState, useEffect } from "react";
import { Route } from "lucide-react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { loadCuriosidadesByKingdom } from "@/common/content/curiosidades";
import type { Curiosidades } from "@/common/content/curiosidades/types";
import { capitalizar } from "@/common/utils/string";
import { getKingdomImages } from "@/common/utils/tree/ranks";
import { treeAtom } from "@/store/tree";
import { authStore } from "@/store/auth/atoms";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import type { Kingdom, Rank } from "@/common/types/api";
import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";
import { Explorer } from "./explorer";

export const CardInfo = () => {
  const { t } = useTranslation();
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const userDb = useAtomValue(authStore.userDb);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { navigateToNodes } = useTreeNavigation();
  const scrollThenNavigate = useScrollThenNavigate();

  const [isPaused, setIsPaused] = useState(false);
  const [curiosidadesState, setCuriosidadesState] = useState<{
    kingdomKey: number | null;
    data: Curiosidades | null;
  }>({
    kingdomKey: null,
    data: null,
  });
  const [slideState, setSlideState] = useState<{
    scopeKey: string;
    index: number;
  }>({
    scopeKey: "",
    index: 0,
  });

  const selectedData = exploreInfos.find(
    (item) => item.kingdomKey === expandedNodes[0]?.key,
  );

  const currentRank = expandedNodes[expandedNodes.length - 1]?.rank as Rank;
  const kingdomKey = expandedNodes[0]?.key ?? null;

  const currentName = useMemo(() => {
    if (!selectedData) return "";
    if (currentRank === "KINGDOM") return selectedData.kingdomName;
    return (
      expandedNodes[expandedNodes.length - 1]?.name ?? capitalizar(currentRank)
    );
  }, [expandedNodes, selectedData, currentRank]);

  useEffect(() => {
    if (!kingdomKey) {
      return;
    }

    let cancelled = false;

    loadCuriosidadesByKingdom(kingdomKey).then((data) => {
      if (!cancelled) {
        setCuriosidadesState({ kingdomKey, data });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [kingdomKey]);

  const curiosidades =
    curiosidadesState.kingdomKey === kingdomKey ? curiosidadesState.data : null;

  const slides = useMemo(() => {
    if (!selectedData || !curiosidades || !kingdomKey) return [];

    if (expandedNodes.length === 1) {
      return curiosidades.KINGDOM[kingdomKey] ?? [];
    }

    const entry = curiosidades[currentRank as keyof typeof curiosidades];
    return entry?.[kingdomKey] ?? [];
  }, [curiosidades, expandedNodes, selectedData, currentRank, kingdomKey]);

  const total = slides.length;
  const slideScopeKey = `${selectedData?.kingdomKey ?? "none"}:${currentRank}`;
  const currentIndex =
    slideState.scopeKey === slideScopeKey ? slideState.index : 0;
  const normalizedIndex = total ? currentIndex % total : 0;

  useEffect(() => {
    if (!total || isPaused) return;
    const id = setTimeout(() => {
      setSlideState((prev) => {
        const prevIndex = prev.scopeKey === slideScopeKey ? prev.index : 0;
        return {
          scopeKey: slideScopeKey,
          index: (prevIndex + 1) % total,
        };
      });
    }, 8000);
    return () => clearTimeout(id);
  }, [currentIndex, isPaused, slideScopeKey, total]);

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

  const currentBgImg = kingdomImages[normalizedIndex % kingdomImages.length];
  const rankLabel = t(`ranks.${currentRank}`, {
    defaultValue: capitalizar(currentRank),
  });

  const shortcutsSection = shortcuts && (
    <div className="space-y-1">
      <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase">
        {t("explore.yourShortcuts", { title: t("shortcuts.title") })}
      </p>
      <div className="flex flex-wrap gap-2">
        {shortcuts
          .filter(({ nodes }) => nodes[0].key === selectedData.kingdomKey)
          .map(({ name, nodes }, i) => (
            <button
              key={i}
              onClick={() =>
                scrollThenNavigate(() => navigateToNodes(nodes, true))
              }
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
      slideKey={normalizedIndex}
      badge={rankLabel}
      title={currentName}
      description={slides[normalizedIndex]}
      mainGroupsLabel={t("explore.mainGroups")}
      mainGroups={selectedData.mainGroups.slice(0, 3).map((g) => ({
        groupName: g.groupName,
        onClick: () => scrollThenNavigate(() => navigateToNodes(g.pathNode)),
      }))}
      extra={shortcutsSection}
      total={total}
      currentIndex={normalizedIndex}
      isPaused={isPaused}
      onPrev={() =>
        setSlideState((prev) => {
          const prevIndex = prev.scopeKey === slideScopeKey ? prev.index : 0;
          return {
            scopeKey: slideScopeKey,
            index: (prevIndex - 1 + total) % total,
          };
        })
      }
      onNext={() =>
        setSlideState((prev) => {
          const prevIndex = prev.scopeKey === slideScopeKey ? prev.index : 0;
          return {
            scopeKey: slideScopeKey,
            index: (prevIndex + 1) % total,
          };
        })
      }
      onDotClick={(index) =>
        setSlideState({
          scopeKey: slideScopeKey,
          index,
        })
      }
      onTogglePause={() => setIsPaused((p) => !p)}
    />
  );
};
