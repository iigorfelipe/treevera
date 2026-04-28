import { useTranslation } from "react-i18next";
import { useGetListsWithSpecies } from "@/hooks/queries/useGetLists";
import { ListCard } from "./list-card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

type ListsWithSpeciesProps = {
  gbifKey: number;
};

export const ListsWithSpecies = ({ gbifKey }: ListsWithSpeciesProps) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetListsWithSpecies(gbifKey);

  const lists = data?.rows ?? [];
  const totalCount = data?.totalCount ?? lists.length;
  const listLabel = t(totalCount === 1 ? "lists.list" : "lists.lists");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 border-b pb-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (lists.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 border-b pb-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{t("lists.listsWithSpecies")}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {totalCount} {listLabel}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2.5 text-xs"
        >
          <Link
            to="/specie-detail/$specieKey/lists"
            params={{ specieKey: String(gbifKey) }}
          >
            {t("lists.viewAll")}
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};
