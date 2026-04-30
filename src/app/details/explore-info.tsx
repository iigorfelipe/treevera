import { CardInfo } from "@/modules/explore/card";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { HomeInitialPanel } from "@/modules/home/initial-panel";
import { ListTreePanel } from "@/modules/lists/list-tree-panel";

export const ExploreInfo = () => {
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  if (!challengeMode && listTreeMode) return <ListTreePanel />;

  if (!challengeMode && expandedNodes.length) return <CardInfo />;

  return <HomeInitialPanel />;
};
