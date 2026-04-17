import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  useGetMyListsForPicker,
  useAddSpeciesToList,
  useCreateList,
} from "@/hooks/queries/useGetLists";

type AddToListImage = {
  url?: string | null;
  source?: string | null;
  author?: string | null;
  license?: string | null;
};

type AddToListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gbifKey: number;
  speciesName?: string;
  image?: AddToListImage;
};

export const AddToListDialog = ({
  open,
  onOpenChange,
  gbifKey,
  speciesName,
  image,
}: AddToListDialogProps) => {
  const { t } = useTranslation();
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: lists = [], refetch } = useGetMyListsForPicker(
    open ? gbifKey : undefined,
  );
  const { mutate: createList, isPending: isCreating } = useCreateList();

  const handleCreateAndAdd = () => {
    if (!newTitle.trim()) return;
    createList(
      { title: newTitle.trim() },
      {
        onSuccess: (data) => {
          if (data) {
            setNewTitle("");
            setCreatingNew(false);
            void refetch();
            toast.success(t("lists.listCreated"));
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{t("lists.addToList")}</DialogTitle>
        </DialogHeader>

        <div className="max-h-60 space-y-1 overflow-y-auto py-2">
          {lists.map((list) => (
            <ListPickerRow
              key={list.id}
              listId={list.id}
              title={list.title}
              speciesCount={list.species_count}
              alreadyAdded={list.already_added}
              gbifKey={gbifKey}
              speciesName={speciesName}
              image={image}
              onAdded={() => void refetch()}
            />
          ))}

          {lists.length === 0 && !creatingNew && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t("lists.emptyMyLists")}
            </p>
          )}
        </div>

        {creatingNew ? (
          <div className="flex items-center gap-2 border-t p-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t("lists.titlePlaceholder")}
              className="bg-muted/50 focus:bg-background focus:border-border h-8 min-w-0 flex-1 rounded-lg border border-transparent px-3 text-sm outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateAndAdd();
                if (e.key === "Escape") setCreatingNew(false);
              }}
            />
            <Button
              size="sm"
              className="h-8"
              onClick={handleCreateAndAdd}
              disabled={!newTitle.trim() || isCreating}
            >
              {isCreating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                t("lists.save")
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 border p-3"
            onClick={() => setCreatingNew(true)}
          >
            <Plus className="size-3.5" />
            {t("lists.createNew")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ListPickerRow = ({
  listId,
  title,
  speciesCount,
  alreadyAdded,
  gbifKey,
  speciesName,
  image,
  onAdded,
}: {
  listId: string;
  title: string;
  speciesCount: number;
  alreadyAdded: boolean;
  gbifKey: number;
  speciesName?: string;
  image?: AddToListImage;
  onAdded: () => void;
}) => {
  const { t } = useTranslation();
  const { mutate: addToList, isPending } = useAddSpeciesToList(listId);

  const handleClick = () => {
    if (alreadyAdded) return;
    addToList(
      { gbifKey, image },
      {
        onSuccess: () => {
          toast.success(
            t("lists.speciesAddedToList", {
              species: speciesName || t("lists.defaultSpeciesName"),
              list: title,
            }),
          );
          onAdded();
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={alreadyAdded || isPending}
      className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors disabled:opacity-60"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">
          {speciesCount} {t("lists.species")}
        </div>
      </div>
      <div className="shrink-0">
        {alreadyAdded ? (
          <Check className="text-primary size-4" />
        ) : isPending ? (
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        ) : (
          <Plus className="text-muted-foreground size-4" />
        )}
      </div>
    </button>
  );
};
