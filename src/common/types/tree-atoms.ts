import type { Kingdom, Rank } from "./api";

export type ChallengeMode = "DAILY" | "RANDOM" | "UNSET" | null;
type ChallengeStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type Challenge = {
  mode: ChallengeMode;
  status: ChallengeStatus;
  targetSpecies?: string;
  speciesKey?: number;
};

export type PathNode = {
  rank: Rank;
  key: number;
  name: string;
};

export type NodeEntity = {
  key: number;
  rank: Rank;
  color?: string;
  numDescendants: number;
  canonicalName?: string;
  scientificName?: string;
  kingdom?: string;
  childrenKeys?: number[];
  expanded?: boolean;
  parentKey?: number;
};

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

export type AnimateState = {
  isShaking: boolean;
  shakeDirection: boolean;
};
