---
name: endpoint-workflows
description: >-
  Compose Loyal Spark merchant and holder MCP tools into full business flows
  using next_actions and workflow helpers. Use when an agent knows a tool name
  but not the required follow-up steps.
---

# Endpoint workflows

Loyal Spark actions are multi-step. Responses carry `workflow`, `next_actions`, `prerequisites`, and `field_catalog`. External agents choose every value (`name`, `symbol`, `cost`, `amount`). Do not rely on `auto_generate`.

## Actor first

- Merchant / issuer: `lsk_` → merchant MCP `https://api.loyalspark.online/loyalty-mcp`
- Holder / recipient: `rwk_` → holder MCP `https://api.loyalspark.online/recipient-loyalty-mcp`

Workflow helpers:

- Merchant: `get_program_workflow_status`, `generate_program_defaults`
- Holder: `get_reward_workflow_status`, `prepare_reward_redemption`

## Program first

Before mint, rewards, vouchers, analytics, or transfers, know `token_address`, `token_standard` (`b20` or `erc20`), `status`, and `merchant_address`.

## Common maps

### Launch program (B20)

`create_loyalty_program` → broadcast deploy → extract address → `register_loyalty_program` → `create_reward` → mint/earn.

### Mint

Active program → `mint_loyalty_tokens` or `earn_points` → broadcast fee-first `calls[]` → `confirm_mint_fee` → `get_token_balance`.

### Redeem reward

Discover reward → confirm holder engagement → transfer tokens onchain to merchant → redeem with `transaction_hash` → merchant `use_voucher` when spent.

### Transfer

- Merchant: `transfer_loyalty_tokens`
- Holder: `prepare_loyalty_token_transfer` (`to` or `to_address`)

### P2P / gifts

List/create/accept/cancel offers only after onchain escrow steps confirm. Gift certificates: create → claim → `mark_gift_certificate_minted` when required.

## Decision rules

- "Launch a program" means finish register (and legacy activate), not only deploy calldata.
- "Make it usable" means active program plus at least one reward.
- "Reward customers" means verify the program first.
- "Redeem" expects an onchain transfer step.
- `rwk_` must not call merchant-only tools.

## Errors

Follow `error_code`, `charged`, and `next_steps.request`. Unpaid probes are 402; invalid input before pay is 400 with `charged:false`. Do not pay when the same inputs would stay uncharged.

Docs: https://loyalspark.online/.well-known/skills/13-endpoint-workflows.md
