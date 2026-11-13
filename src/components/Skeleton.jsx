import React from 'react';

/**
 * Skeleton loading placeholder with subtle parchment pulse
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-soft-cream/80 border border-pebble/30 ${
        variantStyles[variant] || variantStyles.text
      } ${className}`}
    />
  );
}

export default Skeleton;

