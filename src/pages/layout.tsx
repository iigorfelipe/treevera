import { Outlet } from "@tanstack/react-router";
import { Translation } from "@/components/translations";
import { ButtonsTheme } from "@/components/buttons-theme";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-white p-4 text-black dark:bg-zinc-900 dark:text-white">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="group flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
            <input type="text" placeholder="Pesquisar" />
            <img
              src="./assets/search-icon.png"
              className="h-full w-fit group-hover:scale-105 group-hover:rotate-5"
              alt=""
            />
          </div>
          <button className="group hover:cursor-normal flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 font-medium">
            Filtrar
            <img
              src="./assets/filter-icon.png"
              className="h-6 w-fit group-hover:scale-105 group-hover:rotate-5"
              alt=""
            />
          </button>
          <button className="group hover:cursor-normal flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 font-medium">
            Remover filtros
            <img
              src="./assets/close-icon.png"
              className="h-6 w-fit group-hover:scale-105 group-hover:rotate-5"
              alt=""
            />
          </button>
        </div>
        <div className="flex gap-2">
          <Translation />
          <ButtonsTheme />
        </div>
      </header>
      <Outlet />
    </div>
  );
};
