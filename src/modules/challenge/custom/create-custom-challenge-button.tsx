import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";

import { Target } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth/atoms";
import { CreateCustomChallengeDialog } from "./create-custom-challenge-dialog";
import type { SpecieDetail } from "@/common/types/api";

type Props = {
  gbifKey: number;
  specieDetail?: SpecieDetail;
};

export const CreateCustomChallengeButton = ({
  gbifKey,
  specieDetail,
}: Props) => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Target className="mr-2 size-4" />
        {t("challenge.createCustom")}
      </Button>

      <CreateCustomChallengeDialog
        open={open}
        onOpenChange={setOpen}
        gbifKey={gbifKey}
        specieDetail={specieDetail}
      />
    </>
  );
};
