import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Create() {
    const [activeTab, setActiveTab] = useState<'general' | 'board' | 'extra'>('general');
    const [crestPreview, setCrestPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        short_name: '',
        crest: null as File | null,
        history: '',
        president_name: '',
        secretary_name: '',
        treasurer_name: '',
        categories: [] as string[],
        categoryInput: '',
        is_active: true,
    });

    const handleCrestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('crest', file);
            setCrestPreview(URL.createObjectURL(file));
        }
    };

    const addCategory = () => {
        if (data.categoryInput.trim() && !data.categories.includes(data.categoryInput.trim())) {
            setData((prev) => ({
                ...prev,
                categories: [...prev.categories, prev.categoryInput.trim()],
                categoryInput: '',
            }));
        }
    };

    const removeCategory = (index: number) => {
        setData((prev) => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index),
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clubs.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Registrar Nuevo Club
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            Ingresa la información institucional y directiva del club
                        </p>
                    </div>

                    <Link
                        href={route('clubs.index')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                        ← Volver a Clubes
                    </Link>
                </div>
            }
        >
            <Head title="Registrar Club - Gestión Financiera AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Navigation Tabs */}
                        <div className="flex space-x-1 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
                            <button
                                type="button"
                                onClick={() => setActiveTab('general')}
                                className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                                    activeTab === 'general'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                1. Datos del Club
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('board')}
                                className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                                    activeTab === 'board'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                2. Mesa Directiva
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('extra')}
                                className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                                    activeTab === 'extra'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                3. Reseña & Categorías
                            </button>
                        </div>

                        {/* Form Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            {/* Tab 1: General Info */}
                            {activeTab === 'general' && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                        Información del Club
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Nombre Completo del Club *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej. Club Deportivo Santa Rosa"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                                required
                                            />
                                            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Siglas / Nombre Corto
                                            </label>
                                            <input
                                                type="text"
                                                value={data.short_name}
                                                onChange={(e) => setData('short_name', e.target.value)}
                                                placeholder="Ej. CD-STR"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Escudo / Insignia del Club (`crest`)
                                        </label>
                                        <div className="flex items-center gap-4 mt-2">
                                            {crestPreview ? (
                                                <img src={crestPreview} alt="Crest preview" className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
                                                    Escudo
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCrestChange}
                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Directiva */}
                            {activeTab === 'board' && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                        Mesa Directiva Institucional
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Presidente
                                            </label>
                                            <input
                                                type="text"
                                                value={data.president_name}
                                                onChange={(e) => setData('president_name', e.target.value)}
                                                placeholder="Nombre del Presidente"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Secretario
                                            </label>
                                            <input
                                                type="text"
                                                value={data.secretary_name}
                                                onChange={(e) => setData('secretary_name', e.target.value)}
                                                placeholder="Nombre del Secretario"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Tesorero
                                            </label>
                                            <input
                                                type="text"
                                                value={data.treasurer_name}
                                                onChange={(e) => setData('treasurer_name', e.target.value)}
                                                placeholder="Nombre del Tesorero"
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Categorias & Estado */}
                            {activeTab === 'extra' && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                        Reseña Histórica, Categorías y Estado
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Reseña Histórica
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.history}
                                            onChange={(e) => setData('history', e.target.value)}
                                            placeholder="Resumen histórico y trayectoria del club..."
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Categorías Deportivas
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={data.categoryInput}
                                                onChange={(e) => setData('categoryInput', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addCategory();
                                                    }
                                                }}
                                                placeholder="Ej. Sub-15, Sub-18, Honor (Presiona Enter o +)"
                                                className="flex-1 rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCategory}
                                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                                            >
                                                + Agregar
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {data.categories.map((cat, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                    {cat}
                                                    <button type="button" onClick={() => removeCategory(idx)} className="text-emerald-500 hover:text-emerald-900">
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="ms-3 text-sm font-bold text-slate-800">
                                                Club Activo en el Sistema
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Form Footer Action Buttons */}
                            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                                <Link
                                    href={route('clubs.index')}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                                >
                                    Cancelar
                                </Link>

                                <div className="flex items-center gap-3">
                                    {activeTab !== 'general' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeTab === 'board') setActiveTab('general');
                                                if (activeTab === 'extra') setActiveTab('board');
                                            }}
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            Anterior
                                        </button>
                                    )}

                                    {activeTab !== 'extra' ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeTab === 'general') setActiveTab('board');
                                                if (activeTab === 'board') setActiveTab('extra');
                                            }}
                                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                                        >
                                            Siguiente →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            {processing ? 'Guardando...' : 'Guardar Club'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
