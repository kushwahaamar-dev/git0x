import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  default: `
    bg-[var(--color-accent)] text-white font-medium
    hover:bg-[var(--color-accent-hover)]
    shadow-[var(--shadow-sm)]
  `,
  secondary: `
    bg-[var(--color-bg-elevated)] text-[var(--color-text)]
    border border-[var(--color-border)]
    hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-text-muted)]
  `,
  ghost: `
    text-[var(--color-text-secondary)]
    hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]
  `,
  destructive: `
    bg-[var(--color-error)] text-white
    hover:bg-red-600
  `,
  outline: `
    border border-[var(--color-border)] text-[var(--color-text-secondary)]
    hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]
  `
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-10 px-5 text-sm rounded-lg gap-2',
  icon: 'h-9 w-9 rounded-lg'
};

export const Button = forwardRef(({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center whitespace-nowrap font-medium
      transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]
      disabled:opacity-50 disabled:pointer-events-none
      active:scale-[0.98]
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
