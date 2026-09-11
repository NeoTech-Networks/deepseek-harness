# @deepseek-ai/dsh-vision-routing

[English](README.md) | 中文

纯文本模型会话的自动图像描述。

## 作用

纯文本模型（`deepseek-v4-pro`）无法接受图像输入。当用户向此类会话附加图像时，提示接纳原本会拒绝该消息（"Model does not support image input"）。此宿主插件改用可接受图像的视觉模型（默认 `deepseek-flash`）描述所附图像并返回模型可见文本，让主模型能基于图像内容行动。

## 门控

除非 `subagent-model-selection` 用户设置（「允许 Agent 为 Subagent 选择模型」开关）已启用且至少命名一个候选路由，否则该插件不活跃。视觉路由是第一个其模型声明 `image` 输入的被允许路由；若都不符合，则回退到配置的 `visionRoute`。这复用操作者已有的子代理模型授权，因此没有单独的设置卡片。

## 配置

所有字段均可选。

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `visionRoute.provider` | `deepseek-official` | 视觉模型提供方 |
| `visionRoute.model` | `deepseek-flash` | 视觉模型 id |
| `prompt` | 描述要点 | 随图像发送的指令 |
| `maxTokens` | 4096 | 单次描述的输出 token 上限 |
| `timeoutMs` | 60000 | 单次描述的端到端截止时间 |

## 服务

该插件注册 `ctx.visionRouting`：

- `enabled()` 返回是否启用自动描述。
- `describe(refs, signal?)` 用视觉模型处理一个有序图像批次并返回描述文本，或在没有可接受图像的模型或调用失败时抛出 `VisionDescriptionError`。

提示接纳把 `VisionDescriptionError` 视为可恢复：消息仍会发送，并附带简短的「描述不可用」说明而不是被拒绝。

## Runtime invariant

No companion is published. 此宿主服务不拥有自己的持久事件流或可变运行时数据：它按调用解析门控偏好与确切视觉路由，其返回的描述由提示接纳作为用户消息的一部分持久化，而非写入包内流。
