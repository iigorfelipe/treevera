import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { ChallengeDatePicker } from "./challenge-date-picker";
import { useGetChallengeDates } from "@/hooks/queries/useGetChallengeDates";
import { useTranslation } from "react-i18next";

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export const DailyDateNav = ({ selectedDate, onSelectDate }: Props) => {
  const { i18n, t } = useTranslation();
  const { data: challengeDates = [] } = useGetChallengeDates();

  const sortedAsc = [...challengeDates].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const currentIndex = sortedAsc.findIndex((cd) => cd.date === selectedDate);
  const prevDate = currentIndex > 0 ? sortedAsc[currentIndex - 1] : null;
  const nextDate =
    currentIndex < sortedAsc.length - 1 ? sortedAsc[currentIndex + 1] : null;

  const formattedLabel = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(selectedDate + "T00:00:00"));

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="bg-muted/80 size-7 shrink-0"
        disabled={!prevDate}
        onClick={() => prevDate && onSelectDate(prevDate.date)}
        title={t("challenge.prevDay")}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <ChallengeDatePicker
        selectedDate={selectedDate}
        challengeDates={challengeDates}
        onSelectDate={onSelectDate}
        formattedLabel={formattedLabel}
      />

      <Button
        variant="ghost"
        size="icon"
        className="bg-muted/80 size-7 shrink-0"
        disabled={!nextDate}
        onClick={() => nextDate && onSelectDate(nextDate.date)}
        title={t("challenge.nextDay")}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};
