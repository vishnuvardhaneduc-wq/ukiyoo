import React from 'react';

/**
 * EmptyState component for blank or zero-result states
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto ${className}`}
    >
      {IconComponent && (
        <div className="w-12 h-12 rounded-2xl bg-soft-cream flex items-center justify-center text-driftwood mb-4 border border-pebble/60 shadow-sm">
          <IconComponent className="w-6 h-6" />
        </div>
      )}
      {title && (
        <h3 className="font-headline text-2xl text-sepia font-normal tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted mt-2 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;

