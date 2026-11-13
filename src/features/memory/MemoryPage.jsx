import React from 'react';
import { Card } from '../../components/Card.jsx';
import { Icons } from '../../components/Icon.jsx';
import { Chip } from '../../components/Chip.jsx';

export function MemoryPage() {
  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
      <Card elevation="sm" className="text-center p-8 sm:p-12 border border-pebble">
        <div className="w-12 h-12 rounded-2xl bg-memory-bg flex items-center justify-center text-memory mx-auto mb-4 border border-memory-border shadow-xs">
          <Icons.Brain className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="font-headline text-2xl text-sepia font-normal">Personal Memory Vault</h2>
          <Chip variant="memory" size="sm">7 Seeded Memories</Chip>
        </div>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          This page manages user-controlled persistent memories: category filtering, edit/delete flows, auto-extraction pause toggle, and pending memory candidate reviews.
        </p>
      </Card>
    </div>
  );
}

export default MemoryPage;

