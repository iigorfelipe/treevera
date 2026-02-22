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
import { selectedSpecieKeyAtom } from "@/store/tree";
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
import { useAtom, useSetAtom } from "jotai";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyFavCard } from "./empty-card";
import { SortableFilledCard } from "./filled-card";
import { PickerItem } from "./picker-item";
import { materializeSlots } from "./utils";

export const FavoriteSpecies = () => {
  const { t } = useTranslation();
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);

  const [editMode, setEditMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const topFavKeys = useMemo(() => {
    const topFav = userDb?.game_info.top_fav_species;

    if (topFav !== undefined && topFav !== null) {
      return topFav.map((n) => n.key);
    }

    const seenSpecies = userDb?.game_info.seen_species ?? [];
    return seenSpecies
      .filter((s) => s.fav)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((s) => s.key)
      .slice(0, 4);
  }, [userDb]);

  const availableFavKeys = useMemo(() => {
    const seenSpecies = userDb?.game_info.seen_species ?? [];
    const topKeys = new Set(topFavKeys);
    if (replacingIndex !== null && topFavKeys[replacingIndex] !== undefined) {
      topKeys.delete(topFavKeys[replacingIndex]);
    }
    return seenSpecies
      .filter((s) => s.fav && !topKeys.has(s.key))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((s) => s.key);
  }, [userDb, topFavKeys, replacingIndex]);

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
    if (updatedUser) setUserDb(updatedUser);
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

    if (updatedUser) setUserDb(updatedUser);
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
    if (updatedUser) setUserDb(updatedUser);
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
          <div className="grid grid-cols-2 gap-3 overflow-visible sm:gap-4 lg:grid-cols-4">
            {topFavKeys.map((key, idx) => (
              <SortableFilledCard
                key={key}
                specieKey={key}
                editMode={editMode}
                onClick={() =>
                  editMode ? openPicker(idx) : setSelectedSpecieKey(key)
                }
                onRemove={() => handleRemove(idx)}
              />
            ))}

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

          {availableFavKeys.length === 0 ? (
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
            <div className="max-h-[60dvh] overflow-y-auto px-3 pb-4">
              <div className="flex flex-col gap-1">
                {availableFavKeys.map((key) => (
                  <PickerItem
                    key={key}
                    specieKey={key}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
