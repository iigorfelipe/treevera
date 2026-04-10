import { Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";

export const ChallengeShareButton = ({
  speciesName,
  variant = "button",
  onShare,
}: {
  speciesName: string;
  variant?: "button" | "icon";
  onShare?: () => void | Promise<void>;
}) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (onShare) {
      await onShare();
      return;
    }
    const url = `${window.location.origin}/treevera/challenges`;
    const text = t("challenge.shareText", { speciesName });
    if (navigator.share) {
      await navigator.share({ title: "Treevera", url, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast(t("specieDetail.shareCopied"));
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className="text-muted-foreground/60 hover:bg-muted hover:text-foreground rounded-full p-1"
        aria-label={t("challenge.share")}
      >
        <Share2 className="size-3.5" />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground text-xs"
      onClick={handleShare}
    >
      <Share2 className="mr-1 size-3.5" />
      {t("challenge.share")}
    </Button>
  );
};
