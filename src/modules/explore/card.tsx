import { curiosidades, kingdomColors } from "@/common/utils/dataFake";
import { getRankIcon } from "@/common/utils/ranks";
import { capitalizar } from "@/common/utils/string";
import { Image } from "@/components/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { treeAtom, type PathNode } from "@/store/tree";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

export const CardInfo = () => {
  const [expandedNodes, setExpandedNodes] = useAtom(treeAtom.expandedNodes);
  const setTreeScroll = useSetAtom(treeAtom.treeScroll);
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);

  const selectedData = exploreInfos.find(
    (item) => item.kingdomKey === expandedNodes[0].key,
  );

  const message = useMemo(() => {
    const currentRank = expandedNodes[expandedNodes.length - 1].rank;

    if (!selectedData) return "";

    if (currentRank !== "KINGDOM") {
      return `a classificação ${capitalizar(currentRank)}`;
    }

    return `o Reino ${selectedData.kingdomName}`;
  }, [expandedNodes, selectedData]);

  if (!selectedData) return;

  const onGroupClick = (pathNode: PathNode[]) => {
    setExpandedNodes(pathNode);
    setTreeScroll({
      autoScroll: true,
      scrollIndex: 0,
      loadingMap: {},
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-10">
      <header className="flex rounded-xl border p-6 pr-10 shadow-sm">
        <div className="space-y-2">
          <Badge variant="secondary">Reino</Badge>

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              color: kingdomColors[selectedData.kingdomName as "Animalia"][1],
            }}
          >
            {selectedData.kingdomName}
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            {selectedData.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedData.mainGroups.map((example, index) => (
              <span
                key={index}
                className="cursor-pointer rounded border px-2 py-1 text-xs hover:font-medium"
                onClick={() => onGroupClick(example.pathNode)}
              >
                {example.groupName}
              </span>
            ))}
          </div>
        </div>
        <Image
          src={getRankIcon(selectedData.kingdomName)}
          className="my-auto ml-auto size-20"
        />
      </header>

      {expandedNodes.length > 0 && (
        <section className="py-8 sm:py-10">
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">
            Fatos e curiosidades sobre {message}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {expandedNodes.length === 1
              ? curiosidades.KINGDOM[
                  expandedNodes[0].kingdom as "Animalia"
                ].map((item, index) => (
                  <Card
                    key={index}
                    className="transition-shadow duration-200 hover:shadow-lg"
                  >
                    <CardContent>
                      <p className="text-foreground/90">{item}</p>
                    </CardContent>
                  </Card>
                ))
              : curiosidades[expandedNodes[expandedNodes.length - 1].rank].map(
                  (item, index) => (
                    <Card
                      key={index}
                      className="transition-shadow duration-200 hover:shadow-lg"
                    >
                      <CardContent>
                        <p className="text-foreground/90">{item}</p>
                      </CardContent>
                    </Card>
                  ),
                )}
          </div>
        </section>
      )}
    </main>
  );
};
