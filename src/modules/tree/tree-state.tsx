import { AlertTriangle, Database } from "lucide-react";
import { TreeSkeleton } from "./components/tree-skeleton";

type Props = {
  type: "loading" | "error" | "empty";
};

export const TreeState = ({ type }: Props) => {
  if (type === "loading") return <TreeSkeleton />;

  const config = {
    error: {
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      title: "Erro ao carregar",
      text: "Não foi possível carregar a árvore. Tente novamente.",
    },
    empty: {
      icon: <Database className="h-6 w-6" />,
      title: "Nenhum dado disponível",
      text: "Ainda não há dados taxonômicos para exibir.",
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
