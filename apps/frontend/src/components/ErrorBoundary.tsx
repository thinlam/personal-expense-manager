import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // log để bạn thấy lỗi thật trong console
    console.error("UI crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui", color: "#111" }}>
          <h2 style={{ marginTop: 0 }}>Có lỗi UI xảy ra</h2>
          <p>Mở Console (F12) để xem lỗi chi tiết. App không bị “trắng” nữa.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer" }}
          >
            Tải lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
