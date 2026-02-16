import { curiosidades } from "@/common/utils/dataFake";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { capitalizar } from "@/common/utils/string";
import { Image } from "@/common/components/image";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent } from "@/common/components/ui/card";
import { treeAtom } from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { Route } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth/atoms";
import { COLOR_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { setExpandedPathAtom } from "@/store/tree";

export const CardInfo = () => {
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const userDb = useAtomValue(authStore.userDb);

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(setExpandedPathAtom);

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

  const shortcuts = useMemo(() => {
    if (!userDb) return null;

    if (!userDb.game_info?.shortcuts) return null;

    const kingdom = selectedData?.kingdomName.toLocaleLowerCase() as "animalia";
    return userDb.game_info.shortcuts[kingdom];
  }, [selectedData?.kingdomName, userDb]);

  if (!selectedData) return;

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-6xl p-10"
      style={{ containerType: "inline-size" }}
    >
      <header className="bg-card flex rounded-xl border p-6 pr-10 shadow-sm">
        <div className="space-y-2">
          <Badge variant="secondary">Reino</Badge>

          <h1
            className="[@container(min-width:350px)]text-4xl text-3xl font-bold tracking-tight [@container(min-width:450px)]:text-5xl"
            style={{
              color: COLOR_KINGDOM_BY_KEY[selectedData.kingdomKey],
            }}
          >
            {selectedData.kingdomName}
          </h1>
          <p className="text-muted-foreground w-full">
            {selectedData.description}
          </p>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1">
              {selectedData.mainGroups.map((example, index) => (
                <Button
                  variant="outline"
                  key={index}
                  onClick={() => setExpandedNodes(example.pathNode)}
                >
                  <Route className="size-4 scale-x-[-1]" />

                  {example.groupName}
                </Button>
              ))}
            </div>

            {shortcuts && (
              <div className="flex flex-wrap items-center gap-1">
                {shortcuts.map(({ name, nodes }, index) => {
                  if (nodes[0].key === selectedData.kingdomKey) {
                    return (
                      <Button
                        key={name + index}
                        variant="outline"
                        onClick={() => setExpandedNodes(nodes)}
                      >
                        <Route className="size-4 scale-x-[-1]" />

                        {name}
                      </Button>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
        <Image
          src={getRankIcon(selectedData.kingdomKey)}
          className="mt-8 size-8 [@container(min-width:350px)]:size-12 [@container(min-width:450px)]:my-auto [@container(min-width:450px)]:ml-auto [@container(min-width:450px)]:size-20"
        />
      </header>

      {expandedNodes.length > 0 &&
        expandedNodes[expandedNodes.length - 1].rank !== "SPECIES" && (
          <section className="py-8 sm:py-10">
            <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">
              Fatos e curiosidades sobre {message}
            </h2>
            <div className="grid gap-4 [@container(min-width:350px)]:grid-cols-2">
              {expandedNodes.length === 1
                ? curiosidades.KINGDOM[expandedNodes[0].key].map(
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
                  )
                : curiosidades[
                    expandedNodes[expandedNodes.length - 1].rank as "PHYLUM"
                  ].map((item, index) => (
                    <Card
                      key={index}
                      className="transition-shadow duration-200 hover:shadow-lg"
                    >
                      <CardContent>
                        <p className="text-foreground/90">{item}</p>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </section>
        )}
    </main>
  );
};
