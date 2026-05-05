import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import type { FavSpecies } from "@/common/types/user";
import { updateTopFavSpecies } from "@/common/utils/supabase/update-top-fav-species";
import { authStore } from "@/store/auth/atoms";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useAtom } from "jotai";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyFavCard } from "./empty-card";
import { FilledFavCard, SortableFilledCard } from "./filled-card";
import { PickerItem } from "./picker-item";
import { materializeSlots } from "./utils";
import {
  useGetFavoriteSpeciesPages,
  useGetBatchAttribution,
} from "@/hooks/queries/useGetUserSeenSpecies";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";
import { getSpeciesSlugParam } from "@/common/utils/species-url";
import { invalidateUserPublicProfileQuery } from "@/hooks/queries/cache-invalidation";

export const FavoriteSpecies = ({
  favSpecies,
  isOwner = true,
  profileOwnerUsername,
}: {
  favSpecies?: FavSpecies[];
  isOwner?: boolean;
  profileOwnerUsername?: string;
}) => {
  const { t } = useTranslation();
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAchievements = useCheckAchievements();
  const [editMode, setEditMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const {
    data: favPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFavoriteSpeciesPages(pickerOpen);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const topFavKeys = useMemo(() => {
    const topFav = userDb?.game_info.top_fav_species;
    if (!topFav) return [];
    return topFav.map((n) => n.key);
  }, [userDb]);

  const favSpeciesKeys = useMemo(
    () => (favSpecies ?? []).map((f) => f.key),
    [favSpecies],
  );
  const { data: attributionMap } = useGetBatchAttribution(
    isOwner ? topFavKeys : favSpeciesKeys,
  );

  const availableFavSpecies = useMemo(() => {
    const topKeys = new Set(topFavKeys);
    if (replacingIndex !== null && topFavKeys[replacingIndex] !== undefined) {
      topKeys.delete(topFavKeys[replacingIndex]);
    }
    const allFavs = favPages?.pages.flatMap((p) => p.rows) ?? [];
    return allFavs.filter((s) => !topKeys.has(s.gbif_key));
  }, [favPages, topFavKeys, replacingIndex]);

  const pickerScrollRef = useRef<HTMLDivElement>(null);
  const pickerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !pickerOpen ||
      !hasNextPage ||
      !pickerSentinelRef.current ||
      !pickerScrollRef.current
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: pickerScrollRef.current, rootMargin: "100px" },
    );

    observer.observe(pickerSentinelRef.current);
    return () => observer.disconnect();
  }, [pickerOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isOwner) {
    const emptyCount = Math.max(0, 4 - (favSpecies?.length ?? 0));
    const handleOpenFavoritesGallery = () => {
      if (!profileOwnerUsername) return;

      navigate({
        to: "/$username/species-gallery",
        params: { username: profileOwnerUsername },
        search: { favorites: "true" },
      });
    };

    return (
      <div className="space-y-3">
        <div className="flex justify-between border-b pb-1">
          <h2>{t("favSpecies.title")}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            disabled={!profileOwnerUsername}
            onClick={handleOpenFavoritesGallery}
          >
            {t("lists.viewAll")}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {favSpecies?.map((f) => (
            <FilledFavCard
              key={f.key}
              specieKey={f.key}
              specieName={f.name}
              familyName={f.family ?? ""}
              imgUrl={f.img ?? null}
              imgSource={attributionMap?.get(f.key)?.source}
              imgAttribution={attributionMap?.get(f.key)?.author}
              imgLicense={attributionMap?.get(f.key)?.license}
              ownerUsername={profileOwnerUsername}
              editMode={false}
              onClick={() => {
                const speciesSlug = getSpeciesSlugParam(f.key, f.name);
                if (speciesSlug) {
                  navigate({
                    to: "/species/$speciesSlug",
                    params: { speciesSlug },
                    search: { from: "profile" },
                  });
                  return;
                }

                navigate({
                  to: "/specie-detail/$specieKey",
                  params: { specieKey: String(f.key) },
                  search: { from: "profile" },
                });
              }}
              onRemove={() => {}}
            />
          ))}
          {Array.from({ length: emptyCount }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="border-border bg-muted aspect-3/4 w-full rounded-xl border-2 border-dashed"
            />
          ))}
        </div>
      </div>
    );
  }

  const emptySlotCount = Math.max(0, 4 - topFavKeys.length);

  const openPicker = (index: number) => {
    setReplacingIndex(index);
    setPickerOpen(true);
  };

  const handleRemove = async (index: number) => {
    if (!userDb) return;
    const materialized = materializeSlots(
      topFavKeys,
      userDb.game_info.top_fav_species ?? [],
    );
    const updatedUser = await updateTopFavSpecies(userDb, () =>
      materialized.filter((_, i) => i !== index),
    );
    if (updatedUser) {
      setUserDb(updatedUser);
      invalidateUserPublicProfileQuery(queryClient, userDb.username);
    }
  };

  const handleSelect = async (data: FavSpecies) => {
    if (!userDb) return;
    setPickerOpen(false);

    const materialized = materializeSlots(
      topFavKeys,
      userDb.game_info.top_fav_species ?? [],
    );

    const updatedUser = await updateTopFavSpecies(userDb, () => {
      const next = [...materialized];
      if (replacingIndex !== null && replacingIndex < next.length) {
        next[replacingIndex] = data;
      } else {
        next.push(data);
      }
      return next.slice(0, 4);
    });

    if (updatedUser) {
      setUserDb(updatedUser);
      invalidateUserPublicProfileQuery(queryClient, userDb.username);
      void checkAchievements();
    }
    setReplacingIndex(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !userDb) return;

    const oldIndex = topFavKeys.indexOf(Number(active.id));
    const newIndex = topFavKeys.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove([...topFavKeys], oldIndex, newIndex);
    const materialized = materializeSlots(
      reordered,
      userDb.game_info.top_fav_species ?? [],
    );

    const updatedUser = await updateTopFavSpecies(userDb, () => materialized);
    if (updatedUser) {
      setUserDb(updatedUser);
      invalidateUserPublicProfileQuery(queryClient, userDb.username);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-1">
        <h2>{t("favSpecies.title")}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? (
            t("favSpecies.done")
          ) : (
            <>
              <Pencil className="size-3.5" />
              {t("favSpecies.edit")}
            </>
          )}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topFavKeys.map(String)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 overflow-visible sm:grid-cols-4 sm:gap-4">
            {topFavKeys.map((key, idx) => {
              const favData = userDb?.game_info.top_fav_species?.find(
                (f) => f.key === key,
              );
              return (
                <SortableFilledCard
                  key={key}
                  specieKey={key}
                  specieName={favData?.name ?? ""}
                  familyName={favData?.family ?? ""}
                  imgUrl={favData?.img ?? null}
                  imgSource={attributionMap?.get(key)?.source}
                  imgAttribution={attributionMap?.get(key)?.author}
                  imgLicense={attributionMap?.get(key)?.license}
                  editMode={editMode}
                  onClick={() =>
                    editMode
                      ? openPicker(idx)
                      : (() => {
                          const speciesSlug = getSpeciesSlugParam(
                            key,
                            favData?.name,
                          );
                          if (speciesSlug) {
                            navigate({
                              to: "/species/$speciesSlug",
                              params: { speciesSlug },
                              search: { from: "profile" },
                            });
                            return;
                          }

                          navigate({
                            to: "/specie-detail/$specieKey",
                            params: { specieKey: String(key) },
                            search: { from: "profile" },
                          });
                        })()
                  }
                  onRemove={() => handleRemove(idx)}
                />
              );
            })}

            {Array.from({ length: emptySlotCount }).map((_, idx) => (
              <EmptyFavCard
                key={`empty-${idx}`}
                editMode={editMode}
                onAdd={
                  editMode
                    ? () => openPicker(topFavKeys.length + idx)
                    : undefined
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setReplacingIndex(null);
        }}
      >
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("favSpecies.pickerTitle")}</DialogTitle>
          </DialogHeader>

          {availableFavSpecies.length === 0 && !isFetchingNextPage ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Plus className="text-muted-foreground/40 size-10" />
              <p className="text-muted-foreground text-sm font-medium">
                {t("favSpecies.pickerEmpty")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("favSpecies.pickerEmptyHint")}
              </p>
            </div>
          ) : (
            <div
              ref={pickerScrollRef}
              className="max-h-[60dvh] overflow-y-auto px-3 pb-4"
            >
              <div className="flex flex-col gap-1">
                {availableFavSpecies.map((s) => (
                  <PickerItem
                    key={s.gbif_key}
                    specieKey={s.gbif_key}
                    specieName={s.canonical_name}
                    familyName={s.family}
                    imgUrl={s.preferred_image_url}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              {hasNextPage && (
                <div
                  ref={pickerSentinelRef}
                  className="flex items-center justify-center py-4"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="text-muted-foreground size-5 animate-spin" />
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
