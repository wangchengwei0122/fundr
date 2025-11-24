# Next.js Web App (apps/web)

This Next.js 15 App Router client is the frontend layer of the Web3 Kickstarter demo. It is built with TypeScript, Tailwind (v4), React Query, viem, and wagmi, and it only renders data provided by `apps/edge`/`apps/api`.

## Key features

- Progressive UI backed by server components and React Query hooks (`useUserCampaigns`, `useCampaigns`, etc.).
- Wallet-friendly wiring with wagmi connectors, viem helpers, pinata-backed metadata uploads, and optional WalletConnect hooks.
- Visual polish from Radix UI primitives and animation helpers while maintaining responsive layouts for the campaign gallery and detail cards.
- Relies on `apps/edge` for all read traffic so the frontend never touches the database or blockchain directly.

## Data flow

The UI fetches campaign summaries, creator stats, and real-time updates through the Cloudflare Edge worker (`NEXT_PUBLIC_EDGE`), which in turn proxies to `apps/api`. Wallet interactions (read-only) lean on viem and wagmi for RPC support, while campaign metadata lives on Pinata via `NEXT_PUBLIC_GATEWAY_URL`.

## Environment variables

- `NEXT_PUBLIC_EDGE` – base URL of the Edge worker (defaults to `http://127.0.0.1:8787` when developing).
- `NEXT_PUBLIC_RPC_URL` / `NEXT_PUBLIC_CHAIN_ID` – used by realtime helpers and viem/wagmi transports when the UI needs to resolve chain context.
- `NEXT_PUBLIC_FACTORY` – campaign factory address; required for fetching ABI-driven timers/rocket data.
- `NEXT_PUBLIC_DEPLOY_BLOCK` – first block to check when computing checkpoints and deadlines.
- `NEXT_PUBLIC_SAMPLE_CAMPAIGN` – optional campaign address used for fast previews.
- `NEXT_PUBLIC_GATEWAY_URL` – Pinata gateway URL to resolve uploaded metadata.
- `NEXT_PUBLIC_WC_PROJECT_ID` – uncommented WalletConnect support if you enable the connector (currently unused by default).

Set these variables in `.env.local` (or the hosting platform’s environment setup) to match the API/edge stack you are running.

## Development commands

- `pnpm dev:web` – Start Next.js with Turbopack for hot feedback.
- `pnpm --filter @apps/web build` – Compile the app for production.
- `pnpm --filter @apps/web start` – Run the optimized build.
- `pnpm --filter @apps/web lint` – Run ESLint with the shared config.

## Tips

- Keep `NEXT_PUBLIC_EDGE` pointed to `apps/edge` during local work to benefit from KV caching and shared CORS policies.
- The `app/` directory wires routes with server and client components; check `app/create`, `app/project`, and `app/(marketing)` for how data fetching is layered.
- `lib/abi` is kept in sync with `packages/contracts`, so updating contracts means running the scripts in `scripts/` that copy ABI/address pairs into this folder.
