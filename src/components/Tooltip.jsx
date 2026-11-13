import React, { useState } from 'react';

/**
 * Accessible hover/focus tooltip
 */
export function Tooltip({ children, text, position = 'top', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  if (!text) return children;

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 mt-2',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute ${positionStyles[position] || positionStyles.top} z-50 whitespace-nowrap rounded-lg bg-sepia px-2.5 py-1 text-xs font-medium text-parchment shadow-md border border-pebble/30 pointer-events-none transition-opacity duration-150 animate-in fade-in`}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default Tooltip;

