"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-sm">
          <h2 className="text-red-500 font-black uppercase italic mb-2">Visualizer Error</h2>
          <p className="text-xs text-red-500/60 uppercase tracking-widest">The neural renderer encountered a fault in the sector.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
