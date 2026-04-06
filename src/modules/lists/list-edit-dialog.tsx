import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";

type ListEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialDescription: string;
  initialIsPublic: boolean;
  onSave: (title: string, description: string, isPublic: boolean) => void;
};

export const ListEditDialog = ({
  open,
  onOpenChange,
  initialTitle,
  initialDescription,
  initialIsPublic,
  onSave,
}: ListEditDialogProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim(), isPublic);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("lists.editTitle")}</DialogTitle>
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

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("lists.visibilityLabel")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isPublic
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
                }`}
              >
                <Globe className="size-3.5" />
                {t("lists.visibilityPublic")}
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  !isPublic
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
                }`}
              >
                <Lock className="size-3.5" />
                {t("lists.visibilityPrivate")}
              </button>
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs">
              {isPublic
                ? t("lists.visibilityPublicHint")
                : t("lists.visibilityPrivateHint")}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("lists.cancel")}
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {t("lists.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
