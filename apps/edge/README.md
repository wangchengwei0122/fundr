# Edge Worker (apps/edge)

`apps/edge` is a Cloudflare Worker that acts as a read cache in front of `apps/api`. It never touches the blockchain or database directly: instead, it fetches data from the Fastify API, optionally caches responses in KV, and returns API-style envelopes to the frontend.

## Responsibilities

- Proxy `GET /projects`, `GET /projects/:address`, `GET /creator/:address`, and `GET /stats` requests to `apps/api`.
- Implement read-through caching using Wrangler KV namespaces so the UI enjoys CDN-like response times.
- Centralize retries, timeouts, and CORS headers for every client without duplicating API logic.
- Serve as the default data gateway for `apps/web`, keeping the frontend shielded from raw API or RPC complexity.

## Development commands

- `pnpm dev:edge` – runs `wrangler dev --local` and watches `src` for TypeScript changes.
- `pnpm --filter @apps/edge lint` – run `wrangler lint`.
- `pnpm --filter @apps/edge typecheck` – run `tsc --noEmit`.
- `pnpm deploy:edge` – deploys the worker via `wrangler deploy`.
- `pnpm edge:kv:create` / `pnpm edge:kv:create:preview` – create KV namespaces used for caching.

## Environment & configuration

- `wrangler.jsonc` defines bindings to KV namespaces, secrets, and routes. Keep API base URLs consistent with `apps/api`.
- The worker relies on the `API_URL` binding (defined in `wrangler.jsonc`) so it knows where to forward requests to `apps/api`.
- KV caching keys use campaign addresses or pagination fingerprints so updates can be invalidated when the indexer writes new blocks.

## Deployment notes

- Deploy the edge worker after the API is live; it expects the API to already expose campaign data.
- Keep KV namespaces simple: one namespace for campaign lists and one for detail pages is usually enough for this demo.
- Monitor build output (`wrangler dev`) when you add new routes to ensure the worker stays in sync with `apps/api`.
