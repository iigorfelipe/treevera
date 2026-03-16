import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { authStore } from "@/store/auth/atoms";
import { checkAndUnlockAchievements } from "@/common/utils/supabase/user-achievements";
import { insertActivity } from "@/common/utils/supabase/user-activities";
import { ACHIEVEMENTS } from "@/common/data/achievements";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useNavigate } from "@tanstack/react-router";

export const useCheckAchievements = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    if (!userId) return;

    const newlyUnlocked = await checkAndUnlockAchievements(userId);
    if (newlyUnlocked.length === 0) return;

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_achievements_key, userId],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_activities_key, userId],
    });

    for (const achievementId of newlyUnlocked) {
      const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!def) continue;

      toast.custom(
        () => (
          <div
            className="bg-background border rounded-xl px-4 py-3 flex items-center justify-between gap-4 cursor-pointer shadow-sm"
            onClick={() => void navigate({ to: "/profile" })}
          >
            <span className="text-sm font-semibold">{def.name}</span>
            <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
              <span>Ver conquistas</span>
              <ArrowRight className="size-3" />
            </div>
          </div>
        ),
        { duration: 6000 },
      );

      void insertActivity(userId, `Conquista: ${def.name}`, def.description);
    }
  }, [userId, queryClient, navigate]);
};
