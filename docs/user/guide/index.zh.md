# 使用 Web UI

[English](index.md) | 中文

请先按照[根目录 README](../../../README.zh.md#run) 中的说明启动 Web UI；本地启动会在浏览器中打开 `http://127.0.0.1:3080`，通过 SSH 启动则只打印主机地址。本指南从服务器已经运行的状态开始。

## 配置模型

打开**设置 → 模型**，输入 [DeepSeek API 密钥](https://platform.deepseek.com/)并保存。模型路由会立即可用，不需要重启服务器。

在浏览器中首次启动时，还会弹出**添加一个 API Key 开始使用**对话框；选择**稍后配置**即可改为在本页填写。

[模型配置指南](./providers.zh.md)介绍其他提供方和自定义 OpenAI 兼容端点。

## 选择工作区

全新的安装会准备一个**默认工作区**，位于“文档”目录下（`<Documents>/deepseek-harness/default-workspace`），并在其中打开一个空白会话；无需选择任何内容即可直接发送第一条消息。如果要在自己的项目目录中工作，请打开输入框上方的工作区选择器，选择**添加工作区…**，然后选中该文件夹。

首次使用初始化不适用时（例如 Linux 主机没有“文档”目录，也未配置 `documentsDirectory`），选择器会显示**选择工作区**，在你选中文件夹之前输入框保持不可用。之后的启动会重新打开上次的会话；若没有保存的会话，则选中最近使用的工作区。

## 运行任务

在已打开的会话中发送第一条消息：

> Summarize this repository and identify its main packages.

Agent（智能体）可以读取和编辑工作区文件、运行命令、委派工作并维护计划。如果根据当前权限策略，某项操作需要审批，Web UI 会先询问你。

## 继续使用

- [配置模型](./providers.zh.md)
- [使用 Python SDK](./python-sdk.zh.md)
- [在反向代理之后发布 Web UI](./public-deployments.zh.md)
- [使用其他 CLI 模式](../../../apps/cli/README.zh.md)
- [开发插件](../develop/basic/index.zh.md)
