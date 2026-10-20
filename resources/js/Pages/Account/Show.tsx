import { Head, Link } from '@inertiajs/react';
import { StoreLayout } from '../../Components/StoreLayout';

type OrderItem = {
    product_name: string;
    variant_name: string | null;
    variant_value: string | null;
    quantity: number;
    unit_price_minor: number;
    currency: string;
};

type OrderDetails = {
    id: number;
    reference: string;
    status_label: string;
    payment_status_label: string;
    currency: string;
    subtotal_minor: number;
    created_at: string;
    items: OrderItem[];
};

function formatPrice(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency}`;
    }
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function Show({ order }: { order: OrderDetails }) {
    return (
        <StoreLayout>
            <Head title={`Demande ${order.reference}`}>
                <meta content="noindex, nofollow" name="robots" />
            </Head>
            <section className="mx-auto max-w-3xl px-5 py-10 sm:py-16 lg:px-10">
                <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-flora-muted">
                    <Link href="/account">Mon compte</Link>
                    <span className="px-2">/</span>
                    <span aria-current="page" className="text-flora-ink">Détail de la demande</span>
                </nav>
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Historique des demandes</p>
                <h1 className="mt-2 break-all font-display text-3xl sm:text-4xl">{order.reference}</h1>
                <p className="mt-3 text-sm text-flora-muted">Envoyée le {formatDate(order.created_at)}</p>

                <div className="mt-6 grid gap-2 border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                    <p>Statut : <span className="font-medium">{order.status_label}</span></p>
                    <p>Paiement : {order.payment_status_label}</p>
                    <p>Cette demande n’est pas une commande confirmée et aucun paiement n’a été enregistré.</p>
                </div>

                <div className="mt-8 border border-flora-line bg-white p-5 sm:p-7">
                    <h2 className="font-display text-2xl">Articles demandés</h2>
                    <ul className="mt-5 grid gap-4">
                        {order.items.map((item, index) => (
                            <li
                                className="flex flex-col justify-between gap-2 border-b border-flora-line pb-4 sm:flex-row sm:items-start"
                                key={`${item.product_name}-${index}`}
                            >
                                <div>
                                    <p className="font-medium">{item.product_name}</p>
                                    {(item.variant_name || item.variant_value) && (
                                        <p className="text-sm text-flora-muted">
                                            {[item.variant_name, item.variant_value].filter(Boolean).join(' : ')}
                                        </p>
                                    )}
                                    <p className="text-sm text-flora-muted">Quantité : {item.quantity}</p>
                                </div>
                                <p className="text-sm">{formatPrice(item.unit_price_minor * item.quantity, item.currency)}</p>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-5 flex justify-between gap-4 text-sm font-medium">
                        <span>Sous-total indicatif</span>
                        <span>{formatPrice(order.subtotal_minor, order.currency)}</span>
                    </p>
                </div>

                <Link className="mt-6 inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white" href="/account">
                    Retour à mon compte
                </Link>
            </section>
        </StoreLayout>
    );
}
