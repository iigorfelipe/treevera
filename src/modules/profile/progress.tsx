import { Badge } from "@/common/components/ui/badge";
import { userProgress } from "@/common/utils/data-profile-fake";
import { useTranslation } from "react-i18next";

export const UserProgress = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <h2 className="border-b">{t("progress.title")}</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.speciesExplored")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.totalSpecies}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.challengesCompleted")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.challenges}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.hitAccuracy")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.accuracy}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.medalsEarned")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.medals}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.dayStreak")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.streak}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t("progress.globalRanking")}</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            #{userProgress.rank}
          </Badge>
        </div>
      </div>
    </div>
  );
};
