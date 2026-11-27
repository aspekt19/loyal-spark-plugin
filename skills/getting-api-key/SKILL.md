---
name: getting-api-key
description: >-
  Get a Loyal Spark merchant (lsk_) or holder (rwk_) API key via x402 ($0.01)
  or SIWE. Use when the user needs authenticated MCP tools beyond keyless
  tools/list and get_platform_info.
---

# Getting a Loyal Spark API key

Keys are optional for discovery. Both MCP servers accept `initialize` and `tools/list` without a key. Authenticated writes need a key in `x-api-key` (or `Authorization: Bearer`).

## Merchant key (`lsk_`)

**Free plan via x402 ($0.01 USDC on Base):**

1. `POST https://api.loyalspark.online/x402-gateway/register-agent`
2. Pay the 402 challenge (x402 v2, USDC on Base). Optional body: `{"agent_name": "My agent"}`.
3. Save the returned `lsk_...` key once. It is not shown again.
4. Put it in the plugin variable `LSK_KEY` (Cursor: Plugins → Configure).

Free plan when the wallet has no store or paid agent plan: 200 calls/month, 1 agent, 1,000 mint tokens/month, 1.25% mint fee, scopes `read`, `create_program`, `mint`, `trade`, `manage_rewards`.

**SIWE (store plan, Pro/Enterprise, or rotate an existing Free key):**

1. `POST https://api.loyalspark.online/siwe-nonce`
2. Sign EIP-4361 with domain `loyalspark.online`, URI `https://loyalspark.online`, statement `Register Loyal Spark merchant agent`, Chain ID `8453`
3. `POST https://api.loyalspark.online/agent-register-siwe` with `{message, signature, agent_name, scopes}`
4. Or create a key in the dashboard: https://loyalspark.online/merchant → AI Agents

Full message format: https://loyalspark.online/.well-known/skills/00-getting-started.md

## Holder key (`rwk_`)

No paid registration. Wallet-scoped only (balances, redeem, vouchers, transfer calldata, P2P, gift claims). Not a merchant key.

1. `POST https://api.loyalspark.online/siwe-nonce`
2. Sign SIWE for the holder wallet (allowed domain matching the URI, Chain ID `8453`, no special phrase)
3. `POST https://api.loyalspark.online/recipient-api/register` with `{message, signature, name}`
4. Put the `rwk_...` key in plugin variable `RWK_KEY`

## After you have a key

1. Configure `LSK_KEY` and/or `RWK_KEY` on the plugin.
2. Merchant planner: MCP `get_program_workflow_status` or REST `GET https://api.loyalspark.online/agent-api/workflow/program-status` with `x-api-key: lsk_...`
3. Follow `next_actions` until the program can mint and redeem. Do not stop on a single call.

## Safety

- Never commit keys. Never paste keys into chat logs or the repo.
- Lost `lsk_` key: rotate free with SIWE (same wallet and agent name) or `rotate:true` on register-agent.
- One wallet may hold both `lsk_` and `rwk_`.
