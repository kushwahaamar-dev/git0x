import { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', ...props }, ref) => (
    <input
        ref={ref}
        className={`
      flex h-10 w-full rounded-lg
      bg-[var(--color-bg-muted)] 
      border border-[var(--color-border)]
      px-3 py-2 text-sm
      text-[var(--color-text)]
      placeholder:text-[var(--color-text-muted)]
      transition-colors duration-150
      hover:border-[var(--color-text-muted)]
      focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]
      disabled:cursor-not-allowed disabled:opacity-50
      ${className}
    `}
        {...props}
    />
));
Input.displayName = 'Input';

export const Label = forwardRef(({ className = '', ...props }, ref) => (
    <label
        ref={ref}
        className={`
      text-sm font-medium text-[var(--color-text-secondary)]
      ${className}
    `}
        {...props}
    />
));
Label.displayName = 'Label';

export default Input;
