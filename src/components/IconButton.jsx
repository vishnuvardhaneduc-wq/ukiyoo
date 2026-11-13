import React from 'react';
import Tooltip from './Tooltip.jsx';

/**
 * Accessible Icon-only button with built-in tooltip and focus rings
 */
export function IconButton({
  icon: IconComponent,
  'aria-label': ariaLabel,
  tooltip,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: 'w-7 h-7 p-1 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-10 h-10 p-2 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary text-parchment hover:bg-sepia shadow-sm',
    secondary: 'bg-pure-card text-sepia border border-pebble hover:bg-soft-cream',
    ghost: 'text-driftwood hover:bg-soft-cream hover:text-charcoal-bark',
    danger: 'text-danger hover:bg-danger-bg/40',
  };

  const button = (
    <button
      type={type}
      aria-label={ariaLabel || tooltip}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-orange focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.ghost} ${className}`}
      {...props}
    >
      {IconComponent && <IconComponent className="w-full h-full" />}
    </button>
  );

  if (tooltip || ariaLabel) {
    return <Tooltip text={tooltip || ariaLabel}>{button}</Tooltip>;
  }

  return button;
}

export default IconButton;

