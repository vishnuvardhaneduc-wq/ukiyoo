import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './app/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { AppLayout } from './app/AppLayout.jsx';
import { SignInPage } from './features/auth/SignInPage.jsx';
import { ChatPage } from './features/chat/ChatPage.jsx';
import { MemoryPage } from './features/memory/MemoryPage.jsx';
import { SearchPage } from './features/search/SearchPage.jsx';
import { WorkspaceTasksPage } from './features/workspace/WorkspaceTasksPage.jsx';
import { WorkspaceNotesPage } from './features/workspace/WorkspaceNotesPage.jsx';
import { SettingsPage } from './features/workspace/SettingsPage.jsx';
import { NotFoundPage } from './app/NotFoundPage.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<SignInPage />} />

            {/* Protected App Routes under AppLayout shell */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/chat" replace />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:conversationId" element={<ChatPage />} />
              <Route path="memory" element={<MemoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="workspace/tasks" element={<WorkspaceTasksPage />} />
              <Route path="workspace/notes" element={<WorkspaceNotesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Root redirect to /app/chat */}
            <Route path="/" element={<Navigate to="/app/chat" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
