import { Button } from "@/common/components/ui/button";
import { Share2 } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Props = {
  specieKey: number;
  canonicalName: string;
};

export const ShareButton = ({ specieKey, canonicalName }: Props) => {
  const { t } = useTranslation();

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/treevera/specie-detail/${specieKey}`;
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
  }, [specieKey, canonicalName, t]);

  return (
    <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
      <Share2 className="size-4" />
      {t("specieDetail.shareLabel")}
    </Button>
  );
};
