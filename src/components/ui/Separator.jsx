export function Separator({ className = '', orientation = 'horizontal', ...props }) {
    return (
        <div
            role="separator"
            className={`
        shrink-0 bg-[hsl(var(--border))]
        ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'}
        ${className}
      `}
            {...props}
        />
    );
}

export default Separator;
