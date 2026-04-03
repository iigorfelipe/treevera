import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { nodeAtomFamily } from "@/store/tree";
import { TREE_LEVEL_INDENT_PX } from "@/common/constants/tree";

type Props = {
  parentNodeKey: number;
  level: number;
};

export const EmptyNodeInfoCard = ({ parentNodeKey, level }: Props) => {
  const { t } = useTranslation();
  const node = useAtomValue(nodeAtomFamily(parentNodeKey));

  if (!node) return null;

  const name =
    node.canonicalName || node.scientificName || String(parentNodeKey);
  const gbifUrl = `https://www.gbif.org/species/${parentNodeKey}`;

  return (
    <div
      className="-ml-4 flex h-full w-full min-w-0 items-start"
      style={{ paddingLeft: level * TREE_LEVEL_INDENT_PX }}
    >
      <div className="bg-muted/40 flex w-full min-w-0 flex-col divide-y overflow-hidden rounded-lg border text-xs">
        <p className="px-3 py-2 leading-relaxed">
          {t("tree.emptyNodeAcceptedPrefix", { name })}{" "}
          <a
            href={gbifUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            GBIF
          </a>
          , {t("tree.emptyNodeAcceptedSuffix")}
        </p>
        <p className="text-muted-foreground px-3 py-2 leading-relaxed">
          {t("tree.emptyNodeSettingsHint")}{" "}
          <span className="font-medium">
            {t("tree.emptyNodeSettingsPath")}
          </span>
          .
        </p>
      </div>
    </div>
  );
};
