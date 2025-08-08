import React from "react";
import { Result, Button } from "antd";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/app/dashboard";
  };

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Result
            status="500"
            title="500"
            subTitle="抱歉，页面出现了错误。"
            extra={
              <div>
                <Button
                  type="primary"
                  onClick={this.handleReload}
                  style={{ marginRight: 8 }}
                >
                  刷新页面
                </Button>
                <Button onClick={this.handleGoHome}>返回首页</Button>
              </div>
            }
          >
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  textAlign: "left",
                  marginTop: 24,
                  padding: 16,
                  background: "#f5f5f5",
                  borderRadius: 4,
                }}
              >
                <h4>错误详情（仅开发环境显示）：</h4>
                <pre style={{ fontSize: 12, color: "#666" }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
