import { useEffect, useRef, useState } from "react";

const TYPING_SPEED_MS = 65;
const ERASING_SPEED_MS = 32;
const PAUSE_AFTER_TYPING_MS = 2000;
const PAUSE_AFTER_ERASING_MS = 450;
const INITIAL_DELAY_MS = 700;

type AnimState = {
  index: number;
  chars: number;
  phase: "typing" | "erasing";
};

export function useAnimatedPlaceholder(suggestions: string[]): string {
  const [text, setText] = useState("");
  const stateRef = useRef<AnimState>({ index: 0, chars: 0, phase: "typing" });

  useEffect(() => {
    if (!suggestions.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText("");
      return;
    }

    stateRef.current = { index: 0, chars: 0, phase: "typing" };
    setText("");

    let timeoutId: ReturnType<typeof setTimeout>;
    let active = true;

    const tick = () => {
      if (!active) return;

      const state = stateRef.current;
      const current = suggestions[state.index % suggestions.length];

      if (state.phase === "typing") {
        const next = state.chars + 1;
        state.chars = next;
        setText(current.slice(0, next));

        if (next >= current.length) {
          state.phase = "erasing";
          timeoutId = setTimeout(tick, PAUSE_AFTER_TYPING_MS);
        } else {
          timeoutId = setTimeout(tick, TYPING_SPEED_MS);
        }
      } else {
        const next = state.chars - 1;
        state.chars = next;
        setText(current.slice(0, next));

        if (next <= 0) {
          state.index = (state.index + 1) % suggestions.length;
          state.phase = "typing";
          timeoutId = setTimeout(tick, PAUSE_AFTER_ERASING_MS);
        } else {
          timeoutId = setTimeout(tick, ERASING_SPEED_MS);
        }
      }
    };

    timeoutId = setTimeout(tick, INITIAL_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [suggestions]);

  return text;
}

export const SUGGESTIONS_BY_KINGDOM: Record<string, string[]> = {
  "": [
    // "Nome científico ou chave GBIF...",
  ],
  animalia: [
    "Canis lupus",
    "Ursus maritimus",
    "Loxodonta",
    "Panthera leo",
    "Gorilla",
    "Orcinus orca",
    "Harpia",
  ],
  plantae: [
    "Zea mays",
    "Rosa canina",
    "Quercus robur",
    "Arabidopsis thaliana",
    "Solanum lycopersicum",
    "Ficus carica",
  ],
  fungi: [
    "Amanita muscaria",
    "Penicillium notatum",
    "Boletus edulis",
    "Aspergillus niger",
  ],
  bacteria: [
    "Escherichia coli",
    "Bacillus subtilis",
    "Streptomyces coelicolor",
    "Lactobacillus acidophilus",
  ],
  archaea: [
    "Halobacterium salinarum",
    "Methanobacterium formicicum",
    "Sulfolobus acidocaldarius",
  ],
  chromista: [
    "Navicula radiosa",
    "Fucus vesiculosus",
    "Phytophthora infestans",
  ],
  protozoa: ["Amoeba proteus", "Plasmodium falciparum", "Trypanosoma brucei"],
};
