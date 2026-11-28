# Loyal Spark

You have the Loyal Spark Gemini CLI extension. It connects two remote MCP servers for onchain loyalty on Base (chain 8453):

- Merchant server `loyal-spark` — deploy and run B20 loyalty programs, rewards, minting, merchandising, and reports. About 43 tools.
- Holder server `loyal-spark-recipient` — wallet-scoped balances, redemptions, P2P offers, and gift certificates. About 20 tools.

Official site: https://loyalspark.online  
Docs: https://loyalspark.online/llms.txt  
Agent onboarding: https://loyalspark.online/for-agents

## When to use these tools

Use Loyal Spark when the user wants to:

- Check loyalty program status, balances, rewards, vouchers, or gift certificates
- Create or configure a merchant loyalty program (B20 token on Base)
- Mint or transfer loyalty tokens, earn points, or prepare redemptions
- Work with marketplace / P2P offers or the Bazaar x402 discovery tools
- Get a merchant (`lsk_`) or holder (`rwk_`) API key, or learn how Loyal Spark agents onboard

Do not use these tools for unrelated tasks (generic coding, other chains, or off-platform payments).

## Which server to call

- Merchant questions (programs, rewards catalog, minting, store discounts, reports, agent profile): `loyal-spark`.
- Holder / shopper questions (my balances, my vouchers, redeem my reward, P2P offers I create or accept, claim a gift certificate): `loyal-spark-recipient`.
- If unsure, start keyless on the merchant server with `get_platform_info`, then follow `get_program_workflow_status` / `next_actions`.

## Auth

`initialize` and `tools/list` work without a key. Some read tools (notably merchant `get_platform_info`) are also keyless. Wallet-scoped and state-changing tools need a key in `x-api-key` (or `Authorization: Bearer`).

The extension settings `LSK_KEY` and `RWK_KEY` are optional. If a required tool returns an auth error, explain how to get a key and ask the user to set it with `gemini extensions config` (or reinstall and enter it). Never invent, log, or print secret key values.

Merchant key (`lsk_...`):

- Free plan: pay $0.01 USDC once at `POST https://api.loyalspark.online/x402-gateway/register-agent` (x402 on Base). Repeats for the same wallet return `agent_exists` unless `rotate:true`.
- Or SIWE / dashboard at https://loyalspark.online/merchant (AI Agents), or SIWE via `/siwe-nonce` + `/agent-register-siwe` (statement `Register Loyal Spark merchant agent`, chain ID 8453).

Holder key (`rwk_...`):

- Free SIWE: `POST /siwe-nonce`, sign, then `POST https://api.loyalspark.online/recipient-api/register`.
- Some holder tools can also be paid per call via x402 at `https://api.loyalspark.online/x402-gateway/recipient-mcp-tools/<tool>`.

## How to work

1. Prefer workflow tools (`get_program_workflow_status`, `get_reward_workflow_status`, `generate_program_defaults`) over improvising transaction steps.
2. Loyal Spark prepares unsigned calldata. The user's wallet signs and broadcasts on Base. Gas is paid in ETH by that wallet. Do not claim a transaction is confirmed until the user (or their wallet) has actually submitted it.
3. Destructive or state-changing tools — including `mint_loyalty_tokens`, `transfer_loyalty_tokens`, `earn_points`, `redeem_reward`, `use_voucher`, `redeem_my_reward`, `accept_p2p_offer`, `cancel_p2p_offer`, `claim_gift_certificate`, `revoke_gift_certificate`, `delete_report`, `update_store_discount_code`, and `bazaar_pay_and_call` — change production state on Base mainnet. Confirm with the user before calling them.
4. Do not broadcast or urge mainnet transactions unless the user clearly intends to. For demos, stay on discovery and workflow guidance.
5. Bazaar probe tools can be rate-limited; use `bazaar_probe_x402` sparingly.
6. If a tool schema or name is unclear, call `tools/list` rather than guessing parameters.

## Example prompts this extension should handle

- "Using Loyal Spark, show platform info and list my loyalty programs."
- "What are the next_actions to deploy a B20 loyalty program named Demo Rewards with symbol DEMO?"
- "Show my holder loyalty balances and available rewards."
- "How do I get a free merchant or holder API key for Loyal Spark?"
