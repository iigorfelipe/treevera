import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/common/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/theme";
import {
  ArrowLeft,
  Loader,
  LogIn,
  LogOut,
  MenuIcon,
  Settings,
  Target,
  Telescope,
} from "lucide-react";
import i18n from "@/common/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/common/components/ui/button";
import { treeAtom } from "@/store/tree";
import { authStore } from "@/store/auth/atoms";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { useState } from "react";
import { SettingsModal } from "@/modules/settings/settings-modal";

export const Menu = ({ isProfilePage }: { isProfilePage?: boolean }) => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const { logout, isLoggingOut } = useAuth();

  const [challenge, setChallenge] = useAtom(treeAtom.challenge);

  const handleLogout = async () => {
    if (challenge.status === "IN_PROGRESS") {
      const confirmed = window.confirm(
        "Você tem um desafio em andamento. Ao Sair, o desafio será cancelado.\n\nDeseja continuar?",
      );

      if (!confirmed) return;
    }
    await logout();
    setChallenge({ mode: null, status: "NOT_STARTED" });
  };

  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isProfilePage && !isAuthenticated) {
    navigate({ to: "/login" });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="group cursor-pointer">
          <div className="rounded-full">
            {isAuthenticated && userDb ? (
              <Avatar className={isProfilePage ? "size-12" : "size-8"}>
                <AvatarImage src={userDb.avatar_url} alt="User" />
                <AvatarFallback className="bg-green-600 text-xs text-white">
                  {userDb.name[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <MenuIcon className="size-6" />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-1 w-full" align="start">
          <DropdownMenuGroup>
            {!isAuthenticated && (
              <>
                <DropdownMenuItem>
                  <Link to="/login" className="flex w-full items-center">
                    <LogIn className="mr-2 size-4" />
                    <span>{t("loginWithGoogle")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!isProfilePage && isAuthenticated && userDb && (
              <DropdownMenuItem
                onClick={() => {
                  if (challenge.status === "IN_PROGRESS") {
                    const confirmed = window.confirm(
                      "Você tem um desafio em andamento. Acessar seu perfil, o desafio será cancelado.\n\nDeseja continuar?",
                    );

                    if (!confirmed) return;
                  }
                  setChallenge({ mode: null, status: "NOT_STARTED" });
                  navigate({ to: "/profile" });
                }}
              >
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{userDb.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {userDb.email}
                  </div>
                </div>

                <DropdownMenuSeparator />
              </DropdownMenuItem>
            )}

            {isProfilePage && (
              <>
                <DropdownMenuItem>
                  <Link to="/" className="flex w-full items-center">
                    <ArrowLeft className="mr-2 size-4" />
                    <span>{t("nav.back")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              disabled={challenge.status === "IN_PROGRESS"}
              onClick={() =>
                setChallenge({ mode: "UNSET", status: "NOT_STARTED" })
              }
            >
              <Link to="/challenges" className="flex w-full items-center">
                <Target className="mr-2 size-4" /> {t("nav.challenges")}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                if (challenge.status === "IN_PROGRESS") {
                  const confirmed = window.confirm(
                    "Você tem um desafio em andamento. Ao acessar Explorar, o desafio será cancelado.\n\nDeseja continuar?",
                  );

                  if (!confirmed) return;
                }
                setChallenge({ mode: null, status: "NOT_STARTED" });
                navigate({ to: "/" });
              }}
            >
              <div className="flex w-full items-center">
                <Telescope className="mr-2 size-4" /> {t("nav.explore")}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              <Settings className="mr-2 size-4" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {t("theme")}: {t(theme)}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="m-1">
                  <DropdownMenuItem onClick={() => changeTheme("light")}>
                    {t("light")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme("dark")}>
                    {t("dark")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme("system")}>
                    {t("system")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {t("language")}: {t(i18n.language)}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="m-1">
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("pt")}>
                    {t("pt")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                    {t("en")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("es")}>
                    {t("es")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {!isProfilePage && isAuthenticated && (
              <DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuSubTrigger disabled={isLoggingOut}>
                  <LogOut className="mr-2 size-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="w-72 max-w-[90vw] p-4"
                    sideOffset={-90}
                    alignOffset={90}
                  >
                    <p className="mb-3 text-center text-sm leading-relaxed">
                      {t("nav.logoutWarning")}
                    </p>

                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full"
                    >
                      {isLoggingOut ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      {t("nav.logoutAnyway")}
                    </Button>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
