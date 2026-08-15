import Spinner from '@/Components/Spinner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePermissions from '@/hooks/usePermissions';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Club {
    id: number;
    name: string;
    slug: string;
    short_name?: string;
    crest?: string;
    crest_url?: string;
    history?: string;
    president_name?: string;
    secretary_name?: string;
    treasurer_name?: string;
    categories?: string[];
    is_active: boolean;
    created_at: string;
}

export default function Show({ club }: { club: Club }) {
    const { can } = usePermissions();
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = () => {
        if (confirm(`¿Estás seguro de eliminar el club "${club.name}"? Esta acción no se puede deshacer.`)) {
            setIsDeleting(true);
            router.delete(route('clubs.destroy', club.id), {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {club.crest_url ? (
                            <img src={club.crest_url} alt={club.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-lg font-black text-white shadow-xs shrink-0">
                                {club.short_name ? club.short_name.substring(0, 3) : club.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                    {club.name}
                                </h2>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    club.is_active 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                    {club.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Perfil Institucional • {club.short_name ? `Siglas: ${club.short_name}` : 'Club Deportivo'}
                            </p>
                        </div>
                    </div>

                    {can('clubs.manage') && (
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('clubs.edit', club.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                            >
                                Editar Club
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                            >
                                {isDeleting && <Spinner className="h-4 w-4" />}
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`${club.name} - Perfil de Club`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 space-y-8 sm:px-6 lg:px-8">
                    {/* Top Overview & Board Directiva */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Ficha Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                Datos del Club
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs text-slate-400 font-semibold">Nombre Oficial</dt>
                                    <dd className="font-bold text-slate-900">{club.name}</dd>
                                </div>
                                {club.short_name && (
                                    <div>
                                        <dt className="text-xs text-slate-400 font-semibold">Siglas Corporativas</dt>
                                        <dd className="font-bold text-slate-800">{club.short_name}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs text-slate-400 font-semibold">Slug Identificador</dt>
                                    <dd className="font-mono text-xs text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">{club.slug}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Board Directiva */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                Mesa Directiva Institucional
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                                        P
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Presidente</p>
                                        <p className="text-sm font-bold text-slate-800">{club.president_name || 'No asignado'}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-bold">
                                        S
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Secretario</p>
                                        <p className="text-sm font-bold text-slate-800">{club.secretary_name || 'No asignado'}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100 flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                                        T
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Tesorero</p>
                                        <p className="text-sm font-bold text-slate-800">{club.treasurer_name || 'No asignado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History & Categories */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-2">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                                Reseña Histórica y Trayectoria
                            </h3>
                            <div className="prose prose-slate text-sm leading-relaxed text-slate-600 font-medium">
                                {club.history ? club.history : 'No se ha registrado una reseña histórica para este club.'}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                                Categorías Participantes
                            </h3>

                            {club.categories && club.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {club.categories.map((cat, idx) => (
                                        <span key={idx} className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            ⚽ {cat}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">Sin categorías especificadas</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
