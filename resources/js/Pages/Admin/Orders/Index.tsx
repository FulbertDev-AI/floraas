import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../../Components/AdminLayout';

type OrderSummary = {
    id: number;
    reference: string;
    contact_name: string;
    email: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    currency: string;
    subtotal_minor: number;
    items_count: number;
    created_at: string;
};

type Props = {
    orders: {
        data: OrderSummary[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
};

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
}

export default function Index({ orders }: Props) {
    return (
        <AdminLayout>
            <Head title="Demandes de commande" />
            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Commerce</p>
                <h1 className="mt-2 font-display text-4xl">Demandes de commande</h1>
                <p className="mt-2 text-sm text-flora-muted">{orders.total} demande(s), aucune confirmation de paiement automatique.</p>
            </div>

            <div className="mt-8 overflow-x-auto border border-flora-line bg-white">
                {orders.data.length > 0 ? (
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-flora-line bg-flora-paper text-xs uppercase tracking-wide text-flora-muted">
                            <tr>
                                <th className="px-4 py-3 font-medium">Référence</th>
                                <th className="px-4 py-3 font-medium">Client</th>
                                <th className="px-4 py-3 font-medium">Statut</th>
                                <th className="px-4 py-3 font-medium">Paiement</th>
                                <th className="px-4 py-3 font-medium">Montant indicatif</th>
                                <th className="px-4 py-3 font-medium"><span className="sr-only">Action</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-flora-line">
                            {orders.data.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-4 py-4">
                                        <p className="font-medium">{order.reference}</p>
                                        <p className="mt-1 text-xs text-flora-muted">{order.created_at}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p>{order.contact_name}</p>
                                        <p className="mt-1 text-xs text-flora-muted">{order.email}</p>
                                    </td>
                                    <td className="px-4 py-4">{order.status_label}</td>
                                    <td className="px-4 py-4">{order.payment_status_label}</td>
                                    <td className="px-4 py-4">{formatPrice(order.subtotal_minor, order.currency)}</td>
                                    <td className="px-4 py-4">
                                        <Link className="underline underline-offset-4" href={`/admin/orders/${order.id}`}>Consulter</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="px-6 py-14 text-center text-sm text-flora-muted">Aucune demande n’a encore été reçue.</p>
                )}
            </div>
        </AdminLayout>
    );
}
