import { CardInfo } from "@/modules/explore/card";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { HomeInitialPanel } from "@/modules/home/initial-panel";

export const ExploreInfo = () => {
  const challengeMode = useAtomValue(treeAtom.challenge).mode;

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  if (!challengeMode && expandedNodes.length) return <CardInfo />;

  return <HomeInitialPanel />;
};
