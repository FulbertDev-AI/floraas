import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout } from '../../../Components/AdminLayout';

type TaxonomyInput = {
    id: number;
    parent_id?: number | null;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_published: boolean;
    sort_order: number;
};

type ParentCategory = {
    id: number;
    name: string;
};

type Props = {
    kind: 'categories' | 'collections';
    title: string;
    item: TaxonomyInput | null;
    parents?: ParentCategory[];
};

type FormData = {
    parent_id: number | null;
    name: string;
    slug: string;
    description: string;
    image: File | null;
    is_published: boolean;
    sort_order: number;
};

function slugify(value: string): string {
    return value.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function Form({ kind, title, item, parents = [] }: Props) {
    const baseUrl = `/admin/${kind}`;
    const form = useForm<FormData>({
        parent_id: item?.parent_id ?? null,
        name: item?.name ?? '',
        slug: item?.slug ?? '',
        description: item?.description ?? '',
        image: null,
        is_published: item?.is_published ?? false,
        sort_order: item?.sort_order ?? 0,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (item) {
            form.put(`${baseUrl}/${item.id}`, { forceFormData: true });
        } else {
            form.post(baseUrl, { forceFormData: true });
        }
    }

    return (
        <AdminLayout>
            <Head title={title} />
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h1 className="font-display text-4xl">{title}</h1>
                <Link className="text-sm underline underline-offset-4" href={baseUrl}>Retour à la liste</Link>
            </div>
            <form className="grid max-w-3xl gap-6 border border-flora-line bg-white p-5 sm:p-8" onSubmit={submit}>
                {kind === 'categories' && (
                    <Field label="Catégorie parente" error={form.errors.parent_id}>
                        <select
                            className="admin-input"
                            onChange={(event) => form.setData('parent_id', event.target.value ? Number(event.target.value) : null)}
                            value={form.data.parent_id ?? ''}
                        >
                            <option value="">Catégorie principale</option>
                            {parents.map((parent) => (
                                <option key={parent.id} value={parent.id}>{parent.name}</option>
                            ))}
                        </select>
                    </Field>
                )}
                <Field label="Nom" error={form.errors.name}>
                    <input className="admin-input" onChange={(event) => form.setData('name', event.target.value)} required value={form.data.name} />
                </Field>
                <Field label="Slug" error={form.errors.slug}>
                    <input className="admin-input" onBlur={() => !form.data.slug && form.setData('slug', slugify(form.data.name))} onChange={(event) => form.setData('slug', slugify(event.target.value))} value={form.data.slug} />
                </Field>
                <Field label="Description" error={form.errors.description}>
                    <textarea className="admin-input min-h-32 py-3" onChange={(event) => form.setData('description', event.target.value)} value={form.data.description} />
                </Field>
                {item?.image_url && (
                    <img alt="" className="max-h-52 w-fit object-contain" src={item.image_url} />
                )}
                <Field label="Image (JPG, PNG ou WebP, 5 Mo maximum)" error={form.errors.image}>
                    <input accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:border-0 file:bg-flora-paper file:px-4" onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)} type="file" />
                </Field>
                <Field label="Ordre d’affichage" error={form.errors.sort_order}>
                    <input className="admin-input" min="0" onChange={(event) => form.setData('sort_order', Number(event.target.value))} required type="number" value={form.data.sort_order} />
                </Field>
                <label className="flex items-center gap-3 text-sm">
                    <input checked={form.data.is_published} onChange={(event) => form.setData('is_published', event.target.checked)} type="checkbox" />
                    Publier
                </label>
                {form.errors.is_published && <p className="text-sm text-red-800">{form.errors.is_published}</p>}
                <button className="min-h-12 bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                    {form.processing ? 'Enregistrement…' : 'Enregistrer'}
                </button>
            </form>
            {item && (
                <Link
                    as="button"
                    className="mt-5 min-h-11 border border-red-900/30 px-4 text-sm text-red-900 hover:bg-red-50"
                    href={`${baseUrl}/${item.id}`}
                    method="delete"
                    onBefore={() => window.confirm('Supprimer cet élément ?')}
                >
                    Supprimer
                </Link>
            )}
        </AdminLayout>
    );
}

function Field({
    children,
    error,
    label,
}: {
    children: React.ReactNode;
    error?: string;
    label: string;
}) {
    return (
        <label className="grid gap-2 text-sm">
            {label}
            {children}
            {error && <span className="text-sm text-red-800">{error}</span>}
        </label>
    );
}
