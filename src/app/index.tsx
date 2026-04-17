import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { useIsRestoring } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";

export const App = () => {
  const isRestoring = useIsRestoring();
  const { t } = useTranslation();
  const { isInitializing } = useAuth();

  if (isRestoring || isInitializing) {
    const label = isRestoring
      ? t("loading.restoringCache")
      : t("loading.initializing");

    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader className="text-muted-foreground size-6 animate-spin" />
          <p className="text-sm font-medium tracking-tight">{label}</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};
