import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/theme";
import {
  List,
  LogIn,
  LogOut,
  MenuIcon,
  Settings,
  Target,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import i18n from "@/common/i18n";
import { useNavigate } from "@tanstack/react-router";
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

type MenuProps = {
  trigger?: "avatar" | "label";
  label?: string;
  hoverOpen?: boolean;
  avatarSize?: "sm" | "lg";
};

const CLOSED_CONFIRM: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "",
  onConfirm: () => {},
  variant: "default",
};

export const Menu = ({
  trigger = "avatar",
  label,
  hoverOpen = false,
  avatarSize = "sm",
}: MenuProps) => {
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
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openConfirm = (params: Omit<ConfirmState, "open">) => {
    setConfirmState({ ...params, open: true });
  };

  const closeConfirm = () => setConfirmState(CLOSED_CONFIRM);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const closeMenuImmediately = () => {
    clearCloseTimeout();
    setOpen(false);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  const navigateToAppHome = () => {
    navigate({ to: "/" });
  };

  const handleLogout = async () => {
    setChallenge({ mode: null, status: "NOT_STARTED" });
    setExpandedNodes([]);
    await logoutService();
    setSession(null);
    setUserDb(null);
    navigateToAppHome();
  };

  const navigateProfile = () => {
    if (!userDb?.username) return;

    const goProfile = () => {
      setChallenge({ mode: null, status: "NOT_STARTED" });
      navigate({
        to: "/$username",
        params: { username: userDb.username },
      });
    };

    if (challenge.status === "IN_PROGRESS") {
      openConfirm({
        title: t("challenge.inProgressTitle"),
        description: t("challenge.leaveWarning"),
        confirmLabel: t("challenge.continue"),
        onConfirm: goProfile,
        variant: "default",
      });
      return;
    }

    goProfile();
  };

  const navigateChallenges = () => {
    const goChallenges = () => {
      setChallenge({ mode: "UNSET", status: "NOT_STARTED" });
      navigate({ to: "/challenges" });
    };

    if (challenge.status === "IN_PROGRESS") {
      openConfirm({
        title: t("challenge.inProgressTitle"),
        description: t("challenge.leaveWarning"),
        confirmLabel: t("challenge.continue"),
        onConfirm: goChallenges,
        variant: "default",
      });
      return;
    }

    goChallenges();
  };

  const navigateLists = () => {
    if (challenge.status === "IN_PROGRESS") {
      openConfirm({
        title: t("challenge.inProgressTitle"),
        description: t("challenge.leaveWarning"),
        confirmLabel: t("challenge.continue"),
        onConfirm: () => navigate({ to: "/lists" }),
        variant: "default",
      });
      return;
    }
    navigate({ to: "/lists" });
  };

  const renderTrigger = () => {
    if (trigger === "label") {
      return (
        <button
          aria-label={t("header.userMenu")}
          className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none"
          onMouseEnter={hoverOpen ? openMenu : undefined}
          onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
        >
          <span className="block max-w-28 truncate lowercase">{label}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      );
    }

    return (
      <div
        className="rounded-full"
        onMouseEnter={hoverOpen ? openMenu : undefined}
        onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
      >
        {isAuthenticated && userDb ? (
          <Avatar className={avatarSize === "lg" ? "size-16" : "size-8"}>
            <AvatarImage
              src={userDb.avatar_url}
              alt={t("header.userAvatarAlt")}
            />
            <AvatarFallback className="bg-green-600 text-xs text-white">
              {userDb.name[0]}
            </AvatarFallback>
          </Avatar>
        ) : (
          <MenuIcon className="size-6" />
        )}
      </div>
    );
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>{renderTrigger()}</DropdownMenuTrigger>
        <DropdownMenuContent
          className={trigger === "avatar" ? "m-1 w-full" : "w-56"}
          align={trigger === "avatar" ? "start" : "end"}
          sideOffset={trigger === "avatar" ? 4 : 0}
          onMouseEnter={hoverOpen ? openMenu : undefined}
          onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={() => closeMenuImmediately()}
          onEscapeKeyDown={() => closeMenuImmediately()}
        >
          <DropdownMenuGroup>
            {!isAuthenticated && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    closeMenuImmediately();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogIn className="mr-2 size-4" />
                  <span>{t("loginWithGoogle")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {isAuthenticated && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    closeMenuImmediately();
                    navigateProfile();
                  }}
                >
                  <UserCircle className="mr-2 size-4" />
                  {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => {
                closeMenuImmediately();
                navigateChallenges();
              }}
            >
              <Target className="mr-2 size-4" />
              {t("nav.challenges")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                closeMenuImmediately();
                navigateLists();
              }}
            >
              <List className="mr-2 size-4" />
              {t("lists.title")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-3.75 size-4" />
                {t("nav.settings")}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  className="m-1"
                  onMouseEnter={hoverOpen ? openMenu : undefined}
                  onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {t("theme")}: {t(theme)}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        className="m-1"
                        onMouseEnter={hoverOpen ? openMenu : undefined}
                        onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
                      >
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
                      <DropdownMenuSubContent
                        className="m-1"
                        onMouseEnter={hoverOpen ? openMenu : undefined}
                        onMouseLeave={hoverOpen ? scheduleCloseMenu : undefined}
                      >
                        <DropdownMenuItem
                          onClick={() => i18n.changeLanguage("pt")}
                        >
                          {t("pt")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => i18n.changeLanguage("en")}
                        >
                          {t("en")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => i18n.changeLanguage("es")}
                        >
                          {t("es")}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      closeMenuImmediately();
                      if (challenge.status === "IN_PROGRESS") {
                        openConfirm({
                          title: t("challenge.inProgressTitle"),
                          description: t("challenge.leaveWarning"),
                          confirmLabel: t("challenge.continue"),
                          onConfirm: () => navigate({ to: "/settings" }),
                          variant: "default",
                        });
                        return;
                      }
                      navigate({ to: "/settings" });
                    }}
                  >
                    {t("nav.allSettings")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {isAuthenticated && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    closeMenuImmediately();
                    openConfirm({
                      title: t("logout"),
                      description: t("nav.logoutWarning"),
                      confirmLabel: t("logout"),
                      onConfirm: handleLogout,
                      variant: "destructive",
                    });
                  }}
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
