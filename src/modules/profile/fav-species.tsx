import { Image } from "@/common/components/image";
import { cn } from "@/common/utils/cn";
import { authStore } from "@/store/auth";
import { useAtomValue } from "jotai";
import { Plus } from "lucide-react";

export const FavoriteSpecies = () => {
  const userDb = useAtomValue(authStore.userDb);

  const favSpecies = userDb?.game_info.top_fav_species || [];

  return (
    <div className="space-y-3">
      <h2 className="border-b">ESPÉCIES FAVORITAS</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favSpecies.map((species, index) => (
          <div
            key={index}
            className="group flex cursor-pointer flex-col items-center gap-2"
          >
            {species ? (
              <>
                <figure className="h-[277px] w-[194px] overflow-hidden rounded-lg shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                  <Image
                    src={""}
                    alt={species.name}
                    className={cn(
                      "size-full object-cover",
                      index === 3 && "object-[63%_center]",
                    )}
                  />
                </figure>

                <div className="text-center">
                  <div className="text-xs font-medium">{species.name}</div>
                  <div className="text-xs italic">{species.name}</div>
                </div>
              </>
            ) : (
              <div className="dark:bg-accent flex h-[277px] w-[194px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 transition-all duration-300 hover:bg-transparent">
                <div className="text-center">
                  <Plus className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <div className="text-xs text-slate-500">
                    Adicionar favorita
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
