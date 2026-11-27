---
name: mint-tokens
description: >-
  Mint Loyal Spark loyalty tokens to a customer wallet with fee-first calls
  and confirm_mint_fee. Use when rewarding purchases, engagement, or referrals.
---

# Mint loyalty tokens

Requires merchant key with scope `mint`. Program must already be active (B20: registered; legacy ERC-20: activated).

## Steps

1. Confirm ownership and readiness: `list_loyalty_programs` and/or `get_program_workflow_status`.
2. Call MCP `mint_loyalty_tokens` with:
   - `token_address`
   - `recipient_address` (preferred; `0x` wallet or customer email) or `recipient_email`
   - `amount`
3. The result is a **fee-first** `calls[]` bundle:
   - `calls[0]` `purpose: "protocol_fee"`: mint `fee_amount` to the platform fee wallet. Send first.
   - `calls[1]` `purpose: "recipient_mint"`: mint full `amount` to the customer.
4. Broadcast in order, or one EIP-5792 batch. Wait for receipts. Signer pays Base gas in ETH (`value` is `0x0`).
5. Call MCP `confirm_mint_fee` with `{obligation_id, fee_tx_hash, recipient_tx_hash}` (same hash for both when batched).
6. Verify with `get_token_balance` (`current` / `total_earned`). Off-chain ledger balance stays 0 until confirm succeeds.

Purchase-driven alternative: MCP `earn_points` (same fee model).

## Fees

Mint fee is a separate mint of the merchant's own loyalty tokens to the platform wallet (not USDC). Free plan default 1.25%; Pro 0.5%; Enterprise 0.25%. Five or more unpaid obligations older than 60 minutes block further mints (`fee_obligations_unpaid`). List debts with `list_fee_obligations`, settle, then confirm.

## Safety

- Never invent fee amounts; use the tool response.
- Do not re-deploy if `tx-receipt` is pending; poll.
- Keys and private keys never belong in the repo or chat.
