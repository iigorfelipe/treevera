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
import { LogIn, LogOut, MenuIcon } from "lucide-react";
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

export const Menu = () => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isLoggingOut =
    useAtomValue(authStore.states.authStatus) === "loading-logout";
  const user = useAtomValue(authStore.states.authUser);
  const logout = useSetAtom(authStore.actions.logout);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="group bottom-0 z-50 flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl rounded-l-none rounded-b-none backdrop-blur-2xl md:absolute"
      >
        <div className="rounded-full">
          {user ? (
            <Avatar>
              <AvatarImage src={user.avatar_url} alt={"User"} />
              <AvatarFallback className="bg-green-600 text-xs text-white">
                {user.full_name[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <MenuIcon className="size-6" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="m-1 w-full" align="start">
        <DropdownMenuGroup>
          {!user && (
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
          {user && (
            <>
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-muted-foreground text-xs">
                  {user.email}
                </div>
              </div>

              <DropdownMenuSeparator />
            </>
          )}

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

          {user && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isLoggingOut}>
                <LogOut className="mr-2 size-4" />
                <span>{t("logout")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-72 max-w-[90vw] p-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Ao sair, seus recursos e progresso só ficarão disponíveis
                    quando entrar novamente.
                  </p>

                  <Button
                    onClick={() => {
                      logout();
                      (document.activeElement as HTMLElement | null)?.blur();
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
