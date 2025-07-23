import { atom } from "jotai";

export const specieKeyAtom = atom<number | null>(null);

// Map: rank -> key expandido
export const expandedNodeAtomByRank = atom<Record<string, string | null>>({});
