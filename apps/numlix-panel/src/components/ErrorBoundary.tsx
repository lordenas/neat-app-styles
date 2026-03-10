import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-lg font-medium text-foreground">Что-то пошло не так</p>
            <p className="text-sm text-muted-foreground">Попробуйте перезагрузить страницу</p>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
            >
              Попробовать снова
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
