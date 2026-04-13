import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-logo.avif?url";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { ConfirmDialog } from "@/common/components/ui/confirm-dialog";

import { Menu } from "./menu";

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (challenge.status === "IN_PROGRESS") {
      e.preventDefault();
      setConfirmOpen(true);
    }
  };

  const handleConfirmLeave = () => {
    setChallenge({ mode: null, status: "NOT_STARTED" });
    setExpandedNodes([]);
    void navigate({ to: "/" });
  };

  return (
    <>
      <header className="flex w-[calc(100%-8px)] items-center justify-between gap-3 rounded-br-2xl pt-4 pb-6">
        <Link
          to="/"
          className="flex cursor-pointer items-center gap-3"
          onClick={handleLogoClick}
        >
          <Image alt={t("header.logoAlt")} src={logoUrl} className="h-12" />

          <div className="flex w-full flex-col">
            <h1 className="text-2xl font-bold">Treevera</h1>
            <p className="line-clamp-1 text-base/4">{t("header.tagline")}</p>
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
