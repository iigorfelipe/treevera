import { Image } from "@/common/components/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { CardInfo } from "@/modules/explore/card";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";

export const ExploreInfo = () => {
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { navigateToNodes } = useTreeNavigation();

  if (!challengeMode && expandedNodes.length) return <CardInfo />;

  return (
    <div className="p-8">
      <div
        className="mx-auto max-w-7xl space-y-12"
        style={{ containerType: "inline-size" }}
      >
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-semibold">
            Escolha um Reino para iniciar sua exploração!
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 [@container(min-width:620px)]:grid-cols-2 [@container(min-width:820px)]:grid-cols-3">
          {exploreInfos.map((item) => (
            <Card
              key={item.kingdomKey}
              className="cursor-pointer overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              onClick={() =>
                navigateToNodes([
                  {
                    key: item.kingdomKey,
                    rank: "KINGDOM",
                    name: item.kingdomName,
                  },
                ])
              }
            >
              <CardHeader className="">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-sm"
                    style={{ backgroundColor: item.lightColor }}
                  >
                    <Image
                      src={item.icon}
                      className="size-6"
                      alt={item.kingdomName + "icon"}
                    />
                  </div>
                  <CardTitle className="mb-2 text-xl font-bold">
                    {item.kingdomName}
                  </CardTitle>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardHeader>

              <CardContent>
                <p className="mb-2 text-xs font-medium">Principais Grupos:</p>
                <div className="flex flex-wrap gap-1">
                  {item.mainGroups.slice(0, 3).map((group, index) => (
                    <span
                      key={index}
                      className="bg-accent rounded border px-2 py-1 text-xs"
                    >
                      {group.groupName}
                    </span>
                  ))}
                  {item.mainGroups.length > 3 && (
                    <span className="bg-accent rounded border px-2 py-1 text-xs">
                      +{item.mainGroups.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
