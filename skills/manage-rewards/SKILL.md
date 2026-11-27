---
name: manage-rewards
description: >-
  Create and manage Loyal Spark reward catalogs and vouchers for an active
  loyalty program. Use when setting up redeemable rewards or checking catalog status.
---

# Manage rewards

Requires merchant key with scope `manage_rewards`. Program must exist and be usable first (B20: deploy then register; legacy ERC-20: activate as well).

## Catalog

1. `list_rewards` with `token_address` (or omit for all owned programs on keyed REST; MCP prefers `token_address`).
2. `create_reward` with `token_address`, `name`, `description`, `cost` (`cost` must be positive).
3. Confirm the reward is `is_active: true`.

Optional: `update_reward_status` to deactivate instead of deleting.

## Redemption (merchant side)

Reward redeem is multi-step and onchain-first:

1. Holder transfers the required token amount to the merchant.
2. Merchant (or holder tools) completes redeem with the confirmed `transaction_hash`.
3. Merchant marks vouchers used with MCP `use_voucher` (`voucher_code` or `code`). Already-used vouchers return `voucher_already_used` (do not retry).

Prefer workflow helpers when available: holder `get_reward_workflow_status` and `prepare_reward_redemption`.

## Design tips from the public guide

- Align `cost` with earn rate.
- Prefer clear customer-facing names.
- Deactivate rather than delete to keep history.

## Safety

Destructive tools (`use_voucher`, revoke/cancel flows, report delete) change state. Confirm with the user before calling. Calldata is unsigned until the user's wallet signs.
