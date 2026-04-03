import { useState } from "react";
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
  LogIn,
  LogOut,
  MenuIcon,
  Settings,
  Target,
  Telescope,
  UserCircle,
  List,
} from "lucide-react";
import i18n from "@/common/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { router } from "@/routes";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { authStore } from "@/store/auth/atoms";
import { logout as logoutService } from "@/services/auth/profile";
import { ConfirmDialog } from "@/common/components/ui/confirm-dialog";

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  variant: "default" | "destructive";
};

const CLOSED_CONFIRM: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirmar",
  onConfirm: () => {},
  variant: "default",
};

export const Menu = ({ isProfilePage }: { isProfilePage?: boolean }) => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const setSession = useSetAtom(authStore.session);
  const setUserDb = useSetAtom(authStore.userDb);

  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);

  const navigate = useNavigate();

  const [confirmState, setConfirmState] =
    useState<ConfirmState>(CLOSED_CONFIRM);

  const openConfirm = (params: Omit<ConfirmState, "open">) => {
    setConfirmState({ ...params, open: true });
  };

  const closeConfirm = () => setConfirmState(CLOSED_CONFIRM);

  const handleLogout = async () => {
    setChallenge({ mode: null, status: "NOT_STARTED" });
    setExpandedNodes([]);
    await logoutService();
    setSession(null);
    setUserDb(null);
    navigate({ to: "/" });
  };

  if (isProfilePage && !isAuthenticated) {
    navigate({ to: "/login" });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="group cursor-pointer">
          <div className="rounded-full">
            {isAuthenticated && userDb ? (
              <Avatar className={isProfilePage ? "size-16" : "size-8"}>
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
              <>
                <DropdownMenuItem
                  onClick={() => {
                    if (challenge.status === "IN_PROGRESS") {
                      openConfirm({
                        title: "Desafio em andamento",
                        description:
                          "Você tem um desafio em andamento. Acessar seu perfil cancelará o desafio. Deseja continuar?",
                        confirmLabel: "Continuar",
                        onConfirm: () => {
                          setChallenge({ mode: null, status: "NOT_STARTED" });
                          navigate({
                            to: "/$username",
                            params: { username: userDb.username },
                          });
                        },
                        variant: "default",
                      });
                      return;
                    }
                    setChallenge({ mode: null, status: "NOT_STARTED" });
                    navigate({
                      to: "/$username",
                      params: { username: userDb.username },
                    });
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-muted-foreground truncate text-xs">
                      {userDb.email}
                    </div>
                    <div className="flex items-center">
                      <UserCircle className="mr-2 size-4 shrink-0" />
                      <div className="min-w-0 flex-1 py-0.5 text-sm">
                        <div className="font-medium">Perfil</div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => {
                const goHome = () => {
                  setChallenge({ mode: null, status: "NOT_STARTED" });
                  setExpandedNodes([]);
                  router.history.push(router.basepath + "/");
                };
                if (challenge.status === "IN_PROGRESS") {
                  openConfirm({
                    title: "Desafio em andamento",
                    description:
                      "Você tem um desafio em andamento. Ao acessar Explorar, o desafio será cancelado. Deseja continuar?",
                    confirmLabel: "Continuar",
                    onConfirm: goHome,
                    variant: "default",
                  });
                  return;
                }
                goHome();
              }}
            >
              <div className="flex w-full items-center">
                <Telescope className="mr-2 size-4" /> {t("nav.explore")}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

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
              onClick={() =>
                router.history.push(`${router.basepath}/lists`)
              }
            >
              <div className="flex w-full items-center">
                <List className="mr-2 size-4" /> {t("lists.title")}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <Settings className="size-4" />
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

            {isAuthenticated && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    openConfirm({
                      title: t("logout"),
                      description: t("nav.logoutWarning"),
                      confirmLabel: t("logout"),
                      onConfirm: handleLogout,
                      variant: "destructive",
                    })
                  }
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => !open && closeConfirm()}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        onConfirm={confirmState.onConfirm}
        variant={confirmState.variant}
      />
    </>
  );
};
