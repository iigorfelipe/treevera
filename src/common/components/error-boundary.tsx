import { Component, type ReactNode } from "react";
import { RotateCcw, Home } from "lucide-react";
import { Button } from "@/common/components/ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback onReset={() => this.setState({ hasError: false })} />
      );
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg font-semibold">Algo deu errado</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ocorreu um erro inesperado. Tente novamente ou volte para a página
        inicial.
      </p>
      <div className="flex gap-2">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="size-4" />
          Tentar novamente
        </Button>
        <Button
          onClick={() => {
            window.location.href = window.location.origin + "/treevera/";
          }}
          variant="default"
          className="gap-2"
        >
          <Home className="size-4" />
          Início
        </Button>
      </div>
    </div>
  );
};
