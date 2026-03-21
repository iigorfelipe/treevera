import { atom } from "jotai";
import { authStore } from "./auth/atoms";

const localShowEmptyNodesAtom = atom<boolean>(false);

export const showEmptyNodesAtom = atom((get) => {
  const userDb = get(authStore.userDb);
  if (userDb) {
    return userDb.game_info?.settings?.showEmptyNodes ?? false;
  }
  return get(localShowEmptyNodesAtom);
});

const localShowRankBadgeAtom = atom<boolean>(false);

export const showRankBadgeAtom = atom((get) => {
  const userDb = get(authStore.userDb);
  if (userDb) {
    return userDb.game_info?.settings?.showRankBadge ?? false;
  }
  return get(localShowRankBadgeAtom);
});

export { localShowEmptyNodesAtom, localShowRankBadgeAtom };
