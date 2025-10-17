import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from "./App";
import "./styles/global.css";

dayjs.locale('zh-cn'); // 配置中文本地化

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>
  // </React.StrictMode>
);
