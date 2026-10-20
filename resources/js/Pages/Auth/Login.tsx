import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthLayout } from '../../Components/AuthLayout';

export default function Login() {
    const form = useForm({ email: '', password: '', remember: false });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/login');
    }

    return (
        <AuthLayout>
            <Head title="Connexion" />
            <h1 className="font-display text-3xl">Connexion</h1>
            <p className="mt-2 text-sm text-flora-muted">Retrouvez votre compte FLORAA’S.</p>
            <form className="mt-7 grid gap-5" onSubmit={submit}>
                <label className="grid gap-2 text-sm">
                    Adresse e-mail
                    <input autoComplete="email" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('email', event.target.value)} required type="email" value={form.data.email} />
                    {form.errors.email && <span className="text-sm text-red-800">{form.errors.email}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Mot de passe
                    <input autoComplete="current-password" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('password', event.target.value)} required type="password" value={form.data.password} />
                    {form.errors.password && <span className="text-sm text-red-800">{form.errors.password}</span>}
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input checked={form.data.remember} onChange={(event) => form.setData('remember', event.target.checked)} type="checkbox" />
                    Se souvenir de moi
                </label>
                <button className="min-h-12 bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                    {form.processing ? 'Connexion…' : 'Se connecter'}
                </button>
                <Link className="text-center text-sm underline underline-offset-4" href="/forgot-password">Mot de passe oublié ?</Link>
            </form>
            <p className="mt-7 border-t border-flora-line pt-6 text-center text-sm text-flora-muted">
                Nouveau chez FLORAA’S ? <Link className="text-flora-ink underline" href="/register">Créer un compte</Link>
            </p>
        </AuthLayout>
    );
}
