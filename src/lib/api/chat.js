import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from '../mock/data.js';

// Stateful in-memory stores for mock sessions
let conversations = [...INITIAL_CONVERSATIONS];
let messagesStore = { ...INITIAL_MESSAGES };

const simulateLatency = () =>
  new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

/**
 * List all conversations for current user.
 * @endpoint GET /rest/v1/conversations?select=*&order=updated_at.desc
 */
export async function listConversations() {
  await simulateLatency();
  return [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Create a new conversation thread.
 * @endpoint POST /rest/v1/conversations
 */
export async function createConversation(title = 'New chat') {
  await simulateLatency();
  const newConv = {
    id: `conv-${Date.now()}`,
    title,
    updatedAt: new Date().toISOString(),
    timeGroup: 'Today',
  };
  conversations = [newConv, ...conversations];
  messagesStore[newConv.id] = [];
  return newConv;
}

/**
 * Rename an existing conversation.
 * @endpoint PATCH /rest/v1/conversations?id=eq.{id}
 */
export async function renameConversation(id, newTitle) {
  await simulateLatency();
  const conv = conversations.find((c) => c.id === id);
  if (!conv) throw new Error('Conversation not found');
  conv.title = newTitle;
  conv.updatedAt = new Date().toISOString();
  return { ...conv };
}

/**
 * Delete a conversation thread and its associated message rows.
 * @endpoint DELETE /rest/v1/conversations?id=eq.{id}
 */
export async function deleteConversation(id) {
  await simulateLatency();
  conversations = conversations.filter((c) => c.id !== id);
  delete messagesStore[id];
  return { success: true, id };
}

/**
 * List all messages within a conversation.
 * @endpoint GET /rest/v1/messages?conversation_id=eq.{id}&order=created_at.asc
 */
export async function listMessages(conversationId) {
  await simulateLatency();
  return messagesStore[conversationId] ? [...messagesStore[conversationId]] : [];
}

/**
 * Send a user message and receive streaming assistant tokens and tool output.
 * @endpoint POST /functions/v1/chat
 */
export async function sendMessage(conversationId, text, { onToken, signal } = {}) {
  await simulateLatency();

  const userMsg = {
    id: `msg-${Date.now()}`,
    conversationId,
    role: 'user',
    content: text,
    createdAt: new Date().toISOString(),
    status: 'complete',
    memoriesUsed: [],
    sources: [],
  };

  if (!messagesStore[conversationId]) {
    messagesStore[conversationId] = [];
  }
  messagesStore[conversationId].push(userMsg);

  // Simulated AI response
  const assistantMsgId = `msg-${Date.now() + 1}`;
  const responseText = `I have received your message: "${text}". I have logged this to your MindMate memory and workspace.`;

  // Simulate token streaming if callback provided
  if (onToken) {
    const tokens = responseText.split(' ');
    for (const token of tokens) {
      if (signal?.aborted) break;
      await new Promise((r) => setTimeout(r, 40));
      onToken(`${token} `);
    }
  }

  const assistantMsg = {
    id: assistantMsgId,
    conversationId,
    role: 'assistant',
    content: responseText,
    createdAt: new Date().toISOString(),
    status: 'complete',
    memoriesUsed: [],
    sources: [],
  };

  messagesStore[conversationId].push(assistantMsg);

  // Update conversation timestamp
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }

  return assistantMsg;
}

/**
 * Approve a pending sensitive action.
 * @endpoint POST /functions/v1/confirm-action
 */
export async function approveAction(actionId) {
  await simulateLatency();
  // Find message with this action and update status
  for (const convId of Object.keys(messagesStore)) {
    for (const msg of messagesStore[convId]) {
      if (msg.proposedAction?.id === actionId) {
        msg.proposedAction.status = 'approved';
        return {
          ok: true,
          actionId,
          status: 'approved',
          message: 'Action approved and executed successfully.',
        };
      }
    }
  }
  return { ok: true, actionId, status: 'approved' };
}

/**
 * Reject a pending sensitive action.
 * @endpoint POST /functions/v1/confirm-action
 */
export async function rejectAction(actionId) {
  await simulateLatency();
  for (const convId of Object.keys(messagesStore)) {
    for (const msg of messagesStore[convId]) {
      if (msg.proposedAction?.id === actionId) {
        msg.proposedAction.status = 'rejected';
        return {
          ok: true,
          actionId,
          status: 'rejected',
          message: 'Action was safely cancelled.',
        };
      }
    }
  }
  return { ok: true, actionId, status: 'rejected' };
}

