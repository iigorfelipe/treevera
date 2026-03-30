import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { useCreateList } from "@/hooks/queries/useGetLists";

type ListCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (listId: string) => void;
};

export const ListCreateDialog = ({
  open,
  onOpenChange,
  onCreated,
}: ListCreateDialogProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: create, isPending } = useCreateList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    create(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: (data) => {
          if (data) {
            setTitle("");
            setDescription("");
            onCreated(data.id);
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("lists.createTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("lists.titleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("lists.titlePlaceholder")}
              className="bg-muted/50 focus:bg-background focus:border-border h-9 w-full rounded-lg border border-transparent px-3 text-sm transition-colors outline-none"
              autoFocus
              maxLength={120}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("lists.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("lists.descriptionPlaceholder")}
              className="bg-muted/50 focus:bg-background focus:border-border min-h-20 w-full resize-none rounded-lg border border-transparent px-3 py-2 text-sm transition-colors outline-none"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("lists.cancel")}
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              {t("lists.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
