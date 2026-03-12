import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";

import { treeAtom, setFocusSearchAtom } from "@/store/tree";
import {
  TREE_LEVEL_INDENT_PX,
  NAME_KINGDOM_BY_KEY,
} from "@/common/constants/tree";

type Props = {
  parentNodeKey: number;
  level: number;
};

export const SearchBannerNode = ({ level }: Props) => {
  const { t } = useTranslation();
  const expandedPath = useAtomValue(treeAtom.expandedNodes);
  const setFocusSearch = useSetAtom(setFocusSearchAtom);

  const kingdomKey = expandedPath[0]?.key;
  const kingdomName = kingdomKey ? (NAME_KINGDOM_BY_KEY[kingdomKey] ?? "") : "";

  return (
    <div
      className="-ml-4 flex h-10 w-full items-center"
      style={{ paddingLeft: level * TREE_LEVEL_INDENT_PX }}
    >
      <button
        type="button"
        onClick={() => setFocusSearch({ kingdom: kingdomName })}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        {t("tree.searchBannerPrompt")}
      </button>
    </div>
  );
};
