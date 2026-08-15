import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePermissions from '@/hooks/usePermissions';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface TransactionVoucher {
    id: number;
    folio_number: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    concept: string;
    period_month?: string;
    player_name?: string;
    payment_method: string;
    date: string;
    notes?: string;
    club?: {
        id: number;
        name: string;
        short_name?: string;
    };
    user?: {
        name: string;
    };
}

interface TributeClubStatus {
    club_id: number;
    club_name: string;
    short_name?: string;
    status: 'paid' | 'overdue' | 'pending';
    status_label: string;
    status_color: string;
    badge: string;
    payment_date: string | null;
    folio_number: string | null;
    amount: number;
    due_date: string;
    due_date_formatted: string;
}

interface TributeStatusData {
    period_month: string;
    due_date: string;
    due_date_formatted: string;
    is_due_passed: boolean;
    summary: {
        total_clubs: number;
        paid_count: number;
        overdue_count: number;
        pending_count: number;
    };
    clubs: TributeClubStatus[];
}

interface InstitutionalData {
    association_name: string;
    association_rut: string;
    association_address: string;
    treasurer_name: string;
    logo_url?: string;
}

interface MonthlyChartData {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

interface DashboardProps {
    kpis: {
        total_income: number;
        total_expense: number;
        net_balance: number;
        cash_balance?: number;
        bank_balance?: number;
        income_cash?: number;
        income_bank?: number;
        expense_cash?: number;
        expense_bank?: number;
        total_clubs_count: number;
        categories: {
            tributo: number;
            fondo_solidario: number;
            inscripcion: number;
            inscripcion_campeonato: number;
            pase: number;
            pase_afc?: number;
            pase_arfa?: number;
            apelacion: number;
            multa: number;
            otro_ingreso: number;
        };
        arfa_distribution: {
            total_arfa_pases: number;
            total_afc_pases: number;
            total_arfa_inscripciones?: number;
            total_afc_inscripciones?: number;
            total_arfa_overall?: number;
            total_afc_overall?: number;
        };
        monthly_chart: MonthlyChartData[];
    };
    tribute_status: TributeStatusData;
    recent_transactions: TransactionVoucher[];
    institutional: InstitutionalData;
    filters?: {
        month_filter?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function Dashboard({
    kpis,
    tribute_status,
    recent_transactions,
    institutional,
    filters,
}: DashboardProps) {
    const { can } = usePermissions();
    const [monthFilter, setMonthFilter] = useState(filters?.month_filter || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleApplyFilter = (monthVal?: string, startVal?: string, endVal?: string) => {
        const params: any = {};
        const m = monthVal !== undefined ? monthVal : monthFilter;
        const s = startVal !== undefined ? startVal : startDate;
        const e = endVal !== undefined ? endVal : endDate;

        if (m) params.month_filter = m;
        if (s && e) {
            params.start_date = s;
            params.end_date = e;
            params.month_filter = '';
        }

        router.get(route('dashboard'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetDateFilter = () => {
        setMonthFilter('');
        setStartDate('');
        setEndDate('');
        router.get(route('dashboard'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCLP = (val: number) => {
        return '$' + Math.round(val || 0).toLocaleString('es-CL');
    };

    const formatDateChile = (dateStr: string | null) => {
        if (!dateStr) return '';
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const categoryBadges: Record<string, { label: string; class: string }> = {
        tributo: { label: 'Tributo Mensual', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        fondo_solidario: { label: 'Fondo Solidario', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        inscripcion: { label: 'Inscripción Jugador', class: 'bg-sky-50 text-sky-700 border-sky-200' },
        inscripcion_campeonato: { label: 'Inscripción Campeonato', class: 'bg-purple-50 text-purple-700 border-purple-200' },
        pase: { label: 'Pase Jugador', class: 'bg-teal-50 text-teal-700 border-teal-200' },
        apelacion: { label: 'Apelación', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        multa: { label: 'Multa / Sanción', class: 'bg-amber-50 text-amber-700 border-amber-200' },
        otro_ingreso: { label: 'Otro Ingreso', class: 'bg-slate-100 text-slate-700 border-slate-200' },
        egreso: { label: 'Egreso / Salida', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    };

    // Calculate tribute compliance percentage
    const totalClubsInTribute = tribute_status.summary.total_clubs || 1;
    const paidPercentage = Math.round((tribute_status.summary.paid_count / totalClubsInTribute) * 100);

    // Calculate maximum value for chart scaling
    const maxChartValue = Math.max(
        ...kpis.monthly_chart.map((m) => Math.max(m.income, m.expense)),
        kpis.total_income,
        100000
    );

    const incomeRatio = kpis.total_income > 0 ? Math.round((kpis.total_income / (kpis.total_income + kpis.total_expense)) * 100) : 100;
    const expenseRatio = 100 - incomeRatio;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Panel de Control Ejecutivo
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {institutional.association_name || 'Asociación de Fútbol Catemu'}
                        </h2>
                        <p className="text-xs font-medium text-slate-500">
                            RUT: {institutional.association_rut} • {institutional.association_address} • Tesorero General: <span className="font-bold text-slate-800">{institutional.treasurer_name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {can('transactions.view') && (
                            <Link
                                href={route('transactions.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                            >
                                {can('transactions.manage') ? '💳 Registrar Cobro / Tesorería' : '💳 Ver Tesorería'}
                            </Link>
                        )}
                        {can('settings.manage') && (
                            <Link
                                href={route('settings.index')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                ⚙️ Configuración
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard - Gestión Financiera" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Executive Global Date Filter Toolbar */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                📅
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Filtro General del Dashboard por Período
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Filtra todos los KPIs, recaudación y movimientos del sistema por mes o fechas exactas
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Month Selector */}
                            <select
                                value={monthFilter}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setMonthFilter(val);
                                    setStartDate('');
                                    setEndDate('');
                                    handleApplyFilter(val, '', '');
                                }}
                                className="rounded-xl border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-2xs cursor-pointer"
                            >
                                <option value="">🗓️ Todo el Período 2026</option>
                                <option value="2026-01">Enero 2026</option>
                                <option value="2026-02">Febrero 2026</option>
                                <option value="2026-03">Marzo 2026</option>
                                <option value="2026-04">Abril 2026</option>
                                <option value="2026-05">Mayo 2026</option>
                                <option value="2026-06">Junio 2026</option>
                                <option value="2026-07">Julio 2026</option>
                                <option value="2026-08">Agosto 2026</option>
                                <option value="2026-09">Septiembre 2026</option>
                                <option value="2026-10">Octubre 2026</option>
                                <option value="2026-11">Noviembre 2026</option>
                                <option value="2026-12">Diciembre 2026</option>
                            </select>

                            {/* Custom Date Range */}
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold uppercase text-slate-400 pl-1">Desde:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded-lg border-0 bg-transparent py-0.5 px-1.5 text-xs font-bold text-slate-800 focus:ring-0 w-28"
                                />
                                <span className="text-[10px] font-bold uppercase text-slate-400">Hasta:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-lg border-0 bg-transparent py-0.5 px-1.5 text-xs font-bold text-slate-800 focus:ring-0 w-28"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleApplyFilter()}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-2xs cursor-pointer"
                                >
                                    Filtrar Fechas
                                </button>
                            </div>

                            {(monthFilter || startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={handleResetDateFilter}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 1. Top Executive KPI Cards Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* KPI 1: Saldo Disponible */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Saldo Disponible en Caja
                                </span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg">
                                    💰
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                    {formatCLP(kpis.net_balance)}
                                </h3>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                    <span>✅ Fondos Netos Verificados</span>
                                </div>
                            </div>
                        </div>

                        {/* KPI 2: Total Ingresos */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Total Ingresos Recaudados
                                </span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-bold text-lg">
                                    📈
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tight text-emerald-600">
                                    {formatCLP(kpis.total_income)}
                                </h3>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <span>Tributos, Pases, Inscripciones y Varios</span>
                                </div>
                            </div>
                        </div>

                        {/* KPI 3: Total Egresos */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Total Egresos / Gastos
                                </span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold text-lg">
                                    💸
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tight text-rose-600">
                                    {formatCLP(kpis.total_expense)}
                                </h3>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <span>Salidas respaldadas con boleta</span>
                                </div>
                            </div>
                        </div>

                        {/* KPI 4: % Cumplimiento Tributario */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Cumplimiento Tributos ({tribute_status.period_month})
                                </span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold text-lg">
                                    📊
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                        {paidPercentage}%
                                    </h3>
                                    <span className="text-xs font-extrabold text-emerald-600">
                                        {tribute_status.summary.paid_count} / {tribute_status.summary.total_clubs} Clubes
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${paidPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cash vs Bank Liquidity Breakdown Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <span>💵</span> Disponibilidad en Caja Chica (Efectivo Físico)
                                </span>
                                <h4 className="text-xl font-black text-amber-950 mt-1">{formatCLP(kpis.cash_balance || 0)}</h4>
                                <p className="text-[10px] font-bold text-amber-800 mt-0.5">
                                    Entradas: +{formatCLP(kpis.income_cash || 0)} • Salidas: -{formatCLP(kpis.expense_cash || 0)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-200/60 p-3 text-amber-900 font-extrabold text-xs">
                                Efectivo Caja
                            </div>
                        </div>

                        <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                    <span>🏦</span> Fondos en Banco (Transferencias / Depósitos)
                                </span>
                                <h4 className="text-xl font-black text-blue-950 mt-1">{formatCLP(kpis.bank_balance || 0)}</h4>
                                <p className="text-[10px] font-bold text-blue-800 mt-0.5">
                                    Entradas: +{formatCLP(kpis.income_bank || 0)} • Salidas: -{formatCLP(kpis.expense_bank || 0)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-blue-200/60 p-3 text-blue-900 font-extrabold text-xs">
                                Cta. Bancaria
                            </div>
                        </div>
                    </div>

                    {/* 2. Visual Financial Charts Section (Ingresos vs Egresos Bar Chart) */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Interactive Main Chart Card */}
                        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">📊</span>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Gráfico Comparativo: Ingresos vs Egresos
                                        </h3>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                                        Evolución mensual del flujo de caja en la Temporada 2026
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                                        <span className="text-slate-700">Ingresos</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                                        <span className="text-slate-700">Egresos</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                                        <span className="text-slate-700">Saldo Neto</span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Bar Chart Render */}
                            <div className="space-y-6 pt-2">
                                {kpis.monthly_chart.map((m) => {
                                    const incWidth = maxChartValue > 0 ? Math.min(100, Math.round((m.income / maxChartValue) * 100)) : 0;
                                    const expWidth = maxChartValue > 0 ? Math.min(100, Math.round((m.expense / maxChartValue) * 100)) : 0;
                                    const balWidth = maxChartValue > 0 ? Math.min(100, Math.round((Math.max(0, m.balance) / maxChartValue) * 100)) : 0;

                                    return (
                                        <div key={m.month} className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center justify-between text-xs font-extrabold">
                                                <span className="text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    📅 {m.month} 2026
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-emerald-700 font-mono font-black">
                                                        +{formatCLP(m.income)}
                                                    </span>
                                                    <span className="text-rose-600 font-mono font-black">
                                                        -{formatCLP(m.expense)}
                                                    </span>
                                                    <span className="bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-lg font-mono font-black text-[11px]">
                                                        Neto: {formatCLP(m.balance)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stacked / Grouped Bars */}
                                            <div className="space-y-1.5 pt-1">
                                                {/* Income Bar */}
                                                <div className="flex items-center gap-2">
                                                    <span className="w-16 text-[10px] font-bold text-slate-500 uppercase">Entradas</span>
                                                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                                            style={{ width: `${Math.max(incWidth, 4)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Expense Bar */}
                                                <div className="flex items-center gap-2">
                                                    <span className="w-16 text-[10px] font-bold text-slate-500 uppercase">Salidas</span>
                                                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-rose-500 transition-all duration-700"
                                                            style={{ width: `${Math.max(expWidth, expWidth > 0 ? 4 : 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Net Balance Bar */}
                                                <div className="flex items-center gap-2">
                                                    <span className="w-16 text-[10px] font-bold text-slate-500 uppercase">Saldo</span>
                                                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-blue-600 transition-all duration-700"
                                                            style={{ width: `${Math.max(balWidth, 4)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ratio Chart Summary Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6 flex flex-col justify-between">
                            <div>
                                <div className="border-b border-slate-100 pb-4">
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Proporción Financiera
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500">
                                        Relación % entre recaudación y gastos operacionales
                                    </p>
                                </div>

                                <div className="mt-6 space-y-6">
                                    {/* Donut Progress Visual */}
                                    <div className="text-center">
                                        <div className="inline-flex flex-col items-center justify-center h-32 w-32 rounded-full border-8 border-emerald-500 border-t-rose-500 bg-slate-50 shadow-inner">
                                            <span className="text-2xl font-black text-slate-900">{incomeRatio}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Ingresos</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs">
                                            <span className="font-extrabold text-emerald-900">🟢 Proporción Ingresos</span>
                                            <span className="font-black text-emerald-800">{incomeRatio}% ({formatCLP(kpis.total_income)})</span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs">
                                            <span className="font-extrabold text-rose-900">🔴 Proporción Egresos</span>
                                            <span className="font-black text-rose-800">{expenseRatio}% ({formatCLP(kpis.total_expense)})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-900 p-4 text-white text-center">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                                    Eficiencia Financiera
                                </p>
                                <p className="text-base font-black text-white mt-0.5">
                                    + {formatCLP(kpis.net_balance)} de Superávit
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Recaudación por Categorías & Distribución Pases ARFA V Región vs AFC */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Categorías de Ingreso */}
                        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Recaudación por Categoría Financiera
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500">
                                        Distribución detallada de entradas según tipo de gestión
                                    </p>
                                </div>

                                {/* Date Filter Controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Month Selector */}
                                    <select
                                        value={monthFilter}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setMonthFilter(val);
                                            setStartDate('');
                                            setEndDate('');
                                            handleApplyFilter(val, '', '');
                                        }}
                                        className="rounded-xl border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs"
                                    >
                                        <option value="">🗓️ Todo el Período 2026</option>
                                        <option value="2026-01">Enero 2026</option>
                                        <option value="2026-02">Febrero 2026</option>
                                        <option value="2026-03">Marzo 2026</option>
                                        <option value="2026-04">Abril 2026</option>
                                        <option value="2026-05">Mayo 2026</option>
                                        <option value="2026-06">Junio 2026</option>
                                        <option value="2026-07">Julio 2026</option>
                                        <option value="2026-08">Agosto 2026</option>
                                        <option value="2026-09">Septiembre 2026</option>
                                        <option value="2026-10">Octubre 2026</option>
                                        <option value="2026-11">Noviembre 2026</option>
                                        <option value="2026-12">Diciembre 2026</option>
                                    </select>

                                    {/* Custom Date Range */}
                                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="rounded-lg border-0 bg-transparent py-0.5 px-1 text-xs font-bold text-slate-700 focus:ring-0 w-28"
                                            title="Fecha Desde"
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold">a</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="rounded-lg border-0 bg-transparent py-0.5 px-1 text-xs font-bold text-slate-700 focus:ring-0 w-28"
                                            title="Fecha Hasta"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleApplyFilter()}
                                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-black text-white hover:bg-emerald-700 cursor-pointer"
                                        >
                                            Filtrar
                                        </button>
                                    </div>

                                    {(monthFilter || startDate || endDate) && (
                                        <button
                                            type="button"
                                            onClick={handleResetDateFilter}
                                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🏛️</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-700">Tributos Mensuales</p>
                                            <p className="text-[10px] text-slate-400">Cuota Club + Aporte Selección</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-slate-900">
                                        {formatCLP(kpis.categories.tributo)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🤝</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-blue-950">Fondo Solidario</p>
                                            <p className="text-[10px] text-blue-600">Auxilio a Clubes</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-blue-900">
                                        {formatCLP(kpis.categories.fondo_solidario)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-sky-50/60 p-4 border border-sky-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📝</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-sky-950">Inscripciones Jugadores</p>
                                            <p className="text-[10px] text-sky-600">ARFA $0 • 100% Arcas</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-sky-900">
                                        {formatCLP(kpis.categories.inscripcion)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🏆</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-purple-950">Inscripción Campeonato</p>
                                            <p className="text-[10px] text-purple-600">Bases y Torneos Libres</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-purple-900">
                                        {formatCLP(kpis.categories.inscripcion_campeonato)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-teal-50/60 p-4 border border-teal-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⚽</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-teal-950">Pases / Transferencias</p>
                                            <p className="text-[10px] text-teal-600">
                                                Cobrado: {formatCLP(kpis.categories.pase)} • ARFA: {formatCLP(kpis.arfa_distribution.total_arfa_pases)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-base font-black text-teal-900 block">
                                            {formatCLP(kpis.arfa_distribution.total_afc_pases)}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase text-emerald-600 block">
                                            Margen Asociación
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-indigo-50/60 p-4 border border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⚖️</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-indigo-950">Apelaciones & Multas</p>
                                            <p className="text-[10px] text-indigo-600">Tribunal de Penas</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-indigo-900">
                                        {formatCLP(kpis.categories.apelacion + kpis.categories.multa)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 flex items-center justify-between sm:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💎</span>
                                        <div>
                                            <p className="text-xs font-extrabold text-emerald-950">Otros Ingresos Institucionales</p>
                                            <p className="text-[10px] text-emerald-700">Donaciones, Proyectos Municipal / FNDR, Sponsor & Beneficios</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-emerald-900">
                                        {formatCLP(kpis.categories.otro_ingreso)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Distribución Transparente Pases & Inscripciones: ARFA V Región vs AFC */}
                        <div className="rounded-3xl border border-teal-200/80 bg-white p-6 shadow-2xs space-y-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 font-bold">
                                        🏛️
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900">
                                            Distribución ARFA V Región vs Asociación
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Fondos Pases e Inscripciones de Jugadores
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {/* Box ARFA V Región */}
                                    <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                                                Rendido a ARFA V Región
                                            </span>
                                            <span className="text-[10px] font-bold text-amber-700">Pases + Inscripciones ($0)</span>
                                        </div>
                                        <p className="text-2xl font-black text-amber-900 mt-1">
                                            {formatCLP(kpis.arfa_distribution.total_arfa_overall ?? kpis.arfa_distribution.total_arfa_pases)}
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-semibold text-amber-800">
                                            <span>Pases: {formatCLP(kpis.arfa_distribution.total_arfa_pases)}</span>
                                            <span>Inscripciones: $0 (Gratis)</span>
                                        </div>
                                    </div>

                                    {/* Box Arcas AFC */}
                                    <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                                                Ganancia Libre Arcas Asociación
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-700">100% Permanente</span>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-900 mt-1">
                                            {formatCLP(kpis.arfa_distribution.total_afc_overall ?? kpis.arfa_distribution.total_afc_pases)}
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                                            <span>Margen Pases: {formatCLP(kpis.arfa_distribution.total_afc_pases)}</span>
                                            <span>Inscripciones: {formatCLP(kpis.arfa_distribution.total_afc_inscripciones ?? kpis.categories.inscripcion)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={route('transactions.index')}
                                className="mt-4 block w-full rounded-2xl bg-slate-900 py-3 text-center text-xs font-extrabold text-white hover:bg-slate-800 transition"
                            >
                                💳 Ver Libro de Transacciones Completo
                            </Link>
                        </div>
                    </div>

                    {/* 4. Control de Tributos por Club & Morosidad */}
                    <div className="rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-2xs space-y-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    Estado de Cumplimiento de Tributos ({tribute_status.period_month})
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Fecha Límite en Días Hábiles: <span className="font-bold text-slate-800">{tribute_status.due_date_formatted}</span>
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                    🟢 {tribute_status.summary.paid_count} Al Día
                                </span>
                                <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200">
                                    🔴 {tribute_status.summary.overdue_count} Morosos
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tribute_status.clubs.map((c) => (
                                <div
                                    key={c.club_id}
                                    className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
                                        c.status === 'paid'
                                            ? 'bg-emerald-50/40 border-emerald-200/80'
                                            : c.status === 'overdue'
                                            ? 'bg-rose-50/50 border-rose-200'
                                            : 'bg-blue-50/40 border-blue-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                                            {c.club_name}
                                        </h4>
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border whitespace-nowrap ${
                                            c.status === 'paid'
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                : c.status === 'overdue'
                                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                : 'bg-blue-100 text-blue-800 border-blue-300'
                                        }`}>
                                            {c.badge}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-semibold mt-2.5 pt-2 border-t border-slate-100/60">
                                        {c.payment_date ? `Pagado: ${formatDateChile(c.payment_date)} (${c.folio_number})` : `Límite: ${formatDateChile(c.due_date)}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Últimos Comprobantes Emitidos */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    Últimos Comprobantes Emitidos
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Movimientos recientes en tesorería
                                </p>
                            </div>
                            <Link
                                href={route('transactions.index')}
                                className="text-xs font-bold text-emerald-700 hover:underline"
                            >
                                Ver Todos los Movimientos →
                            </Link>
                        </div>

                        {/* Desktop Table View (1024px+) */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        <th className="py-3 px-4">N° Folio</th>
                                        <th className="py-3 px-4">Fecha</th>
                                        <th className="py-3 px-4">Club / Destino</th>
                                        <th className="py-3 px-4">Concepto</th>
                                        <th className="py-3 px-4">Categoría</th>
                                        <th className="py-3 px-4 text-right">Monto</th>
                                        <th className="py-3 px-4 text-right">PDF</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {recent_transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/80">
                                            <td className="py-3 px-4 font-mono font-black text-emerald-700">
                                                {tx.folio_number || <span className="text-slate-400 font-sans font-normal text-xs">S/N</span>}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-bold">
                                                {formatDateChile(tx.date)}
                                            </td>
                                            <td className="py-3 px-4 font-extrabold text-slate-900">
                                                {tx.club ? tx.club.name : '— General —'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-semibold">
                                                {tx.concept}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                                    categoryBadges[tx.category]?.class || 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {categoryBadges[tx.category]?.label || tx.category}
                                                </span>
                                            </td>
                                            <td className={`py-3 px-4 text-right font-black ${
                                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCLP(tx.amount)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <a
                                                    href={route('transactions.pdf', tx.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                                                >
                                                    🖨️ PDF
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile & Tablet Cards View (< 1024px) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3.5">
                            {recent_transactions.map((tx) => (
                                <div key={tx.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs transition hover:border-slate-300 flex flex-col justify-between">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                {tx.folio_number || 'S/N'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">
                                                {formatDateChile(tx.date)}
                                            </span>
                                        </div>
                                        <span className={`text-sm font-black ${
                                            tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCLP(tx.amount)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-[11px] font-semibold">Club / Destino:</span>
                                            <span className="font-extrabold text-slate-900">{tx.club ? tx.club.name : '— General —'}</span>
                                        </div>
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-slate-400 text-[11px] font-semibold shrink-0">Concepto:</span>
                                            <span className="font-semibold text-slate-700 text-right truncate">{tx.concept}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                                categoryBadges[tx.category]?.class || 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {categoryBadges[tx.category]?.label || tx.category}
                                            </span>
                                            <a
                                                href={route('transactions.pdf', tx.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                                            >
                                                🖨️ Ver PDF
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
