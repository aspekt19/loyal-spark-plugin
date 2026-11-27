# Marketplace submission fields

Copy these into https://cursor.com/marketplace/publish and https://x.ai/bot/marketplace/submit-a-plugin. Founder: Yuri Gerasimov (GitHub `aspekt19`, X `@gerassyk`). Project X: `@Loyal_Spark`.

## Shared identity

| Field | Value |
| --- | --- |
| First name | Yuri |
| Last name | Gerasimov |
| Work email | admin@loyalspark.online |
| Organization name | Loyal Spark |
| Organization handle | loyalspark |
| Website | https://loyalspark.online |
| GitHub repository | https://github.com/aspekt19/loyal-spark-plugin |
| Logo URL (1:1 PNG) | https://raw.githubusercontent.com/aspekt19/loyal-spark-plugin/main/assets/logo.png |
| Support contact | admin@loyalspark.online |
| Founder X | https://x.com/gerassyk (`@gerassyk`) |
| Project X | https://x.com/Loyal_Spark (`@Loyal_Spark`) |
| Privacy | https://loyalspark.online/privacy |
| Terms | https://loyalspark.online/terms |
| List on | Grok Bot and Cursor (and Grok when available) |

## Short description (form "brief description")

Onchain loyalty on Base for merchants and AI agents. Connects merchant (`lsk_`) and holder (`rwk_`) MCP servers so agents can deploy B20 loyalty tokens, register programs, create rewards, mint, and redeem.

## Long description (README / Cursor details)

Loyal Spark is onchain loyalty infrastructure on Base L2 (https://loyalspark.online, X @Loyal_Spark). This plugin packages:

- Merchant MCP: `https://api.loyalspark.online/loyalty-mcp` (43 tools, optional `lsk_` key)
- Holder MCP: `https://api.loyalspark.online/recipient-loyalty-mcp` (20 tools, optional `rwk_` key)
- Agent skills for getting keys (x402 $0.01 or SIWE), creating programs, minting, rewards, workflows, and holder flows

Transport is Streamable HTTP, protocol `2025-06-18`. Auth is only via `x-api-key` or `Authorization: Bearer`. `initialize` and `tools/list` work without a key. Transactions are prepared as unsigned calldata; the user's wallet signs and pays Base gas.

## Categories / keywords

Suggested: developer tools, MCP, web3, loyalty, Base, agents, rewards, x402.

Plugin keywords (already in manifest): `loyalty`, `base`, `b20`, `mcp`, `x402`, `rewards`, `merchants`, `agents`, `web3`, `loyal-spark`.

## MCP server URLs (if the form asks for a single URL)

Primary (merchant): `https://api.loyalspark.online/loyalty-mcp`

Secondary (holder): `https://api.loyalspark.online/recipient-loyalty-mcp`

Prefer submitting the **GitHub repository** so both servers and skills ship together.

## Testing instructions (free / low-cost path)

Reviewers can verify discovery without a paid key, then optionally issue a Free plan merchant key for $0.01 USDC on Base.

### Keyless checks (required)

1. Install the plugin from this repo, or add both MCP URLs as custom servers with empty headers.
2. Confirm `initialize` succeeds on both:
   - `https://api.loyalspark.online/loyalty-mcp`
   - `https://api.loyalspark.online/recipient-loyalty-mcp`
3. Call `tools/list` on each (no key). Expect about 43 merchant tools and 20 holder tools.
4. On the merchant server, call `get_platform_info` (keyless). Expect platform / endpoint metadata.
5. On the holder server, call `tools/list` again or a read-only discovery tool such as `bazaar_probe_x402` sparingly (rate limited).

### Optional Free plan key ($0.01 USDC on Base)

1. From a Base wallet with a little USDC and ETH for gas, `POST https://api.loyalspark.online/x402-gateway/register-agent` and complete the x402 payment.
2. Save the returned `lsk_...` key into plugin variable `LSK_KEY`.
3. Call `get_my_profile` or `get_program_workflow_status`.
4. Prompt examples:
   - "Using Loyal Spark, show platform info and list my loyalty programs."
   - "What are the next_actions to deploy a B20 loyalty program named Demo Rewards with symbol DEMO?"
   - Expect: workflow guidance using `generate_program_defaults` / `create_loyalty_program`; do **not** broadcast mainnet txs unless the reviewer intends to.

### Holder key (free SIWE)

1. `POST /siwe-nonce` → sign → `POST /recipient-api/register`.
2. Set `RWK_KEY` and call `get_recipient_profile` or `list_my_loyalty_balances`.

### Safety for reviewers

- Do not approve unsigned mint/deploy broadcasts unless testing on purpose.
- Destructive tools change production state on Base mainnet.
- Never paste live keys into the public submission form; use a disposable review key if needed.

## Cursor-specific checklist

- [x] `.cursor-plugin/plugin.json` present
- [x] `name` kebab-case: `loyal-spark`
- [x] `mcp.json` with `${LSK_KEY}` / `${RWK_KEY}` declared in `variables`
- [x] Skills with YAML frontmatter
- [x] Logo at `assets/logo.png`
- [x] README documents install and config
- [x] Contact / support email filled: admin@loyalspark.online
- [ ] Founder tests locally in Cursor and in Grok Bot, then ticks the form checkbox
- [ ] Founder adds GitHub topics (agent token lacked permission):  
  `gh repo edit aspekt19/loyal-spark-plugin --add-topic gemini-cli-extension --add-topic gemini-extension --add-topic mcp --add-topic cursor-plugin --add-topic loyalty --add-topic base`

## x.ai form checkbox text

> I've tested this plugin locally and in-app and confirmed it works as expected

Founder must complete real in-app testing before checking this.
