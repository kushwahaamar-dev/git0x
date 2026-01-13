const variants = {
    default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
};

export function Badge({ variant = 'default', className = '', children, ...props }) {
    return (
        <span
            className={`
        inline-flex items-center gap-1 
        px-2 py-0.5 
        text-xs font-medium 
        rounded-md border
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {children}
        </span>
    );
}

export function SeverityBadge({ severity }) {
    const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
    return <Badge variant={severity}>{labels[severity] || severity}</Badge>;
}

export default Badge;
