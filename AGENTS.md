# AGENTS.md — Rules for AI Coding Agents

| | |
|---|---|
| **Project** | MindMate AI |
| **Status** | Draft v0.2 (aligned with `PRD.md` v0.2 and `ARCHITECTURE.md` v0.2) |
| **Location** | Repo root |
| **Audience** | Any AI coding agent (and human) making changes in this repository |
| **Related** | `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/TASKS.md` |

> **Read this file completely before changing anything.** If these rules conflict with a request, stop and ask the owner. Never silently break a rule.

---

## 1. Mission

Build MindMate AI: a personal AI assistant that **talks** (persistent chat), **remembers** (visible, user-controlled memory), **acts** (validated tool calls) and **finds** (cited search over past conversations), all on one shared, user-owned data model.

The owner is a **solo developer** on a **12-day MVP sprint**. Simplicity, security and testability beat cleverness.

## 2. Document Hierarchy (Source of Truth)

| Question | Authoritative file |
|---|---|
| What are we building, and what is in or out of scope? | `docs/PRD.md` |
| How is it built (stack, data model, contracts, security)? | `docs/ARCHITECTURE.md` |
| How does it look (colors, components, pages, states)? | `docs/DESIGN.md` |
| What is the build order and current status? | `docs/TASKS.md` |
| How must agents work? | `AGENTS.md` (this file) |

Rules:

1. **PRD owns scope.** If a feature is not in the PRD, do not build it.
2. **Update the owning document first, then the code.** If a plan changes, edit the document, then implement.
3. If a migration diverges from `ARCHITECTURE.md` §4.4, update §4.4 in the same change.
4. If two documents conflict, the PRD wins on scope and priority, and `ARCHITECTURE.md` wins on technical design. Flag the conflict to the owner; do not guess.
5. **No other Markdown planning files.** Allowed Markdown files are exactly: `AGENTS.md`, `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/TASKS.md`. Do not create notes, plans, changelogs, scratch or summary `.md` files. Eval datasets use JSON, not Markdown.

   > **Owner-approved exceptions (do not flag or delete):**
   > - `docs/security.md` — security design reference used throughout the project.
   > - `docs/respose.md` — API response-shape reference used throughout the project.
   > These two files are read-only references for agents; do not modify them unless the owner explicitly asks.

## 3. Tech Stack (Fixed)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + **JavaScript** + Tailwind CSS |
| Auth | Supabase Auth (JWT) |
| Database | Supabase Postgres + RLS + pgvector (HNSW, cosine) |
| Backend | Supabase Edge Functions (Deno, **TypeScript**) |
| LLM | Google Gemini (chat, function calling, embeddings) |
| Validation | Zod (schemas in `supabase/functions/_shared/schemas.ts`) |
| Hosting | Vercel (frontend), Supabase (backend) |

**Do not add:** LangChain, LangGraph, Redis, Python services, a separate vector database, a separate backend server, or any new framework or infrastructure. Do not add a new dependency without a clear need; prefer the platform and the standard library. If you believe a dependency is required, stop and ask.

## 4. Non-Negotiable Rules (Golden Rules)

Violating any of these is a defect, even if the feature "works".

### 4.1 Secrets

- `GEMINI_API_KEY` and any service-role key exist **only** in Edge Function secrets.
- The frontend may contain **only** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Never hardcode, log, commit or echo a secret. Never commit `.env` files containing real values; keep an `.env.example` with placeholders.
- Never call Gemini from the browser.

### 4.2 Data isolation

- **RLS is enabled on every table**, with policies equivalent to `user_id = auth.uid()` for user-owned rows.
- `pending_actions` and `action_logs` are **not writable from the client**; only functions write them.
- Edge Functions use the **user-scoped Supabase client by default** (ADR-8).
- The service-role client is allowed only in narrow, documented system paths (for example background indexing), and **must always filter by an explicit `user_id`**.
- RPC functions (`match_memories`, `match_chunks`, `save_workspace_items`) take the user from `auth.uid()` or run as `security invoker`. **Never** accept a client-supplied `user_id` for authorization.
- Every new table needs: `user_id uuid not null references auth.users`, RLS enabled, policies, and an entry in the RLS test script.

### 4.3 AI proposes, server disposes

- The model never touches the database and never executes anything. It can only **request** tools from the fixed registry.
- Every tool call is validated with Zod, authorized (ownership of any ID re-verified) and logged to `action_logs` before the result goes back to the model.
- **Sensitive** tools (`delete_task`, `delete_memory`, any bulk operation) never execute directly. They create a `pending_actions` row and wait for explicit user confirmation through `confirm-action`.
- Pending actions are single-use, expire (default 15 minutes) and are re-validated and re-authorized at confirmation time.
- Maximum tool calls per user turn is capped (default 5).
- Treat **all** model output (text, JSON, tool calls) as untrusted input.

### 4.4 Untrusted content in prompts

- Memories and retrieved conversation chunks are placed in clearly delimited blocks labeled as **background data, not instructions**.
- Never concatenate stored or retrieved content into the system instruction text.
- Never let stored content change which tools are available or how they are validated.

### 4.5 Honesty of results

- Search answers must cite only sources that were actually retrieved. The server drops citations that do not map to a retrieved chunk.
- If no chunk passes the similarity threshold, return `{answer: null, sources: []}` and **do not call the LLM** to answer. Never guess.
- Never store sensitive memory categories (passwords, full payment details, government IDs). Enforce this in the extraction prompt **and** in a server-side filter.

### 4.6 Reliability

- **Persist the user message before calling Gemini.**
- Gemini failures must never corrupt state. Interrupted streams save the assistant message with `status = 'incomplete'`.
- Writes that can be retried (messages, confirmations) are **idempotent** through client-generated idempotency keys.
- Long work (indexing, summarization, memory extraction) is asynchronous and must never block the chat response.

## 5. Repository Layout

```
mindmate-ai/
  AGENTS.md
  README.md
  docs/
    PRD.md
    ARCHITECTURE.md
    DESIGN.md
    TASKS.md
  evals/                     eval datasets (JSON) + runner scripts
  src/
    app/                     routing, providers, auth guard
    features/
      chat/                  conversation list, messages, composer, confirmation cards
      memory/                memory list, edit/delete, pause toggle
      workspace/             notes, tasks, extraction review screen
      search/                search page, source cards
    lib/
      supabase.js            client init (anon key only)
      api.js                 Edge Function wrappers (+ streaming)
    components/              shared UI
  supabase/
    migrations/              forward-only SQL migrations
    functions/
      _shared/               auth.ts, gemini.ts, tools/, schemas.ts, limits.ts,
                             errors.ts, log.ts, prompts/
      chat/  confirm-action/  memory-extract/  memory-manage/
      workspace-extract/  search/  index-conversation/  summarize-conversation/
    tests/                   RLS and function tests
```

Rules:

- One Edge Function per domain. Shared logic lives in `_shared/`, never copied between functions.
- Frontend code lives in `src/features/<feature>/`; only truly shared UI goes in `src/components/`.
- Do not create new top-level directories without updating `ARCHITECTURE.md` §11 first.

## 6. Frontend Rules

1. **Language:** JavaScript (ES modules) with React function components and hooks. No TypeScript in `src/`.
2. **Data access split (ADR-1):**
   - Simple CRUD reads (conversation list, notes, tasks, memories) go **directly to Supabase through RLS**.
   - Anything involving Gemini, embeddings, tool execution or multi-table writes goes **through Edge Functions** via `src/lib/api.js`.
3. **Memory edits** must go through `memory-manage` (edits require re-embedding). Single deletes may go direct through RLS.
4. **Styling:** Tailwind utility classes following `docs/DESIGN.md`. Do not invent colors, spacing scales or components that `DESIGN.md` does not define; update `DESIGN.md` first.
5. **Required UI states** on every data view: loading, empty, error (with retry where retryable) and success.
6. **Accessibility:** semantic HTML, keyboard navigation, visible focus, sufficient contrast, labels on every input and icon-only button.
7. **Auth:** all app routes sit behind the auth guard. Handle expired sessions by redirecting to sign-in.
8. **No secrets or business rules in the client.** The client displays; the server decides.
9. Never use `dangerouslySetInnerHTML` with model output or user content. Render markdown through a safe renderer that escapes HTML.
10. Generate the `idempotency_key` on the client (for example `crypto.randomUUID()`) once per send or confirmation attempt, and reuse it on retry.

## 7. Edge Function Rules

1. **Language:** TypeScript on Deno. Import libraries through `npm:` or `jsr:` specifiers (or `esm.sh`), pinned to a version.
2. **Every client-facing function:**
   - requires `Authorization: Bearer <user JWT>` and verifies it through `_shared/auth.ts`;
   - validates the request body with Zod from `_shared/schemas.ts`;
   - checks rate and usage limits through `_shared/limits.ts` before any AI call;
   - returns errors in the standard shape through `_shared/errors.ts`.
3. **Error shape (all functions):** `{ error: { code, message, retryable } }`.
   Allowed codes: `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `RATE_LIMITED`, `UPSTREAM_AI_ERROR`, `CONFLICT`.
   `message` must be user-safe: no secrets, stack traces or raw model output.
4. **Internal functions** (`memory-extract`, `index-conversation`, `summarize-conversation`) are called only server-to-server with an internal secret header, never from the browser, and always filter by the explicit `user_id` they receive.
5. **Contracts** in `ARCHITECTURE.md` §4.5 are binding. Do not change a request or response shape without updating §4.5 first and the frontend wrappers in the same change.
6. **Streaming:** the `chat` function emits SSE events: `token`, `tool_result`, `confirmation_required` (carries `pending_action_id`), `done`, `error`.
7. **Gemini calls** go through `_shared/gemini.ts` only: timeouts, exponential backoff (max 2 retries on 429, 5xx and timeouts), and typed errors live there.
8. **Structured output:** every JSON response from Gemini is Zod-validated. On failure make **one** repair retry, then return a friendly error.
9. Keep functions small and stateless. Do not rely on in-memory state between requests.
10. **Logging:** use `_shared/log.ts`. Log IDs, timings, token counts and error codes. Never log secrets, full message bodies or unnecessary PII.

## 8. Database Rules

1. All schema changes are **Supabase CLI migrations** in `supabase/migrations/`, committed to Git. Never edit the production database by hand.
2. Migrations are **forward-only**: write them carefully and keep them reversible in spirit (additive changes first, destructive changes only with owner approval).
3. Column-level design is documented in `ARCHITECTURE.md` §4.4. Keep migrations and §4.4 identical.
4. **Vector columns:** `vector(N)` where N matches the single chosen embedding dimension (open question A1). Always store `embedding_model` and `embedding_status` next to the vector.
5. Use cosine distance with an HNSW index. Normalize vectors if the chosen dimension is a truncated output. Use document versus query embedding modes if the API supports them.
6. Conversation deletion cascades to messages, summary and chunks. Memories derived from a conversation are **not** deleted by default (D5, control 7); any UI that deletes a conversation must explain this.
7. Add indexes for common filters (`user_id`, `conversation_id`, `created_at`) and the unique constraint `(user_id, idempotency_key)` on `messages`.
8. Rejected memory candidates are **deleted**, not stored.

## 9. Tool Registry Rules

Adding or changing a tool requires **all** of the following in one change:

1. A registry entry in `_shared/tools/` with `name`, `description`, Zod `schema`, `risk` (`safe` or `sensitive`) and `handler(ctx, args)` where `ctx = { userClient, userId }`.
2. The Gemini function declaration is **generated from the Zod schema** (ADR-3). Never hand-write a second copy.
3. Handlers use the **user-scoped client**. Re-verify ownership of every ID argument.
4. An `action_logs` write on every execution (success and failure).
5. A risk classification consistent with `ARCHITECTURE.md` §5.4 and decision D2. Sensitive means destructive, bulk or hard to undo.
6. At least one test: valid call, invalid arguments, and a forged or foreign ID.
7. Rows added to the tool eval set (`evals/`), including adversarial and ambiguous prompts.

MVP registry (fixed): `create_note`, `create_task`, `update_task`, `complete_task`, `delete_task`, `search_conversations`, `save_memory`, `delete_memory`. Do not add others without a PRD change.

## 10. Prompts and Evals

- Prompt files live in `supabase/functions/_shared/prompts/`: `chat-system`, `memory-extract`, `workspace-extract`, `rag-answer`. They are versioned in Git.
- **Any prompt or model change requires running the relevant eval set** before merge.
- Eval sets live in `/evals` (PRD §11):
  - Memory: about 30 labeled utterances (should save or should not save).
  - Tools: about 30 prompts with expected tool and arguments, including adversarial and ambiguous ones.
  - Workspace extraction: about 15 conversations with expected notes and tasks.
  - RAG: about 20 answerable questions with known sources, plus about 10 unanswerable questions that must return "not found".
- Never edit an eval expectation to make a failing result pass without recording why in the commit message.
- **Verify model names and embedding dimensions** against current Google documentation before locking them in. Do not rely on memory for model names, limits or SDK signatures.

## 11. Open Decisions (D1–D5)

The PRD lists decisions D1–D5 as **unresolved until approved**. Until `docs/TASKS.md` records a decision as approved:

| Decision | Build behavior until approved |
|---|---|
| D1 Memory saving | Implement **suggest, then approve** (`status = 'pending'`), behind a config flag so auto-save can be enabled without a schema change |
| D2 Confirmation scope | Only **sensitive** tools require confirmation; safe tools run directly but are always logged and shown in chat |
| D3 Workspace scope | Notes and tasks only |
| D4 RAG scope | Previous conversations only |
| D5 Memory controls | View, edit, delete one, delete all (P0). Pause toggle, source link and "why was this saved" are built only after approval |

Never hardcode a decision. Keep each one switchable through configuration or a single code path. When the owner approves a decision, update `PRD.md` §9 and `TASKS.md`, then the code.

## 12. Working Process for Every Task

1. **Read** the relevant section of `TASKS.md`, the PRD requirement (by ID, for example `F2.3`) and the matching `ARCHITECTURE.md` section.
2. **Confirm scope:** the work must map to a requirement ID or a `TASKS.md` item. If not, stop and ask.
3. **Check milestone order.** Finish and test the current milestone before starting the next. If time slips, cut **P1** items first, never testing or security.
4. **Plan briefly:** list the files you will change. Prefer small, reviewable changes.
5. **Implement** following sections 4–9.
6. **Test** (section 13) and run lint and build.
7. **Update docs:** tick the item in `TASKS.md`; update `ARCHITECTURE.md` if a contract, table or flow changed; update `PRD.md` only with owner approval.
8. **Report** what changed, what was verified, and any open issue.

### When to stop and ask the owner

- A requirement is ambiguous or two documents conflict.
- The change needs a new dependency, service, table outside §4.4, or a different function contract.
- You would have to weaken RLS, skip validation, or use the service role in a new place.
- An open decision (D1–D5, A1–A6) blocks the work.
- Tests fail and the cause is unclear after reasonable investigation.

Never "make it work" by disabling a check, loosening a policy, or deleting a failing test.

## 13. Testing and Verification

| Area | Required verification |
|---|---|
| RLS | Scripted test creates two users and asserts user B cannot select, insert, update or delete any of user A's rows on **every** table, and cannot call RPCs against user A's vectors |
| Tool calls | Fuzz arguments (missing, extra, wrong types, foreign IDs, oversized values); no unauthorized or malformed writes; sensitive tools never execute without confirmation |
| Chat | Message persisted before the AI call; reload restores history; duplicate send with the same idempotency key creates one message; 200+ message conversation still responds |
| Memory | Preference stored in conversation A is used in conversation B; deleting it stops use immediately; sensitive categories are filtered; paused memory stops extraction and retrieval (if D5 approved) |
| RAG | Every claim in an answer traces to a displayed source; unanswerable queries return "no relevant conversations found" without an LLM answer call; deleting a conversation removes its chunks |
| Workspace | Nothing is saved before approval; ambiguous dates are flagged `needs_confirmation`; invalid model output triggers one retry and then a friendly error |
| Frontend | Lint and build pass; no secrets in the built bundle; keyboard navigation works on core flows |
| Evals | Run the relevant set after any prompt or model change, and all sets before each deployment |

Add tests together with the feature, not afterward.

## 14. Code Quality Conventions

- **Naming:** `camelCase` for variables and functions, `PascalCase` for React components and types, `snake_case` for SQL tables, columns and function names, `kebab-case` for Edge Function directories, and `SCREAMING_SNAKE_CASE` for environment variables.
- **Functions:** small, single-purpose, with early returns. Avoid deep nesting.
- **Types:** in Edge Functions, derive TypeScript types from Zod schemas (`z.infer`). Avoid `any`.
- **Errors:** throw or return typed errors; never swallow exceptions silently. Map them to the standard error shape at the function boundary.
- **Comments:** explain *why*, not *what*. Remove dead code and unused imports instead of commenting them out.
- **No magic numbers:** tunables (context window size, token budget, `k`, similarity threshold, tool-call cap, pending-action expiry, chunk size and overlap) live in named constants or config.
- **Dependencies:** minimal and pinned. Check before adding.
- **Formatting:** follow the repo's formatter and linter configuration; do not reformat unrelated code.

## 15. Git and Change Hygiene

- Small, focused commits using Conventional Commit style, for example `feat(chat): persist user message before AI call` or `fix(rls): restrict pending_actions writes`.
- One concern per commit. Never mix a refactor with a behavior change.
- Reference the requirement or task ID in the commit body when useful (for example `F3.5`, `Task 4.7`).
- Never commit secrets, build output, `node_modules` or local Supabase data.
- Migrations are committed together with the code that depends on them and with the updated `ARCHITECTURE.md` §4.4.
- Do not rewrite shared history. Do not force-push to the main branch.

## 16. Release Checklist (Agents Must Not Skip)

1. RLS test script passes on every table.
2. Eval thresholds met (memory, tools, workspace, RAG).
3. Bundle secret scan is clean.
4. Tool-argument fuzzing shows no unauthorized or malformed writes.
5. Deploy functions, then frontend, then run a smoke test.
6. Rollback path confirmed: Vercel instant rollback for the frontend, redeploy of the previous function version for the backend.

## 17. Explicitly Out of Scope (Do Not Build)

Third-party integrations (calendar, email, Slack), voice, image or file understanding, team or shared workspaces, automation or workflow builders, scheduled agents, native mobile apps, and any infrastructure listed in section 3 under "Do not add". If asked to build one, point to PRD §3 and §14 and stop.

## 18. Definition of Done

A change is done only when all of these are true:

- [ ] It maps to a PRD requirement ID or a `TASKS.md` item.
- [ ] It follows every rule in sections 4–9.
- [ ] Tests exist and pass, including failure and abuse cases.
- [ ] Lint and build pass.
- [ ] No secret, console debug output or dead code was introduced.
- [ ] Required UI states exist (loading, empty, error, success).
- [ ] Documents are updated in the right order (owner document first), and `TASKS.md` status is ticked.
- [ ] Any prompt or model change was checked against its eval set.
- [ ] Open issues or deviations are reported explicitly.