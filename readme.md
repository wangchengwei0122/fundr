# Fundr

A decentralized crowdfunding platform built on Web3 with an indexer-first data architecture.

**Live Demo**: [https://fundr-web.vercel.app/](https://fundr-web.vercel.app/)

## Overview

Fundr is a complete Web3 crowdfunding data stack with the following core components:

- **Indexer-first data sourcing** - Chain data indexing via `apps/indexer` and Drizzle ORM
- **Fastify API** - Single source of truth for frontend and edge cache
- **Cloudflare Edge Worker** - Caching layer between API and Next.js UI
- **Next.js 15 Frontend** - App Router implementation that never interacts with blockchain directly

## Architecture

Data flow: `Blockchain → apps/indexer (viem) → PostgreSQL (packages/db) → apps/api (Fastify + Drizzle) → apps/edge (Cloudflare KV) → apps/web (Next.js 15)`

Core principles:

- `apps/web` and `apps/edge` only read from `apps/api`
- Only `apps/indexer` interacts with the blockchain
- API layer is the single data source for frontend and edge

## Modules

- **apps/indexer** - WebSocket indexing service that listens to on-chain events and writes to PostgreSQL. Includes batching, retry/backoff, checkpoints, and periodic refresh mechanisms
- **packages/db** - Shared Drizzle database schema (campaigns + checkpoints) ensuring data consistency between indexer and API
- **apps/api** - Fastify REST API that wraps Drizzle queries, provides filtering/pagination, and serves as the single data source for frontend and edge
- **apps/edge** - Cloudflare Worker that proxies API requests, implements KV read-through caching, keeping logic minimal (no blockchain access)
- **apps/web** - Next.js 15 frontend using React Query + wagmi + viem for wallet interactions, all data reads go through Edge Worker
- **packages/contracts** - Foundry smart contracts with ABI outputs synchronized across the workspace
- **scripts/** - Helper scripts for ABI/address sync, database migrations, deployments, and environment configuration

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Start Development Environment

```bash
pnpm dev
```

`pnpm dev` starts the full stack. You can also start individual services:

- `pnpm dev:web` - Start Next.js frontend
- `pnpm dev:edge` - Start Cloudflare Worker (wrangler dev)
- `pnpm --filter @apps/api dev` - Start Fastify API server
- `pnpm --filter @apps/indexer dev` - Start crowdfunding indexer

### Environment Variables

Ensure the following environment variables are consistent across services:

- `DATABASE_URL` - PostgreSQL database connection string
- `NEXT_PUBLIC_EDGE` - Edge Worker URL
- `NEXT_PUBLIC_FACTORY` - CampaignFactory contract address
- `NEXT_PUBLIC_RPC_URL` - Blockchain RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID
- `NEXT_PUBLIC_DEPLOY_BLOCK` - Contract deployment block number

## Core Features

- **Real-time synced campaigns** - Indexer listens for `CampaignCreated` events, extracts goal/deadline, and writes data to `campaigns` and `checkpoints` tables
- **Edge caching layer** - Cloudflare Worker provides KV read-through caching for faster UI loads
- **Modern frontend** - Next.js 15 App Router with server components, Tailwind CSS, React Query, wagmi, and viem
- **Smart contracts & tooling** - Foundry contracts and scripts ensure ABI/address deployment synchronization

## Development Guide

### Smart Contracts

```bash
# Run tests
pnpm --filter @packages/contracts test
# or
forge test

# Build contracts
pnpm contracts:build

# Deploy locally
pnpm contracts:deploy:local:auto

# Deploy to Sepolia
pnpm contracts:deploy:sepolia
```

### Database Migrations

```bash
# Generate migration files
pnpm db:generate

# Push migrations to database
pnpm db:push
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, wagmi, viem
- **Backend**: Fastify, Drizzle ORM, PostgreSQL
- **Indexer**: Node.js, viem (WebSocket), Drizzle ORM
- **Edge**: Cloudflare Workers, KV
- **Smart Contracts**: Foundry, Solidity 0.8.30
- **Tooling**: pnpm workspaces, TypeScript
