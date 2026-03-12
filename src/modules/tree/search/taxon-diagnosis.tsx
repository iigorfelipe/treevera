import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

import type { TaxonDiagnostic } from "@/hooks/use-navigate-to-taxon";

interface Props {
  diagnostic: TaxonDiagnostic;
}

const GBIF_SPECIES_BASE = "https://www.gbif.org/species";

export function TaxonDiagnosis({ diagnostic }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { taxonomicStatus, gbifKey, acceptedName, remarks } = diagnostic;

  const reasonText = (() => {
    if (remarks) return remarks;
    if (taxonomicStatus.includes("SYNONYM"))
      return `${t("search.statusSynonymOf")} ${acceptedName ?? ""}`;
    if (taxonomicStatus === "DOUBTFUL") return t("search.statusDoubtful");
    if (taxonomicStatus === "EXCLUDED") return t("search.statusExcluded");
    return t("search.statusNotAccepted", { status: taxonomicStatus });
  })();

  return (
    <div className="bg-card mt-2 overflow-hidden rounded-lg border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-muted-foreground text-xs font-medium">
          {t("search.expansionIssueTitle")}
        </span>
        {open ? (
          <ChevronUp className="text-muted-foreground ml-2 size-3.5 shrink-0" />
        ) : (
          <ChevronDown className="text-muted-foreground ml-2 size-3.5 shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t px-3 py-3">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">{t("search.gbifRemarks")}:</span>{" "}
            {reasonText}
          </p>
          <a
            href={`${GBIF_SPECIES_BASE}/${gbifKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t("search.viewOnGbif")}
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
