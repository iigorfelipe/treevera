import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-new-fav-icon.avif?url";

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <Image
          alt={t("header.logoAlt")}
          src={logoUrl}
          className="size-20 rounded-full opacity-60"
        />

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground/60 text-sm font-medium tracking-widest uppercase">
            Erro 404
          </p>
          <h1 className="text-foreground text-3xl font-bold">
            {t("notFound.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-base leading-relaxed">
            {t("notFound.description")}
          </p>
        </div>

        <button
          onClick={() => void navigate({ to: "/" })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("notFound.backHome")}
        </button>
      </div>
    </div>
  );
}
