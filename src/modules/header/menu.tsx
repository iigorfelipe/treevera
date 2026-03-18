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
  MenuIcon,
  Settings,
  Target,
  Telescope,
  UserCircle,
} from "lucide-react";
import i18n from "@/common/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { authStore } from "@/store/auth/atoms";

export const Menu = ({ isProfilePage }: { isProfilePage?: boolean }) => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);

  const navigate = useNavigate();

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
              <>
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
                if (challenge.status === "IN_PROGRESS") {
                  const confirmed = window.confirm(
                    "Você tem um desafio em andamento. Ao acessar Explorar, o desafio será cancelado.\n\nDeseja continuar?",
                  );

                  if (!confirmed) return;
                }
                setChallenge({ mode: null, status: "NOT_STARTED" });
                setExpandedNodes([]);
                navigate({ to: "/" });
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

            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
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
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
