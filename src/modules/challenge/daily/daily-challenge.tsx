import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { useTranslation } from "react-i18next";
import { getDailySpecies } from "@/common/utils/game/daily-species";
import { Timer } from "@/modules/challenge/components/timer";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useTheme } from "@/context/theme";
import { treeAtom } from "@/store/tree";

export const DailyChallengeCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const speciesName = getDailySpecies();

  const handleStart = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    setChallenge({ mode: "DAILY", status: "IN_PROGRESS" });
  };

  return (
    <div className="md:px-4 md:py-6">
      <Card className="mx-auto rounded-3xl">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={theme === "dark" ? AlvoWhite : Alvo}
                className="size-12"
                alt="Alvo gif"
              />
              <div>
                <h2 className="text-xl font-bold">{t("challenge.title")}</h2>
                <p className="text-sm">
                  {t("challenge.find")}:{" "}
                  <span className="font-semibold text-emerald-600">
                    {speciesName}
                  </span>
                </p>
              </div>
            </div>
            <Timer />
          </div>

          <p className="text-muted-foreground text-sm">
            {t("challenge.missionDescription")}
          </p>

          <Button size="lg" className="bg-emerald-600" onClick={handleStart}>
            {t("challenge.start")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
