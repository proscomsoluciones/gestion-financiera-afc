import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface TariffItem {
    key: string;
    label: string;
    value: number;
    description: string;
}

interface InstitutionalData {
    association_name: string;
    association_rut: string;
    association_address: string;
    treasurer_name: string;
    president_name?: string;
    secretary_name?: string;
    logo_path?: string;
    logo_url?: string;
}

interface OtherIncomeCategory {
    id: string;
    label: string;
}

interface ExpenseCategory {
    id: string;
    label: string;
}

interface SettingsIndexProps {
    tariffs: Record<string, TariffItem>;
    institutional?: InstitutionalData;
    other_income_categories?: OtherIncomeCategory[];
    expense_categories?: ExpenseCategory[];
    flash?: {
        success?: string;
    };
}

export default function Index({ tariffs, institutional, other_income_categories = [], expense_categories = [], flash }: SettingsIndexProps) {
    const { data, setData, post, processing, errors } = useForm({
        // Institutional Data
        association_name: institutional?.association_name ?? 'ASOCIACIÓN DE FÚTBOL AFC',
        association_rut: institutional?.association_rut ?? '65.123.456-K',
        association_address: institutional?.association_address ?? 'Región de Valparaíso, Chile',
        treasurer_name: institutional?.treasurer_name ?? 'Juan Ramón Cornejo',
        president_name: institutional?.president_name ?? 'Presidente General AFC',
        secretary_name: institutional?.secretary_name ?? 'Secretario General AFC',
        association_logo: null as File | null,

        // Tariffs
        rate_tributo_club: (tariffs.rate_tributo_club?.value ?? 30000) as number | string,
        rate_aporte_seleccion: (tariffs.rate_aporte_seleccion?.value ?? 10000) as number | string,
        rate_apelacion: (tariffs.rate_apelacion?.value ?? 30000) as number | string,
        rate_inscripcion_total: (tariffs.rate_inscripcion_total?.value ?? 3000) as number | string,
        rate_inscripcion_arfa: (tariffs.rate_inscripcion_arfa?.value ?? 0) as number | string,
        rate_pase_estandar_total: (tariffs.rate_pase_estandar_total?.value ?? 22000) as number | string,
        rate_pase_estandar_arfa: (tariffs.rate_pase_estandar_arfa?.value ?? 17000) as number | string,
        rate_pase_femenino_total: (tariffs.rate_pase_femenino_total?.value ?? 17000) as number | string,
        rate_pase_femenino_arfa: (tariffs.rate_pase_femenino_arfa?.value ?? 12000) as number | string,

        // Configurable Other Income Categories
        other_income_categories: (other_income_categories && other_income_categories.length > 0)
            ? other_income_categories
            : [
                { id: 'donacion', label: 'Donación / Aporte Voluntario' },
                { id: 'proyecto', label: 'Proyecto / Subvención Municipal o FNDR' },
                { id: 'finales', label: 'Recaudación Entradas / Final de Campeonato' },
                { id: 'sponsor', label: 'Sponsor / Auspicio Comercial' },
                { id: 'evento', label: 'Venta de Bases / Evento / Beneficio' },
                { id: 'otro', label: 'Otro Ingreso Extraordinario' },
            ],

        // Configurable Expense Categories
        expense_categories: (expense_categories && expense_categories.length > 0)
            ? expense_categories
            : [
                { id: 'viatico', label: 'Viático / Asignación de Traslado / Árbitros' },
                { id: 'compra', label: 'Compra de Insumos / Balones / Materiales' },
                { id: 'servicio', label: 'Pago de Servicios / Honorarios / Gastos' },
                { id: 'otro', label: 'Otro Egreso AFC' },
            ],
    });

    const [activeTab, setActiveTab] = useState<'institutional' | 'player_tariffs' | 'tributes' | 'categories'>('institutional');
    const [deletingCategory, setDeletingCategory] = useState<{
        type: 'other_income' | 'expense';
        index: number;
        label: string;
    } | null>(null);

    const formatCLP = (val: number | string) => {
        const num = Math.round(Number(val || 0));
        return '$' + num.toLocaleString('es-CL');
    };

    const totalTributoCalculated =
        Math.round(Number(data.rate_tributo_club || 0)) +
        Math.round(Number(data.rate_aporte_seleccion || 0));

    const marginInscripcion =
        Math.round(Number(data.rate_inscripcion_total || 0)) -
        Math.round(Number(data.rate_inscripcion_arfa || 0));

    const marginEstandar =
        Math.round(Number(data.rate_pase_estandar_total || 0)) -
        Math.round(Number(data.rate_pase_estandar_arfa || 0));

    const marginFemenino =
        Math.round(Number(data.rate_pase_femenino_total || 0)) -
        Math.round(Number(data.rate_pase_femenino_arfa || 0));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Configuración Institucional & Tarifas
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            Administra la identidad de la asociación, firma de tesorería y aranceles oficiales
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Configuración Institucional - Gestión Financiera AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 border border-emerald-200 flex items-center gap-2">
                            <span>✅</span>
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {/* Tab Navigation Bar */}
                    <div className="flex border-b border-slate-200 gap-2 mb-6 overflow-x-auto pb-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('institutional')}
                            className={`px-4 py-2.5 text-xs font-black rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                activeTab === 'institutional'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>🏛️ Identidad & Tesorería</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('player_tariffs')}
                            className={`px-4 py-2.5 text-xs font-black rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                activeTab === 'player_tariffs'
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>⚽ Pases e Inscripciones</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('tributes')}
                            className={`px-4 py-2.5 text-xs font-black rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                activeTab === 'tributes'
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>📊 Tributos y Apelaciones</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('categories')}
                            className={`px-4 py-2.5 text-xs font-black rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                activeTab === 'categories'
                                    ? 'bg-purple-700 text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span>💎 Categorías Otros Ingresos</span>
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        {/* TAB 1: Identidad Institucional & Tesorería */}
                        {activeTab === 'institutional' && (
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                                        🏛️
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Identidad Institucional & Firma de Tesorería
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Información legal que encabeza los comprobantes de pago e informes financieros
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Nombre Oficial de la Asociación *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.association_name}
                                            onChange={(e) => setData('association_name', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            RUT Institucional *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.association_rut}
                                            onChange={(e) => setData('association_rut', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Dirección Sede Social *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.association_address}
                                            onChange={(e) => setData('association_address', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                                            <span>✍️</span>
                                            <span>Nombre Completo del Tesorero General *</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.treasurer_name}
                                            onChange={(e) => setData('treasurer_name', e.target.value)}
                                            placeholder="Ej. Juan Ramón Cornejo"
                                            className="w-full rounded-xl border-slate-200 bg-emerald-50/50 px-4 py-2.5 text-sm font-black text-emerald-800 border-emerald-200"
                                            required
                                        />
                                        <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                                            Firma de Tesorería General en Reportes y Comprobantes
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 mb-1 flex items-center gap-1.5">
                                            <span>✍️</span>
                                            <span>Nombre Completo del Presidente General *</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.president_name}
                                            onChange={(e) => setData('president_name', e.target.value)}
                                            placeholder="Ej. Jaime Valenzuela"
                                            className="w-full rounded-xl border-slate-200 bg-blue-50/50 px-4 py-2.5 text-sm font-black text-blue-900 border-blue-200"
                                            required
                                        />
                                        <p className="mt-1 text-[11px] font-semibold text-blue-600">
                                            Firma de Presidencia General en Reportes y Balances
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
                                            <span>✍️</span>
                                            <span>Nombre Completo del Secretario General *</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.secretary_name}
                                            onChange={(e) => setData('secretary_name', e.target.value)}
                                            placeholder="Ej. Manuel Rodríguez"
                                            className="w-full rounded-xl border-slate-200 bg-slate-100/60 px-4 py-2.5 text-sm font-black text-slate-900 border-slate-300"
                                            required
                                        />
                                        <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                            Firma de Secretaría General en Reportes y Certificados
                                        </p>
                                    </div>
                                </div>

                                {/* Logo Image Upload */}
                                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                        <span>🖼️</span>
                                        <span>Logo / Insignia Oficial de la Asociación (Opcional)</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {institutional?.logo_url ? (
                                            <img
                                                src={institutional.logo_url}
                                                alt="Logo Institucional"
                                                className="h-14 w-14 object-contain rounded-xl border border-slate-200 bg-white p-1"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-lg">
                                                AFC
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setData('association_logo', e.target.files ? e.target.files[0] : null)}
                                                className="w-full text-xs text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-slate-800 cursor-pointer"
                                            />
                                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                                                Formatos JPG, PNG, WEBP hasta 5MB. Se muestra en el membrete de comprobantes e impresión.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Pases e Inscripciones */}
                        {activeTab === 'player_tariffs' && (
                            <div className="space-y-6">
                                {/* Card Group 2: Inscripciones */}
                                <div className="rounded-3xl border border-blue-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                                                📝
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">
                                                    Inscripciones de Jugadores (Adulto, Infantil, Femenina)
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500">
                                                    ARFA V Región cobra $0 CLP (Gratis) • 100% del ingreso va a las Arcas de la AFC
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-right">
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                                                Ingreso Arcas AFC (100%)
                                            </p>
                                            <p className="text-xl font-black text-blue-700">
                                                {formatCLP(marginInscripcion)} CLP
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Cobro Inscripción al Club ($ CLP)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={data.rate_inscripcion_total}
                                                onChange={(e) => setData('rate_inscripcion_total', e.target.value)}
                                                className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900"
                                                required
                                            />
                                            <p className="mt-1 text-xs font-bold text-blue-600">
                                                Valor cobrado al club: {formatCLP(data.rate_inscripcion_total)} CLP
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Costo ARFA V Región (Gratis $0 CLP)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={data.rate_inscripcion_arfa}
                                                onChange={(e) => setData('rate_inscripcion_arfa', e.target.value)}
                                                className="w-full rounded-xl border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-500"
                                                required
                                                readOnly
                                            />
                                            <p className="mt-1 text-xs font-bold text-slate-500">
                                                Gratis en ARFA V Región ($0 CLP)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Group 3: Pases de Jugadores */}
                                <div className="rounded-3xl border border-teal-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 font-bold">
                                            ⚽
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                Aranceles de Pases / Transferencias (ARFA V Región & AFC)
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500">
                                                Configura el cobro total al club y el arancel pagado a ARFA V Región
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pases Estándar */}
                                    <div className="rounded-2xl bg-teal-50/50 p-4 border border-teal-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-extrabold text-teal-900">
                                                Pases Estándar (Pase Interno, Regional y Externo)
                                            </h4>
                                            <span className="rounded-xl bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
                                                Ingreso Arcas AFC: {formatCLP(marginEstandar)} CLP por Pase
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Cobro Total al Club ($ CLP)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_pase_estandar_total}
                                                    onChange={(e) => setData('rate_pase_estandar_total', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Costo ARFA V Región ($ CLP)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_pase_estandar_arfa}
                                                    onChange={(e) => setData('rate_pase_estandar_arfa', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pase Femenino */}
                                    <div className="rounded-2xl bg-purple-50/50 p-4 border border-purple-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-extrabold text-purple-900">
                                                Pase Femenino
                                            </h4>
                                            <span className="rounded-xl bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                                                Ingreso Arcas AFC: {formatCLP(marginFemenino)} CLP por Pase
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Cobro Total al Club ($ CLP)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_pase_femenino_total}
                                                    onChange={(e) => setData('rate_pase_femenino_total', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Costo ARFA V Región ($ CLP)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_pase_femenino_arfa}
                                                    onChange={(e) => setData('rate_pase_femenino_arfa', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Tributos y Apelaciones */}
                        {activeTab === 'tributes' && (
                            <div className="space-y-6">
                                {/* Card Group 1: Tributos y Selección */}
                                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                                                🏛️
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">
                                                    Tributos Mensuales e Integración Selección
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Valores cargados automáticamente en Pesos Chilenos (formato miles sin decimales)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-right">
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                                                Cobro Total por Club
                                            </p>
                                            <p className="text-xl font-black text-emerald-700">
                                                ${totalTributoCalculated.toLocaleString('es-CL')} CLP
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Tributo Mensual Club ($ CLP)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_tributo_club}
                                                    onChange={(e) => setData('rate_tributo_club', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-extrabold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                                    required
                                                />
                                            </div>
                                            <p className="mt-1 text-xs font-bold text-emerald-600">
                                                Valor formateado: {formatCLP(data.rate_tributo_club)} CLP
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Aporte Fondo Selección AFC ($ CLP)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={data.rate_aporte_seleccion}
                                                    onChange={(e) => setData('rate_aporte_seleccion', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-extrabold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                                    required
                                                />
                                            </div>
                                            <p className="mt-1 text-xs font-bold text-emerald-600">
                                                Valor formateado: {formatCLP(data.rate_aporte_seleccion)} CLP
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Group 4: Apelación */}
                                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                                            ⚖️
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                Derecho de Apelación
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500">
                                                Arancel por presentación de recursos ante el tribunal de penas
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Derecho de Apelación ($ CLP)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                step="1"
                                                value={data.rate_apelacion}
                                                onChange={(e) => setData('rate_apelacion', e.target.value)}
                                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-extrabold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                                required
                                            />
                                        </div>
                                        <p className="mt-1 text-xs font-bold text-indigo-600">
                                            Valor formateado: {formatCLP(data.rate_apelacion)} CLP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: Categorías para Ingresos y Egresos */}
                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                {/* Card Group 5.1: Categorías para Otros Ingresos */}
                                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                                                💎
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">
                                                    Categorías para Otros Ingresos
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Administra las subcategorías (donaciones, proyectos, finales, auspicios) que se despliegan en la caja
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCat = {
                                                    id: 'cat_' + Math.random().toString(36).substring(2, 7),
                                                    label: 'NUEVA CATEGORÍA DE INGRESO',
                                                };
                                                setData('other_income_categories', [...data.other_income_categories, newCat]);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-purple-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                                        >
                                            <span>➕</span>
                                            <span>Agregar Categoría Ingreso</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.other_income_categories.map((cat, index) => (
                                            <div key={cat.id || index} className="flex items-center gap-3 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                                                <span className="text-xs font-black text-purple-900 w-6 text-center">{index + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={cat.label}
                                                    onChange={(e) => {
                                                        const updated = data.other_income_categories.map((c, i) => i === index ? { ...c, label: e.target.value } : c);
                                                        setData('other_income_categories', updated);
                                                    }}
                                                    placeholder="Nombre de la categoría"
                                                    className="flex-1 rounded-xl border-purple-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                                    required
                                                />
                                                {data.other_income_categories.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingCategory({ type: 'other_income', index, label: cat.label })}
                                                        className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-800 font-extrabold text-xs cursor-pointer"
                                                        title="Eliminar categoría"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Group 5.2: Categorías para Egresos y Salidas de Caja */}
                                <div className="rounded-3xl border border-rose-200/80 bg-white p-6 shadow-sm space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold">
                                                💸
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">
                                                    Categorías para Egresos y Salidas de Caja
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500">
                                                    Administra los tipos de egreso (viáticos, compras, servicios) configurables en el formulario de salida
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newExpenseCat = {
                                                    id: 'exp_' + Math.random().toString(36).substring(2, 7),
                                                    label: 'NUEVA CATEGORÍA DE EGRESO',
                                                };
                                                setData('expense_categories', [...data.expense_categories, newExpenseCat]);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-rose-700 transition whitespace-nowrap shrink-0 cursor-pointer"
                                        >
                                            <span>➕</span>
                                            <span>Agregar Categoría Egreso</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.expense_categories.map((cat, index) => (
                                            <div key={cat.id || index} className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                                <span className="text-xs font-black text-rose-900 w-6 text-center">{index + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={cat.label}
                                                    onChange={(e) => {
                                                        const updated = data.expense_categories.map((c, i) => i === index ? { ...c, label: e.target.value } : c);
                                                        setData('expense_categories', updated);
                                                    }}
                                                    placeholder="Nombre del tipo de egreso"
                                                    className="flex-1 rounded-xl border-rose-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                                    required
                                                />
                                                {data.expense_categories.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingCategory({ type: 'expense', index, label: cat.label })}
                                                        className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-800 font-extrabold text-xs cursor-pointer"
                                                        title="Eliminar categoría"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button Bar */}
                        <div className="flex items-center justify-end pt-2 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                <span>💾</span>
                                <span>{processing ? 'Guardando Cambios...' : 'Guardar Configuración General'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Alert Modal for Category Deletion */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl font-bold">
                                ⚠️
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    ¿Confirmar eliminación de categoría?
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Esta opción se quitará de la lista desplegable correspondiente.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-rose-50/50 p-3.5 border border-rose-100">
                            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Categoría a eliminar:</p>
                            <p className="text-sm font-black text-rose-950 mt-1">"{deletingCategory.label}"</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingCategory(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (deletingCategory.type === 'other_income') {
                                        const updated = data.other_income_categories.filter((_, i) => i !== deletingCategory.index);
                                        setData('other_income_categories', updated);
                                    } else {
                                        const updated = data.expense_categories.filter((_, i) => i !== deletingCategory.index);
                                        setData('expense_categories', updated);
                                    }
                                    setDeletingCategory(null);
                                }}
                                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                            >
                                Sí, Eliminar Categoría
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
