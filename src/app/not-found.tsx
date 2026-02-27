import { useNavigate } from "@tanstack/react-router";
import { Image } from "@/common/components/image";
import logoUrl from "@/assets/images/avif-new-fav-icon.avif?url";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <Image
          alt="Logo Treevera"
          src={logoUrl}
          className="size-20 rounded-full opacity-60"
        />

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground/60 text-sm font-medium tracking-widest uppercase">
            Erro 404
          </p>
          <h1 className="text-foreground text-3xl font-bold">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground mt-1 text-base leading-relaxed">
            Este galho não leva a lugar nenhum. A página pode ter sido movida ou nunca existiu.
          </p>
        </div>

        <button
          onClick={() => void navigate({ to: "/" })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </button>
      </div>
    </div>
  );
}
