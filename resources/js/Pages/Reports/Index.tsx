import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface TransactionItem {
    id: number;
    folio_number: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    concept: string;
    date: string;
    receipt_image?: string | null;
    club?: {
        id: number;
        name: string;
    };
}

interface AnnualBalanceRow {
    month_num: string;
    month_name: string;
    income: number;
    expense: number;
    net: number;
    accumulated: number;
    categories?: {
        tributo: number;
        pase: number;
        inscripcion: number;
        multa_apelacion: number;
        otros_ingresos: number;
        egresos: number;
    };
}

interface ClubItem {
    id: number;
    name: string;
}

interface TributeMonthStatus {
    month_num: string;
    month_name: string;
    status: 'paid' | 'overdue' | 'pending';
    status_label: string;
    payment_date: string | null;
    folio_number: string | null;
    amount: number;
}

interface PassDetailItem {
    id: number;
    folio_number: string;
    date: string;
    concept: string;
    total_amount: number;
    arfa_cost: number;
    afc_net: number;
}

interface MonthlyPassSummaryItem {
    month_name: string;
    month_num: string;
    count: number;
    amount: number;
    arfa_cost: number;
    afc_net: number;
}

interface PassesMetrics {
    total_count: number;
    total_amount: number;
    total_arfa: number;
    total_afc: number;
    monthly_summary: MonthlyPassSummaryItem[];
}

interface ClubStatementData {
    club: ClubItem;
    year: number;
    period_title?: string;
    total_paid: number;
    pending_tributes_count: number;
    total_pending_amount: number;
    is_up_to_date: boolean;
    totals_by_category?: {
        tributo: number;
        pase: number;
        inscripcion: number;
        multas_apelaciones: number;
        fondo_solidario?: number;
        otros: number;
    };
    passes_list?: PassDetailItem[];
    passes_count?: number;
    passes_adult_count?: number;
    passes_femenino_count?: number;
    total_arfa_pases?: number;
    total_afc_pases_net?: number;
    solidarity_list?: TransactionItem[];
    solidarity_received_list?: TransactionItem[];
    total_solidarity_contributed?: number;
    total_solidarity_received?: number;
    tribute_history: TributeMonthStatus[];
    transactions: TransactionItem[];
}

interface SolidarityReportData {
    total_collected: number;
    total_delivered: number;
    pending_balance: number;
    incomes: TransactionItem[];
    expenses: TransactionItem[];
}

interface ReportsProps {
    summary: {
        total_income: number;
        total_expense: number;
        net_balance: number;
        cash_balance?: number;
        bank_balance?: number;
        income_cash?: number;
        income_bank?: number;
        expense_cash?: number;
        expense_bank?: number;
        categories: Record<string, number>;
    };
    annual_balance: AnnualBalanceRow[];
    passes_metrics?: PassesMetrics;
    transactions: {
        data: TransactionItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        current_page: number;
        from?: number;
        to?: number;
        per_page?: number;
    };
    solidarity_report?: SolidarityReportData;
    institutional: {
        association_name: string;
        association_rut: string;
        treasurer_name: string;
    };
    clubs: ClubItem[];
    club_statement?: ClubStatementData | null;
    filters: {
        month_filter?: string;
        start_date?: string;
        end_date?: string;
        year?: number;
        club_id?: number | null;
        per_page?: number | string;
    };
}

export default function Index({
    summary,
    annual_balance,
    passes_metrics,
    transactions,
    solidarity_report,
    institutional,
    clubs,
    club_statement,
    filters,
}: ReportsProps) {
    const [activeTab, setActiveTab] = useState<'libro' | 'period' | 'annual' | 'club' | 'solidarity'>('libro');
    const [annualViewMode, setAnnualViewMode] = useState<'summary' | 'detailed'>('summary');
    const [selectedYear, setSelectedYear] = useState<number>(filters.year || 2026);
    const [monthFilter, setMonthFilter] = useState(filters.month_filter || '2026-04');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedClubId, setSelectedClubId] = useState<string>(
        filters.club_id ? String(filters.club_id) : clubs.length > 0 ? String(clubs[0].id) : ''
    );
    const [perPageFilter, setPerPageFilter] = useState<string | number>(filters.per_page || 10);

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

    const handleApplyFilter = (mVal?: string, sVal?: string, eVal?: string, yVal?: number, pVal?: string | number) => {
        const params: any = {};
        const m = mVal !== undefined ? mVal : monthFilter;
        const s = sVal !== undefined ? sVal : startDate;
        const e = eVal !== undefined ? eVal : endDate;
        const y = yVal !== undefined ? yVal : selectedYear;
        const p = pVal !== undefined ? pVal : perPageFilter;

        if (y) params.year = y;
        if (m) params.month_filter = m;
        if (s && e) {
            params.start_date = s;
            params.end_date = e;
            params.month_filter = '';
        }
        if (selectedClubId) {
            params.club_id = selectedClubId;
        }
        if (p) {
            params.per_page = p;
        }

        router.get(route('reports.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setSelectedYear(2026);
        setMonthFilter('2026-04');
        setStartDate('');
        setEndDate('');
        setPerPageFilter(10);
        router.get(route('reports.index'), { per_page: 10 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // PDF & CSV Download Links Helper
    const getDownloadUrl = (reportType: 'libro' | 'monthly' | 'annual' | 'arfa' | 'csv') => {
        const params = new URLSearchParams();
        params.append('year', String(selectedYear));
        if (startDate && endDate) {
            params.append('start_date', startDate);
            params.append('end_date', endDate);
        } else if (monthFilter) {
            params.append('month_filter', monthFilter);
        }

        if (reportType === 'libro') {
            return route('reports.libro-respaldos-pdf') + '?' + params.toString();
        } else if (reportType === 'monthly') {
            return route('reports.monthly-pdf') + '?' + params.toString();
        } else if (reportType === 'arfa') {
            return route('reports.arfa-rendicion-pdf') + '?' + params.toString();
        } else if (reportType === 'csv') {
            return route('reports.export-csv') + '?' + params.toString();
        } else {
            return route('reports.annual-balance-pdf') + '?' + params.toString();
        }
    };

    const expensesList = (transactions?.data || []).filter((t: TransactionItem) => t.type === 'expense');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <span>📊</span> Centro de Reportes & Libro de Respaldos
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {institutional.association_name || 'Asociación de Fútbol Catemu (AFC)'} • Generación de Libros Físicos/Digitales, Balances y Cartolas de Clubes
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                        <a
                            href={getDownloadUrl('arfa')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-blue-700 transition"
                            title="Planilla Rendición Pases ARFA V Región"
                        >
                            <span>📄</span> Pases ARFA
                        </a>
                        <a
                            href={getDownloadUrl('csv')}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-slate-900 transition"
                            title="Exportar a Planilla Excel (.xls)"
                        >
                            <span>📊</span> Exportar Excel
                        </a>
                        <a
                            href={getDownloadUrl('monthly')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-rose-700 transition"
                            title="Exportar Movimientos del Período a PDF"
                        >
                            <span>📑</span> PDF Movimientos
                        </a>
                        <a
                            href={getDownloadUrl('libro')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-emerald-700 transition"
                            title="Descargar Libro de Respaldos con fotos de boletas"
                        >
                            <span>🖨️</span> Libro Respaldos
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Reportes & Libro de Respaldos - AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Executive Global Date Filter Toolbar */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                🗓️
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Filtrar Período y Año del Reporte
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Selecciona el año, mes o rango de fechas para generar el Libro o la Cartola del Club
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Year Selector */}
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setSelectedYear(val);
                                    setMonthFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    handleApplyFilter('', '', '', val);
                                }}
                                className="rounded-xl border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-2xs cursor-pointer"
                            >
                                <option value={2026}>📅 Año 2026</option>
                                <option value={2027}>📅 Año 2027</option>
                                <option value={2028}>📅 Año 2028</option>
                            </select>

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
                                <option value="">🗓️ Todo el Período Anual</option>
                                <option value={`${selectedYear}-01`}>Enero</option>
                                <option value={`${selectedYear}-02`}>Febrero</option>
                                <option value={`${selectedYear}-03`}>Marzo</option>
                                <option value={`${selectedYear}-04`}>Abril</option>
                                <option value={`${selectedYear}-05`}>Mayo</option>
                                <option value={`${selectedYear}-06`}>Junio</option>
                                <option value={`${selectedYear}-07`}>Julio</option>
                                <option value={`${selectedYear}-08`}>Agosto</option>
                                <option value={`${selectedYear}-09`}>Septiembre</option>
                                <option value={`${selectedYear}-10`}>Octubre</option>
                                <option value={`${selectedYear}-11`}>Noviembre</option>
                                <option value={`${selectedYear}-12`}>Diciembre</option>
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
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-black text-white hover:bg-indigo-700 shadow-2xs cursor-pointer"
                                >
                                    Filtrar
                                </button>
                            </div>

                            {(monthFilter !== '2026-04' || startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Restablecer
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Report Summary Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ingresos del Período</span>
                            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCLP(summary.total_income)}</h3>
                        </div>

                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Egresos del Período</span>
                            <h3 className="text-2xl font-black text-rose-600 mt-1">{formatCLP(summary.total_expense)}</h3>
                        </div>

                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Saldo Neto / Flujo</span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCLP(summary.net_balance)}</h3>
                        </div>

                        <div className="rounded-3xl border border-teal-200 bg-teal-50/60 p-5 shadow-2xs">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">Pases Cursados Año {selectedYear}</span>
                            <h3 className="text-2xl font-black text-teal-900 mt-1">
                                {passes_metrics?.total_count || 0} <span className="text-xs font-bold text-teal-700">Pases</span>
                            </h3>
                            <p className="text-[10px] font-extrabold text-teal-800 mt-0.5">
                                Utilidad AFC: {formatCLP(passes_metrics?.total_afc || 0)} (ARFA: {formatCLP(passes_metrics?.total_arfa || 0)})
                            </p>
                        </div>
                    </div>

                    {/* Cash vs Bank Liquidity Breakdown Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <span>💵</span> Disponibilidad en Caja Chica (Efectivo)
                                </span>
                                <h4 className="text-xl font-black text-amber-950 mt-1">{formatCLP(summary.cash_balance || 0)}</h4>
                                <p className="text-[10px] font-bold text-amber-800 mt-0.5">
                                    Entradas: +{formatCLP(summary.income_cash || 0)} • Salidas: -{formatCLP(summary.expense_cash || 0)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-200/60 p-3 text-amber-900 font-extrabold text-xs">
                                Efectivo Físico
                            </div>
                        </div>

                        <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                    <span>🏦</span> Fondos en Cuenta Bancaria (Transferencias / Depósitos)
                                </span>
                                <h4 className="text-xl font-black text-blue-950 mt-1">{formatCLP(summary.bank_balance || 0)}</h4>
                                <p className="text-[10px] font-bold text-blue-800 mt-0.5">
                                    Entradas: +{formatCLP(summary.income_bank || 0)} • Salidas: -{formatCLP(summary.expense_bank || 0)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-blue-200/60 p-3 text-blue-900 font-extrabold text-xs">
                                Banco / CtaRUT
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs Bar */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-2xl border shadow-2xs">
                        <div className="flex space-x-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('libro')}
                                className={`py-4 text-xs font-black tracking-wide transition border-b-2 uppercase ${
                                    activeTab === 'libro'
                                        ? 'border-emerald-600 text-emerald-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                📖 Libro de Respaldos con Anexo PDF
                            </button>

                            <button
                                onClick={() => setActiveTab('period')}
                                className={`py-4 text-xs font-black tracking-wide transition border-b-2 uppercase ${
                                    activeTab === 'period'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                🗓️ Informe de Movimientos del Período
                            </button>

                            <button
                                onClick={() => setActiveTab('annual')}
                                className={`py-4 text-xs font-black tracking-wide transition border-b-2 uppercase ${
                                    activeTab === 'annual'
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                📊 Balance Anual 2026
                            </button>

                            <button
                                onClick={() => setActiveTab('club')}
                                className={`py-4 text-xs font-black tracking-wide transition border-b-2 uppercase ${
                                    activeTab === 'club'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                🛡️ Cartola & Estado por Club
                            </button>

                            <button
                                onClick={() => setActiveTab('solidarity')}
                                className={`py-4 text-xs font-black tracking-wide transition border-b-2 uppercase ${
                                    activeTab === 'solidarity'
                                        ? 'border-cyan-600 text-cyan-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                🤝 Informe Fondo Solidario
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: LIBRO DE RESPALDOS (PREVIEW & DOWNLOAD) */}
                    {activeTab === 'libro' && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Vista Previa: Libro de Respaldos (Detalle de Egresos)
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Resumen contable y anexo de facturas/boletas que se incluirán en el documento PDF oficial
                                        </p>
                                    </div>

                                    <a
                                        href={getDownloadUrl('libro')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 transition"
                                    >
                                        <span>🖨️</span> Descargar Libro de Respaldos PDF
                                    </a>
                                </div>

                                {/* Table Preview */}
                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="py-3 px-5">Fecha</th>
                                                <th className="py-3 px-5">Concepto</th>
                                                <th className="py-3 px-5">Categoría</th>
                                                <th className="py-3 px-5 text-center">Boleta / Foto</th>
                                                <th className="py-3 px-5 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {expensesList.length > 0 ? (
                                                expensesList.map((exp: TransactionItem) => (
                                                    <tr key={exp.id} className="hover:bg-slate-50/80">
                                                        <td className="py-3 px-5 font-bold text-slate-700">
                                                            {formatDateChile(exp.date)}
                                                        </td>
                                                        <td className="py-3 px-5 font-extrabold text-slate-900">
                                                            {exp.concept}
                                                        </td>
                                                        <td className="py-3 px-5 text-slate-600 font-medium">
                                                            {exp.category}
                                                        </td>
                                                        <td className="py-3 px-5 text-center">
                                                            {exp.receipt_image ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                                                    📷 Foto Adjunta
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                                                                    📄 Comprobante Folio
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-5 text-right font-black text-rose-600">
                                                            -{formatCLP(exp.amount)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                                                        No hay egresos o gastos registrados en el período seleccionado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {expensesList.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-slate-50 border-t border-slate-200 font-black">
                                                    <td colSpan={4} className="py-3.5 px-5 text-right text-xs uppercase tracking-wider text-slate-700">
                                                        TOTAL EGRESOS DEL PERÍODO
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right text-sm text-rose-600">
                                                        -{formatCLP(summary.total_expense)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: INFORME DE MOVIMIENTOS DEL PERÍODO */}
                    {activeTab === 'period' && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Movimientos Contables del Período
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Listado consolidado de ingresos y egresos registrados
                                        </p>
                                    </div>

                                    <a
                                        href={getDownloadUrl('monthly')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition"
                                    >
                                        <span>📄</span> Descargar Informe Mensual (PDF)
                                    </a>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="py-3 px-5">Folio</th>
                                                <th className="py-3 px-5">Fecha</th>
                                                <th className="py-3 px-5">Entidad / Club</th>
                                                <th className="py-3 px-5">Concepto</th>
                                                <th className="py-3 px-5 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {(transactions?.data || []).map((tx: TransactionItem) => (
                                                <tr key={tx.id} className="hover:bg-slate-50/80">
                                                    <td className="py-3 px-5 font-mono font-black text-emerald-700">
                                                        {tx.folio_number}
                                                    </td>
                                                    <td className="py-3 px-5 font-bold text-slate-600">
                                                        {formatDateChile(tx.date)}
                                                    </td>
                                                    <td className="py-3 px-5 font-extrabold text-slate-900">
                                                        {tx.club ? tx.club.name : '— Asociación AFC —'}
                                                    </td>
                                                    <td className="py-3 px-5 text-slate-700">
                                                        {tx.concept}
                                                    </td>
                                                    <td className={`py-3 px-5 text-right font-black ${
                                                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                        {tx.type === 'income' ? '+' : '-'}{formatCLP(tx.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: BALANCE ANUAL */}
                    {activeTab === 'annual' && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Balance General Anual {selectedYear}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Consolidado mes a mes del flujo de caja de la temporada
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* View mode toggle */}
                                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setAnnualViewMode('summary')}
                                                className={`px-3 py-1.5 rounded-lg transition ${
                                                    annualViewMode === 'summary'
                                                        ? 'bg-white text-slate-900 shadow-2xs font-black'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                📊 Resumen
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAnnualViewMode('detailed')}
                                                className={`px-3 py-1.5 rounded-lg transition ${
                                                    annualViewMode === 'detailed'
                                                        ? 'bg-white text-slate-900 shadow-2xs font-black'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                🔍 Detallado por Categoría
                                            </button>
                                        </div>

                                        <a
                                            href={getDownloadUrl('annual')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-purple-700 transition"
                                        >
                                            <span>📊</span> Descargar Balance Anual (PDF)
                                        </a>
                                    </div>
                                </div>

                                {annualViewMode === 'summary' ? (
                                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3.5 px-5">Mes</th>
                                                    <th className="py-3.5 px-5 text-right">Ingresos ($)</th>
                                                    <th className="py-3.5 px-5 text-right">Egresos ($)</th>
                                                    <th className="py-3.5 px-5 text-right">Resultado Neto ($)</th>
                                                    <th className="py-3.5 px-5 text-right">Saldo Acumulado ($)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {annual_balance.map((row) => (
                                                    <tr key={row.month_num} className="hover:bg-slate-50/80">
                                                        <td className="py-3.5 px-5 font-black text-slate-900 uppercase">
                                                            📅 {row.month_name} {selectedYear}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                                                            +{formatCLP(row.income)}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right font-bold text-rose-600">
                                                            -{formatCLP(row.expense)}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right font-extrabold text-slate-800">
                                                            {formatCLP(row.net)}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900">
                                                            {formatCLP(row.accumulated)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    /* Detailed Category Matrix */
                                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3.5 px-4">Mes</th>
                                                    <th className="py-3.5 px-4 text-right">Tributos</th>
                                                    <th className="py-3.5 px-4 text-right">Pases</th>
                                                    <th className="py-3.5 px-4 text-right">Inscripciones</th>
                                                    <th className="py-3.5 px-4 text-right">Multas / Apel.</th>
                                                    <th className="py-3.5 px-4 text-right">Otros Ing.</th>
                                                    <th className="py-3.5 px-4 text-right">Egresos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {annual_balance.map((row) => (
                                                    <tr key={row.month_num} className="hover:bg-slate-50/80">
                                                        <td className="py-3.5 px-4 font-black text-slate-900 uppercase">
                                                            📅 {row.month_name}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                                                            {formatCLP(row.categories?.tributo || 0)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-teal-600">
                                                            {formatCLP(row.categories?.pase || 0)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-sky-600">
                                                            {formatCLP(row.categories?.inscripcion || 0)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                                                            {formatCLP(row.categories?.multa_apelacion || 0)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                                                            {formatCLP(row.categories?.otros_ingresos || 0)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                                                            -{formatCLP(row.categories?.egresos || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ESTADO FINANCIERO POR CLUB (CARTOLA) */}
                    {activeTab === 'club' && club_statement && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-2xl font-bold">
                                            🛡️
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                Cartola Financiera: {club_statement.club.name}
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500">
                                                Informe detallado de pagos realizados y tributos pendientes en la temporada {club_statement.year}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Club Selector Dropdown */}
                                        <select
                                            value={selectedClubId}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedClubId(val);
                                                router.get(route('reports.index'), { club_id: val, year: selectedYear, month_filter: monthFilter, start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
                                            }}
                                            className="rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-900 shadow-2xs cursor-pointer"
                                        >
                                            {clubs.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    🛡️ {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <a
                                             href={
                                                 route('reports.club-certificate-pdf', club_statement.club.id) +
                                                 '?' +
                                                 new URLSearchParams({
                                                     year: String(selectedYear),
                                                 }).toString()
                                             }
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-teal-800 transition"
                                         >
                                             <span>📜</span> Certificado Paz y Salvo
                                         </a>

                                         <a
                                            href={
                                                route('reports.club-statement-pdf', club_statement.club.id) +
                                                '?' +
                                                new URLSearchParams({
                                                    year: String(selectedYear),
                                                    ...(monthFilter ? { month_filter: monthFilter } : {}),
                                                    ...(startDate && endDate ? { start_date: startDate, end_date: endDate } : {}),
                                                }).toString()
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 transition"
                                        >
                                            <span>🖨️</span> Descargar Cartola en PDF
                                        </a>
                                    </div>
                                </div>

                                {/* Desglose por Categorías de Pago del Club */}
                                {club_statement.totals_by_category && (
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Tributos</span>
                                            <span className="text-base font-black text-slate-900 mt-0.5 block">{formatCLP(club_statement.totals_by_category.tributo)}</span>
                                        </div>
                                        <div className="rounded-2xl bg-teal-50/60 p-3 border border-teal-200 text-center">
                                            <span className="text-[10px] font-extrabold uppercase text-teal-800 block">Pases Jugadores</span>
                                            <span className="text-base font-black text-teal-900 mt-0.5 block">{formatCLP(club_statement.totals_by_category.pase)}</span>
                                        </div>
                                        <div className="rounded-2xl bg-sky-50/60 p-3 border border-sky-200 text-center">
                                            <span className="text-[10px] font-extrabold uppercase text-sky-800 block">Inscripciones</span>
                                            <span className="text-base font-black text-sky-900 mt-0.5 block">{formatCLP(club_statement.totals_by_category.inscripcion)}</span>
                                        </div>
                                        <div className="rounded-2xl bg-amber-50/60 p-3 border border-amber-200 text-center">
                                            <span className="text-[10px] font-extrabold uppercase text-amber-800 block">Multas & Apelaciones</span>
                                            <span className="text-base font-black text-amber-900 mt-0.5 block">{formatCLP(club_statement.totals_by_category.multas_apelaciones)}</span>
                                        </div>
                                        <div className="rounded-2xl bg-indigo-50/60 p-3 border border-indigo-200 text-center col-span-2 sm:col-span-1">
                                            <span className="text-[10px] font-extrabold uppercase text-indigo-800 block">Fondo Solidario / Varios</span>
                                            <span className="text-base font-black text-indigo-900 mt-0.5 block">{formatCLP(club_statement.totals_by_category.otros)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Club KPI Header Cards */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Total Cancelado</span>
                                            <h4 className="text-2xl font-black text-emerald-900 mt-1">{formatCLP(club_statement.total_paid)}</h4>
                                        </div>
                                        <span className="text-2xl">💰</span>
                                    </div>

                                    <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Tributos Pendientes</span>
                                            <h4 className="text-2xl font-black text-amber-900 mt-1">
                                                {club_statement.pending_tributes_count} Mes(es) ({formatCLP(club_statement.total_pending_amount)})
                                            </h4>
                                        </div>
                                        <span className="text-2xl">⚠️</span>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Estado de Cuenta</span>
                                            <div className="mt-1">
                                                {club_statement.is_up_to_date ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                                        ✅ AL DÍA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded-lg">
                                                        🔴 MOROSO ({club_statement.pending_tributes_count} PENDIENTES)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-2xl">📋</span>
                                    </div>
                                </div>

                                {/* 1. Monthly Tributes Status Grid */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                        1. Estado de Tributos Mensuales (Temporada 2026)
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {club_statement.tribute_history.map((t) => (
                                            <div
                                                key={t.month_num}
                                                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                                                    t.status === 'paid'
                                                        ? 'bg-emerald-50/60 border-emerald-200'
                                                        : t.status === 'overdue'
                                                        ? 'bg-rose-50/60 border-rose-200'
                                                        : 'bg-slate-50 border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between font-extrabold">
                                                    <span className="text-slate-900 uppercase">📅 {t.month_name}</span>
                                                    {t.status === 'paid' ? (
                                                        <span className="text-emerald-700 font-bold">✔ Pagado</span>
                                                    ) : t.status === 'overdue' ? (
                                                        <span className="text-rose-600 font-bold">✖ Vencido / Moroso</span>
                                                    ) : (
                                                        <span className="text-slate-500 font-bold">⏳ Por Vencer (En Plazo)</span>
                                                    )}
                                                </div>
                                                {t.status === 'paid' && (
                                                    <p className="text-[10px] text-emerald-800 font-medium">
                                                        {formatDateChile(t.payment_date)} • {t.folio_number}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Transparent Pases Section */}
                                {club_statement.passes_list && club_statement.passes_list.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                                                <span>🔄</span> 2. Detalle Transparente de Pases: ARFA V Región vs Retención AFC
                                                <span className="ml-2 rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-800 border border-teal-200">
                                                    {club_statement.passes_count || 0} Pases ({club_statement.passes_adult_count || 0} Adultos • {club_statement.passes_femenino_count || 0} Femeninos)
                                                </span>
                                            </h4>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-teal-200 bg-teal-50/20">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-teal-200 bg-teal-100/50 text-[11px] font-bold uppercase tracking-wider text-teal-900">
                                                        <th className="py-3 px-4">Folio</th>
                                                        <th className="py-3 px-4">Fecha</th>
                                                        <th className="py-3 px-4">Detalle / Jugador</th>
                                                        <th className="py-3 px-4 text-right">Cobrado al Club</th>
                                                        <th className="py-3 px-4 text-right">Costo ARFA V Región</th>
                                                        <th className="py-3 px-4 text-right">Ganancia AFC</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-teal-100 font-medium">
                                                    {club_statement.passes_list.map((pass) => (
                                                        <tr key={pass.id} className="hover:bg-teal-50/50">
                                                            <td className="py-3 px-4 font-mono font-black text-teal-800">
                                                                {pass.folio_number}
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-slate-700">
                                                                {formatDateChile(pass.date)}
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-900 font-bold">
                                                                {pass.concept}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-black text-slate-900">
                                                                {formatCLP(pass.total_amount)}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-bold text-rose-600">
                                                                {formatCLP(pass.arfa_cost)}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-black text-emerald-600">
                                                                +{formatCLP(pass.afc_net)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t border-teal-300 bg-teal-100/80 font-black text-slate-900">
                                                        <td colSpan={3} className="py-3 px-4 text-right text-[11px] uppercase tracking-wider">
                                                            SUBTOTALES PASES Y TRANSFERENCIAS
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-emerald-800">
                                                            {formatCLP(club_statement.totals_by_category?.pase || 0)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-rose-700">
                                                            {formatCLP(club_statement.total_arfa_pases || 0)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-emerald-700">
                                                            +{formatCLP(club_statement.total_afc_pases_net || 0)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Full Transactions List for Club */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                        3. Historial Completo de Pagos Realizados por {club_statement.club.name}
                                    </h4>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3 px-5">N° Folio</th>
                                                    <th className="py-3 px-5">Fecha</th>
                                                    <th className="py-3 px-5">Categoría</th>
                                                    <th className="py-3 px-5">Detalle / Motivo</th>
                                                    <th className="py-3 px-5 text-right">Monto Cancelado</th>
                                                    <th className="py-3 px-5 text-center">Comprobante</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {club_statement.transactions && club_statement.transactions.length > 0 ? (
                                                    club_statement.transactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/80">
                                                            <td className="py-3 px-5 font-mono font-black text-emerald-700">
                                                                {tx.folio_number}
                                                            </td>
                                                            <td className="py-3 px-5 font-bold text-slate-600">
                                                                {formatDateChile(tx.date)}
                                                            </td>
                                                            <td className="py-3 px-5 font-bold text-slate-800">
                                                                {tx.category}
                                                            </td>
                                                            <td className="py-3 px-5 text-slate-700">
                                                                {tx.concept}
                                                            </td>
                                                            <td className="py-3 px-5 text-right font-black text-emerald-600">
                                                                +{formatCLP(tx.amount)}
                                                            </td>
                                                            <td className="py-3 px-5 text-center">
                                                                <a
                                                                    href={route('transactions.pdf', tx.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                                                                >
                                                                    🖨️ Recibo
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                                            No hay pagos registrados para este club en la temporada.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: INFORME DE FONDO SOLIDARIO & AUXILIOS */}
                    {activeTab === 'solidarity' && (
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                            <span>🤝</span> Informe Especial: Fondo Solidario & Auxilios Médicos
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500">
                                            Control y rendición transparente de fondos recaudados de los clubes y entregados a beneficiarios
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">
                                            Cuenta en Tránsito (Saldo $0 para la Asociación)
                                        </span>
                                    </div>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5">
                                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                                            📥 Total Recaudado (Aportes Clubes)
                                        </div>
                                        <div className="mt-2 text-2xl font-black text-blue-900">
                                            {formatCLP(solidarity_report?.total_collected || 0)}
                                        </div>
                                        <p className="mt-1 text-[11px] font-medium text-blue-600">
                                            Ingresos por fondos de auxilio médico / social
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-5">
                                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
                                            📤 Total Entregado (Ayudas a Beneficiarios)
                                        </div>
                                        <div className="mt-2 text-2xl font-black text-rose-900">
                                            {formatCLP(solidarity_report?.total_delivered || 0)}
                                        </div>
                                        <p className="mt-1 text-[11px] font-medium text-rose-600">
                                            Desembolsos efectuados a los clubes o jugadores
                                        </p>
                                    </div>

                                    <div className={`rounded-2xl border p-5 ${
                                        (solidarity_report?.pending_balance || 0) === 0
                                            ? 'border-emerald-200/80 bg-emerald-50/50'
                                            : 'border-amber-200/80 bg-amber-50/50'
                                    }`}>
                                        <div className={`text-[11px] font-extrabold uppercase tracking-wider ${
                                            (solidarity_report?.pending_balance || 0) === 0 ? 'text-emerald-700' : 'text-amber-700'
                                        }`}>
                                            ⚖️ Saldo por Entregar / Rendir
                                        </div>
                                        <div className={`mt-2 text-2xl font-black ${
                                            (solidarity_report?.pending_balance || 0) === 0 ? 'text-emerald-900' : 'text-amber-900'
                                        }`}>
                                            {formatCLP(solidarity_report?.pending_balance || 0)}
                                        </div>
                                        <p className={`mt-1 text-[11px] font-medium ${
                                            (solidarity_report?.pending_balance || 0) === 0 ? 'text-emerald-600' : 'text-amber-600'
                                        }`}>
                                            {(solidarity_report?.pending_balance || 0) === 0 ? '✅ Rendición 100% al día y cuadrada' : '⚠️ Pendiente por asignar o entregar'}
                                        </p>
                                    </div>
                                </div>

                                {/* Table 1: Incomes / Collections */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                        <span>📥</span> 1. Aportes y Fondos Recaudados por los Clubes
                                    </h4>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3 px-5">Folio</th>
                                                    <th className="py-3 px-5">Fecha</th>
                                                    <th className="py-3 px-5">Club Aportante</th>
                                                    <th className="py-3 px-5">Detalle / Concepto</th>
                                                    <th className="py-3 px-5 text-right">Monto Recaudado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {solidarity_report?.incomes && solidarity_report.incomes.length > 0 ? (
                                                    solidarity_report.incomes.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/80">
                                                            <td className="py-3 px-5 font-mono font-black text-blue-700">
                                                                {tx.folio_number}
                                                            </td>
                                                            <td className="py-3 px-5 font-bold text-slate-600">
                                                                {formatDateChile(tx.date)}
                                                            </td>
                                                            <td className="py-3 px-5 font-extrabold text-slate-900">
                                                                {tx.club ? tx.club.name : '— Aporte Varios —'}
                                                            </td>
                                                            <td className="py-3 px-5 text-slate-700">
                                                                {tx.concept}
                                                            </td>
                                                            <td className="py-3 px-5 text-right font-black text-blue-600">
                                                                +{formatCLP(tx.amount)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                                                            No hay ingresos por Fondo Solidario registrados en el período.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Table 2: Expenses / Deliveries */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                        <span>📤</span> 2. Ayudas Entregadas y Desembolsadas a Beneficiarios
                                    </h4>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3 px-5">Folio</th>
                                                    <th className="py-3 px-5">Fecha</th>
                                                    <th className="py-3 px-5">Club / Beneficiario</th>
                                                    <th className="py-3 px-5">Motivo / Caso de Auxilio</th>
                                                    <th className="py-3 px-5 text-right">Monto Entregado</th>
                                                    <th className="py-3 px-5 text-center">Comprobante</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {solidarity_report?.expenses && solidarity_report.expenses.length > 0 ? (
                                                    solidarity_report.expenses.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/80">
                                                            <td className="py-3 px-5 font-mono font-black text-rose-700">
                                                                {tx.folio_number}
                                                            </td>
                                                            <td className="py-3 px-5 font-bold text-slate-600">
                                                                {formatDateChile(tx.date)}
                                                            </td>
                                                            <td className="py-3 px-5 font-extrabold text-slate-900">
                                                                {tx.club ? tx.club.name : '— Beneficiario Directo —'}
                                                            </td>
                                                            <td className="py-3 px-5 text-slate-700">
                                                                {tx.concept}
                                                            </td>
                                                            <td className="py-3 px-5 text-right font-black text-rose-600">
                                                                -{formatCLP(tx.amount)}
                                                            </td>
                                                            <td className="py-3 px-5 text-center">
                                                                <a
                                                                    href={route('transactions.pdf', tx.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                                                                >
                                                                    🖨️ Recibo
                                                                </a>
                                                            </td>
                                                        </tr>
                                                     ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                                            No se han registrado entregas o desembolsos de Fondo Solidario en el período.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
