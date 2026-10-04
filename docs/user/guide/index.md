# Use the Web UI

English | [中文](index.zh.md)

Start the Web UI through the [root README](../../../README.md#run); a local launch opens `http://127.0.0.1:3080` in your browser, and an SSH launch prints the host URL. This guide begins after that server is running.

## Configure a model

Open **Settings → Models**, enter a [DeepSeek API key](https://platform.deepseek.com/), and save it. The model route becomes usable immediately without restarting the server.

A browser launch also offers the key in an **Add an API key to get started** dialog on first run; **Configure later** leaves it to this page.

The [model configuration guide](./providers.md) covers other providers and custom OpenAI-compatible endpoints.

## Choose a workspace

An empty installation prepares a **Default workspace** in your Documents folder (`<Documents>/deepseek-harness/default-workspace`) and opens a blank session in it, so the composer is ready for a first message with nothing to select. To work in your own project instead, open the workspace chip on the composer and choose **Add workspace…**, then pick that folder.

When first-use initialization is not eligible, for example on a Linux host with no Documents directory and no configured `documentsDirectory`, the chip reads **Choose workspace** and the composer stays unavailable until you select a folder. Later launches reopen the saved session, or the most recent workspace when none is saved.

## Run a task

Send the first message in the open session:

> Summarize this repository and identify its main packages.

The agent can read and edit workspace files, run commands, delegate work, and maintain a plan. The Web UI asks before operations that require approval under the active permission policy.

## Continue

- [Configure models](./providers.md)
- [Use the Python SDK](./python-sdk.md)
- [Publish the Web UI behind a reverse proxy](./public-deployments.md)
- [Use other CLI modes](../../../apps/cli/README.md)
- [Develop a plugin](../develop/basic/index.md)
