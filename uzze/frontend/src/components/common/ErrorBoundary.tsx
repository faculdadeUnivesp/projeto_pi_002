import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('ErrorBoundary caught', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth" style={{ maxWidth: 600 }}>
          <div className="auth-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
            <h1 className="sm">Algo deu errado</h1>
            <p className="sub">{this.state.message}</p>
            <button className="btn btn-grad" type="button" onClick={this.handleReload}>
              Recarregar a página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
