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
import { useTheme } from "@/hooks/theme";
import { Loader, LogIn, LogOut, MenuIcon, Target } from "lucide-react";
import i18n from "@/common/i18n";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { useAtomValue, useSetAtom } from "jotai";

import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth";
import { useAuth } from "@/hooks/auth/use-auth-profile";
import { treeAtom } from "@/store/tree";

export const Menu = () => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const isLoggingOut = useAtomValue(authStore.logoutStatus) === "loading";
  const setChallenge = useSetAtom(treeAtom.challenge);
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="group cursor-pointer">
        <div className="rounded-full">
          {isAuthenticated && userDb ? (
            <Avatar>
              <AvatarImage src={userDb.avatar_url} alt={"User"} />
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
          {isAuthenticated && userDb && (
            <DropdownMenuItem>
              <Link to="/profile">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{userDb.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {userDb.email}
                  </div>
                </div>
              </Link>

              <DropdownMenuSeparator />
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() =>
              setChallenge({ mode: "UNSET", status: "NOT_STARTED" })
            }
          >
            <Target /> Desafios
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
            <DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuSubTrigger disabled={isLoggingOut}>
                <LogOut className="mr-2 size-4" />
                <span>{t("logout")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-72 max-w-[90vw] p-4">
                  <p className="mb-3 text-center text-sm leading-relaxed">
                    Ao sair, seus recursos e progresso só ficarão disponíveis
                    quando entrar novamente.
                  </p>

                  <Button
                    onClick={logout}
                    variant="destructive"
                    className="w-full"
                  >
                    {isLoggingOut ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sair mesmo assim
                  </Button>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
