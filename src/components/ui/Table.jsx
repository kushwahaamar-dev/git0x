export function Table({ className = '', ...props }) {
    return (
        <div className="relative w-full overflow-auto">
            <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
        </div>
    );
}

export function TableHeader({ className = '', ...props }) {
    return <thead className={`[&_tr]:border-b ${className}`} {...props} />;
}

export function TableBody({ className = '', ...props }) {
    return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
}

export function TableRow({ className = '', ...props }) {
    return (
        <tr
            className={`border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted))]/50 data-[state=selected]:bg-[hsl(var(--muted))] ${className}`}
            {...props}
        />
    );
}

export function TableHead({ className = '', ...props }) {
    return (
        <th
            className={`h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))] [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        />
    );
}

export function TableCell({ className = '', ...props }) {
    return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />;
}

export default Table;
