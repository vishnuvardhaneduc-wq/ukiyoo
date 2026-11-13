/**
 * Seeded mock data reflecting docs/DESIGN_TOKENS.md, docs/API_SHAPES.md,
 * and stitch screenshots.
 */

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Database schema for MindMate',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    timeGroup: 'Today',
  },
  {
    id: 'conv-2',
    title: 'Weekly budget review',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // Yesterday
    timeGroup: 'Yesterday',
  },
  {
    id: 'conv-3',
    title: 'Hackathon demo script',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
    timeGroup: 'Yesterday',
  },
  {
    id: 'conv-4',
    title: 'Gemini embeddings dimensions',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    timeGroup: 'Previous 7 days',
  },
  {
    id: 'conv-5',
    title: 'Plan my week',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    timeGroup: 'Previous 7 days',
  },
];

export const INITIAL_MEMORIES = [
  {
    id: 'mem-1',
    content: 'Prefers PostgreSQL v16 with pgvector extension enabled for all vector storage.',
    category: 'preference',
    status: 'active',
    sourceConversationId: 'conv-1',
    sourceConversationTitle: 'Database schema for MindMate',
    createdAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'mem-2',
    content: 'All API JSON response keys and client state must use camelCase conventions.',
    category: 'preference',
    status: 'active',
    sourceConversationId: 'conv-1',
    sourceConversationTitle: 'Database schema for MindMate',
    createdAt: '2026-11-12T10:05:00Z',
  },
  {
    id: 'mem-3',
    content: 'Primary project goal is building MindMate AI: transparent, user-controlled memory assistant.',
    category: 'project',
    status: 'active',
    sourceConversationId: 'conv-3',
    sourceConversationTitle: 'Hackathon demo script',
    createdAt: '2026-11-11T14:20:00Z',
  },
  {
    id: 'mem-4',
    content: 'Solo engineer Pramod is working on a fast 12-day MVP delivery sprint.',
    category: 'person',
    status: 'active',
    sourceConversationId: 'conv-5',
    sourceConversationTitle: 'Plan my week',
    createdAt: '2026-11-10T09:15:00Z',
  },
  {
    id: 'mem-5',
    content: 'Backend Edge Functions run on Deno TypeScript runtime with user-scoped RLS clients.',
    category: 'fact',
    status: 'active',
    sourceConversationId: 'conv-4',
    sourceConversationTitle: 'Gemini embeddings dimensions',
    createdAt: '2026-11-09T16:30:00Z',
  },
  {
    id: 'mem-6',
    content: 'User prefers dark-mode terminal color schemes and compact ASCII tables in responses.',
    category: 'preference',
    status: 'pending',
    sourceConversationId: 'conv-1',
    sourceConversationTitle: 'Database schema for MindMate',
    createdAt: '2026-11-13T01:10:00Z',
  },
  {
    id: 'mem-7',
    content: 'Need to submit hackathon prototype video presentation by November 15th.',
    category: 'project',
    status: 'pending',
    sourceConversationId: 'conv-3',
    sourceConversationTitle: 'Hackathon demo script',
    createdAt: '2026-11-13T02:00:00Z',
  },
];

export const INITIAL_TASKS = [
  {
    id: 'TK-8801',
    title: 'Record demo video',
    description: 'Record 3-minute walkthrough demonstrating chat, memory extraction, and action confirmation.',
    status: 'done',
    priority: 'high',
    dueDate: '2026-11-14',
    sourceConversationId: 'conv-1',
  },
  {
    id: 'TK-8802',
    title: 'Review budget draft',
    description: 'Associated with Q3 Financial Allocations ledger. 3 subtasks and calendar reminders.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-11-15',
    sourceConversationId: 'conv-2',
  },
  {
    id: 'TK-8803',
    title: 'Configure pgvector HNSW index',
    description: 'Tune m=16, ef_construction=64 with cosine distance operator on embedding columns.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-11-16',
    sourceConversationId: 'conv-1',
  },
  {
    id: 'TK-8804',
    title: 'Verify RLS multi-tenant test script',
    description: 'Ensure cross-user read/write asserts fail across all 6 production tables.',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-11-17',
    sourceConversationId: 'conv-4',
  },
];

export const INITIAL_MESSAGES = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Can you show me the SQL schema for conversations and messages, and create a task for recording the demo video?',
      createdAt: '2026-11-13T10:40:00Z',
      status: 'complete',
      memoriesUsed: [],
      sources: [],
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: `Here is the clean Postgres v16 database schema with row-level security enabled:

\`\`\`sql
-- Conversations Table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages Table with Idempotency Key
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_idempotency UNIQUE(user_id, idempotency_key)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
\`\`\`

I have also registered the task for recording your demo video.`,
      createdAt: '2026-11-13T10:41:00Z',
      status: 'complete',
      memoriesUsed: [
        INITIAL_MEMORIES[0], // Postgres v16
        INITIAL_MEMORIES[1], // camelCase
        INITIAL_MEMORIES[4], // Deno Edge
      ],
      sources: [
        {
          id: 'src-1',
          conversationId: 'conv-4',
          conversationTitle: 'Gemini embeddings dimensions',
          date: 'Yesterday',
          excerpt: 'Using standard UUID keys with cascade constraints across messages.',
          messageRange: 'Messages 3-4',
          score: 0.92,
        },
      ],
      actionResult: {
        tool: 'create_task',
        summary: 'Created task: Record demo video (Due tomorrow • Assigned to Pramod)',
        ok: true,
      },
      memorySuggestion: {
        id: 'sugg-1',
        text: 'User prefers dark-mode terminal color schemes and compact ASCII tables in responses.',
        category: 'preference',
      },
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Delete the task Review budget draft.',
      createdAt: '2026-11-13T10:42:00Z',
      status: 'complete',
      memoriesUsed: [],
      sources: [],
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'I can do that. Because deleting a task cannot be undone, please confirm before I remove it from your workspace ledger.',
      createdAt: '2026-11-13T10:42:15Z',
      status: 'complete',
      memoriesUsed: [],
      sources: [],
      proposedAction: {
        id: 'act-1',
        tool: 'delete_task',
        summary: 'Delete task: Review budget draft (Associated with Q3 Financial Allocations ledger. 3 subtasks will be removed.)',
        risk: 'sensitive',
        status: 'pending',
        expiresAt: new Date(Date.now() + 1000 * 60 * 14).toISOString(), // ~14m left
        targetTaskId: 'TK-8802',
      },
    },
  ],
  'conv-2': [
    {
      id: 'msg-201',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Let us do our weekly budget review.',
      createdAt: '2026-11-12T09:00:00Z',
      status: 'complete',
      memoriesUsed: [],
      sources: [],
    },
    {
      id: 'msg-202',
      conversationId: 'conv-2',
      role: 'assistant',
      content: 'Ready! Last week total expenditures were within the allotted $2,400 envelope.',
      createdAt: '2026-11-12T09:00:30Z',
      status: 'complete',
      memoriesUsed: [],
      sources: [],
    },
  ],
};

