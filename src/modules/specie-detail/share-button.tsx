import { Button } from "@/common/components/ui/button";
import { Share2 } from "lucide-react";
import { useGetParents } from "@/hooks/queries/useGetParents";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Props = {
  specieKey: number;
  canonicalName: string;
};

export const ShareButton = ({ specieKey, canonicalName }: Props) => {
  const { t } = useTranslation();
  const { data: parents = [] } = useGetParents(specieKey, !!specieKey);

  const handleShare = useCallback(async () => {
    const parentKeys = parents.map((p) => p.key).join("/");
    const treePath = parentKeys
      ? `/treevera/tree/${parentKeys}/${specieKey}`
      : `/treevera/tree/${specieKey}`;

    const url = `${window.location.origin}${treePath}`;
    const title = canonicalName;
    const text = t("specieDetail.shareText", { name: canonicalName });

    if (navigator.share) {
      try {
        await navigator.share({ title, url, text });
      } catch {
        //
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast(t("specieDetail.shareCopied"));
    }
  }, [parents, specieKey, canonicalName, t]);

  return (
    <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
      <Share2 className="size-4" />
      {t("specieDetail.shareLabel")}
    </Button>
  );
};
