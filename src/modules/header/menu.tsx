import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme";
import { Settings } from "lucide-react";

const user = false;

export const Menu = () => {
  const { changeTheme, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="group bottom-0 z-50 m-[1px] overflow-hidden rounded-3xl p-3 backdrop-blur-2xl md:absolute">
      <span className="bg-accent-foreground absolute inset-0 origin-center scale-0 rounded-full transition-transform delay-500 duration-500 group-hover:scale-100 group-hover:delay-0"></span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-accent-foreground text-accent relative flex size-8 cursor-pointer items-center justify-center rounded-full">
            <span className="pointer-events-none absolute inset-0 scale-0 rounded-full bg-inherit transition-transform duration-300 ease-in-out group-hover:scale-150" />

            {user ? (
              <span className="text-xl">I</span>
            ) : (
              <Settings className="size-5 transition-transform delay-300 duration-300 ease-in-out group-hover:scale-150 group-hover:delay-0" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-1 w-max min-w-42" align="start">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tema: {t(theme)}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="m-1">
                  <DropdownMenuItem onClick={() => changeTheme("light")}>
                    Claro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme("dark")}>
                    Escuro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTheme("system")}>
                    Sistema
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Idioma: {i18n.language}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="m-1">
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("pt")}>
                    Português
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                    Inglês
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("es")}>
                    Espanhol
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub> */}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
