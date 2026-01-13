import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    BookKey,
    ScanSearch,
    Clock,
    CodeXml,
    GitBranch,
    Settings2,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const navItems = [
    { to: '/scan', icon: ScanSearch, label: 'Scan' },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/playground', icon: CodeXml, label: 'Playground' },
    { to: '/hooks', icon: GitBranch, label: 'Git Hooks' },
];

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
        transition-all duration-150
        ${isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
                }
      `}
        >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span className="flex-1">{label}</span>
            <ChevronRight className={`h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-40`} />
        </NavLink>
    );
}

export default function Layout() {
    const location = useLocation();

    const pageTitle = {
        '/scan': 'New Scan',
        '/history': 'Scan History',
        '/playground': 'Playground',
        '/hooks': 'Pre-commit Hooks',
        '/settings': 'Settings',
        '/results': 'Results'
    }[location.pathname] || 'git0x';

    return (
        <div className="flex h-screen bg-[var(--color-bg)]">
            {/* Sidebar */}
            <aside className="w-56 border-r border-[var(--color-border-subtle)] flex flex-col bg-[var(--color-bg-subtle)]">
                {/* Logo */}
                <div className="h-14 flex items-center gap-3 px-4 border-b border-[var(--color-border-subtle)]">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                        <BookKey className="h-4 w-4 text-zinc-900" strokeWidth={2} />
                    </div>
                    <div>
                        <span className="font-semibold text-[var(--color-text)] text-sm">git0x</span>
                        <span className="block text-[10px] text-[var(--color-text-muted)] -mt-0.5">Secret Scanner</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-2.5 space-y-0.5">
                    <p className="px-3 pt-3 pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
                        Scanner
                    </p>
                    {navItems.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-2.5 border-t border-[var(--color-border-subtle)]">
                    <NavItem to="/settings" icon={Settings2} label="Settings" />
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                    <h1 className="text-sm font-medium text-[var(--color-text)]">{pageTitle}</h1>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                        <Sparkles className="h-3 w-3" />
                        <span>Powered by entropy + pattern analysis</span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-[var(--color-bg)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
