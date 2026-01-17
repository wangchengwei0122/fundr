# Fundr Multi-Environment Configuration and Isolation Spec

## 1. Architecture Overview

- Frontend (Next.js App Router)
  - Only consumes data from Edge or API.
  - Must not read blockchain, DB, or Indexer directly.
- Edge (Cloudflare Worker / Edge Service)
  - Read-through cache and CDN-style acceleration.
  - Calls API only; no blockchain access; no DB access.
- API (Fastify)
  - Reads from DB only.
  - Must not listen to blockchain.
- Indexer (Node.js / viem)
  - The only chain reader.
  - Writes to DB; no public HTTP endpoints.
- Database (Postgres / SQLite / KV)
  - Source of truth for app data.
  - API is the only reader; Indexer is the only writer.
- Blockchain (anvil / sepolia / mainnet)
  - Data source; only Indexer reads it.

## 2. Multi-Environment Isolation Principles

Environment matrix (fixed):

| Environment | Chain | Indexer | DB | API | Edge |
|---|---|---|---|---|---|
| local | anvil (31337) | local indexer | local DB | local API | local edge |
| test | sepolia | test indexer | test DB | test API | test edge |
| prod | mainnet | prod indexer | prod DB | prod API | prod edge |

Hard isolation rules:

- Forbidden: local connecting to test/prod DB.
- Forbidden: test connecting to prod DB.
- Forbidden: prod connecting to test/local DB.
- Forbidden: Edge calling cross-environment API.
- Forbidden: Frontend direct access to DB/Indexer.
- Forbidden: API reading chain RPC.
- Forbidden: Indexer exposed to Frontend/Edge.

## 3. Environment Variable Specifications by Sub-Project

Legend:
- Public: browser-visible (NEXT_PUBLIC_*)
- Server-only: not exposed to browser
- Cross-env access: allowed or forbidden

### 3.1 Frontend (Next.js)

| Variable | Purpose | Public | Env Variation | Cross-Env Access |
|---|---|---|---|---|
| NEXT_PUBLIC_API_BASE_URL | API base URL for web | Yes | local/test/prod | No |
| NEXT_PUBLIC_EDGE_BASE_URL | Edge base URL for web | Yes | local/test/prod | No |

Rules:

- Must: use NEXT_PUBLIC_* only in Frontend.
- Forbidden: Frontend uses DB, Indexer, or chain RPC variables.
- Forbidden: NEXT_PUBLIC_* used in API/Indexer/Edge.

Examples:

```env
# apps/web/.env.local (local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_EDGE_BASE_URL=http://localhost:8787
```

```env
# apps/web/.env.test (test)
NEXT_PUBLIC_API_BASE_URL=https://api-test.fundr.xyz
NEXT_PUBLIC_EDGE_BASE_URL=https://edge-test.fundr.xyz
```

```env
# apps/web/.env.prod (prod)
NEXT_PUBLIC_API_BASE_URL=https://api.fundr.xyz
NEXT_PUBLIC_EDGE_BASE_URL=https://edge.fundr.xyz
```

### 3.2 Edge (Cloudflare Worker)

| Variable | Purpose | Public | Env Variation | Cross-Env Access |
|---|---|---|---|---|
| API_BASE_URL | API base URL for Edge | No | local/test/prod | No |
| EDGE_CACHE_TTL | Cache TTL seconds | No | per environment | Yes |
| EDGE_ENV | Environment label | No | local/test/prod | Yes |

Rules:

- Must: Edge calls only same-environment API.
- Forbidden: Edge reads chain RPC.
- Forbidden: Edge reads DB.

Examples:

```env
# apps/edge/.dev.vars (local)
API_BASE_URL=http://localhost:3001
EDGE_CACHE_TTL=30
EDGE_ENV=local
```

```env
# apps/edge/.env.test (test)
API_BASE_URL=https://api-test.fundr.xyz
EDGE_CACHE_TTL=60
EDGE_ENV=test
```

```env
# apps/edge/.env.prod (prod)
API_BASE_URL=https://api.fundr.xyz
EDGE_CACHE_TTL=120
EDGE_ENV=prod
```

### 3.3 API (Fastify)

| Variable | Purpose | Public | Env Variation | Cross-Env Access |
|---|---|---|---|---|
| DATABASE_URL | DB connection string | No | local/test/prod | No |
| API_PORT | Port to bind | No | per environment | Yes |
| API_ENV | Environment label | No | local/test/prod | Yes |

Rules:

- Must: read from DB only.
- Forbidden: API reads blockchain.
- Forbidden: API connects to cross-environment DB.

Examples:

```env
# apps/api/.env.local
DATABASE_URL=postgres://local_user:local_pass@localhost:5432/fundr_local
API_PORT=3001
API_ENV=local
```

```env
# apps/api/.env.test
DATABASE_URL=postgres://test_user:test_pass@db-test.internal:5432/fundr_test
API_PORT=3001
API_ENV=test
```

```env
# apps/api/.env.prod
DATABASE_URL=postgres://prod_user:prod_pass@db-prod.internal:5432/fundr_prod
API_PORT=3001
API_ENV=prod
```

### 3.4 Indexer (Node.js)

| Variable | Purpose | Public | Env Variation | Cross-Env Access |
|---|---|---|---|---|
| CHAIN_RPC_WSS | Chain WS RPC | No | local/test/prod | No |
| CHAIN_ID | Chain ID | No | 31337/11155111/1 | No |
| DATABASE_URL | DB connection string | No | local/test/prod | No |
| INDEXER_ENV | Environment label | No | local/test/prod | Yes |

Rules:

- Must: write to DB only.
- Forbidden: Indexer exposed to Frontend/Edge.
- Forbidden: Indexer connects to cross-environment RPC or DB.

Examples:

```env
# apps/indexer/.env.local
CHAIN_RPC_WSS=ws://127.0.0.1:8545
CHAIN_ID=31337
DATABASE_URL=postgres://local_user:local_pass@localhost:5432/fundr_local
INDEXER_ENV=local
```

```env
# apps/indexer/.env.test
CHAIN_RPC_WSS=wss://sepolia.infura.io/ws/v3/xxx
CHAIN_ID=11155111
DATABASE_URL=postgres://test_user:test_pass@db-test.internal:5432/fundr_test
INDEXER_ENV=test
```

```env
# apps/indexer/.env.prod
CHAIN_RPC_WSS=wss://mainnet.infura.io/ws/v3/xxx
CHAIN_ID=1
DATABASE_URL=postgres://prod_user:prod_pass@db-prod.internal:5432/fundr_prod
INDEXER_ENV=prod
```

### 3.5 Database (Postgres / SQLite / KV)

| Variable | Purpose | Public | Env Variation | Cross-Env Access |
|---|---|---|---|---|
| DATABASE_URL | DB connection string | No | local/test/prod | No |
| DB_ENV | Environment label | No | local/test/prod | Yes |

Rules:

- Must: only Indexer writes; only API reads.
- Forbidden: Frontend/Edge direct DB access.
- Forbidden: cross-environment connections.

## 4. Typical Configuration Examples by Environment

### Local

```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_EDGE_BASE_URL=http://localhost:8787

# Edge
API_BASE_URL=http://localhost:3001
EDGE_ENV=local

# API
DATABASE_URL=postgres://local_user:local_pass@localhost:5432/fundr_local
API_ENV=local

# Indexer
CHAIN_RPC_WSS=ws://127.0.0.1:8545
CHAIN_ID=31337
DATABASE_URL=postgres://local_user:local_pass@localhost:5432/fundr_local
INDEXER_ENV=local
```

### Test

```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api-test.fundr.xyz
NEXT_PUBLIC_EDGE_BASE_URL=https://edge-test.fundr.xyz

# Edge
API_BASE_URL=https://api-test.fundr.xyz
EDGE_ENV=test

# API
DATABASE_URL=postgres://test_user:test_pass@db-test.internal:5432/fundr_test
API_ENV=test

# Indexer
CHAIN_RPC_WSS=wss://sepolia.infura.io/ws/v3/xxx
CHAIN_ID=11155111
DATABASE_URL=postgres://test_user:test_pass@db-test.internal:5432/fundr_test
INDEXER_ENV=test
```

### Prod

```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.fundr.xyz
NEXT_PUBLIC_EDGE_BASE_URL=https://edge.fundr.xyz

# Edge
API_BASE_URL=https://api.fundr.xyz
EDGE_ENV=prod

# API
DATABASE_URL=postgres://prod_user:prod_pass@db-prod.internal:5432/fundr_prod
API_ENV=prod

# Indexer
CHAIN_RPC_WSS=wss://mainnet.infura.io/ws/v3/xxx
CHAIN_ID=1
DATABASE_URL=postgres://prod_user:prod_pass@db-prod.internal:5432/fundr_prod
INDEXER_ENV=prod
```

## 5. Startup and Deployment Guidance

Local:

- Must: start DB -> Indexer -> API -> Edge -> Frontend.
- Recommended: use pnpm dev with .env.local files.

Test:

- Must: deploy Indexer (sepolia) first and complete sync, then API, Edge, Frontend.
- Recommended: separate CI/CD and secrets for test.

Prod:

- Must: complete mainnet Indexer sync, then API, Edge, Frontend.
- Recommended: enforce access through Edge domain; block direct API access from public.

## 6. Common Misconfigurations and Risks

- Risk: local Indexer connects to prod DB.
  - Impact: production data pollution.
  - Forbidden.
- Risk: test Edge calls prod API.
  - Impact: test traffic writes/reads in prod.
  - Forbidden.
- Risk: Frontend reads RPC directly.
  - Impact: breaks single-source-of-truth model.
  - Forbidden.
- Risk: API points to wrong environment DB.
  - Impact: data mismatch and incorrect views.
  - Forbidden.

## 7. Environment Consistency Self-Check Plan

Recommended startup checks:

- Indexer: verify CHAIN_ID matches INDEXER_ENV.
- API: verify DATABASE_URL host matches API_ENV allowlist.
- Edge: verify API_BASE_URL matches EDGE_ENV.
- Frontend: verify NEXT_PUBLIC_* include environment tag.

Example check (pseudo-code):

```ts
// apps/indexer/src/bootstrap/env-guard.ts
const env = process.env.INDEXER_ENV;
const chainId = Number(process.env.CHAIN_ID);

const expected = { local: 31337, test: 11155111, prod: 1 } as const;

if (expected[env as keyof typeof expected] !== chainId) {
  throw new Error(`[env-guard] CHAIN_ID mismatch for ${env}`);
}
```

## Required Constraints (Must Not Omit)

- Indexer can only write DB, and must not be called by Frontend or Edge.
- API reads DB only and must not listen to chain.
- Edge can only access same-environment API.
- Frontend must not access DB or Indexer directly.
- Local environment must never connect to test/prod DB.
- NEXT_PUBLIC_* variables are for Frontend only.
