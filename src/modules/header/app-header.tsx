import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-new-logo.avif?url";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Menu } from "@/modules/header/menu";

export const AppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <Image alt={t("header.logoAlt")} src={logoUrl} className="h-9" />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold">Treevera</span>
            <span className="text-muted-foreground hidden text-xs sm:block">
              {t("header.tagline")}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {t("nav.signIn")}
            </Link>
          )}

          <button
            onClick={() => navigate({ to: "/challenges" })}
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {t("nav.challenges")}
          </button>

          <button
            onClick={() => navigate({ to: "/lists" })}
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {t("lists.title")}
          </button>

          {isAuthenticated && userDb && (
            <Menu
              trigger="label"
              label={userDb.username.toLowerCase()}
              hoverOpen
            />
          )}
        </nav>
      </div>
    </header>
  );
};
