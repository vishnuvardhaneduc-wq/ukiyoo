import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/Card.jsx';
import { Icons } from '../../components/Icon.jsx';

export function ChatPage() {
  const { conversationId } = useParams();

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
      <Card elevation="sm" className="text-center p-8 sm:p-12 border border-pebble">
        <div className="w-12 h-12 rounded-2xl bg-soft-cream flex items-center justify-center text-sepia mx-auto mb-4 border border-pebble/60 shadow-xs">
          <Icons.MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="font-headline text-2xl text-sepia font-normal">
          {conversationId ? `Conversation Session: ${conversationId}` : 'New Conversation'}
        </h2>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          This thread view will render persistent multi-turn chat, token streaming, code blocks, cited sources, memory suggestions, and sensitive-action confirmation cards.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/app/chat/conv-1"
            className="text-xs font-medium text-ember-orange hover:underline px-3 py-1.5 rounded-lg bg-soft-cream"
          >
            Load Seeded Chat (Database Schema) →
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ChatPage;

