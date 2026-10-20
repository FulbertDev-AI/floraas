import { Head, Link } from '@inertiajs/react';
import { StoreLayout } from '../../Components/StoreLayout';

type OrderSummary = {
    id: number;
    reference: string;
    status_label: string;
    currency: string;
    subtotal_minor: number;
    items_count: number;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    customer: {
        name: string;
        email: string;
    };
    orders: {
        data: OrderSummary[];
        links: PaginationLink[];
        total: number;
    };
};

function formatPrice(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency}`;
    }
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function paginationLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export default function Index({ customer, orders }: Props) {
    return (
        <StoreLayout>
            <Head title="Mon compte">
                <meta content="noindex, nofollow" name="robots" />
            </Head>
            <section className="mx-auto max-w-5xl px-5 py-10 sm:py-16 lg:px-10">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Espace client</p>
                <h1 className="mt-2 font-display text-4xl sm:text-5xl">Bonjour {customer.name}</h1>
                <p className="mt-3 text-sm text-flora-muted">{customer.email}</p>

                <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="font-display text-3xl">Mes demandes</h2>
                        <p className="mt-2 text-sm text-flora-muted">
                            Les demandes invitées ne sont pas rattachées automatiquement à un compte.
                        </p>
                    </div>
                    <p className="text-sm text-flora-muted">{orders.total} demande(s)</p>
                </div>

                {orders.data.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                        {orders.data.map((order) => (
                            <article className="border border-flora-line bg-white p-5 sm:p-6" key={order.id}>
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="grid gap-2">
                                        <p className="break-all font-medium">{order.reference}</p>
                                        <p className="text-xs text-flora-muted">
                                            {formatDate(order.created_at)} · {order.items_count} article(s)
                                        </p>
                                        <p className="text-sm">{order.status_label}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:items-end">
                                        <p className="text-sm">
                                            Sous-total indicatif : {formatPrice(order.subtotal_minor, order.currency)}
                                        </p>
                                        <Link
                                            className="inline-flex min-h-10 items-center justify-center border border-flora-ink px-4 text-sm hover:bg-flora-ink hover:text-white"
                                            href={`/account/orders/${order.id}`}
                                        >
                                            Voir le détail
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="mt-6 border border-flora-line bg-white px-6 py-12 text-center text-sm text-flora-muted">
                        Aucune demande n’est encore associée à ce compte.
                    </p>
                )}

                {orders.links.length > 3 && (
                    <nav aria-label="Pagination des demandes" className="mt-8 flex flex-wrap justify-center gap-2">
                        {orders.links.map((link, index) => link.url ? (
                            <Link
                                aria-current={link.active ? 'page' : undefined}
                                className={`min-w-10 border px-3 py-2 text-center text-sm ${link.active ? 'border-flora-ink bg-flora-ink text-white' : 'border-flora-line'}`}
                                href={link.url}
                                key={`${link.label}-${index}`}
                            >
                                {paginationLabel(link.label)}
                            </Link>
                        ) : null)}
                    </nav>
                )}
            </section>
        </StoreLayout>
    );
}
