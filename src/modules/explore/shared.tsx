import type { MouseEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/common/utils/cn";

interface CardShellProps {
  bgImg: string;
  alt: string;
  onClick?: () => void;
  children: ReactNode;
}

export const CardShell = ({
  bgImg,
  alt,
  onClick,
  children,
}: CardShellProps) => (
  <div
    className={cn(
      "relative min-h-screen w-full overflow-hidden bg-black pl-2 md:pl-8",
      onClick && "cursor-pointer",
    )}
    onClick={onClick}
  >
    <img
      key={bgImg}
      src={bgImg}
      alt={alt}
      className="animate-fade-in absolute inset-0 h-full w-full object-cover"
    />

    <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/10" />
    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

    {children}
  </div>
);

interface CardKingdomTagProps {
  kingdomLabel: string;
  kingdomName: string;
  primaryColor: string;
}

export const CardKingdomTag = ({
  kingdomLabel,
  kingdomName,
  primaryColor,
}: CardKingdomTagProps) => (
  <div className="absolute top-8 flex items-center gap-3">
    <div
      className="h-5 w-0.5 rounded-full"
      style={{ backgroundColor: primaryColor }}
    />
    <span className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
      {kingdomLabel} {kingdomName.toUpperCase()}
    </span>
  </div>
);

interface CardSlideControlsProps {
  total: number;
  currentIndex: number;
  primaryColor: string;
  stopPropagation?: boolean;
  isPaused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  onTogglePause: () => void;
}

export const CardSlideControls = ({
  total,
  currentIndex,
  primaryColor,
  stopPropagation: shouldStop = false,
  isPaused,
  onPrev,
  onNext,
  onDotClick,
  onTogglePause,
}: CardSlideControlsProps) => {
  const stop = (e: MouseEvent) => {
    if (shouldStop) e.stopPropagation();
  };

  return (
    <>
      <div className="absolute bottom-10 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              stop(e);
              onDotClick(i);
            }}
            className="h-0.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 28 : 12,
              backgroundColor:
                i === currentIndex ? primaryColor : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      <div
        className="absolute right-8 bottom-7 flex items-center gap-3"
        onClick={stop}
      >
        <button
          onClick={onPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={onTogglePause}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
        >
          {isPaused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </button>

        <button
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-full text-black transition"
          style={{ backgroundColor: primaryColor }}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </>
  );
};
