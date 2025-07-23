import { useTranslation } from "react-i18next";

export const Translation = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-row items-center gap-2">
      <h1>{t("welcome")}</h1>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded border border-gray-300 p-2 font-medium dark:bg-zinc-900"
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};
