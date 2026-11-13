import React from 'react';
import { Card } from '../../components/Card.jsx';
import { Icons } from '../../components/Icon.jsx';

export function WorkspaceNotesPage() {
  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
      <Card elevation="sm" className="text-center p-8 sm:p-12 border border-pebble">
        <div className="w-12 h-12 rounded-2xl bg-soft-cream flex items-center justify-center text-sepia mx-auto mb-4 border border-pebble/60 shadow-xs">
          <Icons.FileText className="w-6 h-6" />
        </div>
        <h2 className="font-headline text-2xl text-sepia font-normal">Workspace Notes</h2>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          Captures editorial summaries and reference notes extracted directly from conversation threads through the Conversation-to-Workspace extraction pipeline.
        </p>
      </Card>
    </div>
  );
}

export default WorkspaceNotesPage;

