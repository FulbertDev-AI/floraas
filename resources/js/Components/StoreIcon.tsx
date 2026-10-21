type IconName = 'account' | 'arrow' | 'bag' | 'chevron' | 'close' | 'logout' | 'menu' | 'search';

export function StoreIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
    const shared = {
        'aria-hidden': true as const,
        className,
        fill: 'none',
        focusable: false as const,
        stroke: 'currentColor',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        strokeWidth: 1.6,
        viewBox: '0 0 24 24',
    };

    switch (name) {
        case 'account':
            return <svg {...shared}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.5-3.1 2.7-5 6.5-5s6 1.9 6.5 5" /></svg>;
        case 'arrow':
            return <svg {...shared}><path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" /></svg>;
        case 'bag':
            return <svg {...shared}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
        case 'chevron':
            return <svg {...shared}><path d="m7 9 5 5 5-5" /></svg>;
        case 'close':
            return <svg {...shared}><path d="m6 6 12 12M18 6 6 18" /></svg>;
        case 'logout':
            return <svg {...shared}><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>;
        case 'menu':
            return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
        case 'search':
            return <svg {...shared}><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></svg>;
    }
}
