import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout } from '../../../Components/AdminLayout';

type Settings = {
    hero_title: string;
    hero_description: string;
    hero_button_text: string;
    hero_button_url: string;
    hero_image_url: string | null;
    brand_story: string;
    show_categories: boolean;
    show_featured_products: boolean;
    show_new_products: boolean;
    show_brand_story: boolean;
};

type Props = {
    homepage: Settings;
    announcement: {
        enabled: boolean;
        text: string;
    };
};

type FormData = {
    announcement: {
        enabled: boolean;
        text: string;
    };
    homepage: Omit<Settings, 'hero_image_url'>;
    hero_image: File | null;
};

export default function Index({ homepage, announcement }: Props) {
    const form = useForm<FormData>({
        announcement,
        homepage: {
            hero_title: homepage.hero_title,
            hero_description: homepage.hero_description,
            hero_button_text: homepage.hero_button_text,
            hero_button_url: homepage.hero_button_url,
            brand_story: homepage.brand_story,
            show_categories: homepage.show_categories,
            show_featured_products: homepage.show_featured_products,
            show_new_products: homepage.show_new_products,
            show_brand_story: homepage.show_brand_story,
        },
        hero_image: null,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put('/admin/settings', { forceFormData: true, preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Paramètres de la boutique" />
            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Configuration</p>
                <h1 className="mt-2 font-display text-4xl">Paramètres de la boutique</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-flora-muted">
                    Le texte prérempli de la page d’accueil est provisoire. Remplacez-le par les contenus et visuels officiels de FLORAA’S avant la mise en ligne.
                </p>
            </div>
            <form className="grid max-w-4xl gap-6" encType="multipart/form-data" onSubmit={submit}>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <div>
                        <h2 className="font-display text-2xl">Barre d’annonce</h2>
                        <p className="mt-1 text-sm text-flora-muted">Aucune remise ni condition de livraison n’est créée automatiquement.</p>
                    </div>
                    <CheckField
                        checked={form.data.announcement.enabled}
                        label="Afficher la barre d’annonce"
                        onChange={(checked) => form.setData('announcement', { ...form.data.announcement, enabled: checked })}
                    />
                    <Field label="Texte" error={form.errors['announcement.text']}>
                        <input
                            className="admin-input"
                            maxLength={255}
                            onChange={(event) => form.setData('announcement', { ...form.data.announcement, text: event.target.value })}
                            value={form.data.announcement.text}
                        />
                    </Field>
                </section>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <div>
                        <h2 className="font-display text-2xl">Bannière d’accueil</h2>
                        <p className="mt-1 text-sm text-flora-muted">Le lien est limité à une destination interne.</p>
                    </div>
                    <Field label="Titre" error={form.errors['homepage.hero_title']}>
                        <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_title: event.target.value })} value={form.data.homepage.hero_title} />
                    </Field>
                    <Field label="Description" error={form.errors['homepage.hero_description']}>
                        <textarea className="admin-input min-h-24 py-3" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_description: event.target.value })} value={form.data.homepage.hero_description} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Texte du bouton" error={form.errors['homepage.hero_button_text']}>
                            <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_button_text: event.target.value })} value={form.data.homepage.hero_button_text} />
                        </Field>
                        <Field label="Lien interne (ex. /shop)" error={form.errors['homepage.hero_button_url']}>
                            <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_button_url: event.target.value })} value={form.data.homepage.hero_button_url} />
                        </Field>
                    </div>
                    {homepage.hero_image_url && (
                        <img alt="" className="max-h-64 w-fit object-contain" src={homepage.hero_image_url} />
                    )}
                    <Field label="Image de bannière (JPG, PNG ou WebP, 5 Mo maximum)" error={form.errors.hero_image}>
                        <input accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:border-0 file:bg-flora-paper file:px-4" onChange={(event) => form.setData('hero_image', event.target.files?.[0] ?? null)} type="file" />
                    </Field>
                </section>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <h2 className="font-display text-2xl">Sections de la page</h2>
                    <CheckField checked={form.data.homepage.show_categories} label="Catégories publiées" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_categories: checked })} />
                    <CheckField checked={form.data.homepage.show_featured_products} label="Produits mis à la une" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_featured_products: checked })} />
                    <CheckField checked={form.data.homepage.show_new_products} label="Nouveautés" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_new_products: checked })} />
                    <CheckField checked={form.data.homepage.show_brand_story} label="Présentation de la marque" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_brand_story: checked })} />
                    <Field label="Présentation de FLORAA’S (rédigée/validée par la marque)" error={form.errors['homepage.brand_story']}>
                        <textarea className="admin-input min-h-40 py-3" onChange={(event) => form.setData('homepage', { ...form.data.homepage, brand_story: event.target.value })} value={form.data.homepage.brand_story} />
                    </Field>
                </section>
                {Object.keys(form.errors).length > 0 && (
                    <p className="text-sm text-red-800" role="alert">Certaines valeurs sont à corriger avant l’enregistrement.</p>
                )}
                <button className="min-h-12 w-full bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60 sm:w-fit" disabled={form.processing} type="submit">
                    {form.processing ? 'Enregistrement…' : 'Enregistrer les paramètres'}
                </button>
            </form>
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

function CheckField({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3 text-sm">
            <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
            {label}
        </label>
    );
}
