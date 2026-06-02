/**
 * Converts a render crash (e.g. a WebGL/postprocessing failure) into a visible,
 * diagnosable message instead of a blank screen.
 */
import { Component, type ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[neural-cosmos] render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="centered">
          <h1 className="display">3D render failed</h1>
          <p className="meta">{this.state.error.message}</p>
          <p className="meta">
            Try turning Bloom off in Settings, or use a WebGL-capable browser.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
