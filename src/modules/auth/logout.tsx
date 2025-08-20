import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";

export const LogoutWarningContent = ({
  onConfirmLogout,
}: {
  onConfirmLogout: () => void;
}) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="space-y-3 text-center">
        <DialogTitle className="text-xl font-semibold">
          Deseja realmente sair?
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-gray-600">
          Ao sair, seus recursos e progresso só ficarão disponíveis quando
          entrar novamente.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
        <DialogClose asChild>
          <Button
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuar conectado
          </Button>
        </DialogClose>

        <Button
          onClick={onConfirmLogout}
          variant="outline"
          className="w-full bg-transparent text-gray-600 hover:text-gray-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair Mesmo Assim
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
