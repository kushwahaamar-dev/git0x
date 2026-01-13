import { forwardRef } from 'react';

export const Card = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`
      bg-[var(--color-bg-subtle)] 
      border border-[var(--color-border-subtle)]
      rounded-xl
      shadow-[var(--shadow-sm)]
      ${className}
    `}
        {...props}
    />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`px-5 pt-5 pb-2 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className = '', ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-base font-semibold text-[var(--color-text)] tracking-tight ${className}`}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({ className = '', ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`px-5 pb-5 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`px-5 pb-5 pt-2 flex items-center border-t border-[var(--color-border-subtle)] ${className}`}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export default Card;
