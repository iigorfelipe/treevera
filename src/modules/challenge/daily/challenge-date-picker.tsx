import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { cn } from "@/common/utils/cn";
import type { ChallengeDate } from "@/hooks/queries/useGetChallengeDates";
import { useTranslation } from "react-i18next";

type Props = {
  selectedDate: string;
  challengeDates: ChallengeDate[];
  onSelectDate: (date: string) => void;
  formattedLabel: string;
  triggerContent?: ReactNode;
  triggerClassName?: string;
};

type ChallengeDateCalendarProps = {
  selectedDate: string;
  challengeDates: ChallengeDate[];
  onSelectDate: (date: string) => void;
  onAfterSelect?: () => void;
  className?: string;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfWeek = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const getToday = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const ChallengeDateCalendar = ({
  selectedDate,
  challengeDates,
  onSelectDate,
  onAfterSelect,
  className,
}: ChallengeDateCalendarProps) => {
  const { i18n, t } = useTranslation();
  const today = getToday();

  const [viewYear, setViewYear] = useState(() =>
    parseInt(selectedDate.slice(0, 4)),
  );
  const [viewMonth, setViewMonth] = useState(
    () => parseInt(selectedDate.slice(5, 7)) - 1,
  );

  useEffect(() => {
    setViewYear(parseInt(selectedDate.slice(0, 4)));
    setViewMonth(parseInt(selectedDate.slice(5, 7)) - 1);
  }, [selectedDate]);

  const challengeMap = new Map<string, ChallengeDate>(
    challengeDates.map((cd) => [cd.date, cd]),
  );

  const todayParts = today.split("-");
  const maxYear = parseInt(todayParts[0]);
  const maxMonth = parseInt(todayParts[1]) - 1;

  const minDate =
    challengeDates.length > 0
      ? challengeDates.reduce(
          (oldest, challengeDate) =>
            challengeDate.date < oldest ? challengeDate.date : oldest,
          challengeDates[0].date,
        )
      : today;
  const minYear = parseInt(minDate.slice(0, 4));
  const minMonth = parseInt(minDate.slice(5, 7)) - 1;

  const isAtMaxMonth = viewYear === maxYear && viewMonth === maxMonth;
  const isAtMinMonth = viewYear === minYear && viewMonth === minMonth;

  const handlePrevMonth = () => {
    if (isAtMinMonth) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isAtMaxMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    const challengeDate = challengeMap.get(dateStr);
    if (!challengeDate || dateStr > today) return;
    onSelectDate(dateStr);
    onAfterSelect?.();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const monthLabel = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const dayHeaders = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(2025, 0, 6 + i);
    return new Intl.DateTimeFormat(i18n.language, { weekday: "short" })
      .format(day)
      .slice(0, 2);
  });

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handlePrevMonth}
          disabled={isAtMinMonth}
          aria-label={t("challenge.prevMonth")}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleNextMonth}
          disabled={isAtMaxMonth}
          aria-label={t("challenge.nextMonth")}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {dayHeaders.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-muted-foreground py-1 text-center text-[10px] font-medium uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`gap-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isFuture = dateStr > today;
          const challengeDate = challengeMap.get(dateStr);
          const hasChallenge = !!challengeDate;
          const isCompleted = challengeDate?.completed ?? false;
          const isSelected = dateStr === selectedDate;
          const disabled = isFuture || !hasChallenge;

          return (
            <button
              key={day}
              type="button"
              onClick={() => !disabled && handleSelectDay(dateStr)}
              disabled={disabled}
              className={[
                "relative mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-all",
                disabled
                  ? "text-muted-foreground/35 cursor-not-allowed"
                  : "cursor-pointer",
                isSelected
                  ? "ring-primary bg-primary/5 ring-1"
                  : !disabled
                    ? "hover:bg-muted"
                    : "",
                isCompleted && !isSelected
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
              {isCompleted && (
                <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
          {t("challenge.completedLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="ring-primary inline-block size-3 rounded-full ring-1" />
          {t("challenge.selectedLabel")}
        </span>
      </div>
    </div>
  );
};

export const ChallengeDatePicker = ({
  selectedDate,
  challengeDates,
  onSelectDate,
  formattedLabel,
  triggerContent,
  triggerClassName,
}: Props) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "bg-muted/80 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors",
            triggerClassName,
          )}
        >
          {triggerContent ?? formattedLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[320px] p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">
            {t("challenge.dailyChallenges")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("challenge.pastChallenges")}
          </DialogDescription>
        </DialogHeader>

        <ChallengeDateCalendar
          selectedDate={selectedDate}
          challengeDates={challengeDates}
          onSelectDate={onSelectDate}
          onAfterSelect={() => setOpen(false)}
          className="px-4 pb-5"
        />
      </DialogContent>
    </Dialog>
  );
};
