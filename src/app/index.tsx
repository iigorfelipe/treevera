import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { useIsRestoring } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { useTranslation } from "react-i18next";

export const App = () => {
  const isRestoring = useIsRestoring();
  const { t } = useTranslation();
  const { isInitializing } = useAuth();

  if (isRestoring) {
    return <div>{t("loading.restoringCache")}</div>;
  }

  if (isInitializing) {
    return <div>{t("loading.initializing")}</div>;
  }

  return <RouterProvider router={router} />;
};
