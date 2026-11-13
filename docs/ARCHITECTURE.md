# MindMate AI — System Architecture

| | |
|---|---|
| **Status** | Draft v0.2 |
| **Related** | `PRD.md`, `DESIGN.md`, `TASKS.md`, `AGENTS.md` |

---

## 1. Architecture Goals

1. **Secure by default:** secrets server-side only; RLS as the final authority on data access.
2. **Simple:** React SPA + Supabase + Edge Functions + Gemini. Nothing else.
3. **Integrated:** one data model shared by chat, memory, tools, RAG, and workspace.
4. **AI proposes, server disposes:** the model never executes anything; the server validates and acts.
5. **Operable by one person:** few moving parts, clear logs, easy rollback.

## 2. System Context

```
┌──────────────────────┐        ┌───────────────────────────────────────┐
│  Browser             │        │  Supabase                             │
│  React + Vite SPA    │        │                                       │
│  (hosted on Vercel)  │        │  Auth (JWT)                           │
│                      │ HTTPS  │  Postgres + RLS + pgvector            │
│  - supabase-js       │───────▶│  Edge Functions (Deno)  ──────────┐   │
│  - Auth session      │        │                                   │   │
│  - Reads via RLS     │        └───────────────────────────────────┼───┘
└──────────────────────┘                                            │ HTTPS (API key
                                                                    │ in function secrets)
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │ Google Gemini API│
                                                          │ chat · tools ·   │
                                                          │ embeddings       │
                                                          └──────────────────┘
```

**Trust boundaries**
- **Browser = untrusted.** Holds only the Supabase URL, anon key, and the user's JWT.
- **Edge Functions = trusted.** Hold the Gemini key; verify the JWT; use a user-scoped client.
- **Gemini = untrusted output.** Anything it returns (text, tool calls, JSON) is validated before use.
- **Database = last line of defense.** RLS enforces isolation even if application code has a bug.

## 3. Technology Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + Vite + JavaScript + Tailwind | Developer's existing skills; fast iteration |
| Auth | Supabase Auth | JWT integrates directly with RLS |
| DB | Supabase Postgres | Relational data + pgvector in one place |
| Vector search | pgvector (HNSW index) | No separate vector DB; joins with user data and RLS |
| Backend | Supabase Edge Functions (Deno/TypeScript) | Keeps secrets server-side; no separate server to host |
| LLM | Gemini (chat + function calling + embeddings) | Mandated by scope |
| Validation | Zod (shared schemas) | One schema language for tool args and structured output |
| Hosting | Vercel (frontend), Supabase (backend) | Zero-ops deploys |

**Explicitly rejected:** LangChain/LangGraph (unneeded abstraction), Redis (use Postgres for rate limits/queues), Python services (extra runtime), separate vector DB (pgvector suffices at this scale).

**Note on Edge Functions:** The runtime is Deno. Use `npm:`/`jsr:` specifiers or `esm.sh` imports for libraries such as Zod. Keep functions small and stateless.

## 4. Component Overview

### 4.1 Frontend (React SPA)

```
src/
  app/            routing, providers, auth guard
  features/
    chat/         conversation list, message view, composer, tool-confirmation cards
    memory/       memory list, edit/delete, pause toggle
    workspace/    notes, tasks, extraction review screen
    search/       RAG search page, source cards
  lib/
    supabase.js   client init (anon key only)
    api.js        wrappers for Edge Function calls (+ streaming)
  components/     shared UI
```

Rules:
- Reads of simple CRUD data (conversation list, notes, tasks, memories) go **directly to Supabase via RLS**. This is fast and simple.
- Anything involving Gemini, embeddings, tool execution, or multi-table writes goes through **Edge Functions**.
- No Gemini calls, no service-role key, no secrets in the frontend.
- All UI (colors, typography, components, page list, UI states) follows `DESIGN.md`.

### 4.2 Edge Functions

One function per domain keeps deploys and debugging simple.

| Function | Responsibility |
|---|---|
| `chat` | Main turn handler: persist user message → build context → call Gemini → handle tool calls → stream and persist reply |
| `confirm-action` | Execute or reject a pending sensitive action after user decision |
| `memory-extract` | Propose memories from a conversation turn (invoked async after a turn) |
| `memory-manage` | Create/edit memory with re-embedding (edit/delete can also be direct via RLS, but edits need re-embed so route through here) |
| `workspace-extract` | Convert conversation content to validated proposed notes/tasks |
| `search` | RAG: embed query → retrieve chunks → grounded answer with sources |
| `index-conversation` | Chunk and embed conversation content (async/triggered) |
| `summarize-conversation` | Update rolling summary for long conversations |

Shared module `_shared/`:
- `auth.ts` — verify JWT, create user-scoped Supabase client
- `gemini.ts` — Gemini client wrapper (chat, embeddings, retries, timeouts)
- `tools/` — tool registry, schemas, handlers
- `schemas.ts` — Zod schemas
- `limits.ts` — per-user rate/usage checks
- `errors.ts` — typed error → HTTP response mapping
- `log.ts` — structured logging
- `prompts/` — versioned prompt files (see §4.6)

### 4.3 Database

Column-level detail is in §4.4. Logical entities:

```
auth.users
   │ 1
   ├──< conversations ──< messages
   │         │               
   │         ├── conversation_summaries  (rolling summary)
   │         └──< conversation_chunks    (text + vector)
   ├──< memories                         (text + vector + status)
   ├──< pending_actions                  (tool proposals awaiting confirm)
   ├──< action_logs                      (audit trail)
   ├──< notes
   ├──< tasks
   ├──  user_settings                    (memory paused, limits, etc.)
   └──< usage_events                     (rate limiting / cost tracking)
```

Every user-owned table has `user_id uuid not null references auth.users` and RLS policies of the form `user_id = auth.uid()`.

### 4.4 Data Model Detail

Authoritative column list. Final types and constraints are written in `supabase/migrations/`; if a migration diverges from this table, update this table in the same change.

| Table | Key columns | Notes |
|---|---|---|
| `conversations` | `id`, `user_id`, `title`, `created_at`, `updated_at` | Delete cascades to messages, summary, chunks |
| `messages` | `id`, `conversation_id`, `user_id`, `role` (`user`/`assistant`/`tool`), `content`, `status` (`complete`/`incomplete`/`error`), `idempotency_key`, `created_at` | Unique `(user_id, idempotency_key)` prevents duplicate submits |
| `conversation_summaries` | `conversation_id` (PK), `user_id`, `summary`, `summarized_through_message_id`, `updated_at` | One rolling summary per conversation |
| `conversation_chunks` | `id`, `conversation_id`, `user_id`, `content`, `start_message_id`, `end_message_id`, `content_hash`, `embedding vector(N)`, `embedding_model`, `embedding_status` | HNSW cosine index on `embedding` |
| `memories` | `id`, `user_id`, `content`, `category`, `confidence`, `status` (`pending`/`active`), `source_conversation_id`, `reason`, `embedding vector(N)`, `embedding_model`, `embedding_status`, `created_at`, `updated_at` | Rejected candidates are deleted, not stored |
| `pending_actions` | `id`, `user_id`, `conversation_id`, `tool_name`, `args` (jsonb), `status` (`pending`/`executed`/`rejected`/`expired`), `expires_at`, `created_at` | Single-use; written only by functions |
| `action_logs` | `id`, `user_id`, `tool_name`, `args`, `result`, `ok`, `created_at` | Append-only audit trail; written only by functions |
| `notes` | `id`, `user_id`, `title`, `body`, `source_conversation_id`, `created_at`, `updated_at` | |
| `tasks` | `id`, `user_id`, `title`, `description`, `status` (`todo`/`in_progress`/`done`), `due_date`, `priority`, `source_conversation_id`, `created_at`, `updated_at` | |
| `user_settings` | `user_id` (PK), `memory_paused`, `timezone`, `daily_token_limit` | |
| `usage_events` | `id`, `user_id`, `kind`, `tokens`, `created_at` | Rate limiting and cost tracking |
| `jobs` (only if A4 requires it) | `id`, `user_id`, `type`, `payload`, `status`, `attempts`, `run_at` | Safety-net retries |

**RLS:** enabled on every table. User-owned rows: `select/insert/update/delete` allowed only where `user_id = auth.uid()`. `pending_actions` and `action_logs` are not writable from the client; functions write them.

**RPC functions** (all take the user from `auth.uid()`, never from a parameter):
- `match_memories(query_embedding, k, threshold)` → top-k active memories
- `match_chunks(query_embedding, k, threshold)` → top-k chunks joined with conversation title and date
- `save_workspace_items(items)` → transactional insert of approved notes/tasks with `source_conversation_id`

### 4.5 Edge Function Contracts

All client-facing functions require `Authorization: Bearer <user JWT>`. Request and response bodies are JSON and validated with Zod from `_shared/schemas.ts`.

| Function | Request | Response |
|---|---|---|
| `chat` | `{conversation_id, text, idempotency_key}` | SSE stream of events: `token`, `tool_result`, `confirmation_required` (carries `pending_action_id`), `done`, `error` |
| `confirm-action` | `{pending_action_id, decision: "approve" \| "reject", edited_args?}` | `{status, result}` |
| `memory-manage` | `{op: "create" \| "update" \| "approve" \| "delete_all", memory_id?, content?}` | `{memory}` or `{deleted_count}` |
| `workspace-extract` | `{conversation_id, message_ids?}` | `{notes: [...], tasks: [...]}` (proposed only, nothing saved) |
| `search` | `{query}` | `{answer, sources: [{conversation_id, chunk_id, excerpt, date}]}`, or `{answer: null, sources: []}` when nothing passes the threshold |
| `memory-extract`, `index-conversation`, `summarize-conversation` | Internal, invoked after a turn with `{user_id, conversation_id}` | `{ok}` |

Internal functions are called only server-to-server with an internal secret header, never from the browser, and always filter by the explicit `user_id` they receive.

**Error shape (all functions):** `{error: {code, message, retryable}}`. Codes: `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `RATE_LIMITED`, `UPSTREAM_AI_ERROR`, `CONFLICT`. `message` is user-safe and never contains secrets or raw model output.

### 4.6 AI Workflow Reference

- **Prompt files** live in `supabase/functions/_shared/prompts/`: `chat-system`, `memory-extract`, `workspace-extract`, `rag-answer`. Prompts are versioned in Git; any change requires running the relevant eval set (PRD §11).
- **Untrusted data:** memories and retrieved chunks are placed in clearly delimited blocks labeled as background data, not instructions.
- **Memory extraction rules:** save only durable, useful facts or preferences; never passwords, payment details, or government IDs (also filtered server-side); output must match `{memories: [{content, category, confidence}]}`.
- **Tool declarations:** generated from the Zod schemas in the tool registry (ADR-3); the model sees only registered tools.
- **RAG answer rules:** answer only from the numbered chunks provided, cite reference numbers, and say "not found" when evidence is missing.
- **Structured output:** every JSON response from Gemini is Zod-validated; one repair retry, then a friendly error.
- **Model names and dimensions:** verify current Gemini model names and embedding dimensions in Google's documentation before locking them in (open question A1).

## 5. Core Data Flows

### 5.1 Chat Turn (Feature 1)

```
Client                 chat function                         Postgres        Gemini
  │  POST {conv_id, text} │                                      │              │
  │──────────────────────▶│ verify JWT, rate-limit check         │              │
  │                       │ insert user message ────────────────▶│              │
  │                       │ build context:                       │              │
  │                       │  • system prompt                     │              │
  │                       │  • conversation summary              │              │
  │                       │  • recent N messages                 │              │
  │                       │  • top-k memories (vector search) ──▶│              │
  │                       │ call Gemini (stream) ───────────────────────────────▶│
  │◀── SSE tokens ────────│◀────────────────────────────────────────────────────│
  │                       │ insert assistant message ───────────▶│              │
  │                       │ enqueue: memory-extract, summarize?, index          │
```

Key rules:
- **Persist the user message before calling Gemini** so nothing is lost on failure.
- Assistant message saved when the stream completes (or saved as `status='error'` if interrupted).
- Context budget (configurable): system prompt + summary + last ~N messages + k memories, capped to a token budget. Oldest messages drop first.

### 5.2 Context Management & Summarization

- After a turn, if unsummarized message count or estimated tokens exceed a threshold, `summarize-conversation` runs asynchronously.
- It produces a rolling summary covering messages up to a checkpoint (`summarized_through_message_id`) and stores it in `conversation_summaries`.
- Context assembly = summary + messages after the checkpoint. This bounds prompt size regardless of conversation length.
- Failures leave the previous summary in place; the system still works with a longer recent window.

### 5.3 Intelligent Memory (Feature 2)

**Write path**
1. After a turn, `memory-extract` sends the recent exchange to Gemini with a strict prompt and a JSON schema: `{memories: [{content, category, confidence}]}`.
2. Output is Zod-validated; sensitive-category and low-confidence candidates are filtered server-side.
3. Candidates are compared against existing memories via embedding similarity; near-duplicates are skipped or flagged as updates.
4. Depending on decision **D1**, candidates are inserted as `status='pending'` (user approves) or `status='active'` (auto-save). The schema supports both; only a config flag changes.
5. On activation, the memory is embedded and stored.

**Read path**
1. Embed the user's message (and optionally a short recent-context string).
2. `match_memories(user_id, query_embedding, k, threshold)` returns top-k active memories.
3. Inject into the prompt inside a clearly delimited block labeled as *user-provided background, not instructions*.

**Controls:** view/edit/delete/delete-all, `user_settings.memory_paused` stops both extraction and retrieval.

### 5.4 Action Agent with Tool Calling (Feature 3)

```
User msg ─▶ Gemini (with tool declarations)
              │
              ├─ plain text ───────────────────────────▶ stream to user
              │
              └─ functionCall {name, args}
                     │
                     ▼
            Server: lookup tool in registry   ── unknown ─▶ reject, tell model
                     │
            Zod-validate args                 ── invalid ─▶ return error to model (1 retry)
                     │
            Authorize (user-scoped client + ownership checks)
                     │
            risk == "safe" ? ──yes──▶ execute ─▶ log ─▶ return result to model ─▶ final reply
                     │
                     no (sensitive)
                     ▼
            Insert pending_actions row (args snapshot, expires_at)
            Stream "confirmation required" card to client; stop loop
                     │
            User clicks Approve / Reject  ──▶ confirm-action function
                     │
            Re-validate args, re-check authorization, execute once (idempotent),
            log, append result message to conversation
```

**Tool registry entry shape**

```ts
{
  name: "create_task",
  description: "...",              // shown to Gemini
  schema: z.object({...}),         // validation + generates Gemini declaration
  risk: "safe" | "sensitive",
  handler: async (ctx, args) => {} // ctx = { userClient, userId }
}
```

**Safety properties**
- The model can only *request* tools from a fixed registry; it has no SQL access.
- Handlers use the **user-scoped client**, so RLS still applies even inside tools.
- IDs in arguments (e.g., `task_id`) are re-verified against the user's data.
- Pending actions are single-use, expire (e.g., 15 minutes), and execute only from the `confirm-action` endpoint.
- Max tool calls per turn (e.g., 5) to prevent loops.
- Every execution writes to `action_logs`.

**Risk classification (proposed, subject to D2):**

| Tool | Risk |
|---|---|
| `create_note`, `create_task`, `update_task`, `complete_task`, `search_conversations`, `save_memory` (if D1 approval mode, this creates a *pending memory*) | safe |
| `delete_task`, `delete_memory`, any bulk operation | sensitive |

### 5.5 Conversation-to-Workspace (Feature 4)

1. User triggers "Extract to workspace" for a conversation or selection.
2. `workspace-extract` sends relevant messages to Gemini with a response schema (`{notes: [...], tasks: [...]}`).
3. Server validates with Zod; on failure, one repair retry, then a user-friendly error.
4. Dates are normalized server-side against the user's timezone; ambiguous dates are flagged `needs_confirmation`.
5. Proposed items are returned to the client (not saved). The user edits/approves on a review screen.
6. Approved items are saved through a single transactional call (RPC or function) with `source_conversation_id` attached.

### 5.6 RAG Conversation Search (Feature 5)

**Indexing (async)**
1. Trigger: after a turn completes (debounced) or via a scheduled catch-up job.
2. `index-conversation` groups messages into chunks (e.g., sliding window of ~6–10 messages or ~500 tokens, with overlap) and stores each chunk's text, message range, and metadata.
3. Chunks are embedded in batches. Changed chunks are re-embedded; removed ones deleted. A content hash avoids redundant embedding.

**Query**
1. `search` embeds the query.
2. `match_chunks(user_id, embedding, k, threshold)` returns the top-k chunks joined with conversation title and timestamps.
3. If zero chunks pass the threshold → return "no relevant conversations found" **without calling the LLM to answer**.
4. Otherwise Gemini receives only the retrieved chunks with numbered references and is instructed to answer solely from them and cite reference numbers.
5. Response returns `{answer, sources: [{conversation_id, chunk_id, excerpt, date}]}`; citations in the answer map to sources. The server drops citations that don't map to a retrieved chunk.

**Hybrid option (P1):** combine vector score with Postgres full-text rank for better recall on exact terms.

## 6. Security Architecture

| Concern | Control |
|---|---|
| Secret exposure | `GEMINI_API_KEY` and any service-role key only in Edge Function secrets; frontend bundle scanned before release |
| AuthN | Supabase Auth JWT verified on every Edge Function call |
| AuthZ / isolation | RLS on every table (`user_id = auth.uid()`); functions use user-scoped client by default |
| Service role usage | Only for narrow system tasks (e.g., background indexing triggered by trusted events), always filtering by explicit `user_id`; documented and reviewed |
| Vector functions | `match_*` RPCs take `user_id` from `auth.uid()` (or are `security invoker`) — never from a client-supplied parameter |
| Prompt injection | Memories and retrieved chunks are wrapped as untrusted data; instructions in them are ignored by system prompt; tools are still validated server-side; sensitive actions need human confirmation |
| Tool abuse | Fixed registry, Zod validation, ownership checks, per-turn call cap, audit log |
| Abuse / cost | Per-user rate limits and daily token caps checked in `limits.ts`; request size limits |
| CORS | Restrict allowed origins to the production and preview domains |
| Data deletion | Cascading deletes for chunks/embeddings; "delete all memories"; account deletion flow (P1) |
| Logging | No secrets or full message bodies in logs; log IDs, timings, token counts, error codes |

**RLS testing requirement:** a scripted test creates two users and asserts that user B cannot select, insert, update, or delete any of user A's rows on every table, and cannot call RPCs against user A's vectors.

## 7. Error Handling and Resilience

| Failure | Behavior |
|---|---|
| Gemini 429/5xx/timeout | Exponential backoff (max 2 retries) → user-visible error with a Retry button; user message already persisted |
| Stream interrupted | Partial assistant message saved with `status='incomplete'`; user can regenerate |
| Invalid tool args / bad JSON | Return structured error to model once; then fall back to plain-language reply |
| Embedding failure | Memory/chunk marked `embedding_status='failed'`; retried by catch-up job; never blocks chat |
| Duplicate submissions | Client-generated idempotency key on messages and confirmations |
| Function timeout | Long work (indexing, summarization, extraction) is async and resumable |

## 8. Async Work Without Extra Infrastructure

No Redis or queue service. Options, in order of preference:

1. **Fire-and-forget invocation** from the `chat` function after responding (e.g., `EdgeRuntime.waitUntil` or a follow-up function call).
2. **Jobs table** (`jobs`: type, payload, status, attempts) processed by a scheduled function (Supabase cron / `pg_cron`) as a safety net for retries.
3. **Database triggers** only for trivial bookkeeping, not AI calls.

Start with option 1 plus a lightweight catch-up job for rows with `embedding_status in ('pending','failed')`.

## 9. Embeddings and Vector Design

- Pick **one embedding model and dimension** before creating tables; the `vector(N)` column size must match. Store `embedding_model` alongside each vector so a future migration can re-embed safely. Verify the current Gemini embedding model name and supported output dimensions in Google's documentation before locking this in.
- Use cosine distance with an **HNSW** index; apply `user_id` filtering in the query (and consider a composite approach if data grows).
- Normalize vectors if the chosen dimension is a truncated output.
- Use task-appropriate embedding modes (document vs. query) if the API supports them.
- Similarity threshold is empirical: tune using the RAG eval set (PRD §11).

## 10. Environments and Deployment

| Environment | Frontend | Backend |
|---|---|---|
| Local | `vite dev` | `supabase start` + `supabase functions serve` |
| Preview | Vercel preview deployments | Separate Supabase project (staging) |
| Production | Vercel production | Production Supabase project |

- **Migrations:** all schema changes via Supabase CLI migrations in `supabase/migrations/`, committed to Git.
- **Secrets:** `supabase secrets set GEMINI_API_KEY=...`; Vercel env holds only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **CI (lightweight):** lint, build, run RLS test script and eval set on demand.
- **Release checklist:** RLS tests pass → eval thresholds met → bundle secret scan → deploy functions → deploy frontend → smoke test.
- **Rollback:** Vercel instant rollback for frontend; redeploy previous function version; migrations are forward-only, so write reversible ones carefully.

## 11. Repository Layout

```
mindmate-ai/
  AGENTS.md             rules for AI coding agents (stays in root)
  README.md             public overview (stays in root)
  docs/
    PRD.md
    ARCHITECTURE.md
    DESIGN.md
    TASKS.md
  evals/                eval datasets + runner scripts
  src/                  React app (see 4.1)
  supabase/
    migrations/
    functions/
      _shared/          auth, gemini, tools/, schemas, limits, errors, log, prompts/
      chat/ confirm-action/ memory-extract/ memory-manage/
      workspace-extract/ search/ index-conversation/ summarize-conversation/
    tests/              RLS and function tests
```

No other Markdown files are created (see PRD §15).

## 12. Key Architecture Decisions (ADR Summary)

| ID | Decision | Alternatives considered | Reason |
|---|---|---|---|
| ADR-1 | Direct Supabase reads from client for simple CRUD, Edge Functions for AI/multi-step ops | All traffic via functions | Less code, RLS already protects; functions only where secrets/logic needed |
| ADR-2 | pgvector in the same Postgres | Pinecone/Weaviate | Fewer services, RLS applies to vectors, adequate scale |
| ADR-3 | Zod schemas for tool args and structured output | Hand-written validation | Single source of truth; generates tool declarations |
| ADR-4 | Pending-actions table for confirmations | In-memory state / client-held tokens | Durable, auditable, single-use, survives reloads |
| ADR-5 | Rolling summary + recent window | Full history / vector-only recall | Predictable cost; simple |
| ADR-6 | Memory `status` column (`pending`/`active`) | Separate tables per mode | Supports D1 either way with no migration |
| ADR-7 | Async indexing with catch-up job | Synchronous embedding in request | Keeps chat latency low; resilient to failures |
| ADR-8 | User-scoped client by default in functions | Service role everywhere | RLS stays the safety net even if function logic has a bug |
| ADR-9 | Five-document set (PRD, ARCHITECTURE, DESIGN, TASKS, AGENTS) with DB, API, and AI-workflow detail inside ARCHITECTURE | Separate DATABASE/API/AI_WORKFLOW files | Fewer files to keep in sync; each document has one owner and one job |

## 13. Open Architecture Questions

| # | Question | Needed by |
|---|---|---|
| A1 | Final embedding model and dimension | Before DB schema (Day 1) |
| A2 | Streaming transport: SSE from Edge Function vs. non-streaming MVP | Day 2 |
| A3 | Chunking window size and overlap (tune against eval set) | Day 8 |
| A4 | Whether `waitUntil` background work is reliable enough or the jobs table is needed from the start | Day 4 |
| A5 | Auth methods: email/password only vs. adding Google OAuth | Day 1 |
| A6 | Product decisions D1–D5 from the PRD | Day 1 (D1, D2) / before respective phase |

## 14. Documentation Map

| Doc | Contents |
|---|---|
| `PRD.md` | Scope, requirements, priorities, product decisions D1–D5, evaluation plan |
| `ARCHITECTURE.md` (this file) | Stack, components, data model (§4.4), function contracts (§4.5), AI workflow (§4.6), security, deployment |
| `DESIGN.md` | UI style, components, pages, UI states |
| `TASKS.md` | Milestones, build order, status |
| `AGENTS.md` | Rules for AI coding agents (repo root) |
