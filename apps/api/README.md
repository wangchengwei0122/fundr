# Fastify API (apps/api)

`apps/api` is the single source of truth for all read traffic in the Web3 Kickstarter demo. It sits on top of PostgreSQL, exposes REST endpoints for campaigns/creators/stats, and is consumed by both `apps/edge` and `apps/web`.

## Responsibilities

- Reads normalized data from PostgreSQL using the shared Drizzle schema (`packages/db`).
- Serves paginated/sorted campaign lists, campaign detail views, creator portfolio data, and summary statistics.
- Configures CORS, error handling, and environment-driven ports while keeping the stack lightweight (TypeScript + Fastify + TSX watch for dev).

## Available endpoints

- `GET /projects` – list campaigns with optional `page`, `limit`, and `sort` (`latest` | `deadline`).
- `GET /projects/:address` – fetch a single campaign plus derived status flags.
- `GET /creator/:address` – list projects created by a specific wallet.
- `GET /stats` – overall campaign metrics, including totals and status breakdowns.

Every route returns a consistent `SuccessResponse` envelope so clients can unwrap `data` predictably.

## Environment

- `DATABASE_URL` (required) – connection string for PostgreSQL (Supabase-friendly).
- `PORT` (optional, default `3001`) – server port for the API.
- `NODE_ENV` (optional, defaults to `development`) – controls logging/level.
- `CORS_ORIGIN` (optional, defaults to `*`) – fastify-cors origin policy.

Place these variables in `.env` or inject them through your deployment platform before starting the server.

## Development & deployment

```bash
pnpm --filter @apps/api dev          # TSX watch mode for development
pnpm --filter @apps/api build        # Compile to dist/
pnpm --filter @apps/api start        # Run the compiled build
```

Linting is handled at the workspace level, but you can run `pnpm --filter @apps/api lint` if needed.

## Schema & migrations

`apps/api` imports `packages/db` for the `campaigns` and `checkpoints` tables plus shared migrations. When the schema changes (e.g., after indexer updates), regenerate and push migrations via:

1. `pnpm db:generate` – create migration files.
2. `pnpm db:push` – push the schema to your development database.

## Operational notes

- The API never watches blockchain events—`apps/indexer` owns that responsibility.
- `apps/edge` and `apps/web` rely on this service for every read; keep the API fast with indexes on the `campaigns` table and caching in `apps/edge`.
- For production deployments, build the API (`pnpm --filter @apps/api build`) and host it behind a load balancer or serverless container.
