import type { ReactNode } from "react";
import { CardShell, CardKingdomTag, CardSlideControls } from "./shared";

export interface ExplorerGroup {
  groupName: string;
  onClick?: () => void;
}

export interface ExplorerProps {
  bgImg: string;
  alt: string;
  onCardClick?: () => void;

  kingdomLabel: string;
  kingdomName: string;
  primaryColor: string;

  slideKey: number;
  badge: string;
  title: string;
  description: string;

  mainGroupsLabel: string;
  mainGroups: ExplorerGroup[];

  extra?: ReactNode;

  total: number;
  currentIndex: number;
  stopPropagation?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (i: number) => void;
}

export const Explorer = ({
  bgImg,
  alt,
  onCardClick,
  kingdomLabel,
  kingdomName,
  primaryColor,
  slideKey,
  badge,
  title,
  description,
  mainGroupsLabel,
  mainGroups,
  extra,
  total,
  currentIndex,
  stopPropagation,
  onPrev,
  onNext,
  onDotClick,
}: ExplorerProps) => (
  <CardShell bgImg={bgImg} alt={alt} onClick={onCardClick}>
    <CardKingdomTag
      kingdomLabel={kingdomLabel}
      kingdomName={kingdomName}
      primaryColor={primaryColor}
    />

    <div key={slideKey} className="animate-slide-up absolute bottom-32 max-w-xl space-y-5">
      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-widest text-white uppercase"
        style={{ backgroundColor: primaryColor }}
      >
        {badge}
      </span>

      <h1 className="text-4xl leading-none font-black tracking-tight text-white sm:text-5xl md:text-7xl">
        {title}
      </h1>

      <p className="max-w-sm text-sm leading-relaxed text-white/65">
        {description}
      </p>

      <div className="space-y-1">
        <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase">
          {mainGroupsLabel}:
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {mainGroups.map(({ groupName, onClick }, i) =>
            onClick ? (
              <button
                key={i}
                onClick={onClick}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left backdrop-blur-sm transition hover:bg-white/20"
              >
                <p className="mt-0.5 text-sm font-semibold" style={{ color: primaryColor }}>
                  {groupName}
                </p>
              </button>
            ) : (
              <div key={i} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <p className="mt-0.5 text-sm font-semibold" style={{ color: primaryColor }}>
                  {groupName}
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      {extra}
    </div>

    <CardSlideControls
      total={total}
      currentIndex={currentIndex}
      primaryColor={primaryColor}
      stopPropagation={stopPropagation}
      onPrev={onPrev}
      onNext={onNext}
      onDotClick={onDotClick}
    />
  </CardShell>
);
