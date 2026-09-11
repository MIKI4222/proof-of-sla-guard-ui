# Proof of SLA Guard

On-chain uptime (SLA) insurance on GenLayer. A provider locks collateral, a client reports a failing
endpoint, and GenLayer AI validators fetch that endpoint themselves to decide the claim. When the
outage is confirmed by consensus, compensation is paid instantly from the provider's fund — no
oracle, no support ticket, no human arbiter.

## Live deployment

| Item | Value |
| --- | --- |
| Contract | `0xF05D822Bd4c2F18b8452ce6086f77070CAdfbE10` |
| Explorer | https://explorer-bradbury.genlayer.com/address/0xF05D822Bd4c2F18b8452ce6086f77070CAdfbE10 |
| Network | GenLayer Bradbury Testnet, chain id `41234` |
| RPC | `https://bradbury.genlayer.fastnode.io` |
| Compensation | `10000000000000000` wei (0.01 GEN) per confirmed outage |

Verified against the live deployment: `https://httpbin.org/status/500` is approved with an 0.01 GEN
payout and `status_code: 500`, while `https://httpbin.org/status/200` is rejected with no payout.

## Pages

The dApp is split by task rather than crammed into one dashboard:

| Route | Purpose |
| --- | --- |
| `/` | Overview: fund, payouts, claim counters, settlement flow, recent claims |
| `/report` | Report Outage: claim form, quick test endpoints, live validator stepper, verdict |
| `/policies` | Policies: buy coverage with a premium or grant it as the provider |
| `/claims` | Claims: full history with status filters, endpoint search, pagination |
| `/claims/:id` | Claim detail: validator reasoning, status code, payout, claimant, explorer link |
| `/provider` | Fund: deposit and withdraw insurance capital |
| `/provider/services` | Monitoring: endpoints covered by the policy |
| `/provider/settings` | Settings: compensation size and the pause circuit breaker |
| `/about` | How it works: architecture, verdict rules, verification runs, known limits |

The claim stepper follows the real pipeline: `Sending Tx -> GenLayer AI Validators Inspecting Web
Endpoint -> Consensus Reached -> Payout Dispatched`.

## Stack

- **Contract**: Python Intelligent Contract (`genlayer` SDK), `DynArray` state with JSON blobs,
  `gl.nondet.web.request` inside `gl.eq_principle.strict_eq`, payouts via `emit_transfer`.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, React Router.
- **Web3**: `genlayer-js` against Bradbury Testnet, MetaMask for signing.

## Local development

```bash
npm install
cp .env.example .env      # already filled with the live contract address
npm run dev               # http://localhost:5173
```

Add Bradbury Testnet to MetaMask (the app offers to do it automatically): RPC
`https://bradbury.genlayer.fastnode.io`, chain id `41234`, symbol `GEN`.

## Environment variables

| Variable | Value |
| --- | --- |
| `VITE_CONTRACT_ADDRESS` | `0xF05D822Bd4c2F18b8452ce6086f77070CAdfbE10` |
| `VITE_GENLAYER_RPC` | `https://bradbury.genlayer.fastnode.io` |
| `VITE_CHAIN_ID` | `41234` |

Vite inlines these at build time, so after changing them on Netlify use **Deploys → Trigger deploy →
Clear cache and deploy site**.

## Deploy to Netlify

Build command `npm run build`, publish directory `dist`. SPA routing is handled by `netlify.toml`
and `public/_redirects`, which is required for the deep links above to work on reload.

## Demo script

1. Connect the provider wallet, open `/provider`, deposit 1 GEN.
2. Add a monitored endpoint on `/provider/services`.
3. Switch to a second MetaMask account, open `/report`, pick the `500 Internal Error` quick endpoint
   and submit. Watch the stepper reach `Payout Dispatched`.
4. Repeat with `200 Healthy` to show a rejected claim with no payout.
5. Open `/claims` and then a single claim to show the stored on-chain verdict.

## Project layout

```
contracts/sla_guard.py        Intelligent Contract (v3.2, deployed)
src/config/genlayer.ts        network, method names, shared types
src/lib/contract.ts           the only genlayer-js integration point
src/lib/format.ts             wei/GEN conversion and address helpers
src/lib/appContext.tsx        wallet + contract state shared across pages
src/hooks/useWallet.ts        MetaMask connection and network switching
src/hooks/useSlaGuard.ts      reads, writes and claim settlement
src/components/layout/        sidebar, topbar, breadcrumbs, app shell
src/components/ui/            stat cards, badges, table, stepper, toasts, dialogs
src/pages/                    one file per task-focused page
```

## License

MIT
