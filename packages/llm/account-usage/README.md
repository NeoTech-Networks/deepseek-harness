---
description: "Subscription-account usage for the Web GUI: the signed-in account's rolling and weekly limit occupancy, read Host-side from the stored grant and shown on the composer dock strip; for users and maintainers of subscription routing."
kind: "package-reference"
---

# @deepseek-ai/dsh-account-usage

English | [中文](README.zh.md)

## Summary

This package reports how much of a subscription account's own rate limits the operator has already consumed, and shows it under the composer. A provider that authorizes by subscription grant rather than by API key meters two windows: a rolling short window that resets several times a day, and a weekly window. Neither is visible anywhere in a session, so the first sign of exhaustion is normally a refusal mid-turn. The Host half reads the stored grant and asks the account for its own figures; the browser half seats one short reading, `5h 3% · Week 16%`, on the composer dock strip beside the session statistics row, with a click-open panel carrying reset instants, any scoped weekly window, and the month's extra-usage spend. A deployment with no subscription grant shows nothing at all.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount this plugin in a composition that also mounts a credential provider and `ui-conversation`. The Host half owns the `accountUsage` Remote namespace and one method, `read`, which answers from a short-lived cache so several open windows cost one upstream request. The browser half starts one page-wide feed and registers one entry on `conversation.composer.dock`.

### What the reading says

The two figures are whole percentages of each window. They take a warning tone from 80 percent and a critical tone from 95. A trailing marker on the reading means the figures are not a fresh live reading, and the panel says which of the three reasons applies: the stored grant has expired and is waiting for the adapter's next model call to refresh it, the account refused the grant, or the read simply failed and the previous figures are still on screen.

### Cadence

The feed reads once a minute at rest, once every twenty seconds while a session in this page is running, once shortly after a turn settles, and once whenever the page becomes visible again. That cadence follows the figures themselves: the account's numbers move when a request is billed, so polling harder while nothing runs would spend requests to learn nothing.

### Deployments with no subscription

`read` answers `unsupported` when no credential provider is mounted, when no record is stored at the configured address, or when the stored record is not a grant this service can read (an API key, for instance). The entry then renders nothing, so an install signed in to another provider is untouched.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals - click to expand</summary>

Three properties define the Host half. The grant never leaves the Host: the credential record is read in `load` and used in the same call, and `AccountUsageSnapshot` has no member a token could ride in. The grant is never refreshed here, because the adapter that owns it refreshes it during its own requests and a second refresher racing that one can revoke a token an in-flight request is still using; an expired grant reports `stale` and waits. Nothing fails loudly: transport faults, refusals and unreadable payloads all become a status on the snapshot, carrying the last figures that were actually read.

The usage report is an undocumented endpoint owned by the provider, so `usage-endpoint.ts` is the only module that speaks to it and its schema is deliberately permissive: every window is nullable, unknown keys are ignored, and a shape the parse cannot read degrades to a failed read. One cache entry and one in-flight promise are shared by every caller; the caller's cancellation is deliberately not forwarded into that shared read.

The browser half keeps one feed per page rather than one per session, because the figure is an account-level fact and opening a second conversation must not double the polling. The dock entry closes over that feed, since the composer dock cell declares no slot inject face.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the usage reading is not enough. They move from the surface it shares to the credential seam behind it.

- [ui-chat](../../client/ui-chat/README.md) - owns the session statistics row this reading sits beside.
- [ui-conversation](../../client/ui-conversation/README.md) - declares the `conversation.composer.dock` cell both entries occupy.
- [dsh-credentials](../../credentials/credentials/README.md) - the credential seam whose stored grant this service reads.
- [dsh-llm-pi-ai](../llm-pi-ai/README.md) - the adapter that writes and refreshes that grant.

-----

<a id="model-experience"></a>
## Model Experience

None, as this package answers a browser readout with the account's own limit percentages and registers nothing model-facing.

#### KV Cache effect

None; the figures travel over the Remote and assemble no model request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


These limits define the current usage surface. They are current package constraints, not a general rate-limit comparison or a task backlog.

- **One provider's report shape** - the parse targets a subscription usage report keyed by two named windows plus a flat limit list. Another provider metering subscriptions differently needs its own reader, not a config value.
- **No refresh of its own** - an expired grant reports `stale` until the owning adapter refreshes it on its next model call, so a long idle period leaves the figures visibly out of date rather than current.
- **Whole percentages only** - the report's own utilization is rounded to a whole percent for display, so a window under half a percent reads as zero rather than as a small non-zero figure.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers - click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. Every answer is derived from the stored credential record and one HTTP read at call time, and the package owns no cross-plugin mutable state beyond a cache whose only observable effect is the age of the figure it serves.
