import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AdminIcon } from './AdminIcon';

type AdminPageProps = {
    auth?: {
        user?: {
            name: string;
            email: string;
            role: string;
        } | null;
    };
    flash?: {
        success?: string | null;
    };
};

type NavigationItem = {
    href: string;
    icon: Parameters<typeof AdminIcon>[0]['name'];
    label: string;
    exact?: boolean;
};

const navigationGroups: Array<{ label: string; items: NavigationItem[] }> = [
    {
        label: 'Vue d’ensemble',
        items: [{ href: '/admin', icon: 'chart', label: 'Tableau de bord', exact: true }],
    },
    {
        label: 'Catalogue',
        items: [
            { href: '/admin/products', icon: 'box', label: 'Produits' },
            { href: '/admin/categories', icon: 'tag', label: 'Catégories' },
            { href: '/admin/collections', icon: 'layers', label: 'Collections' },
        ],
    },
    {
        label: 'Commandes',
        items: [{ href: '/admin/orders', icon: 'shop', label: 'Demandes de commande' }],
    },
    {
        label: 'Contenu et configuration',
        items: [{ href: '/admin/settings', icon: 'settings', label: 'Apparence et paramètres' }],
    },
];

export function AdminLayout({ children }: { children: ReactNode }) {
    const { props, url } = usePage<AdminPageProps>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = props.auth?.user;

    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        }

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, []);

    function closeSidebar() {
        setIsSidebarOpen(false);
    }

    return (
        <div className="min-h-screen bg-flora-paper text-flora-ink">
            {isSidebarOpen && (
                <button
                    aria-label="Fermer le menu d’administration"
                    className="fixed inset-0 z-40 bg-flora-ink/35 backdrop-blur-[1px] lg:hidden"
                    onClick={closeSidebar}
                    type="button"
                />
            )}

            <aside
                aria-label="Navigation d’administration"
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-2.5rem))] flex-col border-r border-flora-line bg-white transition-transform duration-200 ease-out motion-reduce:transition-none lg:w-72 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex min-h-20 items-center justify-between border-b border-flora-line px-6">
                    <Link
                        aria-label="FLORAA’S — tableau de bord"
                        className="font-display text-xl tracking-[0.12em]"
                        href="/admin"
                        onClick={closeSidebar}
                    >
                        FLORAA’S
                    </Link>
                    <button
                        aria-label="Fermer le menu d’administration"
                        className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
                        onClick={closeSidebar}
                        type="button"
                    >
                        <AdminIcon name="x" />
                    </button>
                </div>

                <nav aria-label="Administration" className="flex-1 overflow-y-auto px-4 py-5" id="admin-navigation">
                    {navigationGroups.map((group) => (
                        <section className="mb-7 last:mb-0" key={group.label}>
                            <h2 className="px-3 text-[10px] font-medium uppercase tracking-[0.17em] text-flora-muted">
                                {group.label}
                            </h2>
                            <ul className="mt-2 grid gap-1">
                                {group.items.map((item) => {
                                    const isActive = item.exact
                                        ? url.split('?')[0] === item.href
                                        : url.split('?')[0] === item.href || url.split('?')[0].startsWith(`${item.href}/`);

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                aria-current={isActive ? 'page' : undefined}
                                                className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition-colors duration-150 ${isActive ? 'border-flora-accent bg-[#f8f3ef] font-medium text-flora-accent-dark' : 'border-transparent text-flora-muted hover:bg-flora-paper hover:text-flora-ink'}`}
                                                href={item.href}
                                                onClick={closeSidebar}
                                            >
                                                <AdminIcon className="h-[18px] w-[18px]" name={item.icon} />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </nav>

                <div className="border-t border-flora-line p-4">
                    {user && (
                        <div className="mb-3 flex min-w-0 items-center gap-3 px-2 py-2">
                            <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3e9e3] font-display text-lg text-flora-accent-dark">
                                {user.name.trim().charAt(0).toLocaleUpperCase('fr-FR')}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{user.name}</p>
                                <p className="truncate text-xs text-flora-muted">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <Link
                        className="flex min-h-11 items-center gap-3 px-3 text-sm text-flora-muted transition-colors hover:bg-flora-paper hover:text-flora-ink"
                        href="/"
                        onClick={closeSidebar}
                        target="_blank"
                    >
                        <AdminIcon className="h-[18px] w-[18px]" name="shop" />
                        Voir la boutique
                        <AdminIcon className="ml-auto h-4 w-4" name="chevron" />
                    </Link>
                    <Link
                        as="button"
                        className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm text-flora-muted transition-colors hover:bg-red-50 hover:text-red-900"
                        href="/logout"
                        method="post"
                        onClick={closeSidebar}
                    >
                        <AdminIcon className="h-[18px] w-[18px]" name="logout" />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-72">
                <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-flora-line bg-flora-paper/95 px-4 backdrop-blur sm:px-6 lg:min-h-20 lg:px-10">
                    <div className="flex items-center gap-3">
                        <button
                            aria-controls="admin-navigation"
                            aria-expanded={isSidebarOpen}
                            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            className="inline-flex h-10 w-10 items-center justify-center border border-flora-line bg-white lg:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            type="button"
                        >
                            <AdminIcon name={isSidebarOpen ? 'x' : 'menu'} />
                        </button>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.17em] text-flora-muted">Espace de gestion</p>
                            <p className="mt-0.5 text-sm font-medium">Administration FLORAA’S</p>
                        </div>
                    </div>
                    {user && (
                        <span className="hidden max-w-52 truncate text-sm text-flora-muted sm:inline" title={user.name}>
                            {user.name}
                        </span>
                    )}
                </header>

                <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                    {props.flash?.success && (
                        <p className="mb-6 border border-green-900/15 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
                            {props.flash.success}
                        </p>
                    )}
                    <div className="admin-content-enter">{children}</div>
                </main>
            </div>
        </div>
    );
}
