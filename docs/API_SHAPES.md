# API shapes (mock now, real backend later)

Conversation   { id, title, updatedAt }
Message        { id, conversationId, role: "user"|"assistant", content, createdAt,
                 status: "complete"|"streaming"|"error",
                 memoriesUsed: Memory[], sources: Source[],
                 proposedAction?: PendingAction,
                 actionResult?: { tool, summary, ok },
                 memorySuggestion?: { id, text, category } }
Memory         { id, content, category: "preference"|"project"|"person"|"fact",
                 status: "active"|"pending",
                 sourceConversationId, sourceConversationTitle, createdAt }
PendingAction  { id, tool, summary, risk: "safe"|"sensitive",
                 status: "pending"|"approved"|"rejected"|"expired", expiresAt }
Task           { id, title, description, status: "todo"|"in_progress"|"done",
                 priority: "low"|"medium"|"high", dueDate, sourceConversationId }
Note           { id, title, body, sourceConversationId, updatedAt }
Source         { id, conversationId, conversationTitle, date, excerpt, messageRange, score }
SearchResult   { answer: string with markers like [1] [2], or null; sources: Source[] }
               (answer is null and sources is empty when nothing relevant is found)

Functions (all async)
chat:      listConversations, createConversation, renameConversation, deleteConversation,
           listMessages, sendMessage(conversationId, text, { onToken, signal }),
           approveAction(id), rejectAction(id)
memory:    listMemories, updateMemory, deleteMemory, approveMemory, dismissMemory,
           setMemoryPaused, saveMemorySuggestion
search:    searchConversations(query)
workspace: listTasks, createTask, updateTask, deleteTask