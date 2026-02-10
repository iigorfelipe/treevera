import success from "@/assets/audio/click-success.wav";
import error from "@/assets/audio/click-error.wav";
import win from "@/assets/audio/winning.wav";
import { getDefaultStore } from "jotai";
import { audioSettingsAtom } from "@/store/audio";

type SoundType = "success" | "error" | "win";

const sounds: Record<SoundType, string> = {
  success,
  error,
  win,
};

class AudioManagerClass {
  play(type: SoundType) {
    const store = getDefaultStore();
    const { muted, volume } = store.get(audioSettingsAtom);

    if (muted) return;

    const audio = new Audio(sounds[type]);
    audio.volume = volume;
    audio.play().catch(() => {});
  }
}

export const AudioManager = new AudioManagerClass();
