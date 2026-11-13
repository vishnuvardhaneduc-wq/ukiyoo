import React, { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    id,
    rows = 3,
    className = '',
    containerClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;
  const hintId = hint && textareaId ? `${textareaId}-hint` : undefined;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium uppercase tracking-wider text-driftwood"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        required={required}
        className={`w-full bg-parchment text-sepia text-sm rounded-xl py-2.5 px-3.5 border transition-colors focus:outline-none focus:ring-2 placeholder:text-stone resize-y ${
          error
            ? 'border-danger/80 focus:border-danger focus:ring-danger-bg'
            : 'border-pebble focus:border-ember-orange focus:ring-peach-glow/50'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger flex items-center gap-1 pt-0.5" role="alert">
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

export default Textarea;

