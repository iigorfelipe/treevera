import { AlertTriangle, Database } from "lucide-react";
import { TreeSkeleton } from "./components/tree-skeleton";
import { useTranslation } from "react-i18next";

type Props = {
  type: "loading" | "error" | "empty";
};

export const TreeState = ({ type }: Props) => {
  const { t } = useTranslation();

  if (type === "loading") return <TreeSkeleton />;

  const config = {
    error: {
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      title: t("tree.loadError"),
      text: t("tree.loadErrorMessage"),
    },
    empty: {
      icon: <Database className="h-6 w-6" />,
      title: t("tree.noData"),
      text: t("tree.noDataMessage"),
    },
  }[type];

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      {config.icon}
      <h2 className="font-semibold">{config.title}</h2>
      <p className="text-muted-foreground max-w-xs text-sm">{config.text}</p>
    </div>
  );
};
