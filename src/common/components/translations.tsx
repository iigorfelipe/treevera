import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const Translation = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-sm font-medium">{t("welcome")}</span>
      <Select
        value={i18n.language}
        onValueChange={(value) => i18n.changeLanguage(value)}
      >
        <SelectTrigger className="w-[7.5rem] rounded-lg border text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg text-sm font-medium">
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="es">Español</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
