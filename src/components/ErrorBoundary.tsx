import { Component, type ReactNode } from "react";
import { Salad, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Novra] Erro de renderização:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div className="brand-mark" style={{ width: 52, height: 52, borderRadius: 16 }}>
              <Salad size={22} />
            </div>
            <div>
              <div className="h2" style={{ marginBottom: 8 }}>Algo deu errado</div>
              <div className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                Ocorreu um erro inesperado. Tente recarregar — se o problema persistir, entre em contato com o suporte.
              </div>
            </div>
            <pre style={{
              fontSize: 11.5, color: "var(--faint)", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px",
              width: "100%", textAlign: "left", overflowX: "auto",
              whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>
              {this.state.error.message}
            </pre>
            <button
              className="btn primary"
              onClick={() => window.location.reload()}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <RefreshCw size={15} /> Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
