import type { Kingdom, Rank } from "./api";

export type ChallengeMode = "DAILY" | "RANDOM" | "CUSTOM" | "UNSET" | null;
type ChallengeStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ChallengeCompletionData = {
  elapsedSeconds: number;
  errorCount: number;
  totalSteps: number;
  correctPath: { rank: string; name: string; key: number }[];
  stepErrors: number[];
  stepInteractions: Record<number, Partial<Record<string, boolean>>>;
};

export type ChallengeErrorTracking = {
  count: number;
  perStep: number[];
};

export type Challenge = {
  mode: ChallengeMode;
  status: ChallengeStatus;
  targetSpecies?: string;
  speciesKey?: number;
  challengeDate?: string;
  completionData?: ChallengeCompletionData;
  replayId?: number;
  startedAt?: number;
  errorTracking?: ChallengeErrorTracking;
  stepInteractions?: Record<number, Partial<Record<string, boolean>>>;
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
  bgImg: string;
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
