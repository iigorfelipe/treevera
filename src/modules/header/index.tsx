import { Image } from "@/components/image";
import logoUrl from "@/assets/images/avif-new-logo.avif?url";

export const Header = () => {
  return (
    <header className="absolute z-50 flex w-[calc(100%-8px)] items-center gap-3 rounded-br-2xl pt-4 pb-6 backdrop-blur-3xl">
      <Image alt="Logo" src={logoUrl} className="h-12" />

      <div className="flex w-full flex-col">
        <h1 className="text-2xl font-bold">Treevera</h1>
        <p className="line-clamp-1 text-base/4">Taxonomia interativa</p>
      </div>
    </header>
  );
};
