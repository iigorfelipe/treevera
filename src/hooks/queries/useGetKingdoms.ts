import { useQuery } from "@tanstack/react-query";
import { getKingdoms } from "@/services/api";
import { QUERY_KEYS } from "./keys";

export function useGetKingdoms() {
  const { kingdoms_key } = QUERY_KEYS;

  return useQuery({
    queryKey: [kingdoms_key],
    queryFn: getKingdoms,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    select: (data) => {
      const seen = new Set<string>();

      const kingdoms = data.filter((item) => {
        if (seen.has(item.kingdom)) return false;
        if (item.kingdom.toLocaleLowerCase() === "viruses") return false;
        seen.add(item.kingdom);
        return true;
      });

      return kingdoms;
    },
  });
}
