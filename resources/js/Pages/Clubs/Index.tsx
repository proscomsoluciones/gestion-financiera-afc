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
    president_name?: string;
    secretary_name?: string;
    treasurer_name?: string;
    is_active: boolean;
    created_at: string;
}

interface IndexProps {
    clubs: {
        data: Club[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        current_page: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ clubs, filters }: IndexProps) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('clubs.index'), { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get(route('clubs.index'));
    };

    const handleDelete = (club: Club) => {
        if (confirm(`¿Estás seguro de eliminar el club "${club.name}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('clubs.destroy', club.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Gestión de Clubes
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            Directorio oficial de instituciones deportivas afiliadas
                        </p>
                    </div>

                    {can('clubs.manage') && (
                        <Link
                            href={route('clubs.create')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition shrink-0"
                        >
                            <span>+</span>
                            <span>Registrar Nuevo Club</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Clubes - Gestión Financiera AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 space-y-6 sm:px-6 lg:px-8">
                    {/* Filters & Search Card */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar por nombre, siglas o presidente..."
                                        className="block w-full rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>

                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">Todos los Estados</option>
                                    <option value="active">Activos</option>
                                    <option value="inactive">Inactivos</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                                >
                                    Filtrar
                                </button>
                                {(search || status) && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Clubs Table List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        {clubs.data.length > 0 ? (
                            <>
                                {/* Desktop Table View (1024px+) */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                <th className="py-3.5 px-6">Club</th>
                                                <th className="py-3.5 px-6">Presidente / Directiva</th>
                                                <th className="py-3.5 px-4 text-center">Estado</th>
                                                <th className="py-3.5 px-6 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {clubs.data.map((club) => (
                                                <tr key={club.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3.5">
                                                            {club.crest_url ? (
                                                                <img
                                                                    src={club.crest_url}
                                                                    alt={club.name}
                                                                    className="h-11 w-11 rounded-xl object-cover border border-slate-200 shadow-xs"
                                                                />
                                                            ) : (
                                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-black text-white shadow-xs">
                                                                    {club.short_name ? club.short_name.substring(0, 3) : club.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <Link
                                                                    href={route('clubs.show', club.id)}
                                                                    className="font-bold text-slate-900 hover:text-emerald-600 transition"
                                                                >
                                                                    {club.name}
                                                                </Link>
                                                                {club.short_name && (
                                                                    <p className="text-xs font-semibold text-slate-400">
                                                                        Siglas: {club.short_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 text-slate-700 text-xs">
                                                        {club.president_name ? (
                                                            <div>
                                                                <p className="font-bold text-slate-800">{club.president_name}</p>
                                                                <p className="text-[11px] text-slate-400">Presidente Institucional</p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">— Sin registrar</span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-4 text-center">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            club.is_active 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                        }`}>
                                                            {club.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route('clubs.show', club.id)}
                                                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                                                title="Ver Detalle"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            {can('clubs.manage') && (
                                                                <>
                                                                    <Link
                                                                        href={route('clubs.edit', club.id)}
                                                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                                                                        title="Editar Club"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(club)}
                                                                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                                        title="Eliminar Club"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile & Tablet Cards View (< 1024px) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4 p-4 bg-slate-50/30">
                                    {clubs.data.map((club) => (
                                        <div key={club.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {club.crest_url ? (
                                                        <img
                                                            src={club.crest_url}
                                                            alt={club.name}
                                                            className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-black text-white shadow-xs shrink-0">
                                                            {club.short_name ? club.short_name.substring(0, 3) : club.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={route('clubs.show', club.id)}
                                                            className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition"
                                                        >
                                                            {club.name}
                                                        </Link>
                                                        {club.short_name && (
                                                            <p className="text-xs font-semibold text-slate-400">
                                                                Siglas: {club.short_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                                                    club.is_active 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {club.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-2.5 text-xs flex items-center justify-between border border-slate-100">
                                                <span className="text-slate-400 font-semibold">Presidente:</span>
                                                <span className="font-bold text-slate-800">{club.president_name || '— Sin registrar'}</span>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
                                                <Link
                                                    href={route('clubs.show', club.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                                                >
                                                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Ver
                                                </Link>
                                                {can('clubs.manage') && (
                                                    <>
                                                        <Link
                                                            href={route('clubs.edit', club.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Editar
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(club)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h10M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-slate-900">No hay clubes registrados</h3>
                                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                                    Comienza agregando el primer club deportivo para gestionar su información y miembros.
                                </p>
                                {can('clubs.manage') && (
                                    <Link
                                        href={route('clubs.create')}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                                    >
                                        + Registrar Primer Club
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Links */}
                    {clubs.links && clubs.links.length > 3 && (
                        <div className="flex justify-center items-center gap-1 pt-2">
                            {clubs.links.map((link, key) => (
                                link.url ? (
                                    <Link
                                        key={key}
                                        href={link.url}
                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                                            link.active
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={key}
                                        className="px-3.5 py-2 text-xs font-medium text-slate-400 rounded-xl bg-slate-50"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
