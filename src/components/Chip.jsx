import React from 'react';

/**
 * Functional status/category badge.
 * Variants: default, memory, warning, success, danger, primary-outline
 */
export function Chip({
  children,
  variant = 'default',
  size = 'md',
  icon: IconComponent,
  onRemove,
  className = '',
  ...props
}) {
  const variantStyles = {
    default: 'bg-soft-cream text-charcoal-bark border border-pebble/60',
    memory: 'bg-memory-bg text-memory border border-memory-border font-medium',
    warning: 'bg-amber-bg text-amber-confirm border border-amber-border font-medium',
    success: 'bg-success-bg text-success border border-success-border font-medium',
    danger: 'bg-danger-bg/70 text-danger border border-danger-border font-medium',
    'primary-outline': 'bg-transparent text-primary border border-primary/50 font-medium',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full leading-none whitespace-nowrap transition-colors ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {IconComponent && <IconComponent className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove chip"
          className="ml-0.5 hover:opacity-75 focus-visible:outline-none rounded-full p-0.5"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Chip;

