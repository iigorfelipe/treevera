import { useTranslation } from "react-i18next";
import {
  useGetListsWithSpecies,
  useGetMyListsForPicker,
} from "@/hooks/queries/useGetLists";
import { ListCard } from "./list-card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { ChevronRight, Images } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { slugify } from "@/common/utils/slugify";
import type {
  ListPickerItem,
  ListPreviewWithCreator,
} from "@/common/types/lists";

type ListsWithSpeciesProps = {
  gbifKey: number;
};

const DETAIL_LISTS_LIMIT = 3;

const ListSectionSkeleton = () => (
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

const ListSectionHeader = ({
  title,
  totalCount,
  action,
}: {
  title: string;
  totalCount: number;
  action?: ReactNode;
}) => {
  const { t } = useTranslation();
  const listLabel = t(totalCount === 1 ? "lists.list" : "lists.lists");

  return (
    <div className="flex items-start justify-between gap-3 border-b pb-2">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {totalCount} {listLabel}
        </p>
      </div>
      {action}
    </div>
  );
};

const MySpeciesListCard = ({
  list,
  username,
}: {
  list: ListPickerItem;
  username: string;
}) => {
  const { t } = useTranslation();
  const listSlug = slugify(list.title);

  return (
    <Link
      to="/$username/lists/$listSlug"
      params={{ username, listSlug }}
      className="group bg-card flex items-center gap-3 rounded-xl border p-3 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-lg">
        <Images className="text-muted-foreground size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
          {list.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {list.species_count} {t("lists.species")}
        </p>
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

const MyListsWithSpeciesSection = ({ gbifKey }: ListsWithSpeciesProps) => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);
  const [expanded, setExpanded] = useState(false);
  const { data = [], isLoading } = useGetMyListsForPicker(gbifKey);

  if (!userDb) return null;

  const lists = data.filter((list) => list.already_added);
  const visibleLists = expanded ? lists : lists.slice(0, DETAIL_LISTS_LIMIT);

  if (isLoading) return <ListSectionSkeleton />;
  if (lists.length === 0) return null;

  return (
    <div className="space-y-3">
      <ListSectionHeader
        title={t("lists.myListsWithSpecies")}
        totalCount={lists.length}
        action={
          lists.length > DETAIL_LISTS_LIMIT ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2.5 text-xs"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? t("lists.collapse") : t("lists.viewAll")}
              <ChevronRight
                className={`size-3.5 transition-transform ${
                  expanded ? "-rotate-90" : ""
                }`}
              />
            </Button>
          ) : null
        }
      />

      <div className="space-y-2">
        {visibleLists.map((list) => (
          <MySpeciesListCard
            key={list.id}
            list={list}
            username={userDb.username}
          />
        ))}
      </div>
    </div>
  );
};

const PublicListsWithSpeciesSection = ({ gbifKey }: ListsWithSpeciesProps) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetListsWithSpecies(
    gbifKey,
    DETAIL_LISTS_LIMIT,
  );

  const lists: ListPreviewWithCreator[] = data?.rows ?? [];
  const totalCount = data?.totalCount ?? lists.length;

  if (isLoading) return <ListSectionSkeleton />;
  if (lists.length === 0) return null;

  return (
    <div className="space-y-3">
      <ListSectionHeader
        title={t("lists.listsWithSpecies")}
        totalCount={totalCount}
        action={
          totalCount > lists.length ? (
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
          ) : null
        }
      />

      <div className="space-y-2">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};

export const ListsWithSpecies = ({ gbifKey }: ListsWithSpeciesProps) => {
  return (
    <div className="space-y-5">
      <MyListsWithSpeciesSection gbifKey={gbifKey} />
      <PublicListsWithSpeciesSection gbifKey={gbifKey} />
    </div>
  );
};
