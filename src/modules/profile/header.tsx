// import { Progress } from "@/common/components/ui/progress";
// import { userProgress } from "@/common/utils/data-profile-fake";
import { formatUserSinceDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth/atoms";
import { useAtomValue } from "jotai";
import { Menu } from "../header/menu";
import { useTranslation } from "react-i18next";

export const HeaderProfile = () => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);

  return (
    <header className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <Menu isProfilePage />

        <div className="flex-1">
          <h1 className="text-xl font-bold">{userDb?.name}</h1>
          <span className="mt-0.5 flex items-center gap-1 text-xs">
            {t("profilePage.memberSince")}
            <strong>{formatUserSinceDate(userDb?.created_at as string)}</strong>
          </span>
        </div>

        {/* <div className="flex flex-col items-end">
          <div className="text-xs font-medium">{t("profilePage.globalRanking")}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl text-amber-300">#</span>
            <span className="text-3xl font-bold text-amber-300">
              {userProgress.rank}
            </span>
          </div>
        </div> */}
      </div>

      {/* <div className="space-y-2">
        <Progress
          value={(1000 - userProgress.pointsToNextRank) / 10}
          className="h-2"
          indicatorClassName="bg-amber-300"
        />

        <div className="text-xs">{t("profilePage.rankingHint")}</div>
      </div> */}
    </header>
  );
};
