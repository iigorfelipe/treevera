import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { authStore } from "@/store/auth/atoms";
import { treeAtom } from "@/store/tree";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetUserCustomChallenges } from "@/hooks/queries/useGetUserCustomChallenges";
import { createCustomChallenge } from "@/common/utils/supabase/challenge/custom-challenges";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import type { SpecieDetail } from "@/common/types/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gbifKey: number;
  specieDetail?: SpecieDetail;
};

function isTaxonomyComplete(d: SpecieDetail): boolean {
  return !!(
    d.kingdom?.trim() &&
    d.phylum?.trim() &&
    d.class?.trim() &&
    d.order?.trim() &&
    d.family?.trim() &&
    d.genus?.trim() &&
    d.species?.trim()
  );
}

export const CreateCustomChallengeDialog = ({
  open,
  onOpenChange,
  gbifKey,
  specieDetail: externalDetail,
}: Props) => {
  const { t } = useTranslation();
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createdGbifKey, setCreatedGbifKey] = useState<number | null>(null);

  const { data: existingChallenges = [] } = useGetUserCustomChallenges();
  const duplicate = existingChallenges.find((c) => c.gbif_key === gbifKey);

  const { data: fetchedDetail, isLoading } = useGetSpecieDetail({
    specieKey: gbifKey,
    enabled: open && !externalDetail,
  });

  const detail = externalDetail ?? fetchedDetail;
  const loading = !externalDetail && isLoading;
  const valid = detail ? isTaxonomyComplete(detail) : false;
  const speciesName = detail?.canonicalName || detail?.scientificName || "";
  const created = createdGbifKey === gbifKey;

  const playCustomChallenge = (targetSpecies: string, speciesKey: number) => {
    setChallenge({
      mode: "CUSTOM",
      status: "IN_PROGRESS",
      targetSpecies,
      speciesKey,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    });
    onOpenChange(false);
    void navigate({ to: "/challenges/custom" });
  };

  const handlePlayExisting = () => {
    if (!duplicate) return;
    playCustomChallenge(duplicate.species_name, duplicate.gbif_key);
  };

  const handlePlayCreated = () => {
    if (!speciesName) return;
    playCustomChallenge(speciesName, gbifKey);
  };

  const handleCreate = async () => {
    if (!userId || !detail || !valid) return;

    setCreating(true);
    const result = await createCustomChallenge({
      userId,
      gbifKey,
      speciesName,
      familyName: detail.family,
      taxonomy: {
        kingdom: detail.kingdom,
        phylum: detail.phylum,
        class: detail.class,
        order: detail.order,
        family: detail.family,
        genus: detail.genus,
        species: detail.species,
      },
    });
    setCreating(false);

    if (result.success) {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_custom_challenges_key, userId],
      });
      setCreatedGbifKey(gbifKey);
      toast.success(t("challenge.customCreated"));
    } else {
      const msgKey: Record<string, string> = {
        already_exists: "challenge.customAlreadyExists",
        limit_reached: "challenge.customLimitReached",
        taxonomy_incomplete: "challenge.customTaxonomyIncomplete",
        unknown: "challenge.customError",
      };
      toast.error(t(msgKey[result.error] ?? "challenge.customError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card w-[calc(100vw-2rem)] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{t("challenge.customCreateTitle")}</DialogTitle>
          <DialogDescription>
            {t("challenge.customCreateDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : !detail ? (
            <p className="text-muted-foreground text-sm">
              {t("challenge.customLoadError")}
            </p>
          ) : duplicate || created ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium italic">{speciesName}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {detail.family} Â· {t("challenge.customTaxonomyValid")}
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={duplicate ? handlePlayExisting : handlePlayCreated}
              >
                {t("challenge.play")}
              </Button>
            </div>
          ) : valid ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium italic">{speciesName}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {detail.family} · {t("challenge.customTaxonomyValid")}
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={created ? handlePlayCreated : handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : created ? (
                  t("challenge.play")
                ) : (
                  t("challenge.customCreate")
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-orange-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium italic">{speciesName}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {t("challenge.customTaxonomyIncomplete")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
