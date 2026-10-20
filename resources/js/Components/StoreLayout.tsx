import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { CategorySummary } from '../types';

type SharedProps = {
    auth?: {
        user?: {
            name: string;
            role: string;
        } | null;
    };
    categories?: CategorySummary[];
    cart_count?: number;
    announcement?: {
        enabled: boolean;
        text: string;
    } | null;
};

export function StoreLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<SharedProps>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const categories = props.categories ?? [];
    const announcement = props.announcement;
    const user = props.auth?.user;
    const cartCount = props.cart_count ?? 0;

    return (
        <div className="min-h-screen bg-flora-paper text-flora-ink">
            {announcement?.enabled && announcement.text && (
                <div className="bg-flora-ink px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
                    {announcement.text}
                </div>
            )}
            <header className="sticky top-0 z-30 border-b border-flora-line bg-flora-paper/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
                    <button
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        className="rounded-full border border-flora-line px-3 py-2 text-sm lg:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        type="button"
                    >
                        Menu
                    </button>
                    <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
                        <Link className="text-sm hover:text-flora-accent" href="/shop">
                            Boutique
                        </Link>
                        {categories.slice(0, 4).map((category) => (
                            <Link
                                className="text-sm hover:text-flora-accent"
                                href={`/categories/${category.slug}`}
                                key={category.id}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                    <Link
                        aria-label="FLORAA'S - Accueil"
                        className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-[0.14em] sm:text-3xl"
                        href="/"
                    >
                        FLORAA’S
                    </Link>
                    <div className="flex items-center gap-4">
                        <form action="/shop" className="hidden md:block" method="get" role="search">
                            <label className="sr-only" htmlFor="store-search">Rechercher un produit</label>
                            <input
                                className="w-44 border-b border-flora-line bg-transparent px-1 py-2 text-sm placeholder:text-flora-muted focus:border-flora-accent focus:outline-none"
                                id="store-search"
                                name="q"
                                placeholder="Rechercher"
                                type="search"
                            />
                        </form>
                        {user ? (
                            <>
                                <Link className="hidden text-sm hover:text-flora-accent sm:inline" href="/account">
                                    Mon compte
                                </Link>
                                {user.role === 'admin' && (
                                    <Link className="hidden text-sm hover:text-flora-accent sm:inline" href="/admin">
                                        Administration
                                    </Link>
                                )}
                                <Link className="hidden text-sm hover:text-flora-accent sm:inline" href="/logout" method="post" as="button">
                                    Déconnexion
                                </Link>
                            </>
                        ) : (
                            <Link className="hidden text-sm hover:text-flora-accent sm:inline" href="/login">
                                Mon compte
                            </Link>
                        )}
                        <Link
                            aria-label="Voir le panier"
                            className="text-sm hover:text-flora-accent"
                            href="/cart"
                        >
                            Panier{cartCount > 0 ? ` (${cartCount})` : ''}
                        </Link>
                    </div>
                </div>
                {isMenuOpen && (
                    <nav aria-label="Navigation mobile" className="border-t border-flora-line px-5 py-4 lg:hidden">
                        <div className="flex flex-col gap-4">
                            <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Toute la boutique</Link>
                            {categories.map((category) => (
                                <Link
                                    href={`/categories/${category.slug}`}
                                    key={category.id}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {category.name}
                                </Link>
                            ))}
                            {user ? (
                                <>
                                    <Link href="/account" onClick={() => setIsMenuOpen(false)}>Mon compte</Link>
                                    {user.role === 'admin' && (
                                        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Administration</Link>
                                    )}
                                    <Link as="button" href="/logout" method="post" onClick={() => setIsMenuOpen(false)}>
                                        Déconnexion
                                    </Link>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Mon compte</Link>
                            )}
                            <form action="/shop" className="flex gap-2" method="get" role="search">
                                <label className="sr-only" htmlFor="mobile-store-search">Rechercher un produit</label>
                                <input
                                    className="min-w-0 flex-1 border-b border-flora-line bg-transparent py-2"
                                    id="mobile-store-search"
                                    name="q"
                                    placeholder="Rechercher"
                                    type="search"
                                />
                                <button className="text-sm underline" type="submit">Rechercher</button>
                            </form>
                        </div>
                    </nav>
                )}
            </header>
            <main>{children}</main>
            <footer className="mt-20 border-t border-flora-line bg-[#f1ece5]">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-end sm:justify-between lg:px-10">
                    <div>
                        <p className="font-display text-2xl tracking-[0.14em]">FLORAA’S</p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-flora-muted">
                            Produits, nouveautés et informations de la maison.
                        </p>
                    </div>
                    <div className="flex gap-5 text-sm">
                        <Link href="/shop">Boutique</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
