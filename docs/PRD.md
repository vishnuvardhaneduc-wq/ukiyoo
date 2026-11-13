# MindMate AI — Product Requirements Document (PRD)

| | |
|---|---|
| **Status** | Draft v0.2 — pending approval of open decisions (Section 9) |
| **Owner** | Solo developer |
| **Target** | 12-day MVP sprint |
| **Related docs** | `ARCHITECTURE.md`, `DESIGN.md`, `TASKS.md`, `AGENTS.md` (see Section 15) |

---

## 1. Summary

MindMate AI is a personal AI assistant that does four things well, all on one shared foundation of the user's own data:

1. **Talks** — persistent, multi-conversation chat.
2. **Remembers** — long-term personal memory it can recall when relevant.
3. **Acts** — executes approved actions through validated tool calls.
4. **Finds** — answers questions grounded in the user's past conversations, with sources.

Useful conversation content can also be converted into structured **notes and tasks**.

**Product principle:** MindMate is one integrated assistant, not a chatbot with disconnected AI features. Memory, tools, search, and workspace all read from and write to the same user-owned data model.

## 2. Problem and Opportunity

| Problem | Impact |
|---|---|
| Chat assistants forget everything between sessions. | Users repeat context every time. |
| Useful decisions and facts get buried in old chats. | Users can't find what they discussed before. |
| Assistants talk but don't help organize work. | Users copy/paste outputs into other tools. |
| AI "memory" is opaque. | Users don't trust what's stored or why. |

**Opportunity:** a transparent, user-controlled assistant whose memory and search are inspectable, grounded, and private.

## 3. Goals and Non-Goals

### Goals
- G1. Persistent conversations that survive sessions and devices.
- G2. Memory that is relevant, visible, and user-controllable.
- G3. Safe action execution: the AI proposes, the server validates and executes, the user confirms when it matters.
- G4. Trustworthy search: every answer cites its source conversations, and says so when nothing relevant is found.
- G5. Strict per-user data isolation.
- G6. Simple, maintainable architecture a solo developer can ship and operate.

### Non-Goals (MVP)
- No third-party integrations (calendar, email, Slack, etc.).
- No voice, image, or file understanding.
- No team/shared workspaces or multi-user collaboration.
- No automation/workflow builder or scheduled agents.
- No native mobile apps (responsive web only).
- No LangChain, LangGraph, Redis, Python microservices, or extra infrastructure.

## 4. Target Users and Personas

**Primary persona — "Busy knowledge worker / student."** Uses an AI assistant daily for thinking, planning, and drafting. Frustrated by repeating context and losing past answers. Wants control over what the AI knows about them.

**Secondary persona — "Organizer."** Turns conversations into to-dos and notes. Wants the assistant to propose structure, then approve it quickly.

## 5. Core User Journeys

1. **Chat & resume:** Sign in → start a conversation → close the tab → return next day → continue in the same conversation with full history.
2. **Teach & recall:** User says "I'm vegetarian and prefer morning meetings." Later, in a new conversation, asks for a lunch plan; the assistant uses the stored preference.
3. **Act:** User says "Add a task to review the budget on Friday." Assistant proposes a `create_task` action; user confirms (if required); task is created and the result is shown in chat.
4. **Convert:** After a planning chat, user clicks "Extract to workspace." Assistant proposes 3 tasks and 1 note; user edits, approves, and they're saved.
5. **Search:** User asks "What did we decide about the database schema?" Assistant answers using retrieved conversation excerpts and links to the source conversations.
6. **Manage memory:** User opens Memory page, edits a wrong memory, deletes another.

## 6. Functional Requirements

Priority: **P0** = must ship in MVP, **P1** = should ship, **P2** = later.

### F1. AI Chatbot with Persistent Conversations

| ID | Requirement | Priority |
|---|---|---|
| F1.1 | Email/password (and optionally OAuth) sign-in via Supabase Auth; all app routes require auth. | P0 |
| F1.2 | Create, list, rename, and delete conversations. | P0 |
| F1.3 | Send a message and receive an AI response; both persisted. | P0 |
| F1.4 | Stream AI responses token-by-token. | P1 |
| F1.5 | Reopening a conversation restores full message history. | P0 |
| F1.6 | Context management: send recent messages plus a rolling summary of older ones, within a token budget. | P0 |
| F1.7 | Auto-generate a conversation title after the first exchange. | P1 |
| F1.8 | Graceful error states (API failure, rate limit, timeout) with retry. | P0 |

**Acceptance:** A conversation with 200+ messages still responds correctly; older context is preserved via summary; refresh never loses messages.

### F2. Intelligent Personal Memory

| ID | Requirement | Priority |
|---|---|---|
| F2.1 | AI identifies potentially durable, useful facts or preferences from conversation (not every statement). | P0 |
| F2.2 | Memories are stored with content, category, source conversation, and an embedding. | P0 |
| F2.3 | On each user message, retrieve only the top-k relevant memories via semantic similarity (never load all). | P0 |
| F2.4 | Memory page: view, edit, delete individual memories. | P0 |
| F2.5 | Delete-all-memories control. | P0 |
| F2.6 | Edited memories are re-embedded. | P0 |
| F2.7 | De-duplicate/merge near-identical memories. | P1 |
| F2.8 | UI indicator showing which memories influenced a response. | P1 |
| F2.9 | Never store sensitive categories (e.g., passwords, full payment details, government IDs) — the extraction prompt and a server-side filter both enforce this. | P0 |

**Acceptance:** A stated preference in conversation A is retrieved and used in conversation B; deleting it stops it being used immediately; user A can never retrieve user B's memories.

### F3. AI Action Agent with Tool Calling

| ID | Requirement | Priority |
|---|---|---|
| F3.1 | Define a fixed registry of tools with typed schemas. MVP tools: `create_note`, `create_task`, `update_task`, `complete_task`, `delete_task`, `search_conversations`, `save_memory`, `delete_memory`. | P0 |
| F3.2 | Gemini selects a tool via function calling; the model never touches the database directly. | P0 |
| F3.3 | Server validates arguments against the schema and checks authorization before execution. | P0 |
| F3.4 | Tools are classified by risk: **safe** (read-only / easily reversible) and **sensitive** (destructive, bulk, or hard to undo). | P0 |
| F3.5 | Sensitive actions create a **pending action** and wait for explicit user confirmation before executing. | P0 |
| F3.6 | Execution results (success or error) are returned to the model and shown in chat. | P0 |
| F3.7 | Every executed action is logged (who, what, arguments, result, timestamp). | P0 |
| F3.8 | Confirmation cards show exactly what will happen; user can approve, edit, or reject. | P0 |
| F3.9 | Limit tool-call loops (max N calls per user turn). | P0 |

**Acceptance:** A malformed or out-of-scope tool call is rejected without side effects; a "delete task" request never deletes until the user clicks confirm; one user can't execute actions on another user's data even with a forged ID.

### F4. Conversation-to-Workspace

| ID | Requirement | Priority |
|---|---|---|
| F4.1 | Workspace has two item types: **Notes** and **Tasks**. | P0 |
| F4.2 | Tasks: title, description, status (todo / in progress / done), due date, priority, optional source conversation. | P0 |
| F4.3 | Notes: title, body (plain text/markdown), optional source conversation. | P0 |
| F4.4 | "Extract to workspace" on a conversation (or selection) produces proposed items as structured output. | P0 |
| F4.5 | AI output is schema-validated; invalid output triggers one retry, then a friendly error. | P0 |
| F4.6 | Review screen: edit, remove, or approve each proposed item; only approved items are saved. | P0 |
| F4.7 | Manual create/edit/delete of notes and tasks. | P0 |
| F4.8 | Source link from item back to its conversation. | P1 |

**Acceptance:** Ambiguous dates are surfaced for the user to confirm rather than guessed silently; nothing is saved without approval.

### F5. Context-Aware Conversation Search (RAG)

| ID | Requirement | Priority |
|---|---|---|
| F5.1 | Conversations are chunked (grouped message windows) and embedded; vectors stored in pgvector. | P0 |
| F5.2 | Natural-language search query is embedded and matched against the user's chunks only. | P0 |
| F5.3 | Top-k chunks above a similarity threshold are passed to Gemini to generate an answer. | P0 |
| F5.4 | Answer shows source references (conversation title, date, excerpt) that link to the conversation. | P0 |
| F5.5 | If no chunk meets the threshold, the assistant says it found nothing — it does not guess. | P0 |
| F5.6 | New/updated conversations are indexed in the background; stale chunks are replaced. | P0 |
| F5.7 | Deleting a conversation deletes its chunks and embeddings. | P0 |
| F5.8 | Search available as a dedicated page and as an in-chat tool. | P1 |

**Acceptance:** Every factual claim in a search answer traces to a displayed source; querying for something never discussed returns "no relevant conversations found."

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Security** | Gemini keys and service-role keys exist only in Edge Function secrets. RLS enabled on every table. JWT verified on every function. |
| **Privacy** | Data scoped to the authenticated user; users can export and delete their data (export P1). |
| **Performance** | Time to first streamed token p50 < 2s; memory + RAG retrieval < 500ms excluding LLM time; conversation list loads < 1s. |
| **Reliability** | Gemini failures never corrupt state; user messages are saved before the AI call; retries are idempotent. |
| **Cost control** | Per-user daily request/token limits; summarization and embeddings only when needed. |
| **Maintainability** | Minimal dependencies; one Edge Function per domain; typed schemas shared across validation points. |
| **Accessibility** | Keyboard navigable, semantic HTML, sufficient contrast. |
| **Observability** | Structured logs for AI calls, tool executions, and errors (no raw secrets; minimal PII in logs). |

## 8. Success Metrics

**MVP launch criteria (all must pass):**
- All P0 requirements implemented and manually verified.
- RLS verification: cross-user access attempts fail for every table.
- No secrets present in the frontend bundle or repo.
- Tool-argument fuzzing produces no unauthorized or malformed writes.
- A fixed evaluation set (see Section 11) meets target quality.

**Product metrics (post-launch):**

| Metric | Target |
|---|---|
| Memory acceptance rate (if approval flow) | > 60% of suggested memories approved |
| Search answer grounded rate | 100% of answers include sources or an explicit "not found" |
| Tool-call success rate | > 95% valid calls on eval set |
| Workspace approval rate | > 70% of proposed items approved |
| Error rate (5xx / AI failures) | < 2% of requests |

## 9. Open Product Decisions (Require Approval)

These are **unresolved**. Each has a recommended default so development isn't blocked, but nothing below is final until approved. The architecture is built so every option can be switched without schema changes.

| # | Decision | Options | Recommendation | Status |
|---|---|---|---|---|
| D1 | How are memories saved? | (a) Automatic, (b) AI suggests → user approves, (c) hybrid by category | **(b)** Suggest then approve: highest trust, and best fit for a privacy-sensitive product. Revisit auto-save for low-risk categories later. | ⏳ Unresolved |
| D2 | Which actions need confirmation? | (a) All, (b) only sensitive | **(b)** Only sensitive/destructive/bulk actions. Safe actions run directly but are always logged and shown in chat. | ⏳ Unresolved |
| D3 | Initial workspace scope | Notes + tasks only, or more | **Notes + tasks only.** | ⏳ Unresolved |
| D4 | RAG scope | Conversations only, or also memories/workspace | **Previous conversations only** for MVP. | ⏳ Unresolved |
| D5 | Memory privacy controls | See below | **View, edit, delete one, delete all, pause memory, source link, per-memory "why was this saved".** | ⏳ Unresolved |

**D5 detail — proposed controls:** (1) view all, (2) edit, (3) delete single, (4) delete all, (5) global "pause memory" toggle, (6) each memory links to its source conversation, (7) deleting a conversation does *not* delete memories derived from it unless the user chooses to (needs confirmation text explaining this).

## 10. Release Plan (aligned to 12-day sprint)

| Days | Milestone | Exit criteria |
|---|---|---|
| 1 | Foundation & docs | PRD, ARCHITECTURE, DESIGN, TASKS, AGENTS finalized; schema migrated (ARCHITECTURE §4.4); Supabase project + auth working; decisions D1–D5 resolved |
| 2–3 | Persistent chatbot | F1 P0 complete |
| 4–5 | Intelligent memory | F2 P0 complete |
| 6–7 | Action agent | F3 P0 complete |
| 8–9 | RAG search | F5 P0 complete |
| 10 | Conversation-to-workspace | F4 P0 complete |
| 11–12 | Testing, security, deploy | Launch criteria (Section 8) met; live on Vercel |

Rule: finish each milestone's tests before starting the next. If time slips, cut P1 items, never testing or security.

## 11. Evaluation Plan

Maintain a small versioned eval set in the repo (`/evals`):

- **Memory:** ~30 utterances labeled "should save / should not save"; precision and recall.
- **Tools:** ~30 prompts labeled with expected tool and arguments, including adversarial and ambiguous ones.
- **Workspace extraction:** ~15 conversations with expected notes/tasks.
- **RAG:** ~20 questions with known source conversations, plus ~10 unanswerable questions that must return "not found."

Run before each deployment and after any prompt or model change. Prompt and eval rules live in `ARCHITECTURE.md` §4.6.

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cross-user data leak via missing RLS or service-role misuse | Low | Critical | RLS on all tables; user-scoped Supabase client in functions; RLS tests in CI/checklist; service role only in narrow, audited paths |
| Prompt injection via stored memories or retrieved chunks | Medium | High | Treat retrieved content as untrusted data in prompts; tools validated server-side regardless of model output; sensitive actions need confirmation |
| Hallucinated "memories" or search answers | Medium | High | Grounding prompts, similarity threshold, mandatory citations, "not found" behavior |
| Gemini cost or rate limits | Medium | Medium | Per-user limits, summarization, batch embeddings, caching |
| Edge Function timeouts on long operations | Medium | Medium | Stream responses; do embeddings/indexing asynchronously |
| Embedding model/dimension change breaks vectors | Low | Medium | Store model name and dimension with each vector; version re-embedding job |
| Scope creep in 12 days | High | High | MVP boundaries enforced; P1 items are the first cut |

## 13. Assumptions and Dependencies

- Gemini API provides chat, function calling, and embeddings under current quotas (verify model names and limits against current Google documentation before building).
- Supabase plan supports pgvector and Edge Functions at expected usage.
- Single region, single language (English) for MVP.
- Developer is solo; no design resource — use a simple Tailwind-based UI that follows `DESIGN.md`.

## 14. Out of Scope / Future Ideas

Calendar and email integrations, file/PDF ingestion, voice input, shared workspaces, scheduled/background agents, memory categories with expiry, mobile apps, analytics dashboard.

## 15. Documentation Set

This project uses exactly five planning documents plus a public README. No other Markdown planning files are created.

| File | Answers | Location |
|---|---|---|
| `PRD.md` (this file) | **What** we build and **why**: scope, priorities, decisions D1–D5 | `docs/` |
| `ARCHITECTURE.md` | **How** it is built: stack, data model, API contracts, AI workflow, security, deployment | `docs/` |
| `DESIGN.md` | **How it looks**: colors, typography, components, pages, UI states | `docs/` |
| `TASKS.md` | **In what order**: milestone-by-milestone checklist and status | `docs/` |
| `AGENTS.md` | **How AI coding agents must work** in this repo | repo root |
| `README.md` | Public overview, setup, live link | repo root |

Rules:
- PRD owns scope. If a feature is not in the PRD, it is not built.
- If a plan changes, update the owning document first, then the code.
- Database, API, and AI-workflow details that earlier drafts placed in separate files now live in `ARCHITECTURE.md` (§4.4, §4.5, §4.6).