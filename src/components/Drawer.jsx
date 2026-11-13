import React, { useEffect, useRef } from 'react';

/**
 * Accessible Drawer sheet for responsive mobile sidebar or slide-over panel
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'left',
  width = 'w-[280px]',
  className = '',
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose?.();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideStyles = {
    left: 'left-0 top-0 bottom-0 animate-in slide-in-from-left duration-200',
    right: 'right-0 top-0 bottom-0 animate-in slide-in-from-right duration-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-sepia/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className={`fixed ${width} max-w-[85vw] bg-soft-cream shadow-2xl flex flex-col z-10 border-r border-pebble/70 ${
          sideStyles[side] || sideStyles.left
        } ${className}`}
      >
        {title && (
          <div className="h-14 px-4 flex items-center justify-between border-b border-pebble/50">
            <h2 className="font-headline text-lg text-sepia font-normal">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-driftwood hover:bg-surface-container-high transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;

