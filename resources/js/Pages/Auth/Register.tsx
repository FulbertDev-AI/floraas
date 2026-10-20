import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthLayout } from '../../Components/AuthLayout';

export default function Register() {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/register');
    }

    return (
        <AuthLayout>
            <Head title="Créer un compte" />
            <h1 className="font-display text-3xl">Créer un compte</h1>
            <p className="mt-2 text-sm text-flora-muted">Vos commandes et vos informations réunies au même endroit.</p>
            <form className="mt-7 grid gap-5" onSubmit={submit}>
                <label className="grid gap-2 text-sm">
                    Nom
                    <input autoComplete="name" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('name', event.target.value)} required value={form.data.name} />
                    {form.errors.name && <span className="text-sm text-red-800">{form.errors.name}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Adresse e-mail
                    <input autoComplete="email" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('email', event.target.value)} required type="email" value={form.data.email} />
                    {form.errors.email && <span className="text-sm text-red-800">{form.errors.email}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Mot de passe
                    <input autoComplete="new-password" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('password', event.target.value)} required type="password" value={form.data.password} />
                    {form.errors.password && <span className="text-sm text-red-800">{form.errors.password}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Confirmer le mot de passe
                    <input autoComplete="new-password" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('password_confirmation', event.target.value)} required type="password" value={form.data.password_confirmation} />
                </label>
                <button className="min-h-12 bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                    {form.processing ? 'Création…' : 'Créer mon compte'}
                </button>
            </form>
            <p className="mt-7 border-t border-flora-line pt-6 text-center text-sm text-flora-muted">
                Déjà un compte ? <Link className="text-flora-ink underline" href="/login">Se connecter</Link>
            </p>
        </AuthLayout>
    );
}
