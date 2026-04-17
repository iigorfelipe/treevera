import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { List } from "lucide-react";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useGetListsWithSpecies } from "@/hooks/queries/useGetLists";
import { ListCard } from "@/modules/lists/list-card";

export const SpecieListsPage = () => {
  const { t } = useTranslation();
  const { specieKey } = useParams({ strict: false }) as {
    specieKey: string;
  };

  const gbifKey = specieKey ? Number(specieKey) : undefined;
  const { data, isLoading } = useGetListsWithSpecies(gbifKey, 100);

  const lists = data?.rows ?? [];

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="py-4">
          <div className="min-w-0">
            <h1 className="text-base leading-tight font-bold">
              {t("specieDetail.listsPageTitle")}
            </h1>
            {!isLoading && (
              <span className="text-muted-foreground text-xs">
                {lists.length} {t("lists.lists")}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <List className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">{t("specieDetail.noListsYet")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {lists.map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                <ListCard list={list} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
