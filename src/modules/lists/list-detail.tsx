import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { Images, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetListDetail,
  useGetListSpecies,
  useDeleteList,
  useUpdateList,
} from "@/hooks/queries/useGetLists";
import { ListDetailHero } from "./list-detail-hero";
import { ListSpeciesGrid } from "./list-species-grid";
import { ListEditDialog } from "./list-edit-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

type ListDetailProps = {
  listId: string;
};

export const ListDetail = ({ listId }: ListDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: list, isLoading: loadingDetail } = useGetListDetail(listId);
  const {
    data: speciesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetListSpecies(listId);

  const { mutate: doDelete, isPending: deleting } = useDeleteList();
  const { mutate: doUpdate } = useUpdateList(listId);

  const allSpecies = useMemo(
    () => speciesData?.pages.flatMap((p) => p.rows) ?? [],
    [speciesData],
  );

  const isOwner = !!userDb && !!list && userDb.id === list.user_id;

  const handleBack = useCallback(() => {
    navigate({ to: "/lists" });
  }, [navigate]);

  const handleDelete = () => {
    doDelete(listId, {
      onSuccess: () => {
        toast.success(t("lists.listDeleted"));
        navigate({ to: "/lists" });
      },
    });
  };

  const handleEditSave = (title: string, description: string) => {
    doUpdate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success(t("lists.listUpdated"));
        },
      },
    );
  };

  if (loadingDetail) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-screen items-center justify-center">
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
    <div className="flex h-screen flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <ListDetailHero
          list={list}
          onBack={handleBack}
          isOwner={isOwner}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteConfirmOpen(true)}
        />

        {allSpecies.length === 0 && !isFetchingNextPage ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground text-center">
              <Images className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">{t("lists.noSpeciesInList")}</p>
            </div>
          </div>
        ) : (
          <ListSpeciesGrid
            species={allSpecies}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => void fetchNextPage()}
            scrollRef={scrollRef}
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
    </div>
  );
};
