import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { nodeAtomFamily } from "@/store/tree";
import { TREE_LEVEL_INDENT_PX } from "@/common/constants/tree";
import { SourceReference } from "@/common/components/source-info/source-reference";

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
  return (
    <div
      className="-ml-4 flex h-full w-full min-w-0 items-start"
      style={{ paddingLeft: level * TREE_LEVEL_INDENT_PX }}
    >
      <div className="bg-muted/40 flex w-full min-w-0 flex-col divide-y overflow-hidden rounded-lg border text-xs">
        <p className="px-3 py-2 leading-relaxed">
          {t("tree.emptyNodeAcceptedPrefix", { name })}{" "}
          <SourceReference
            sourceId="gbif"
            className="text-blue-600 hover:underline"
          >
            GBIF
          </SourceReference>
          , {t("tree.emptyNodeAcceptedSuffix")}
        </p>
        <p className="text-muted-foreground px-3 py-2 leading-relaxed">
          {t("tree.emptyNodeSettingsHint")}{" "}
          <span className="font-medium">{t("tree.emptyNodeSettingsPath")}</span>
          .
        </p>
      </div>
    </div>
  );
};
