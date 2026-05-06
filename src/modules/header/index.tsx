import logoUrl from "@/assets/images/avif-logo.avif?url";
import { Image } from "@/common/components/image";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronRight, Search } from "lucide-react";
import { resetTreeHomeAtom, setFocusSearchAtom, treeAtom } from "@/store/tree";
import { ConfirmDialog } from "@/common/components/ui/confirm-dialog";

import { Menu } from "./menu";

export const Header = ({
  compact = false,
  onExpandRequest,
}: {
  compact?: boolean;
  onExpandRequest?: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const challenge = useAtomValue(treeAtom.challenge);
  const resetTreeHome = useSetAtom(resetTreeHomeAtom);
  const setFocusSearch = useSetAtom(setFocusSearchAtom);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (challenge.status === "IN_PROGRESS") {
      e.preventDefault();
      setConfirmOpen(true);
      return;
    }

    resetTreeHome();
  };

  const handleConfirmLeave = () => {
    resetTreeHome();
    void navigate({ to: "/" });
  };

  const handleExpandSearch = () => {
    onExpandRequest?.();

    if (!challenge.mode) {
      setFocusSearch({ kingdom: "" });
    }
  };

  if (compact) {
    return (
      <>
        <header className="flex w-full flex-col items-center gap-3 px-3 py-4">
          <div className="mb-1">
            <Menu hoverOpen />
          </div>

          <button
            type="button"
            onClick={onExpandRequest}
            className="bg-accent text-muted-foreground hover:text-foreground inline-flex size-10 cursor-pointer items-center justify-center rounded-2xl transition-colors"
            aria-label={t("nav.open")}
            title={t("nav.open")}
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={handleExpandSearch}
            className="bg-accent text-muted-foreground hover:text-foreground inline-flex size-10 cursor-pointer items-center justify-center rounded-2xl transition-colors"
            aria-label={t("nav.searchPlaceholder")}
            title={t("nav.searchPlaceholder")}
          >
            <Search className="size-4" />
          </button>
        </header>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("challenge.inProgressTitle")}
          description={t("challenge.leaveWarning")}
          confirmLabel={t("challenge.continue")}
          onConfirm={handleConfirmLeave}
          variant="default"
        />
      </>
    );
  }

  return (
    <>
      <header className="flex w-[calc(100%-8px)] items-center justify-between gap-3 rounded-br-2xl pt-4 pb-6">
        <Link
          to="/"
          className="flex cursor-pointer items-center gap-3"
          onClick={handleLogoClick}
        >
          <Image
            alt={t("header.logoAlt")}
            src={logoUrl}
            className="h-8 sm:h-12"
          />

          <div className="flex w-full flex-col">
            <h1 className="text-lg font-bold sm:text-2xl">Treevera</h1>
            <p className="line-clamp-1 text-sm sm:text-base/4">
              {t("header.tagline")}
            </p>
          </div>
        </Link>

        <Menu hoverOpen />
      </header>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("challenge.inProgressTitle")}
        description={t("challenge.leaveWarning")}
        confirmLabel={t("challenge.continue")}
        onConfirm={handleConfirmLeave}
        variant="default"
      />
    </>
  );
};
