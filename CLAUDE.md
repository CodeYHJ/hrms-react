## 语言规范

- 所有对话和文档都使用中文
- 文档使用 markdown 格式

## 核心规则

- React 实现必须基于 views 目录中的原有 HTML 文件，逻辑、数据结构、基本布局都必须以原 HTML 为准，不得修改或优化。

## 技术栈规范

- React 版本：v18（位于 frontend 目录）
- UI 框架：antd
- HTTP 请求：axios

## 严格规则

- **禁止创建新文件**：只能在现有文件基础上进行修改
- **禁止优化现有代码**：除非明确修复 bug，否则不得重构或优化现有逻辑
- **禁止添加注释**：不能在代码中添加新的注释说明
- **严格按现有代码风格**：必须完全遵循当前代码的命名、格式和风格规范
- **禁止创建单元测试**：不得创建新的测试文件或测试代码

接口返回结构：

```
{
code:number // number,正常默认200，
status: boolean // 判断是否接口异常，default：true，正常； false：不正常
message: string // 错误信息存放
data: any // 所需的数据存放
}

```

前端请求接口统一放在 frontend/service 目录内，页面引用统一调用

axios 请求封装在 frontend/service/api.js 内，只有一个 axios 实例
