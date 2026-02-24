import { useAtom, useAtomValue } from "jotai";
import { Volume2, VolumeX } from "lucide-react";
import {
  Slider as RadixSlider,
  SliderThumb,
  SliderTrack,
  SliderRange,
} from "@radix-ui/react-slider";
import { authStore } from "@/store/auth/atoms";
import { audioSettingsAtom } from "@/store/audio";
import { useUserSettings } from "@/hooks/user/useUserSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const Toggle = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: () => void;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onCheckedChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
      checked ? "bg-green-600" : "bg-input"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const { showEmptyNodes, toggleShowEmptyNodes } = useUserSettings();
  const [audio, setAudio] = useAtom(audioSettingsAtom);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        <div className="divide-y">
          <section className="space-y-3 p-6">
            <h3 className="text-sm font-semibold">Árvore Taxonômica</h3>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Exibir nós sem descendentes
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Por padrão, é exibido apenas nós que possuem descendentes.
                  Mantenha <strong>desativado</strong> para continuar com esse
                  comportamento ou <strong>ative</strong> para exibir nós sem
                  descendentes.
                </p>
                {!isAuthenticated && (
                  <p className="text-muted-foreground text-xs italic">
                    Faça login para salvar esta preferência.
                  </p>
                )}
              </div>
              <Toggle
                checked={showEmptyNodes}
                onCheckedChange={toggleShowEmptyNodes}
              />
            </div>
          </section>

          <section className="space-y-3 p-6">
            <h3 className="text-sm font-semibold">Desafios</h3>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Som</p>
                <p className="text-muted-foreground text-xs">
                  Ativar ou desativar os efeitos sonoros durante os desafios.
                </p>
              </div>
              <Toggle
                checked={!audio.muted}
                onCheckedChange={() =>
                  setAudio((prev) => ({ ...prev, muted: !prev.muted }))
                }
              />
            </div>

            {!audio.muted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Volume</p>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <VolumeX className="size-3.5" />
                    <RadixSlider
                      value={[audio.volume * 100]}
                      onValueChange={([v]) =>
                        setAudio((prev) => ({ ...prev, volume: v / 100 }))
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="relative flex h-5 w-32 touch-none items-center select-none"
                    >
                      <SliderTrack className="relative h-1 w-full grow rounded-full bg-gray-200">
                        <SliderRange className="absolute h-full rounded-full bg-green-600" />
                      </SliderTrack>
                      <SliderThumb className="block h-4 w-4 rounded-full bg-green-600 shadow focus:outline-none" />
                    </RadixSlider>
                    <Volume2 className="size-3.5" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
