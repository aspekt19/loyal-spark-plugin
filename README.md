# Loyal Spark plugin

Cursor Marketplace and Grok Bot plugin for [Loyal Spark](https://loyalspark.online): onchain loyalty on Base L2 for merchants and AI agents.

This package wires two hosted Streamable HTTP MCP servers (protocol `2025-06-18`) into Cursor / Grok Bot, plus concise agent skills adapted from Loyal Spark's public guides. The founder submits the public repo via [Cursor Marketplace publish](https://cursor.com/marketplace/publish) and [x.ai plugin submit](https://x.ai/bot/marketplace/submit-a-plugin).

## What it does

| Server | MCP URL | Tools | Key |
| --- | --- | --- | --- |
| Merchant (`loyal-spark`) | `https://api.loyalspark.online/loyalty-mcp` | 43 | optional `lsk_...` (`LSK_KEY`) |
| Holder (`loyal-spark-recipient`) | `https://api.loyalspark.online/recipient-loyalty-mcp` | 20 | optional `rwk_...` (`RWK_KEY`) |

Auth header: `x-api-key` (or `Authorization: Bearer` with the same key). `initialize` and `tools/list` work without a key. Official registry names: `io.github.aspekt19/loyal-spark` and `io.github.aspekt19/loyal-spark-recipient`.

Typical merchant path: get a key → follow `get_program_workflow_status` / `next_actions` → deploy a B20 loyalty token → register program → create rewards → mint.

## Install in Cursor

1. Install from the Cursor Marketplace once published, or add this repo as a plugin source during review.
2. Open **Plugins → Configure** for Loyal Spark.
3. Optionally set `LSK_KEY` and/or `RWK_KEY` (never commit these values).
4. Ask the agent to call `get_platform_info` or list tools on both servers.

Manual MCP snippet (same URLs as `mcp.json`):

```json
{
  "mcpServers": {
    "loyal-spark": {
      "url": "https://api.loyalspark.online/loyalty-mcp",
      "headers": { "x-api-key": "lsk_YOUR_KEY" }
    },
    "loyal-spark-recipient": {
      "url": "https://api.loyalspark.online/recipient-loyalty-mcp",
      "headers": { "x-api-key": "rwk_YOUR_KEY" }
    }
  }
}
```

## Install in Grok Bot

1. After marketplace listing (or while testing), add the plugin / custom MCP using this repository or the MCP URLs above.
2. Configure the same optional keys when prompted.
3. Confirm with a keyless `tools/list` or `get_platform_info`, then a keyed workflow call.

Ready-to-paste submission fields: [SUBMISSION.md](./SUBMISSION.md).

## How to get keys

**Merchant (`lsk_`):**

- Free plan: pay $0.01 USDC at `POST https://api.loyalspark.online/x402-gateway/register-agent` (x402 v2 on Base). Save the key when shown.
- Or SIWE / dashboard: https://loyalspark.online/merchant → AI Agents, or SIWE via `/siwe-nonce` + `/agent-register-siwe` (statement `Register Loyal Spark merchant agent`, Chain ID 8453).

**Holder (`rwk_`):**

- Free SIWE: `/siwe-nonce` → sign → `POST https://api.loyalspark.online/recipient-api/register`.

Guides: https://loyalspark.online/for-agents · https://loyalspark.online/.well-known/skills/00-getting-started.md · https://loyalspark.online/llms.txt

## Skills included

| Skill | Purpose |
| --- | --- |
| `getting-api-key` | x402 / SIWE key paths |
| `create-loyalty-program` | B20 deploy + register |
| `mint-tokens` | Fee-first mint + confirm |
| `manage-rewards` | Catalog and vouchers |
| `endpoint-workflows` | Multi-step `next_actions` |
| `holder-recipient-flows` | `rwk_` holder tools |

## Safety notes

- Loyal Spark prepares unsigned calldata. The connected wallet signs and broadcasts on Base (chain 8453). Gas is paid in ETH by that wallet (`value` is `0x0`).
- Destructive tools (voucher use, offer accept/cancel, certificate claim/revoke, report delete, and similar) change state. Confirm with the user before calling.
- Do not commit secrets. Plugin variables hold keys in the client dashboard only.
- Terms: https://loyalspark.online/terms · Privacy: https://loyalspark.online/privacy

## Gemini CLI

This repo includes `gemini-extension.json` (Streamable HTTP via `httpUrl` + headers) and `GEMINI.md` (when to use the merchant vs holder servers). The repository is tagged `gemini-cli-extension` for the official gallery crawler.

```bash
gemini extensions install https://github.com/aspekt19/loyal-spark-plugin
```

## Layout

```text
.cursor-plugin/plugin.json   # Cursor / Grok Bot manifest + variables
mcp.json                     # Both MCP servers with ${LSK_KEY} / ${RWK_KEY}
gemini-extension.json        # Gemini CLI extension
GEMINI.md                    # Gemini CLI context (when to use which server)
skills/*/SKILL.md            # Agent skills
assets/logo.png              # Square logo
SUBMISSION.md                # Marketplace form paste fields
scripts/validate-plugin.mjs  # Local JSON / layout checks
```

## Validate locally

```bash
node scripts/validate-plugin.mjs
python3 -m json.tool .cursor-plugin/plugin.json > /dev/null
python3 -m json.tool mcp.json > /dev/null
python3 -m json.tool gemini-extension.json > /dev/null
```

## Support

- Email: [admin@loyalspark.online](mailto:admin@loyalspark.online)
- Founder: Yuri Gerasimov (GitHub [aspekt19](https://github.com/aspekt19), X [@gerassyk](https://x.com/gerassyk))
- Project X: [@Loyal_Spark](https://x.com/Loyal_Spark)
- Site: https://loyalspark.online
- Privacy: https://loyalspark.online/privacy
- Terms: https://loyalspark.online/terms

## Links

- Site: https://loyalspark.online
- X: [@Loyal_Spark](https://x.com/Loyal_Spark)
- MCP card: https://loyalspark.online/.well-known/mcp.json
- Agent manifest: https://loyalspark.online/.well-known/agent.json
- OpenAPI: https://loyalspark.online/openapi.json
- Metadata repo: https://github.com/aspekt19/loyal-spark
- License: MIT
