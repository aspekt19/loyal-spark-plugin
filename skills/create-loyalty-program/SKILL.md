---
name: create-loyalty-program
description: >-
  Deploy a Base-native B20 loyalty token and register an active Loyal Spark
  program via merchant MCP tools. Use when launching a new merchant loyalty
  program.
---

# Create a loyalty program

Requires merchant key (`LSK_KEY` / `lsk_`) with scope `mint` or `create_program`. New programs default to B20 on Base (chain 8453).

## Do not stop at one tool

A usable rollout is multi-step. Prefer `get_program_workflow_status` and follow `next_actions`.

## B20 flow (default)

1. Choose `name` and `symbol` yourself (and optional `expiration_days`, `cashback_rate`, `points_per_dollar`). Optional planner: `generate_program_defaults` (examples only; does not fill values for you).
2. Call MCP `create_loyalty_program` with required `name` and `symbol`.
3. Broadcast the returned unsigned `contract_call` / calldata on Base. Value is `0x0`. The signing wallet pays ETH gas. Fund ETH first (`gas.fund_eth_first` / `gas.eth_needed` in responses).
4. Extract `token_address` from the `B20Created` event or REST `GET /agent-api/tx-receipt?tx_hash=...`.
5. Call MCP `register_loyalty_program` with `token_address` and `token_standard: "b20"`.
6. Program is `status: active` immediately. No `activate_loyalty_program` step for B20.
7. Create at least one reward (`create_reward`) before large-scale minting.

## Legacy ERC-20

Only if the user asks for it: create with `token_standard: "erc20"`, then `register_loyalty_program`, `activate_loyalty_program` (broadcast activation txs), then `update_program_status` with `status: "active"`.

## Success

- Program appears in `list_loyalty_programs`
- `status: "active"`, `token_standard: "b20"` (unless legacy)
- Ready for `create_reward` and `mint_loyalty_tokens`

## Safety

Loyal Spark returns ready-to-sign calldata. The user's wallet (or CDP MPC wallet) signs and broadcasts. Confirm before any destructive or irreversible onchain step.
