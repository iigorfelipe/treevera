import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Progress } from "@/common/components/ui/progress";
import { userProgress } from "@/common/utils/data-profile-fake";
import { formatUserSinceDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth";
import { useAtomValue } from "jotai";

export const HeaderProfile = () => {
  const userDb = useAtomValue(authStore.userDb);

  return (
    <header className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-4">
        <Avatar className="size-18">
          <AvatarImage src={userDb?.avatar_url || ""} alt={userDb?.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {userDb?.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-xl font-bold">{userDb?.name}</h1>
          <span className="mt-0.5 flex items-center gap-1 text-xs">
            Usuário desde
            <strong>{formatUserSinceDate(userDb?.created_at as string)}</strong>
          </span>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xs font-medium">Ranking Global</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl text-amber-300">#</span>
            <span className="text-3xl font-bold text-amber-300">
              {userProgress.rank}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={(1000 - userProgress.pointsToNextRank) / 10}
          className="h-2"
          indicatorClassName="bg-amber-300"
        />

        <div className="text-xs">
          Pontue em <strong>espécies exploradas</strong>,{" "}
          <strong>precisão de acerto</strong> e <strong>velocidade</strong> para
          continuar subindo.
        </div>
      </div>
    </header>
  );
};
