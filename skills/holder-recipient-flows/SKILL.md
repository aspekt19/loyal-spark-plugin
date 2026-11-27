---
name: holder-recipient-flows
description: >-
  Holder and recipient flows on Loyal Spark using the rwk_ MCP server:
  balances, reward redemption, vouchers, P2P offers, gift certificates, and
  transfer calldata.
---

# Holder / recipient flows

Use the holder MCP server `loyal-spark-recipient` at `https://api.loyalspark.online/recipient-loyalty-mcp` with optional `RWK_KEY` (`rwk_`). Get a key free via SIWE (`siwe-nonce` → `POST /recipient-api/register`). `rwk_` is wallet-scoped and is not a merchant key.

Verified tools (no key needed for `tools/list`):

- Profile / balances: `get_recipient_profile`, `list_my_loyalty_balances`, `get_my_loyalty_balance`
- Transfer: `prepare_loyalty_token_transfer`
- Rewards: `list_rewards_for_program`, `get_reward_workflow_status`, `prepare_reward_redemption`, `redeem_my_reward`
- Vouchers: `list_my_vouchers`
- P2P: `list_p2p_offers`, `create_p2p_offer`, `accept_p2p_offer`, `cancel_p2p_offer`
- Gifts: `lookup_gift_certificate`, `claim_gift_certificate`, `list_my_gift_certificates`
- Discovery helpers: `bazaar_discover_resources`, `bazaar_discover_mcp_servers`, `bazaar_probe_x402`, `bazaar_pay_and_call`

## Redeem a reward

1. `list_rewards_for_program` / `get_reward_workflow_status` for the `token_address`.
2. Confirm the holder can redeem now (engagement / prerequisites in the workflow response). On-chain `balanceOf` alone is not enough for redeem eligibility.
3. `prepare_reward_redemption` for ready-to-broadcast transfer calldata to the merchant.
4. Holder signs and broadcasts; wait for confirmation.
5. `redeem_my_reward` with the confirmed `transaction_hash` (alias `tx_hash` accepted on related routes).
6. Keep the voucher code; merchant later calls `use_voucher` on the merchant server.

## Transfer points

1. `get_my_loyalty_balance` for the program token.
2. `prepare_loyalty_token_transfer` with `to` or `to_address` and amount.
3. Holder signs and broadcasts the returned calldata.

## P2P and gifts

- Inspect with `list_p2p_offers` before create/accept/cancel.
- Accept/cancel can reserve or release offers; wait for onchain confirmation.
- Gift claim: `lookup_gift_certificate` → `claim_gift_certificate` (and merchant mint marking when the flow requires it).

## Safety

- Prepare-only tools return unsigned calldata. The holder's wallet signs.
- Destructive holder tools (`accept_p2p_offer`, `cancel_p2p_offer`, claim/redeem) need explicit user confirmation.
- Prefer `next_actions` / workflow helpers over guessing field names.
