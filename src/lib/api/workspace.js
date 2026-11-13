import { INITIAL_TASKS } from '../mock/data.js';

let tasks = [...INITIAL_TASKS];
let notes = [
  {
    id: 'note-1',
    title: 'MVP Sprint Architecture Notes',
    body: 'Single data model shared across chat, memory, and actions. RLS on every table.',
    sourceConversationId: 'conv-1',
    updatedAt: '2026-11-13T09:00:00Z',
  },
];

const simulateLatency = () =>
  new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

/**
 * List all workspace tasks.
 * @endpoint GET /rest/v1/tasks?select=*&order=created_at.desc
 */
export async function listTasks() {
  await simulateLatency();
  return [...tasks];
}

/**
 * Create a new task in user workspace.
 * @endpoint POST /rest/v1/tasks
 */
export async function createTask({ title, description = '', priority = 'medium', dueDate, sourceConversationId }) {
  await simulateLatency();
  const newTask = {
    id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    description,
    status: 'todo',
    priority,
    dueDate: dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
    sourceConversationId,
  };
  tasks = [newTask, ...tasks];
  return newTask;
}

/**
 * Update task status, priority, or content.
 * @endpoint PATCH /rest/v1/tasks?id=eq.{id}
 */
export async function updateTask(id, updates) {
  await simulateLatency();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error('Task not found');
  Object.assign(task, updates);
  return { ...task };
}

/**
 * Delete a workspace task (typically via confirmed sensitive action).
 * @endpoint DELETE /rest/v1/tasks?id=eq.{id}
 */
export async function deleteTask(id) {
  await simulateLatency();
  tasks = tasks.filter((t) => t.id !== id);
  return { success: true, id };
}

/**
 * List all workspace notes.
 * @endpoint GET /rest/v1/notes?select=*&order=updated_at.desc
 */
export async function listNotes() {
  await simulateLatency();
  return [...notes];
}

