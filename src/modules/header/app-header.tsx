import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-new-logo.avif?url";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { useIsFetching } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Menu } from "@/modules/header/menu";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader } from "lucide-react";

export const AppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
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

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <Image alt={t("header.logoAlt")} src={logoUrl} className="h-9" />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold">Treevera</span>
            <span className="text-muted-foreground hidden text-xs sm:block">
              {t("header.tagline")}
            </span>
          </div>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-0.5">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {t("nav.signIn")}
            </Link>
          )}

          {isAuthenticated && userDb && (
            <Menu
              trigger="label"
              label={userDb.username.toLowerCase()}
              hoverOpen
            />
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

          <motion.div
            animate={{ width: searchOpen ? "min(320px, 40vw)" : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
            style={{ width: 0 }}
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
                className="text-muted-foreground hover:text-foreground shrink-0 p-1 transition-colors"
                aria-label="Fechar"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>

          <motion.button
            onClick={searchOpen ? handleSearch : () => setSearchOpen(true)}
            className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
            aria-label="Pesquisar"
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            {isSearchLoading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
