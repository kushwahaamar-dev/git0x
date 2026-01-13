import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;

    const handleChange = (newValue) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className = '' }) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-[hsl(var(--muted))] p-1 text-[hsl(var(--muted-foreground))] ${className}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className = '' }) {
    const { value: currentValue, onChange } = useContext(TabsContext);
    const isActive = currentValue === value;

    return (
        <button
            type="button"
            onClick={() => onChange(value)}
            className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        ring-offset-[hsl(var(--background))] transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${isActive
                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'hover:bg-[hsl(var(--background))]/50 hover:text-[hsl(var(--foreground))]'
                }
        ${className}
      `}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className = '' }) {
    const { value: currentValue } = useContext(TabsContext);
    if (currentValue !== value) return null;

    return (
        <div className={`mt-2 ring-offset-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 ${className}`}>
            {children}
        </div>
    );
}

export default Tabs;
