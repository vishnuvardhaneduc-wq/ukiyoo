import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Icons } from '../components/Icon.jsx';

export function NotFoundPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-parchment">
      <Card elevation="md" className="max-w-md w-full text-center p-8 sm:p-10 border border-pebble">
        <span className="font-mono text-4xl font-semibold text-ember-orange">404</span>
        <h1 className="font-headline text-3xl text-sepia font-normal mt-2">
          Page Not Found
        </h1>
        <p className="text-sm text-muted mt-2">
          The editorial page or session you requested does not exist or has been relocated.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/app/chat">
            <Button variant="primary" icon={Icons.ArrowRight}>
              Back to Chat
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}

export default NotFoundPage;

