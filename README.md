# Qoneqt VideoForge

Autonomous AI Video Production & Reliability Engine

## Project Goal

Build an actual production-style AI video generation pipeline for the Qoneqt Global Feed.

The system accepts:
- Topic / Prompt / Idea / Trend

And transforms it into:
- Topic → Story → Hook + Script → Scene DAG → Distributed generation jobs → Image / Video / Audio generation → Model routing → Assembly → AI Video QA → Self-healing retry → Final publish-ready video

## Architecture

```
QONEQT INPUT
    ↓
STORY DIRECTOR (LangGraph + LLM)
    ↓
SCENE DAG (structured JSON)
    ↓
ORCHESTRATION LAYER (BullMQ + Redis)
    ↓
┌──────────┼──────────┐
↓          ↓          ↓
IMAGE    VIDEO      AUDIO
WORKER   WORKER     WORKER
    ↓
MODEL ROUTER
  ↙          ↘
WAN 2.1      LTX
ComfyUI     fallback
    ↓
ASSEMBLER (FFmpeg/Remotion)
    ↓
AI VIDEO QA
   ↙           ↘
PASS           FAIL
 ↓               ↓
PUBLISH    SELF-HEAL ENGINE
```

## Repository Structure

```
apps/
  web/          # Next.js dashboard
  
services/
  orchestrator/ # Job orchestration
  story-director/ # LangGraph + LLM
  model-router/   # Model selection
  image-worker/   # Image generation
  video-worker/   # Video generation
  audio-worker/   # Audio generation
  assembly-worker/ # FFmpeg assembly
  qa-worker/      # Quality assurance
  cache-service/  # Semantic caching

packages/
  database/     # Prisma schema
  queue/        # BullMQ configuration
  types/        # Shared TypeScript types
  prompts/      # LLM prompt templates
  storage/      # MinIO abstraction
  observability/ # Logging & metrics

infra/
  docker-compose.yml # PostgreSQL, Redis, MinIO
```

## Quick Start

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- MinIO

### Installation

```bash
npm install
```

### Start Infrastructure

```bash
npm run docker:up
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- MinIO on `localhost:9000` (console: `localhost:9001`)

### Setup Database

```bash
cd services/api
cp .env.example .env.local
npm run db:push
```

### Start API

```bash
cd services/api
npm run dev
```

API will start on `http://localhost:3000`

### Health Checks

```bash
# Overall health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db

# Redis health
curl http://localhost:3000/health/redis

# Queue health
curl http://localhost:3000/health/queues
```

## Environment Configuration

See `.env.example` for all available configuration options.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`
- `MINIO_HOST`, `MINIO_PORT`, `MINIO_USER`, `MINIO_PASSWORD`
- `API_PORT`
- `LLM_PROVIDER`, `ANTHROPIC_API_KEY`

## Database Schema

### Core Tables

- **VideoProject**: Top-level project metadata
- **Story**: Generated story for a project
- **Scene**: Individual scene in a story
- **GenerationJob**: A single generation task (image/video/audio)
- **Artifact**: Generated binary asset (stored in MinIO)
- **RetryAttempt**: Semantic retry history
- **QualityEvaluation**: QA results per artifact
- **Worker**: Worker instance status
- **Model**: Model registry
- **CacheEntry**: Semantic cache entries

See `services/api/prisma/schema.prisma` for full details.

## Development Workflow

### Typecheck all packages

```bash
npm run typecheck
```

### Build all packages

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Lint code

```bash
npm run lint
```

### View database

```bash
cd services/api
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Fastify (HTTP)
- PostgreSQL (database)
- Prisma (ORM)
- Redis (cache & queues)
- BullMQ (job orchestration)

**AI:**
- LangGraph (story director)
- Anthropic Claude (LLM)
- ComfyUI (image/video generation)
- Wan 2.1 (primary video model)
- LTX (fallback video)

**Media:**
- FFmpeg (video assembly)
- Remotion (motion graphics)
- Whisper (transcription)

**Storage:**
- MinIO (S3-compatible API)

**Frontend:**
- Next.js + TypeScript
- Tailwind CSS
- shadcn/ui

## Queue System

BullMQ queues:
- `story` - Story generation
- `image` - Image generation
- `video` - Video generation
- `audio` - Audio generation
- `assembly` - Video assembly
- `qa` - Quality assurance
- `retry` - Semantic retries
- `publish` - Publish ready
- `dead-letter` - Failed jobs

Priority levels: 1 (urgent) to 10 (low)

## Phase Implementation

- **Phase 1**: ✓ Infrastructure, PostgreSQL, Redis, MinIO, API, database
- **Phase 2**: Story Director, LangGraph, structured scene JSON
- **Phase 3**: BullMQ, video worker, ComfyUI, Wan, MinIO artifact storage
- **Phase 4**: Assembly, FFmpeg, audio, Whisper, final video
- **Phase 5**: QA, quality scoring, failure classification
- **Phase 6**: Semantic Retry, Model Router, LTX fallback
- **Phase 7**: Semantic Cache, Idempotency, Worker heartbeat, DLQ
- **Phase 8**: Dashboard, Observability, Demo flow

## Troubleshooting

### PostgreSQL connection refused

Ensure Docker container is running:
```bash
docker ps | grep postgres
npm run docker:up
```

### Redis connection refused

```bash
npm run docker:logs
# Check redis container logs
```

### MinIO console not accessible

Ensure all containers are healthy:
```bash
docker-compose -f infra/docker-compose.yml ps
```

## Contributing

This is a hackathon project. Follow the implementation strategy:
1. Inspect repository structure
2. Determine what already exists
3. Do not duplicate functionality
4. Keep changes modular
5. After each phase, run tests/typecheck/lint
6. Do not silently change architecture

## License

MIT
