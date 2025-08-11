import { useTheme } from "@/hooks/theme";
// import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

export const Menu = () => {
  const { changeTheme, theme } = useTheme();

  // const { i18n } = useTranslation();

  const user = false;

  return (
    <div className="group absolute bottom-0 z-50 overflow-hidden rounded-tr-3xl p-3 backdrop-blur-2xl">
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
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            Configurações
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <div className="flex w-full flex-col gap-1">
              <span className="mb-1 text-xs">Tema</span>
              <Select onValueChange={changeTheme} value={theme}>
                <SelectTrigger className="h-8 w-full rounded-md border px-2 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md text-sm font-medium">
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <div className="flex w-full flex-col gap-1">
              <span className="text-muted-foreground mb-1 text-xs">Idioma</span>
              <Select
                value={i18n.language}
                onValueChange={(value) => i18n.changeLanguage(value)}
              >
                <SelectTrigger className="h-8 w-full rounded-md border px-2 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md text-sm font-medium">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
