import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type FormEvent,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { Images, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { authStore } from "@/store/auth/atoms";
import { Button } from "@/common/components/ui/button";
import {
  useGetListDetail,
  useGetListSpecies,
  useGetUserSeenInList,
  useDeleteList,
  useUpdateList,
  useRemoveSpeciesFromList,
} from "@/hooks/queries/useGetLists";
import { ListDetailHero, type SpeciesFilter } from "./list-detail-hero";
import { ListSpeciesGrid } from "./list-species-grid";
import { ListEditDialog } from "./list-edit-dialog";
import { ConfirmDialog } from "@/common/components/ui/confirm-dialog";
import { slugify } from "@/common/utils/slugify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  SUGGESTIONS_BY_KINGDOM,
  useAnimatedPlaceholder,
} from "@/modules/tree/search/use-animated-placeholder";

type ListDetailProps = {
  username: string;
  listSlug: string;
};

const useNumColumns = () => {
  const [numColumns, setNumColumns] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setNumColumns(5);
      else if (w >= 1024) setNumColumns(4);
      else if (w >= 768) setNumColumns(3);
      else if (w >= 640) setNumColumns(2);
      else setNumColumns(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return numColumns;
};

const ListSpeciesGridSkeleton = () => {
  const numColumns = useNumColumns();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-4">
          {Array.from({ length: numColumns }).map((_, col) => (
            <div key={col} className="flex min-w-0 flex-1 flex-col gap-4">
              {Array.from({ length: 4 }).map((_, row) => (
                <div
                  key={row}
                  className="bg-muted animate-pulse rounded-xl"
                  style={{ height: `${180 + (row % 3) * 40}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type EmptyListStateProps = {
  isOwner: boolean;
  isFiltered: boolean;
  message: string;
  onSearch: (query: string) => void;
  onBrowseLists: () => void;
};

const EmptyListState = ({
  isOwner,
  isFiltered,
  message,
  onSearch,
  onBrowseLists,
}: EmptyListStateProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const animatedPlaceholder = useAnimatedPlaceholder(
    query ? [] : SUGGESTIONS_BY_KINGDOM.animalia,
  );

  const showOwnerSearch = isOwner && !isFiltered;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    onSearch(trimmedQuery);
  };

  return (
    <div className="flex items-center justify-center px-4 py-16 md:py-20">
      <div className="w-full max-w-md text-center">
        <Images className="text-muted-foreground mx-auto mb-3 size-16 opacity-30" />

        {showOwnerSearch ? (
          <>
            <p className="text-foreground text-base font-medium">
              {t("lists.emptyOwnerListTitle")}
            </p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
              {t("lists.emptyOwnerListDescription")}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5 flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="empty-list-species-search" className="sr-only">
                {t("lists.emptyOwnerListSearchLabel")}
              </label>
              <div className="border-border bg-background flex h-10 min-w-0 flex-1 items-center rounded-md border px-3">
                <Search className="text-muted-foreground mr-2 size-4 shrink-0" />
                <div className="relative min-w-0 flex-1">
                  <input
                    id="empty-list-species-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="text-foreground h-full w-full bg-transparent text-sm outline-none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {!query && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 select-none"
                    >
                      <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center text-sm">
                        {animatedPlaceholder ||
                          t("lists.emptyOwnerListSearchPlaceholder")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={!query.trim()}>
                {t("lists.emptyOwnerListSearchButton")}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">{message}</p>
            {!isOwner && !isFiltered && (
              <Button
                variant="outline"
                className="mt-5"
                onClick={onBrowseLists}
              >
                {t("lists.viewOtherLists")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ListDetail = ({ username, listSlug }: ListDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [removeSpeciesGbifKey, setRemoveSpeciesGbifKey] = useState<
    number | null
  >(null);
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("all");

  const { data: list, isLoading: loadingDetail } = useGetListDetail(
    username,
    listSlug,
  );

  useDocumentTitle(list?.title);
  const {
    data: speciesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: loadingSpecies,
    isFetching: fetchingSpecies,
  } = useGetListSpecies(list?.id);

  const { data: seenInList } = useGetUserSeenInList(list?.id);

  const { mutate: doDelete, isPending: deleting } = useDeleteList();
  const { mutate: doUpdate } = useUpdateList(list?.id ?? "");
  const { mutate: doRemoveSpecies } = useRemoveSpeciesFromList(list?.id ?? "");

  const allSpecies = useMemo(
    () => speciesData?.pages.flatMap((p) => p.rows) ?? [],
    [speciesData],
  );
  const isListEmpty = allSpecies.length === 0;

  const filteredSpecies = useMemo(() => {
    if (speciesFilter === "known")
      return allSpecies.filter((s) => seenInList?.has(s.gbif_key));
    if (speciesFilter === "unknown")
      return allSpecies.filter((s) => !seenInList?.has(s.gbif_key));
    return allSpecies;
  }, [allSpecies, speciesFilter, seenInList]);
  const isSpeciesInitialLoading =
    !!list && !speciesData && (loadingSpecies || fetchingSpecies);

  const isOwner = !!userDb && !!list && userDb.id === list.user_id;
  const emptyListMessage = isListEmpty
    ? t("lists.noSpeciesInList")
    : speciesFilter === "known"
      ? t("lists.noKnownSpeciesInList")
      : speciesFilter === "unknown"
        ? t("lists.noUnknownSpeciesInList")
        : t("lists.noSpeciesInList");

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleDelete = () => {
    if (!list) return;
    doDelete(list.id, {
      onSuccess: () => {
        toast.success(t("lists.listDeleted"));
        navigate({ to: "/$username/lists", params: { username } });
      },
    });
  };

  const handleEditSave = (
    title: string,
    description: string,
    isPublic: boolean,
  ) => {
    doUpdate(
      { title, description: description || undefined, is_public: isPublic },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success(t("lists.listUpdated"));
          const newSlug = slugify(title);
          if (newSlug !== listSlug) {
            navigate({
              to: "/$username/lists/$listSlug",
              params: { username, listSlug: newSlug },
              replace: true,
            });
          }
        },
      },
    );
  };

  if (loadingDetail) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center">
          <Images className="mx-auto mb-3 size-16 opacity-30" />
          <p className="text-lg font-medium">{t("lists.noListsFound")}</p>
          <Button variant="ghost" className="mt-4" onClick={handleBack}>
            {t("lists.backToLists")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div>
        <ListDetailHero
          list={list}
          isOwner={isOwner}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteConfirmOpen(true)}
          speciesFilter={speciesFilter}
          onFilterChange={setSpeciesFilter}
        />

        {isSpeciesInitialLoading ? (
          <ListSpeciesGridSkeleton />
        ) : filteredSpecies.length === 0 && !isFetchingNextPage ? (
          <EmptyListState
            isOwner={isOwner}
            isFiltered={!isListEmpty && speciesFilter !== "all"}
            message={emptyListMessage}
            onSearch={(query) =>
              navigate({ to: "/search/$query", params: { query } })
            }
            onBrowseLists={() => navigate({ to: "/lists" })}
          />
        ) : (
          <ListSpeciesGrid
            species={filteredSpecies}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => void fetchNextPage()}
            isOwner={isOwner}
            onRemove={(gbifKey) => setRemoveSpeciesGbifKey(gbifKey)}
            listId={list.id}
            listUsername={list.user_username}
            listSlug={list.slug}
          />
        )}
      </div>

      {isOwner && list && (
        <ListEditDialog
          key={editOpen ? "open" : "closed"}
          open={editOpen}
          onOpenChange={setEditOpen}
          initialTitle={list.title}
          initialDescription={list.description || ""}
          initialIsPublic={list.is_public}
          onSave={handleEditSave}
        />
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("lists.deleteList")}</DialogTitle>
            <DialogDescription>{t("lists.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 p-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              {t("lists.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {t("lists.deleteList")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeSpeciesGbifKey !== null}
        onOpenChange={(open) => !open && setRemoveSpeciesGbifKey(null)}
        title={t("lists.removeSpecies")}
        description={t("lists.removeSpeciesConfirm")}
        confirmLabel={t("lists.removeFromList")}
        onConfirm={() => {
          if (removeSpeciesGbifKey !== null) {
            doRemoveSpecies(removeSpeciesGbifKey);
          }
        }}
        variant="destructive"
      />
    </div>
  );
};
