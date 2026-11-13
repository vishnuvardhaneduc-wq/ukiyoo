import React from 'react';

/**
 * Accessible button with design token styling.
 * Variants: primary, secondary, ghost, danger-outline
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  icon: IconComponent,
  iconRight: IconRightComponent,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-orange focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary text-parchment hover:bg-sepia shadow-sm shadow-peach-glow/40 active:bg-chestnut',
    secondary: 'bg-pure-card text-sepia border border-pebble hover:bg-soft-cream/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]',
    ghost: 'bg-transparent text-charcoal-bark hover:bg-soft-cream hover:text-sepia',
    'danger-outline': 'bg-transparent text-danger border border-danger/40 hover:bg-danger-bg/40 active:bg-danger-bg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      ) : IconComponent ? (
        <IconComponent className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {IconRightComponent && !loading && (
        <IconRightComponent className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}

export default Button;

