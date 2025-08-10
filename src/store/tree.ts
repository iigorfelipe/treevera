import type { Kingdom, Rank } from "@/common/types/api";
import { dataFake } from "@/common/utils/dataFake";
import { atom } from "jotai";

export type PathNode = {
  rank: Rank;
  key: number;
  kingdom: Kingdom;
};

const expandedNodes = atom<PathNode[]>([]);

export type ChallengeMode = "DAILY" | "RANDOM" | null;
type ChallengeStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type Challenge = {
  mode: ChallengeMode;
  status: ChallengeStatus;
};

const challenge = atom<Challenge>({ mode: null, status: "NOT_STARTED" });

export type ExploreInfo = {
  kingdomKey: number;
  kingdomName: Kingdom;
  numDescendants: number;
  explored: number;
  icon: string;
  primaryColor: string;
  lightColor: string;
  description: string;
  mainGroups: { groupName: string; pathNode: PathNode[] }[];
};

const exploreInfos = atom<ExploreInfo[]>(dataFake as ExploreInfo[]);
const treeScroll = atom({
  autoScroll: false,
  scrollIndex: 0,
  loadingMap: {},
});

const animate = atom({
  isShaking: false,
  shakeDirection: true,
});

export const treeAtom = {
  expandedNodes,
  challenge,
  exploreInfos,
  treeScroll,
  animate,
};
