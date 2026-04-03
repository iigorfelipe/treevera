import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-new-logo.avif?url";
import { useTranslation } from "react-i18next";

import { Menu } from "./menu";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="flex w-[calc(100%-8px)] items-center justify-between gap-3 rounded-br-2xl pt-4 pb-6">
      <Image alt={t("header.logoAlt")} src={logoUrl} className="h-12" />

      <div className="flex w-full flex-col">
        <h1 className="text-2xl font-bold">Treevera</h1>
        <p className="line-clamp-1 text-base/4">{t("header.tagline")}</p>
      </div>

      <Menu />
    </header>
  );
};
