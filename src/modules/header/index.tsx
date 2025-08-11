import { Image } from "@/components/image";
import logoUrl from "@/assets/images/avif-new-logo.avif?url";
import { Menu } from "./menu";
import { useResponsive } from "@/hooks/use-responsive";
import { useAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { ArrowLeft } from "lucide-react";

export const Header = () => {
  const { isTablet } = useResponsive();
  const [expandedNodes, setExpandedNodes] = useAtom(treeAtom.expandedNodes);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  const handleBack = () => {
    setExpandedNodes((old) => old.slice(0, -1));
  };

  return (
    <header className="fixed z-50 flex w-[calc(100%-8px)] items-center justify-between gap-3 rounded-br-2xl pt-4 pb-6 backdrop-blur-3xl sm:absolute">
      <Image alt="Logo" src={logoUrl} className="h-12" />

      <div className="flex w-full flex-col">
        <h1 className="text-2xl font-bold">Treevera</h1>
        <p className="line-clamp-1 text-base/4">Taxonomia interativa</p>
      </div>
      {isTablet && (
        <div className="relative">
          {isSpecie ? (
            <ArrowLeft onClick={handleBack} className="size-8 cursor-pointer" />
          ) : (
            <Menu />
          )}
        </div>
      )}
    </header>
  );
};
