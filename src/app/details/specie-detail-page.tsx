import { SpecieDetail } from "@/app/details/specie-detail";
import { selectedSpecieKeyAtom } from "@/store/tree";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const SpecieDetailPage = () => {
  const { t } = useTranslation();
  const { specieKey } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { from?: string };
  const setSelectedKey = useSetAtom(selectedSpecieKeyAtom);
  const numericKey = Number(specieKey);

  useEffect(() => {
    if (!isNaN(numericKey) && numericKey > 0) {
      setSelectedKey(numericKey);
    }
    return () => {
      setSelectedKey(null);
    };
  }, [numericKey, setSelectedKey]);

  const navigate = useNavigate();

  const handleBack = () => {
    if (search.from === "profile") {
      void navigate({ to: "/profile" });
    } else if (search.from === "gallery") {
      void navigate({ to: "/profile/species-gallery" });
    } else if (search.from === "list") {
      window.history.back();
    } else {
      void navigate({ to: "/" });
    }
  };

  return <SpecieDetail onBack={handleBack} backLabel={t("nav.back")} />;
};
