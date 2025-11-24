# Web3 Kickstarter Portfolio

This repo is my interview-grade proof of building a full Web3 data stack:
- **Indexer-first data sourcing** powered by `apps/indexer` and Drizzle.
- **Fastify API** that is the single source of truth for the UI and edge cache.
- **Cloudflare Edge worker** that sits between the API and the Next.js UI for cache-friendly delivery.
- **Next.js 15 App Router frontend** that never talks to the blockchain directly.

## Why this demo?
- Demonstrates a multi-service, pnpm workspace architecture while keeping web/edge clients strictly read-only.
- Highlights how I wired an end-to-end flow around campaigns, checkpoints, pagination, sorting, caching, and metadata pinning.
- Shows discipline around tooling (Foundry contracts, Drizzle schema, viem + wagmi, Wrangler, and reproducible scripts for ABI/address sync).

## Architecture at a glance

`Blockchain → apps/indexer (viem) → PostgreSQL (packages/db) → apps/api (Fastify + Drizzle) → apps/edge (Cloudflare KV cache) → apps/web (Next.js 15 App Router)`

Every outward-facing client—`apps/web` and `apps/edge`—only reads from `apps/api`, and only `apps/indexer` ever touches the blockchain.

## Module guide

- **apps/indexer** – WebSocket-indexed campaign and checkpoint ingestion that writes clean, normalized rows to PostgreSQL. Includes batching, retry/backoff, checkpoints, and periodic refreshes.
- **packages/db** – Shared Drizzle schema (campaigns + checkpoints) so the indexer and API always stay in sync.
- **apps/api** – Fastify REST API that wraps Drizzle queries, offers filtering/pagination, and is the single data source for frontend + edge.
- **apps/edge** – Cloudflare Worker that proxies to the API, implements KV read-through caching, and keeps logic intentionally thin (no blockchain access).
- **apps/web** – Next.js 15 UI that uses React Query + wagmi + viem for wallet interactions and relies on the Edge worker for all reads.
- **packages/contracts** – Foundry contracts plus scripts whose ABI outputs are synchronized across the workspace so every consumer knows the deployed addresses.
- **scripts/** – Helpers for ABI/address sync, migrations, deployments, and environment setup.

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` orchestrates the full stack for local work. You can also target each slice individually:

1. `pnpm dev:web` – Start the Next.js frontend.
2. `pnpm dev:edge` – Run `wrangler dev` for the Cloudflare Worker.
3. `pnpm --filter @apps/api dev` – Start the Fastify API server.
4. `pnpm --filter @apps/indexer dev` – Launch the campaign indexer.

Ensure the shared environment variables (e.g., `DATABASE_URL`, `NEXT_PUBLIC_EDGE`, `NEXT_PUBLIC_FACTORY`, `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_DEPLOY_BLOCK`) stay consistent across services. The `scripts/` folder contains helpers for ABI/address sync and other deployment routines.

## Showcase summary

- **Live-synced campaigns** – Indexer listens for `CampaignCreated`, hydrates goal/deadline, checkpoints `campaigns` + `checkpoints`, and API enriches the response with creator metrics.
- **Edge caching layer** – Cloudflare Worker adds KV read-through caching so the UI loads fast while the API remains authoritative.
- **Modern frontend** – Next.js 15 App Router with server components, tailwind, React Query, wagmi, and viem for wallet interactions and metadata uploads.
- **Contracts + tooling** – Foundry + scripts keep ABI/address deployments in sync and drive deterministic builds for interviews.

## Next steps

1. Run `pnpm --filter @packages/contracts test` or `forge test` when touching contracts.
2. Push Drizzle schema updates with `pnpm db:generate` + `pnpm db:push`.
3. Deploy the API, edge worker, and indexer so you can demo the flow end-to-end.
