import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-logo-icon.avif?url";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useIsFetching } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Menu } from "@/modules/header/menu";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/common/components/ui/button";

export const AppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentRoutePath = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.fullPath ?? "/",
  });

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const activeSearchRequests = useIsFetching({
    predicate: (queryState) => {
      const queryKey = queryState.queryKey[0];

      return (
        queryKey === QUERY_KEYS.search_taxa_key ||
        queryKey === QUERY_KEYS.search_lists_key ||
        queryKey === QUERY_KEYS.search_users_key
      );
    },
  });
  const isSearchLoading = loading || activeSearchRequests > 0;

  useEffect(() => {
    if (searchOpen)
      setTimeout(() => {
        mobileInputRef.current?.focus();
        inputRef.current?.focus();
      }, 50);
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setLoading(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    try {
      setLoading(true);
      await navigate({
        to: "/search/$query",
        params: { query: encodeURIComponent(q) },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    void navigate({ to: "/" });
  };

  const isListDetailRoute = currentRoutePath === "/$username/lists/$listSlug";

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isListDetailRoute) {
      setIsScrolled(false);
      return;
    }
    const scroller = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!scroller) return;

    const handle = () => setIsScrolled(scroller.scrollTop > 8);
    handle();
    scroller.addEventListener("scroll", handle, { passive: true });
    return () => scroller.removeEventListener("scroll", handle);
  }, [isListDetailRoute]);

  const useTransparentHeader = isListDetailRoute && !isScrolled;

  return (
    <header
      className={
        isListDetailRoute
          ? useTransparentHeader
            ? "group/header hover:border-border hover:bg-background/95 focus-within:border-border focus-within:bg-background/95 fixed inset-x-0 top-0 z-50 w-full border-b border-transparent bg-transparent transition-[background-color,border-color,backdrop-filter] duration-200 focus-within:backdrop-blur-sm hover:backdrop-blur-sm"
            : "group/header bg-background/95 fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-sm transition-colors duration-200"
          : "group/header bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-sm"
      }
    >
      <div className="relative">
        {useTransparentHeader && (
          <div className="pointer-events-none absolute inset-0">
            <div className="from-background/45 absolute inset-x-0 top-0 h-16 bg-linear-to-b to-transparent" />
          </div>
        )}

        <Button
          onClick={handleBack}
          className="absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 md:left-4 md:inline-flex md:opacity-0 md:group-hover/header:opacity-100 md:focus-visible:opacity-100"
          aria-label={t("nav.back")}
          title={t("nav.back")}
          variant="ghost"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <div className="relative px-3 md:gap-4 md:px-20">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-2">
            <Link
              to="/"
              className="flex min-w-0 shrink items-center gap-2 sm:shrink-0 sm:gap-2.5"
            >
              <Image
                alt={t("header.logoAlt")}
                src={logoUrl}
                className="h-8 rounded-full sm:h-9"
              />
              <div className="min-w-0 leading-none">
                <span className="block truncate text-sm font-bold sm:text-base">
                  Treevera
                </span>
                <span className="text-muted-foreground hidden text-xs sm:block">
                  {t("header.tagline")}
                </span>
              </div>
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground hidden cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex"
                >
                  {t("nav.signIn")}
                </Link>
              )}

              {isAuthenticated && userDb && (
                <>
                  <div className="hidden sm:block">
                    <Menu
                      trigger="label"
                      label={userDb.username.toLowerCase()}
                      hoverOpen
                    />
                  </div>
                  <div className="min-w-0 sm:hidden">
                    <Menu
                      trigger="label"
                      label={userDb.username.toLowerCase()}
                    />
                  </div>
                </>
              )}

              <button
                onClick={() => navigate({ to: "/challenges" })}
                className="text-muted-foreground hover:text-foreground hidden cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors md:inline-flex"
              >
                {t("nav.challenges")}
              </button>

              <button
                onClick={() => navigate({ to: "/lists" })}
                className="text-muted-foreground hover:text-foreground hidden cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors md:inline-flex"
              >
                {t("lists.title")}
              </button>

              {!isAuthenticated && (
                <div className="sm:hidden">
                  <Menu trigger="avatar" />
                </div>
              )}

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-y-2 right-14 left-3 origin-right md:hidden"
                  >
                    <div className="border-border bg-background flex items-center rounded-md border pr-1 shadow-sm">
                      <input
                        ref={mobileInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-8 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={t("nav.searchPlaceholder")}
                        disabled={loading}
                      />
                      <button
                        onClick={() => closeSearch()}
                        className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-1 transition-colors"
                        aria-label={t("nav.close")}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="hidden overflow-hidden md:block"
                initial={false}
                animate={{
                  width: searchOpen ? "min(320px, 40vw)" : 0,
                  opacity: searchOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="border-border bg-background flex items-center rounded-md border pr-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-8 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Pesquisar..."
                    disabled={loading}
                  />
                  <button
                    onClick={() => closeSearch()}
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-1 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </motion.div>

              <motion.button
                onClick={searchOpen ? handleSearch : () => setSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md p-1.5 transition-colors"
                aria-label="Pesquisar"
                disabled={loading}
                whileTap={{ scale: 0.9 }}
              >
                {isSearchLoading ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
