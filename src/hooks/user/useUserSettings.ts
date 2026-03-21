import { useAtom, useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import {
  showEmptyNodesAtom,
  localShowEmptyNodesAtom,
  showRankBadgeAtom,
  localShowRankBadgeAtom,
} from "@/store/user-settings";
import { updateUserSettings } from "@/common/utils/supabase/update-user-settings";
import type { UserSettings } from "@/common/types/user";

export const useUserSettings = () => {
  const showEmptyNodes = useAtomValue(showEmptyNodesAtom);
  const showRankBadge = useAtomValue(showRankBadgeAtom);
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const [, setLocalShowEmptyNodes] = useAtom(localShowEmptyNodesAtom);
  const [, setLocalShowRankBadge] = useAtom(localShowRankBadgeAtom);

  const toggleShowEmptyNodes = async () => {
    const newValue = !showEmptyNodes;

    if (!userDb) {
      setLocalShowEmptyNodes(newValue);
      return;
    }

    const newSettings: UserSettings = {
      ...userDb.game_info.settings,
      showEmptyNodes: newValue,
      showRankBadge: userDb.game_info.settings?.showRankBadge ?? showRankBadge,
    };

    setUserDb({
      ...userDb,
      game_info: { ...userDb.game_info, settings: newSettings },
    });

    await updateUserSettings(userDb, newSettings);
  };

  const toggleShowRankBadge = async () => {
    const newValue = !showRankBadge;

    if (!userDb) {
      setLocalShowRankBadge(newValue);
      return;
    }

    const newSettings: UserSettings = {
      ...userDb.game_info.settings,
      showEmptyNodes:
        userDb.game_info.settings?.showEmptyNodes ?? showEmptyNodes,
      showRankBadge: newValue,
    };

    setUserDb({
      ...userDb,
      game_info: { ...userDb.game_info, settings: newSettings },
    });

    await updateUserSettings(userDb, newSettings);
  };

  return {
    showEmptyNodes,
    toggleShowEmptyNodes,
    showRankBadge,
    toggleShowRankBadge,
  };
};
