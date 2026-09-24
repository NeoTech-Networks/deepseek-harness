# Agent Note：工具 schema 的路由回退

Status: implemented

[English](2026-09-11-llm-route-fallback.md) | 中文

## 问题

某部署希望携带大型工具 schema 的请求不再走便宜的 flash 路由：需求是当请求中各工具 `function.parameters` 的字节合计在 `deepseek-v4-flash` 上超过 3000 时，网关必须回退到 `deepseek-v4-pro`，而不是截断 schema，并且这次回退必须被记录而非静默发生。

动手之前必须先确定两件事。第一，两个在运行的系统里哪一个是"网关"：harness 自己的 DeepSeek 层（它携带工具 schema），还是车队的 Railway `Agents` 服务（它有 flash/pro 配对与回退阶梯，但它的 `GenerateRequest` 完全不携带工具，因此在不先为其 API 增加工具支持的前提下，该需求无法适用于它）。第二，本守卫所防范的故障是否真实存在：2026-09-11 的实测探测把 4734 个参数字节分别发给 `deepseek-flash`、`deepseek-v4-flash` 与 `deepseek-v4-pro`，流式与非流式都试过，每一路都返回 HTTP 200，而 provider 的 Chat Completions 参考文档对 `tools[].function.parameters` 没有记录任何大小上限。

## 决定

目标是 harness 的 DeepSeek 层，守卫是一个新插件 `@deepseek-ai/dsh-llm-route-fallback`，它以 `prepend` 监听 `agent/request` waterfall。它测量该步组装出的工具参数的 UTF-8 字节合计，当合计在配置路由上超过配置上限时，为这次请求返回配置的 `to` 模型。它绝不截断、改写或重新序列化任何 schema。

关键在于决定发生的位置。循环在前置步骤里组装工具，通过 `agent/request` 解析调用配置，之后才写 `request/header` 以及任何 `request/context` 变更；因此在这里做出的决定就是持久日志会记录的决定。为做到这一点，waterfall 的 payload 增加了组装好的 `tools`，这同时意味着操作者的模型选择中间件（一个更靠内、非 prepend 的监听器）会先于守卫解析完成，因而无法推翻它。

## 考虑过的替代方案

**把守卫放进车队的 `Agents` 服务。** 它已经有 flash/pro 配对与阶梯，但它的请求里没有工具 schema，因此该需求的对象在那里并不存在。

**把守卫放进 DeepSeek 适配器，或放进 `llm/stream` 包装层。** 两者在机制上都可行且不必改动循环，但都在循环写完请求头之后才决定，于是日志会记录所请求的模型而线上用的是另一个。这破坏了"每个对话请求都是日志的纯函数"这一重建契约，比本设计所需的那点核心改动更糟。

**截断或摘要 schema。** 已拒绝，因为那正是需求明确排除的行为。

## 后果

`agent/request` 的 payload 为每个分派方携带 `tools`，因此四处直接分派该 waterfall 的测试现在都传入 `tools: []`。日志记录的路由可能与模型选择器显示的路由不同，这一点被记为限制而不是被掩盖。被移动的请求无法复用继承的缓存前缀。默认阈值与两个路由 id 都是配置而非代码：`deepseek-flash` 及其旧版别名 `deepseek-v4-flash` 都是 `from` 路由，因为 provider 仍为同一个底层模型提供旧 id，并按 Flash 价格计费。
