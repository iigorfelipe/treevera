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
import { useAtom, useSetAtom } from "jotai";
import { nodeAtomFamily, setNodeChildrenAtom } from "@/store/tree";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { Loader } from "lucide-react";
import { cn } from "@/common/utils/cn";

export const TreeNodeLiContent = memo(
  ({ nodeKey, level }: { nodeKey: number; level: number }) => {
    const [node] = useAtom(nodeAtomFamily(nodeKey));
    const setNodeChildren = useSetAtom(setNodeChildrenAtom);
    const { toggleNode } = useTreeNavigation();

    const isExpanded = node?.expanded;

    const { data: childrenData, isLoading } = useGetChildren({
      parentKey: node?.key,
      expanded: !!isExpanded,
      numDescendants: node?.numDescendants,
      rank: node?.rank,
    });

    useEffect(() => {
      if (isExpanded && childrenData) {
        setNodeChildren({ key: node.key, children: childrenData });
      }
    }, [isExpanded, childrenData, node?.key, setNodeChildren]);

    const handleClick = useCallback(() => {
      if (!isLoading) toggleNode(nodeKey);
    }, [isLoading, toggleNode, nodeKey]);

    if (!node) return null;

    const isKingdom = node.rank === "KINGDOM";
    const isSpecie = node.rank === "SPECIES";

    const kingdomColor =
      COLOR_KINGDOM_BY_NAME[
        node?.kingdom?.toLocaleLowerCase() as keyof typeof COLOR_KINGDOM_BY_NAME
      ];

    const marginLeft = level * TREE_LEVEL_INDENT_PX;

    return (
      <div
        className={cn("flex", isLoading && "node-loading")}
        style={
          {
            marginLeft,
            height: isKingdom ? "4.25rem" : "2.125rem",
            zIndex: 1,
            "--tree-color": kingdomColor,
          } as React.CSSProperties
        }
        onClick={handleClick}
      >
        {!isKingdom && (
          <div
            className="z-50 mt-1.5 flex cursor-pointer items-center justify-center rounded-full p-px text-white"
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
