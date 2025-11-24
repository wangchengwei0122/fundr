# Campaign Indexer (apps/indexer)

`apps/indexer` is the only module that reads blockchain data in this workspace. It listens for `CampaignCreated` events via viem’s WebSocket transport, calls campaign contracts for summaries, and writes normalized rows to PostgreSQL through the shared Drizzle schema (`packages/db`).

## Key features

- WebSocket-friendly viem client with retry/backoff, batch RPC throttling, and automatic reconnection.
- Drizzle-powered writes to `campaigns` and `checkpoints` so the API and indexer share identical schema definitions.
- Checkpoint tracking allows restarting from the last processed block to avoid reprocessing historical data.
- Periodic re-syncs keep existing campaigns fresh (status, pledged totals, deadlines).
- Production readiness with structured pino logs, env guards, and optional Supabase SSL support.

## Data pipeline

1. `CampaignCreated` event is emitted on the blockchain.
2. Indexer grabs the event, loads the campaign contract, and calls `getSummary()`.
3. Campaign metadata is written to PostgreSQL (via `packages/db` schema).
4. `checkpoints` table is updated so restarts resume from the last block.
5. API (`apps/api`) reads from PostgreSQL, and Edge/Web clients consume the data.

## Environment variables

| Variable | Description | Required |
| --- | --- | --- |
| `RPC_HTTP` | RPC URL for the chain | ✅ |
| `CHAIN_ID` | Numeric Chain ID (e.g., `11155111` for Sepolia) | ✅ |
| `FACTORY` | Campaign factory address | ✅ |
| `DEPLOY_BLOCK` | First block to start scanning | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BLOCK_BATCH` | Number of blocks per batch (default `10`) | ⚪ |
| `RPC_DELAY_MS` | Milliseconds between RPC calls (default `100`) | ⚪ |
| `MAX_RETRIES` | RPC retry limit (default `3`) | ⚪ |
| `RETRY_DELAY_MS` | Delay between retries (default `1000`) | ⚪ |
| `UPDATE_INTERVAL_MS` | Interval to refresh existing campaigns (default `60000`) | ⚪ |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Set to `0` for self-signed RPC/Supabase | ⚪ |
| `DATABASE_SSL` | Enable SSL when connecting to Supabase | ⚪ |

Copy the example `.env.example` (if present) to `.env`, fill the required fields, and keep the values consistent with `apps/api`/`apps/web`.

## Local development

```bash
pnpm install
pnpm --filter @apps/indexer dev      # tsx watch with TLS flag
```

For a production-like run:

```bash
pnpm --filter @apps/indexer build
pnpm --filter @apps/indexer start
```

Use `pnpm --filter @apps/indexer migrate:push` after schema changes to keep your development database in sync.

## Operational notes

- The indexer only writes to PostgreSQL—it never serves HTTP. Keep it behind a process manager when running in production (Render, Fly, Docker, etc.).
- If RPC requests fail, the built-in retry loop will resubmit up to `MAX_RETRIES`, but stable nodes and a tuned `RPC_DELAY_MS` are recommended.
- The `checkpoints` table prevents duplicate work; you can inspect it to understand progress and resume at will.
- Logs are emitted via Pino and include configuration details on startup so you can audit the sync window.

## Deployment hints

- The Dockerfile at `apps/indexer/Dockerfile` builds a production image. Example:

```
docker buildx build --platform linux/amd64,linux/arm64 -t your-user/fundr-indexer:latest --push -f apps/indexer/Dockerfile .
fly deploy --image your-user/fundr-indexer:latest
```

- Keep `RPC_HTTP`, `DATABASE_URL`, and `FACTORY` locked in secret management so the indexer can reconnect safely.
