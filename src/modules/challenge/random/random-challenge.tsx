import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { treeAtom } from "@/store/tree";
import { Image } from "@/common/components/image";
import { useTheme } from "@/context/theme";
import { getRandomChallengeForUser } from "@/common/utils/supabase/challenge/get-random-challenge";
import { useState } from "react";

export const RandomChallengeCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const session = useAtomValue(authStore.session);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const [isLoading, setIsLoading] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  const handleStart = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    setAllCompleted(false);

    const result = await getRandomChallengeForUser(userId);

    setIsLoading(false);

    if (!result) {
      setAllCompleted(true);
      return;
    }

    setChallenge({
      mode: "RANDOM",
      status: "IN_PROGRESS",
      targetSpecies: result.scientificName,
      speciesKey: result.gbifKey,
    });
  };

  return (
    <Card className="max-w-3xl rounded-3xl">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={theme === "dark" ? AlvoWhite : Alvo}
            className="size-12 shrink-0"
            alt="Alvo gif"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{t("challenge.randomTitle")}</h2>
            <p className="text-sm">
              {t("challenge.find")}:{" "}
              <span className="font-semibold text-violet-600">????</span>
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          {t("challenge.randomMissionDescription")}
        </p>

        {allCompleted && (
          <p className="text-sm font-medium text-violet-600">
            {t("challenge.randomNoChallenge")}
          </p>
        )}

        <Button
          size="lg"
          className="bg-violet-600 text-white hover:bg-violet-700"
          onClick={handleStart}
          disabled={isLoading}
        >
          {t("challenge.play")}
        </Button>
      </CardContent>
    </Card>
  );
};
