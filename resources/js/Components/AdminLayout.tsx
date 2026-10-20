import { Link, usePage } from '@inertiajs/react';

type AdminPageProps = {
    auth?: {
        user?: {
            name: string;
        } | null;
    };
    flash?: {
        success?: string | null;
    };
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<AdminPageProps>();

    return (
        <div className="min-h-screen bg-flora-paper text-flora-ink">
            <header className="border-b border-flora-line bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-10">
                    <div className="flex items-center gap-6">
                        <Link className="font-display text-xl tracking-[0.12em]" href="/admin">FLORAA’S</Link>
                        <nav aria-label="Administration" className="flex flex-wrap gap-4 text-sm">
                            <Link className="hover:text-flora-accent" href="/admin">Vue d’ensemble</Link>
                            <Link className="hover:text-flora-accent" href="/admin/products">Produits</Link>
                            <Link className="hover:text-flora-accent" href="/admin/orders">Demandes</Link>
                            <Link className="hover:text-flora-accent" href="/admin/categories">Catégories</Link>
                            <Link className="hover:text-flora-accent" href="/admin/collections">Collections</Link>
                            <Link className="hover:text-flora-accent" href="/admin/settings">Paramètres</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        {props.auth?.user && <span className="hidden text-flora-muted sm:inline">{props.auth.user.name}</span>}
                        <Link className="hover:text-flora-accent" href="/" target="_blank">Voir la boutique</Link>
                        <Link className="hover:text-flora-accent" href="/logout" method="post" as="button">Déconnexion</Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
                {props.flash?.success && (
                    <p className="mb-6 border border-green-900/15 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
                        {props.flash.success}
                    </p>
                )}
                {children}
            </main>
        </div>
    );
}
