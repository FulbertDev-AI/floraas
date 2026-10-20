import { Head, Link, usePage } from '@inertiajs/react';
import { AdminLayout } from '../../../Components/AdminLayout';

type Taxonomy = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    is_published: boolean;
    sort_order: number;
    products_count: number;
};

type Props = {
    kind: 'categories' | 'collections';
    title: string;
    items: {
        data: Taxonomy[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
};

type ErrorProps = {
    errors?: {
        category?: string;
        collection?: string;
    };
};

export default function Index({ kind, title, items }: Props) {
    const { props } = usePage<ErrorProps>();
    const resourceTitle = kind === 'categories' ? 'catégorie' : 'collection';
    const baseUrl = `/admin/${kind}`;

    return (
        <AdminLayout>
            <Head title={title} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Catalogue</p>
                    <h1 className="mt-2 font-display text-4xl">{title}</h1>
                    <p className="mt-2 text-sm text-flora-muted">{items.total} élément(s)</p>
                </div>
                <Link className="inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark" href={`${baseUrl}/create`}>
                    Ajouter une {resourceTitle}
                </Link>
            </div>
            {(props.errors?.category || props.errors?.collection) && (
                <p className="mt-5 border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                    {props.errors.category ?? props.errors.collection}
                </p>
            )}
            <div className="mt-8 overflow-hidden border border-flora-line bg-white">
                {items.data.length > 0 ? (
                    <ul className="divide-y divide-flora-line">
                        {items.data.map((item) => (
                            <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center" key={item.id}>
                                <div className="h-16 w-20 shrink-0 overflow-hidden bg-[#eee7df]">
                                    {item.image_url && <img alt="" className="h-full w-full object-cover" loading="lazy" src={item.image_url} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link className="font-medium hover:underline" href={`${baseUrl}/${item.id}/edit`}>{item.name}</Link>
                                    <p className="mt-1 text-sm text-flora-muted">
                                        /{item.slug} · {item.products_count} produit(s)
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-wide text-flora-muted">
                                        {item.is_published ? 'Publié' : 'Brouillon'} · Ordre {item.sort_order}
                                    </p>
                                </div>
                                <Link className="text-sm underline underline-offset-4" href={`${baseUrl}/${item.id}/edit`}>
                                    Modifier
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-6 py-12 text-center text-sm text-flora-muted">
                        Aucune {resourceTitle} pour le moment. Créez-en une pour organiser le catalogue.
                    </p>
                )}
            </div>
            {items.links.length > 3 && (
                <nav aria-label="Pagination" className="mt-6 flex flex-wrap justify-center gap-2">
                    {items.links.map((link, index) => link.url ? (
                        <Link
                            aria-current={link.active ? 'page' : undefined}
                            className={`min-w-10 border px-3 py-2 text-center text-sm ${link.active ? 'border-flora-ink bg-flora-ink text-white' : 'border-flora-line hover:border-flora-ink'}`}
                            href={link.url}
                            key={`${link.label}-${index}`}
                        >
                            {link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}
                        </Link>
                    ) : (
                        <span aria-disabled="true" className="min-w-10 border border-flora-line px-3 py-2 text-center text-sm text-flora-muted/60" key={`${link.label}-${index}`}>
                            {link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}
                        </span>
                    ))}
                </nav>
            )}
        </AdminLayout>
    );
}
