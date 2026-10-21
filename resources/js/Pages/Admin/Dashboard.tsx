import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../Components/AdminLayout';

type Metrics = {
    published_products: number;
    draft_products: number;
    out_of_stock_products: number;
    categories: number;
    pending_order_requests: number;
};

export default function Dashboard({ metrics }: { metrics: Metrics }) {
    const cards = [
        { label: 'Produits publiés', value: metrics.published_products },
        { label: 'Brouillons', value: metrics.draft_products },
        { label: 'En rupture', value: metrics.out_of_stock_products },
        { label: 'Catégories', value: metrics.categories },
        { label: 'Demandes en attente', value: metrics.pending_order_requests },
    ];

    return (
        <AdminLayout>
            <Head title="Administration" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Espace de gestion</p>
                    <h1 className="mt-2 font-display text-4xl">Vue d’ensemble</h1>
                </div>
                <Link className="inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark" href="/admin/products/create">
                    Ajouter un produit
                </Link>
            </div>
            <section aria-label="Indicateurs du catalogue" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {cards.map((card) => (
                    <article className="border border-flora-line bg-white p-5" key={card.label}>
                        <p className="text-sm text-flora-muted">{card.label}</p>
                        <p className="mt-3 font-display text-4xl">{card.value}</p>
                    </article>
                ))}
            </section>
            <section className="mt-8 border border-flora-line bg-white p-5 sm:p-7">
                <h2 className="font-display text-2xl">Raccourcis</h2>
                <p className="mt-2 text-sm leading-6 text-flora-muted">
                    Les chiffres ci-dessus sont calculés à partir du catalogue et des demandes enregistrées.
                    Les demandes restent non confirmées tant que le paiement et la livraison ne sont pas configurés.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link className="inline-flex min-h-11 items-center bg-flora-ink px-4 text-sm text-white transition-colors hover:bg-flora-accent-dark" href="/admin/products/create">
                        Ajouter un produit
                    </Link>
                    <Link className="inline-flex min-h-11 items-center border border-flora-line px-4 text-sm transition-colors hover:bg-flora-paper" href="/admin/categories">
                        Gérer les catégories
                    </Link>
                    <Link className="inline-flex min-h-11 items-center border border-flora-line px-4 text-sm transition-colors hover:bg-flora-paper" href="/admin/orders">
                        Voir les demandes
                    </Link>
                    <Link className="inline-flex min-h-11 items-center border border-flora-line px-4 text-sm transition-colors hover:bg-flora-paper" href="/admin/settings">
                        Modifier le site
                    </Link>
                </div>
            </section>
        </AdminLayout>
    );
}
