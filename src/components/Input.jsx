import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    type = 'text',
    className = '',
    containerClassName = '',
    icon: IconComponent,
    rightElement,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-wider text-driftwood"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {IconComponent && (
          <div className="absolute left-3.5 text-stone pointer-events-none">
            <IconComponent className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          required={required}
          className={`w-full bg-parchment text-sepia text-sm rounded-xl py-2.5 px-3.5 border transition-colors focus:outline-none focus:ring-2 placeholder:text-stone ${
            IconComponent ? 'pl-10' : ''
          } ${rightElement ? 'pr-11' : ''} ${
            error
              ? 'border-danger/80 focus:border-danger focus:ring-danger-bg'
              : 'border-pebble focus:border-ember-orange focus:ring-peach-glow/50'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-danger flex items-center gap-1 pt-0.5" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-stone">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

