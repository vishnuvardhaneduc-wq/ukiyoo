import React from 'react';

/**
 * Editorial Card component using token surfaces
 */
export function Card({
  children,
  className = '',
  elevation = 'sm',
  padding = 'md',
  hover = false,
  as: Component = 'div',
  ...props
}) {
  const elevationStyles = {
    none: 'shadow-none border border-line',
    sm: 'shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-line',
    md: 'shadow-[0_1px_8px_rgba(254,208,179,0.25)] border border-pebble',
    lg: 'shadow-lg shadow-peach-glow/30 border border-pebble',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <Component
      className={`bg-pure-card rounded-2xl ${elevationStyles[elevation] || elevationStyles.sm} ${
        paddingStyles[padding] || paddingStyles.md
      } ${hover ? 'transition-transform duration-150 hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;

