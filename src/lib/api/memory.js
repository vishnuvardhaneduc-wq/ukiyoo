import { INITIAL_MEMORIES } from '../mock/data.js';

let memories = [...INITIAL_MEMORIES];
let memoryPaused = false;

const simulateLatency = () =>
  new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

/**
 * List all memories for current user (active and pending).
 * @endpoint GET /rest/v1/memories?select=*&order=created_at.desc
 */
export async function listMemories() {
  await simulateLatency();
  return [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update memory content or category.
 * @endpoint POST /functions/v1/memory-manage
 */
export async function updateMemory(id, { content, category }) {
  await simulateLatency();
  const mem = memories.find((m) => m.id === id);
  if (!mem) throw new Error('Memory not found');
  if (content !== undefined) mem.content = content;
  if (category !== undefined) mem.category = category;
  return { ...mem };
}

/**
 * Delete a memory record.
 * @endpoint DELETE /rest/v1/memories?id=eq.{id}
 */
export async function deleteMemory(id) {
  await simulateLatency();
  memories = memories.filter((m) => m.id !== id);
  return { success: true, id };
}

/**
 * Approve a pending memory recommendation.
 * @endpoint POST /functions/v1/memory-manage
 */
export async function approveMemory(id) {
  await simulateLatency();
  const mem = memories.find((m) => m.id === id);
  if (!mem) throw new Error('Memory not found');
  mem.status = 'active';
  return { ...mem };
}

/**
 * Dismiss/reject a suggested memory.
 * @endpoint POST /functions/v1/memory-manage
 */
export async function dismissMemory(id) {
  await simulateLatency();
  memories = memories.filter((m) => m.id !== id);
  return { success: true, id };
}

/**
 * Pause or resume automated memory extraction and injection.
 * @endpoint PATCH /rest/v1/user_settings?select=memory_paused
 */
export async function setMemoryPaused(paused) {
  await simulateLatency();
  memoryPaused = Boolean(paused);
  return { memoryPaused };
}

/**
 * Save an inline memory suggestion emitted by chat.
 * @endpoint POST /functions/v1/memory-manage
 */
export async function saveMemorySuggestion({ text, category = 'preference', sourceConversationId, sourceConversationTitle }) {
  await simulateLatency();
  const newMemory = {
    id: `mem-${Date.now()}`,
    content: text,
    category,
    status: 'active',
    sourceConversationId: sourceConversationId || 'conv-1',
    sourceConversationTitle: sourceConversationTitle || 'Database schema for MindMate',
    createdAt: new Date().toISOString(),
  };
  memories = [newMemory, ...memories];
  return newMemory;
}

