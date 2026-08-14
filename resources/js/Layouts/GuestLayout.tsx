import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
            <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
                    <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
                    <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
                </div>

                <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/80 border border-slate-100 lg:grid lg:grid-cols-12">
                    {/* Left Banner Section */}
                    <div className="relative flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white lg:col-span-5 lg:p-10">
                        <div className="relative z-10">
                            <Link href="/" className="inline-block">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30">
                                        <svg
                                            className="h-6 w-6 text-emerald-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.2"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold tracking-tight text-white">
                                            AFC <span className="text-emerald-400">Finanzas</span>
                                        </span>
                                        <span className="text-[10px] font-medium tracking-wider text-emerald-300/80 uppercase">
                                            Gestión Financiera
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="mt-12 space-y-4">
                                <h1 className="text-2xl font-bold leading-snug tracking-tight text-white lg:text-3xl">
                                    Control Total de tus Finanzas Corporativas
                                </h1>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    Plataforma integral para el seguimiento de ingresos, egresos, presupuestos y proyecciones financieras en tiempo real.
                                </p>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="relative z-10 mt-10 space-y-3 pt-6 border-t border-slate-700/60">
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                    ✓
                                </div>
                                <span>Seguridad y Cifrado Bancario 256-bit</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                    ✓
                                </div>
                                <span>Reportes Financieros y Métricas AFC</span>
                            </div>
                        </div>

                        {/* Background pattern */}
                        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                    </div>

                    {/* Right Form Container */}
                    <div className="flex flex-col justify-center p-8 lg:col-span-7 lg:p-12">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
