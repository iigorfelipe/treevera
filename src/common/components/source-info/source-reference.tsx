import { useState, type ReactNode } from "react";
import { ExternalLink, X } from "lucide-react";
import { Dialog, DialogContent } from "@/common/components/ui/dialog";
import { SOURCE_DETAILS, type SourceId } from "@/common/data/source-details";
import { useTranslation } from "react-i18next";
import { cn } from "@/common/utils/cn";

export function SourceReference({
  sourceId,
  children,
  className,
}: {
  sourceId: SourceId;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const source = SOURCE_DETAILS[sourceId];
  const baseKey = `sources.items.${sourceId}`;

  return (
    <>
      <button
        type="button"
        className={cn(
          "cursor-pointer text-sky-700 underline decoration-dashed underline-offset-4 transition-colors hover:text-sky-800",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          hideOverlay
          className="bg-card flex max-h-[min(85dvh,720px)] w-[min(760px,calc(100vw-24px))] max-w-none flex-col rounded-lg border p-0 shadow-none"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5">
            <div className="min-w-0">
              <h2 className="text-xl leading-none font-medium tracking-tight">
                {t(`${baseKey}.label`)}
              </h2>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[15px] font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-400"
              >
                {t("sources.viewFullDetails")}
                <ExternalLink className="size-3.5 stroke-[2.2]" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-full p-1 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label={t("sources.close")}
            >
              <X className="size-5 stroke-[2.25]" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <SourceInfoRow
              label={t("sources.fields.title")}
              value={t(`${baseKey}.title`)}
            />
            <SourceInfoRow
              label={t("sources.fields.description")}
              value={t(`${baseKey}.description`)}
            />
            <SourceInfoRow
              label={t("sources.fields.type")}
              value={t(`${baseKey}.sourceType`)}
            />
            <SourceInfoRow
              label={t("sources.fields.citation")}
              value={t(`${baseKey}.citation`)}
            />
            <SourceInfoRow
              label={t("sources.fields.provider")}
              value={t(`${baseKey}.provider`)}
            />
            <SourceInfoRow
              label={t("sources.fields.url")}
              value={
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sky-700 underline-offset-4 hover:underline"
                >
                  {source.url}
                </a>
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SourceInfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 border-b md:grid-cols-[175px_minmax(0,1fr)]">
      <div className="px-4.5 py-3.5 text-xs font-bold tracking-wider uppercase">
        {label}
      </div>
      <div className="px-4.5 py-3.5 text-sm leading-8 wrap-break-word">
        {value}
      </div>
    </div>
  );
}
