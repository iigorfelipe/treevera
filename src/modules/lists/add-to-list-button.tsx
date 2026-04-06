import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ListPlus } from "lucide-react";
import { useAtomValue } from "jotai";

import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth/atoms";
import { AddToListDialog } from "./add-to-list-dialog";

type AddToListButtonProps = {
  gbifKey: number;
  speciesName?: string;
  imageUrl?: string;
};

export const AddToListButton = ({
  gbifKey,
  speciesName,
  imageUrl,
}: AddToListButtonProps) => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <ListPlus className="size-4" />
        {t("lists.addToList")}
      </Button>

      <AddToListDialog
        open={open}
        onOpenChange={setOpen}
        gbifKey={gbifKey}
        speciesName={speciesName}
        imageUrl={imageUrl}
      />
    </>
  );
};
