import React from 'react';

/**
 * Avatar component with initials or fallback icon
 */
export function Avatar({
  name,
  src,
  size = 'md',
  variant = 'user', // user | ai
  className = '',
}) {
  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const isAi = variant === 'ai';

  return (
    <div
      aria-label={name || (isAi ? 'MindMate AI' : 'User')}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 font-medium select-none overflow-hidden ${
        isAi
          ? 'bg-chestnut text-peach-glow shadow-sm'
          : 'bg-soft-cream text-sepia border border-pebble'
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : isAi ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export default Avatar;

