import { useTranslation } from "react-i18next";
import { useGetListsWithSpecies } from "@/hooks/queries/useGetLists";
import { ListPreviewCard } from "./list-preview-card";
import { slugify } from "@/common/utils/slugify";
import { Link } from "@tanstack/react-router";

type ListsWithSpeciesProps = {
  gbifKey: number;
};

export const ListsWithSpecies = ({ gbifKey }: ListsWithSpeciesProps) => {
  const { t } = useTranslation();
  const { data } = useGetListsWithSpecies(gbifKey);

  const lists = data?.rows ?? [];

  if (lists.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b pb-1">
        <h2 className="text-sm font-semibold">{t("lists.listsWithSpecies")}</h2>
        <Link
          to="/specie-detail/$specieKey/lists"
          params={{ specieKey: String(gbifKey) }}
          className="text-primary text-xs font-medium hover:underline"
        >
          {t("lists.viewAll")}
        </Link>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <ListPreviewCard
            key={list.id}
            list={{ ...list, slug: list.slug || slugify(list.title) }}
            username={list.user_username}
          />
        ))}
      </div>
    </div>
  );
};
