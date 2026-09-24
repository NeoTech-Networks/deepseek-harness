---
description: "vision 分组图：纯文本模型会话的自动图像描述，供用户与维护者浏览本分组。"
kind: "package-group"
---

# packages/vision

[English](README.md) | 中文

## 概述

vision 分组为纯文本模型会话提供「借来的眼睛」。当用户向模型无法接受图像的会话附加图像时，该分组的宿主服务用可接受图像的视觉模型描述图像并返回模型可见文本，让提示接纳把描述交给主模型而不是拒绝图像。该行为由 `subagent-model-selection` 用户设置门控，复用操作者已有的子代理模型授权，而非新增设置卡片。

## 目录

- [Packages](#packages)
- [Related documentation](#related-documentation)

-----

<a id="packages"></a>
## Packages

| Package | Role | ctx key |
|---|---|---|
| [`vision-routing`](vision-routing/README.zh.md) | 解析门控偏好与视觉路由，执行描述调用 | `ctx.visionRouting` |

-----

<a id="related-documentation"></a>
## Related documentation

- [Vision subsystem](../../docs/subsystems/vision.zh.md): 门控偏好、路由解析与描述调用契约。
