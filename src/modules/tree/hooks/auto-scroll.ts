import { useAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";

import { treeAtom } from "@/store/tree";

type UseAutoScrollprops = {
  currentNodeIndex: number;
  isExpanded: boolean;
  isLoading: boolean;
  taxonKey: number;
};

export const useAutoScroll = ({
  currentNodeIndex,
  isExpanded,
  isLoading,
  taxonKey,
}: UseAutoScrollprops) => {
  const [treeScroll, setTreeScroll] = useAtom(treeAtom.treeScroll);
  const [expandedNodes] = useAtom(treeAtom.expandedNodes);
  const ref = useRef<HTMLLIElement>(null);

  // Atualiza o loadingMap no atom
  useEffect(() => {
    setTreeScroll((prev) => ({
      ...prev,
      loadingMap: {
        ...prev.loadingMap,
        [taxonKey]: isLoading,
      },
    }));
  }, [isLoading, taxonKey, setTreeScroll]);

  // Função para checar se há loading nos nós do índice atual até o final
  const hasLoadingAfterCurrent = useMemo(() => {
    const map = treeScroll.loadingMap || {};
    for (let i = treeScroll.scrollIndex; i < expandedNodes.length; i++) {
      if (!expandedNodes[i]) continue;
      if (map[expandedNodes[i].key as never]) return true;
    }
    return false;
  }, [treeScroll.loadingMap, expandedNodes, treeScroll.scrollIndex]);

  useEffect(() => {
    if (!treeScroll.autoScroll) return;
    if (treeScroll.scrollIndex !== currentNodeIndex) return;
    if (!isExpanded) return;

    const el = ref.current;
    if (!el) return;

    const container = el.closest(".overflow-auto") as HTMLElement | null;
    const headerHeight =
      document.querySelector("header")?.getBoundingClientRect().height ?? 152;

    const doScroll = () => {
      const elRect = el.getBoundingClientRect();
      const containerRect = container!.getBoundingClientRect();
      const target =
        elRect.top -
        containerRect.top +
        container!.scrollTop -
        headerHeight -
        8;

      container!.scrollTo({
        top: Math.max(0, target),
        behavior: "smooth",
      });
    };

    // Se nenhum nó está carregando, pula direto pro último nó
    if (
      !hasLoadingAfterCurrent &&
      treeScroll.scrollIndex !== expandedNodes.length - 1
    ) {
      setTreeScroll((prev) => ({
        ...prev,
        scrollIndex: expandedNodes.length - 1,
      }));
      return;
    }

    // Rola para o nó atual
    doScroll();

    // Avança para o próximo nó só se nó atual já carregou
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (treeScroll.scrollIndex < expandedNodes.length - 1) {
          setTreeScroll((prev) => ({
            ...prev,
            scrollIndex: prev.scrollIndex + 1,
          }));
        } else {
          // Finaliza scroll automático
          setTreeScroll({ autoScroll: false, scrollIndex: 0, loadingMap: {} });
        }
      }, 350); // tempo para o scroll "smooth" completar

      return () => clearTimeout(timeout);
    }
  }, [
    treeScroll.autoScroll,
    treeScroll.scrollIndex,
    currentNodeIndex,
    isExpanded,
    isLoading,
    setTreeScroll,
    expandedNodes,
    hasLoadingAfterCurrent,
  ]);

  // Scroll quando:
  // - autoScroll está ativo
  // - este nó é o da posição scrollIndex na sequência expandedNodes
  // - está expandido (só nesse caso o nó está visível)
  useEffect(() => {
    if (!treeScroll.autoScroll) return;
    if (treeScroll.scrollIndex !== currentNodeIndex) return;
    if (!isExpanded) return;

    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;

      const container = el.closest(".overflow-auto") as HTMLElement | null;
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 152;

      if (container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const target =
          elRect.top -
          containerRect.top +
          container.scrollTop -
          headerHeight -
          8;

        container.scrollTo({
          top: Math.max(0, target),
          behavior: "smooth",
        });
      }

      // Se o nó atual não está carregando mais e existe próximo na fila
      if (!isLoading && treeScroll.scrollIndex < expandedNodes.length - 1) {
        setTreeScroll((prev) => {
          return {
            ...prev,
            scrollIndex: prev.scrollIndex + 1,
          };
        }); // vai para próximo nó na lista
      } else if (!isLoading) {
        // acabou a sequência, desliga o autoScroll e reseta índice

        setTreeScroll({
          autoScroll: false,
          scrollIndex: 0,
          loadingMap: {},
        });
      }
    });
  }, [
    isExpanded,
    isLoading,
    expandedNodes.length,
    treeScroll.autoScroll,
    treeScroll.scrollIndex,
    currentNodeIndex,
    setTreeScroll,
  ]);

  return {
    ref,
  };
};
