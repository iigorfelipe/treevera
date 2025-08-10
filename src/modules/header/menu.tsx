import { useTheme } from "@/hooks/theme";
import { useTranslation } from "react-i18next";
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
import { Settings, User as UserIcon } from "lucide-react";

export const Menu = () => {
  const { changeTheme, theme } = useTheme();

  const { i18n } = useTranslation();

  const user = false;

  return (
    <div className="absolute bottom-2.5 z-50 w-[calc(100%-8px)] rounded-tr-2xl p-3 backdrop-blur-3xl">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="group flex cursor-pointer items-center justify-center rounded-xl transition-colors"
            aria-label="Configurações"
          >
            <div className="bg-accent flex size-10 items-center justify-center rounded-full">
              {user ? <span className="text-xl">I</span> : <Settings />}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <UserIcon className="size-4" />
            Perfil
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <div className="flex w-full flex-col gap-1">
              <span className="text-muted-foreground mb-1 text-xs">Tema</span>
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
          <DropdownMenuItem asChild>
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
