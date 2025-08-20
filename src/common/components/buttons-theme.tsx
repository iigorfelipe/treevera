import { useTheme } from "@/hooks/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const ButtonsTheme = () => {
  const { changeTheme, theme } = useTheme();

  return (
    <Select onValueChange={changeTheme} value={theme}>
      <SelectTrigger className="w-[7.5rem] rounded-lg text-sm font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg text-sm font-medium">
        <SelectItem value="light">Claro</SelectItem>
        <SelectItem value="dark">Escuro</SelectItem>
        <SelectItem value="system">Sistema</SelectItem>
      </SelectContent>
    </Select>
  );
};
