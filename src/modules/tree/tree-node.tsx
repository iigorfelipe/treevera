import { ContentNode } from "./content-node";
import { RootNode } from "./root-node";
import { SpecieNode } from "./specie-node";
import {
  TREE_TOGGLE_BUTTON_DIAMETER_PX,
  TREE_TOGGLE_BUTTON_OFFSET_X_PX,
  COLOR_KINGDOM_BY_NAME,
  TREE_LEVEL_INDENT_PX,
} from "@/common/constants/tree";
import { memo, useCallback, useEffect } from "react";
import { useGetChildren } from "@/hooks/queries/useGetChildren";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { nodeAtomFamily, setNodeChildrenAtom, treeAtom } from "@/store/tree";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";
import { Loader } from "lucide-react";
import { cn } from "@/common/utils/cn";
import { Image } from "@/common/components/image";
import { inatImageUrl } from "@/common/utils/image-size";

export const TreeNodeLiContent = memo(
  ({ nodeKey, level }: { nodeKey: number; level: number }) => {
    const [node] = useAtom(nodeAtomFamily(nodeKey));
    const setNodeChildren = useSetAtom(setNodeChildrenAtom);
    const listTreeMode = useAtomValue(treeAtom.listTreeMode);
    const { toggleNode } = useTreeNavigation();
    const { isCompactMenu, requestPanelExpand } = useTreePanelLayout();

    const isExpanded = node?.expanded;

    const { data, isLoading } = useGetChildren({
      parentKey: node?.key,
      expanded: !!isExpanded && !listTreeMode,
      numDescendants: node?.numDescendants,
      parentRank: node?.rank,
    });

    useEffect(() => {
      if (isExpanded && data && node?.childrenKeys === undefined) {
        setNodeChildren({
          key: node.key,
          children: data.children,
        });
      }
    }, [isExpanded, data, node?.key, node?.childrenKeys, setNodeChildren]);

    const handleClick = useCallback(() => {
      if (isLoading) return;
      if (isCompactMenu) requestPanelExpand();
      toggleNode(nodeKey);
    }, [isCompactMenu, isLoading, nodeKey, requestPanelExpand, toggleNode]);

    if (!node) return null;

    const isKingdom = node.rank === "KINGDOM";
    const isSpecie = node.rank === "SPECIES";
    const speciesThumbSrc =
      isSpecie && node.imageUrl ? inatImageUrl(node.imageUrl, "square") : null;

    const kingdomColor =
      COLOR_KINGDOM_BY_NAME[
        node?.kingdom?.toLocaleLowerCase() as keyof typeof COLOR_KINGDOM_BY_NAME
      ];

    const marginLeft = isCompactMenu ? 0 : level * TREE_LEVEL_INDENT_PX;

    return (
      <div
        className={cn(
          "flex",
          isLoading && "node-loading",
          isCompactMenu && "cursor-pointer justify-center px-1.5",
          listTreeMode && "cursor-pointer",
        )}
        style={
          {
            marginLeft,
            height: isCompactMenu
              ? isKingdom
                ? "3.25rem"
                : "3.25rem"
              : isKingdom
                ? "4.25rem"
                : "2.125rem",
            zIndex: 1,
            "--tree-color": kingdomColor,
          } as React.CSSProperties
        }
        onClick={handleClick}
      >
        {!isCompactMenu && !isKingdom && (
          <div
            className="z-50 mt-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-full p-px text-white"
            style={{
              backgroundColor: kingdomColor,
              width: TREE_TOGGLE_BUTTON_DIAMETER_PX,
              height: TREE_TOGGLE_BUTTON_DIAMETER_PX,
              marginLeft: TREE_TOGGLE_BUTTON_OFFSET_X_PX,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
            }}
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : speciesThumbSrc ? (
              <Image
                src={speciesThumbSrc}
                alt=""
                className="size-full rounded-full object-cover"
              />
            ) : isSpecie ? (
              <span className="size-5" />
            ) : (
              <span className="flex size-5 items-center justify-center pb-0.5 font-bold">
                {isExpanded ? "−" : "+"}
              </span>
            )}
          </div>
        )}

        {isKingdom ? (
          <RootNode node={node} isLoading={isLoading} />
        ) : isSpecie ? (
          <SpecieNode node={node} />
        ) : (
          <ContentNode node={node} />
        )}
      </div>
    );
  },
);
