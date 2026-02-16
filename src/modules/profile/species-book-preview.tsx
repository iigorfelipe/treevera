import { Button } from "@/common/components/ui/button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { BookOpen, ChevronRight } from "lucide-react";

export const SpeciesBookPreview = () => {
  const userDb = useAtomValue(authStore.userDb);

  const species_book = userDb?.game_info?.species_book ?? [];

  if (!userDb || !userDb.game_info) return null;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>LIVRO DE ESPÉCIES</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 bg-transparent px-2 text-xs"
          disabled={!species_book.length}
        >
          Abrir livro <ChevronRight className="ml-1 size-3" />
        </Button>
      </div>

      {!species_book.length ? (
        <div className="py-8 text-center text-slate-500">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <div className="mb-1 text-sm font-medium">Seu livro está vazio</div>
          <div className="text-xs">Explore espécies para preenchê-lo!</div>
        </div>
      ) : (
        species_book.slice(0, 4).map((species, index) => {
          const specieDetail = species_book[index];
          return (
            <div
              key={index}
              className="-mx-2 flex items-center justify-between border-b border-slate-100 px-2 py-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-xs font-medium italic">
                    {specieDetail?.specie_name}
                  </div>
                  <div className="text-xs">{specieDetail?.family_name}</div>
                </div>
              </div>
              <div className="text-xs">{formatActivityDate(species?.date)}</div>
            </div>
          );
        })
      )}
    </div>
  );
};
