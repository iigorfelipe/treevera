import { atomWithStorage } from "jotai/utils";

export type AudioSettings = {
  muted: boolean;
  volume: number;
};

export const audioSettingsAtom = atomWithStorage<AudioSettings>(
  "audio.settings",
  {
    muted: false,
    volume: 0.7,
  },
);
