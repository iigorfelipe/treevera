import { useAtom, useAtomValue } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { authStore } from "@/store/auth/atoms";
import { showEmptyNodesAtom, localShowEmptyNodesAtom } from "@/store/user-settings";
import { updateUserSettings } from "@/common/utils/supabase/update-user-settings";

export const useUserSettings = () => {
  const showEmptyNodes = useAtomValue(showEmptyNodesAtom);
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const [, setLocalShowEmptyNodes] = useAtom(localShowEmptyNodesAtom);
  const navigate = useNavigate();

  const toggleShowEmptyNodes = async () => {
    const newValue = !showEmptyNodes;

    navigate({ to: "/" });

    if (!userDb) {
      setLocalShowEmptyNodes(newValue);
      return;
    }

    const newSettings = { ...userDb.game_info.settings, showEmptyNodes: newValue };

    setUserDb({
      ...userDb,
      game_info: { ...userDb.game_info, settings: newSettings },
    });

    await updateUserSettings(userDb, newSettings);
  };

  return { showEmptyNodes, toggleShowEmptyNodes };
};
