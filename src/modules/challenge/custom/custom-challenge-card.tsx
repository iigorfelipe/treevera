import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth/atoms";
import { CardInfoPopup } from "@/modules/challenge/components/card-info-popup";

export const CustomChallengeCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const handleGoToGallery = () => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }
    void navigate({
      to: "/$username/species-gallery",
      params: { username: userDb?.username ?? "" },
    });
  };

  return (
    <Card className="relative max-w-md min-w-0 rounded-3xl">
      <div className="absolute top-3 right-4">
        <CardInfoPopup text={t("challenge.infoCustom")} />
      </div>

      <CardContent className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold">{t("challenge.customTitle")}</h2>
        </div>

        <p className="text-muted-foreground text-sm">
          {t("challenge.customDescription")}
        </p>

        <Button size="lg" variant="outline" onClick={handleGoToGallery}>
          {t("challenge.customGoToGallery")}
        </Button>
      </CardContent>
    </Card>
  );
};
