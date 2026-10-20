import { Link } from '@inertiajs/react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12">
            <div className="w-full max-w-md">
                <Link className="block text-center font-display text-3xl tracking-[0.14em]" href="/">
                    FLORAA’S
                </Link>
                <div className="mt-10 border border-flora-line bg-white p-6 sm:p-9">
                    {children}
                </div>
            </div>
        </main>
    );
}
