import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/utils/cn";
import Alvo from "@/assets/alvo.gif";
import { TaxonomicPath } from "@/modules/challenge/taxonomic-path";
import { authStore } from "@/store/auth";

import { treeAtom } from "@/store/tree";
import { useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { getDailySpecies } from "@/common/utils/game/daily-species";

export const DailyChallenge = () => {
  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const navigate = useNavigate();
  const speciesName = getDailySpecies();

  const inProgress = useMemo(
    () => challenge.status === "IN_PROGRESS",
    [challenge.status],
  );

  const handleCkick = useCallback(() => {
    if (inProgress) {
      setChallenge((prev) => ({
        ...prev,
        status: "NOT_STARTED",
        mode: "UNSET"
      }));
      return;
    }

    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    setChallenge((prev) => ({
      ...prev,
      status: "IN_PROGRESS",
      mode: "DAILY"
    }));
    setExpandedNodes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress, isAuthenticated]);

  return (
    <div className="px-4 py-6">
      <Card className="mx-auto rounded-2xl border bg-transparent shadow-sm">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            
            <div className="group flex items-center font-semibold">
              <Image src={Alvo} className="size-12" alt="Alvo gif" />
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-bold 2xl:text-2xl">Desafio Diário</h2>
                <p>
                  Encontre:{" "}
                  <i className="font-semibold text-emerald-600 dark:text-green-500">
                    {speciesName}
                  </i>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-1 text-sm">Tempo restante</div>
              <div className="text-lg font-bold">24:00</div>
            </div>
          </div>

          {inProgress && <TaxonomicPath />}

          {/* <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold">+100</div>
              <div className="text-sm">XP Base</div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold">+50</div>
              <div className="text-sm">Precisão</div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold">+25</div>
              <div className="text-sm">Velocidade</div>
            </div>
          </div> */}

          <Button
            size="lg"
            className={cn(
              "cursor-pointer bg-emerald-600 p-6 hover:bg-emerald-600/90",
              inProgress && "bg-red-500 p-6 hover:bg-red-500/90",
            )}
            onClick={handleCkick}
          >
            <span className="text-xl">
              {inProgress ? "Cancelar Desafio" : "Iniciar Desafio"}
            </span>
          </Button>
 
        </CardContent>
      </Card>
    </div>
  );
};
