type AdminIconName = 'box' | 'chart' | 'chevron' | 'layers' | 'logout' | 'menu' | 'settings' | 'shop' | 'tag' | 'x';

export function AdminIcon({
    name,
    className = 'h-5 w-5',
}: {
    name: AdminIconName;
    className?: string;
}) {
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
        case 'box':
            return <svg {...shared}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" /></svg>;
        case 'chart':
            return <svg {...shared}><rect height="14" rx="1" width="18" x="3" y="5" /><path d="M7 15v-3m5 3V9m5 6v-5" /></svg>;
        case 'chevron':
            return <svg {...shared}><path d="m9 18 6-6-6-6" /></svg>;
        case 'layers':
            return <svg {...shared}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5m-18 5 9 5 9-5" /></svg>;
        case 'logout':
            return <svg {...shared}><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>;
        case 'menu':
            return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
        case 'settings':
            return <svg {...shared}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .8v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.8l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.8-3H4a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .8-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.8V2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .8l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .8 3h.2a1.8 1.8 0 1 1 0 3.6H21a1.8 1.8 0 0 0-1.6 2.9Z" /></svg>;
        case 'shop':
            return <svg {...shared}><path d="M4 9h16l-1 11H5L4 9Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg>;
        case 'tag':
            return <svg {...shared}><path d="M20 13 13 20l-9-9V4h7l9 9Z" /><circle cx="8" cy="8" r="1" /></svg>;
        case 'x':
            return <svg {...shared}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    }
}
