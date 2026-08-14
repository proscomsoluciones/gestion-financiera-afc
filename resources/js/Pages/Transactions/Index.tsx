import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrintableVoucherModal, { TransactionVoucher } from '@/Components/PrintableVoucherModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Club {
    id: number;
    name: string;
    short_name?: string;
    crest_url?: string;
}

interface TariffItem {
    key: string;
    label: string;
    value: number;
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

const defaultOtherIncomeCategories = [
    { id: 'donacion', label: 'Donación / Aporte Voluntario' },
    { id: 'proyecto', label: 'Proyecto / Subvención Municipal o FNDR' },
    { id: 'finales', label: 'Recaudación Entradas / Final de Campeonato' },
    { id: 'sponsor', label: 'Sponsor / Auspicio Comercial' },
    { id: 'evento', label: 'Venta de Bases / Evento / Beneficio' },
    { id: 'otro', label: 'Otro Ingreso Extraordinario' },
];

const defaultExpenseCategories = [
    { id: 'viatico', label: 'Viático / Asignación de Traslado / Árbitros' },
    { id: 'compra', label: 'Compra de Insumos / Balones / Materiales' },
    { id: 'servicio', label: 'Pago de Servicios / Honorarios / Gastos' },
    { id: 'otro', label: 'Otro Egreso AFC' },
];

interface IndexProps {
    transactions: {
        data: TransactionVoucher[];
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
    filters: {
        search?: string;
        club_id?: string;
        category?: string;
        type?: string;
        tribute_period?: string;
        per_page?: number | string;
    };
    clubs: Club[];
    tariffs?: Record<string, TariffItem>;
    institutional?: any;
    other_income_categories?: Array<{ id: string; label: string }>;
    expense_categories?: Array<{ id: string; label: string }>;
    tribute_status?: TributeStatusData;
    metrics: {
        total_income: number;
        total_expense: number;
        balance: number;
        next_folio: string;
    };
    flash?: {
        success?: string;
        created_transaction?: TransactionVoucher;
    };
}

export default function Index({
    transactions,
    filters,
    clubs,
    tariffs = {},
    institutional,
    other_income_categories = [],
    expense_categories = [],
    tribute_status,
    metrics,
    flash,
}: IndexProps) {
    // Navigation Tab state
    const [activeTab, setActiveTab] = useState<'historial' | 'tributos'>('historial');

    // Dynamic Years and Months lists for multi-year support (starting from 2026 onwards)
    const availableYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
    const availableMonths = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formatDateChile = (dateStr: string | null) => {
        if (!dateStr) return '';
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    // Current Date formatted for defaults
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear();
    const currentMonthName = availableMonths[today.getMonth()];

    // Selected Tribute Control Period
    const initialTributePeriod = filters.tribute_period || `${currentMonthName} ${currentYear}`;
    const [tributePeriod, setTributePeriod] = useState(initialTributePeriod);

    // Form Period state
    const [formMonth, setFormMonth] = useState(currentMonthName);
    const [formYear, setFormYear] = useState(currentYear);

    const [search, setSearch] = useState(filters.search || '');
    const [clubIdFilter, setClubIdFilter] = useState(filters.club_id || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [perPageFilter, setPerPageFilter] = useState<string | number>(filters.per_page || 10);

    // Dynamic Tariffs with fallback (CLP integers)
    const rateTributo = Math.round(tariffs.rate_tributo_club?.value ?? 30000);
    const rateSeleccion = Math.round(tariffs.rate_aporte_seleccion?.value ?? 10000);
    const rateApelacion = Math.round(tariffs.rate_apelacion?.value ?? 30000);
    const rateInscripcionTotal = Math.round(tariffs.rate_inscripcion_total?.value ?? 3000);

    // Pass tariffs
    const ratePaseEstandarTotal = Math.round(tariffs.rate_pase_estandar_total?.value ?? 22000);
    const ratePaseEstandarArfa = Math.round(tariffs.rate_pase_estandar_arfa?.value ?? 17000);
    const ratePaseFemeninoTotal = Math.round(tariffs.rate_pase_femenino_total?.value ?? 17000);
    const ratePaseFemeninoArfa = Math.round(tariffs.rate_pase_femenino_arfa?.value ?? 12000);

    const totalTributoCalc = rateTributo + rateSeleccion;

    // Active Modal Form
    const [activeModal, setActiveModal] = useState<
        'tributo' | 'fondo_solidario' | 'inscripcion' | 'inscripcion_campeonato' | 'pase' | 'apelacion' | 'multa' | 'egreso' | 'otro_ingreso' | null
    >(null);

    // Form states
    const [passCategory, setPassCategory] = useState<'interno' | 'regional' | 'externo' | 'femenino'>('interno');
    const [inscriptionType, setInscriptionType] = useState<'adulto' | 'infantil' | 'femenina'>('adulto');
    const [championshipName, setChampionshipName] = useState('Campeonato Apertura 2026');
    const [originClubName, setOriginClubName] = useState('');

    // Multi-Player / Multi-Item State
    const [playerRows, setPlayerRows] = useState<Array<{
        id: string;
        code: string;
        type_label: string;
        player_name: string;
        player_rut: string;
        amount: number;
        arfa_cost: number;
        afc_margin: number;
        origin_club?: string;
    }>>([]);

    // Multi-Item State for Fondo Solidario
    const [solidarityRows, setSolidarityRows] = useState<Array<{
        id: string;
        description: string;
        amount: number | string;
    }>>([]);

    // Confirmation Alert Modal State for Deletion
    const [deletingTx, setDeletingTx] = useState<TransactionVoucher | null>(null);

    // States for Otros Ingresos & Egresos
    const [otherIncomeCategory, setOtherIncomeCategory] = useState<'donacion' | 'proyecto' | 'finales' | 'sponsor' | 'evento' | 'otro'>('donacion');
    const [otherIncomeEntity, setOtherIncomeEntity] = useState('');
    const [expenseType, setExpenseType] = useState<'viatico' | 'compra' | 'servicio' | 'otro'>('viatico');

    const syncSolidarityRowsToForm = (rows: typeof solidarityRows) => {
        setSolidarityRows(rows);
        const totalAmount = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        const descriptionsJoined = rows.map(r => r.description).filter(Boolean).join(' + ');

        let conceptText = '';
        if (rows.length === 1 && rows[0]?.description) {
            conceptText = rows[0].description;
        } else {
            conceptText = `Fondo Solidario (${rows.length} Ítems: ${descriptionsJoined || 'Sin especificar'})`;
        }

        setData(prev => ({
            ...prev,
            amount: totalAmount,
            concept: conceptText,
            breakdown: {
                items: rows.map(r => ({
                    type_label: 'Aporte Fondo Solidario',
                    player_name: r.description || 'Aporte Solidario',
                    amount: Number(r.amount) || 0,
                })),
            },
        }));
    };

    const arfaCodesMap: Record<string, { label: string; amount: number; arfa_cost: number; afc_margin: number }> = {
        '1': { label: 'Código 1: Inscripción Adulto', amount: rateInscripcionTotal, arfa_cost: 0, afc_margin: rateInscripcionTotal },
        '2': { label: 'Código 2: Inscripción Infantil', amount: rateInscripcionTotal, arfa_cost: 0, afc_margin: rateInscripcionTotal },
        '3': { label: 'Código 3: Inscripción Femenina', amount: rateInscripcionTotal, arfa_cost: 0, afc_margin: rateInscripcionTotal },
        '4': { label: 'Código 4: Pase Interno', amount: ratePaseEstandarTotal, arfa_cost: ratePaseEstandarArfa, afc_margin: ratePaseEstandarTotal - ratePaseEstandarArfa },
        '5': { label: 'Código 5: Pase Regional', amount: ratePaseEstandarTotal, arfa_cost: ratePaseEstandarArfa, afc_margin: ratePaseEstandarTotal - ratePaseEstandarArfa },
        '6': { label: 'Código 6: Pase Externo', amount: ratePaseEstandarTotal, arfa_cost: ratePaseEstandarArfa, afc_margin: ratePaseEstandarTotal - ratePaseEstandarArfa },
        '7': { label: 'Código 7: Pase Femenino', amount: ratePaseFemeninoTotal, arfa_cost: ratePaseFemeninoArfa, afc_margin: ratePaseFemeninoTotal - ratePaseFemeninoArfa },
    };

    const syncPlayerRowsToForm = (rows: typeof playerRows) => {
        setPlayerRows(rows);
        const totalAmount = rows.reduce((acc, r) => acc + (r.amount || 0), 0);
        const totalArfaCost = rows.reduce((acc, r) => acc + (r.arfa_cost || 0), 0);
        const totalAfcMargin = rows.reduce((acc, r) => acc + (r.afc_margin || 0), 0);

        const namesJoined = rows.map(r => r.player_name).filter(Boolean).join(', ');
        const firstRow = rows[0];

        let conceptText = '';
        if (rows.length === 1 && firstRow) {
            const rutText = firstRow.player_rut ? ` (RUT: ${firstRow.player_rut})` : '';
            conceptText = `${firstRow.type_label} - ${firstRow.player_name || 'Jugador'}${rutText}`;
        } else {
            conceptText = `Tramitación (${rows.length} Jugadores: ${namesJoined || 'Sin especificación'})`;
        }

        setData(prev => ({
            ...prev,
            amount: totalAmount,
            concept: conceptText,
            player_name: namesJoined,
            breakdown: {
                items: rows,
                arfa_cost: totalArfaCost,
                afc_margin: totalAfcMargin,
            },
        }));
    };

    // Printable Voucher Modal State
    const [selectedVoucher, setSelectedVoucher] = useState<TransactionVoucher | null>(null);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    // Auto-open printable voucher if created
    useEffect(() => {
        if (flash?.created_transaction) {
            setSelectedVoucher(flash.created_transaction);
            setIsVoucherModalOpen(true);
        }
    }, [flash?.created_transaction]);

    // Inertia Form Hook
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'income' as 'income' | 'expense',
        category: 'tributo',
        club_id: '',
        amount: '' as string | number,
        concept: '',
        period_month: `${currentMonthName} ${currentYear}`,
        player_name: '',
        payment_method: 'efectivo',
        reference_number: '',
        receipt_image: null as File | null,
        date: todayStr,
        notes: '',
        breakdown: null as any,
    });

    const openFormModal = (
        type: 'tributo' | 'fondo_solidario' | 'inscripcion' | 'inscripcion_campeonato' | 'pase' | 'apelacion' | 'multa' | 'egreso' | 'otro_ingreso',
        presetClubId?: number | string
    ) => {
        reset();
        setActiveModal(type);
        setPassCategory('interno');
        setInscriptionType('adulto');
        setChampionshipName('Campeonato Apertura 2026');
        setOriginClubName('');

        const targetClubId = presetClubId ? String(presetClubId) : (clubs.length > 0 ? String(clubs[0].id) : '');
        const targetPeriod = tributePeriod || `${currentMonthName} ${currentYear}`;

        if (type === 'tributo') {
            setData({
                type: 'income',
                category: 'tributo',
                club_id: targetClubId,
                amount: totalTributoCalc,
                concept: `Pago Tributo Mensual Club ($${rateTributo.toLocaleString('es-CL')}) + Aporte Selección ($${rateSeleccion.toLocaleString('es-CL')})`,
                period_month: targetPeriod,
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: { tributo_club: rateTributo, aporte_seleccion: rateSeleccion },
            });
        } else if (type === 'fondo_solidario') {
            const initialSolRow = {
                id: Math.random().toString(36).substring(2, 9),
                description: 'Aporte a Fondo Solidario Clubes AFC',
                amount: '',
            };
            setSolidarityRows([initialSolRow]);
            setData({
                type: 'income',
                category: 'fondo_solidario',
                club_id: targetClubId,
                amount: 0,
                concept: initialSolRow.description,
                period_month: targetPeriod,
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: { items: [{ type_label: 'Aporte Fondo Solidario', player_name: initialSolRow.description, amount: 0 }] },
            });
        } else if (type === 'inscripcion') {
            const initialRow = {
                id: Math.random().toString(36).substring(2, 9),
                code: '1',
                type_label: arfaCodesMap['1'].label,
                player_name: '',
                player_rut: '',
                amount: arfaCodesMap['1'].amount,
                arfa_cost: arfaCodesMap['1'].arfa_cost,
                afc_margin: arfaCodesMap['1'].afc_margin,
            };
            setPlayerRows([initialRow]);
            setData({
                type: 'income',
                category: 'inscripcion',
                club_id: targetClubId,
                amount: initialRow.amount,
                concept: `${initialRow.type_label} - Jugador`,
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: { items: [initialRow], arfa_cost: 0, afc_margin: initialRow.amount },
            });
        } else if (type === 'inscripcion_campeonato') {
            setData({
                type: 'income',
                category: 'inscripcion_campeonato',
                club_id: targetClubId,
                amount: 100000,
                concept: 'Inscripción de Campeonato - Campeonato Apertura 2026',
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: null,
            });
        } else if (type === 'pase') {
            const initialRow = {
                id: Math.random().toString(36).substring(2, 9),
                code: '4',
                type_label: arfaCodesMap['4'].label,
                player_name: '',
                player_rut: '',
                amount: arfaCodesMap['4'].amount,
                arfa_cost: arfaCodesMap['4'].arfa_cost,
                afc_margin: arfaCodesMap['4'].afc_margin,
                origin_club: '',
            };
            setPlayerRows([initialRow]);
            setData({
                type: 'income',
                category: 'pase',
                club_id: targetClubId,
                amount: initialRow.amount,
                concept: `${initialRow.type_label} - Jugador`,
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: { items: [initialRow], arfa_cost: initialRow.arfa_cost, afc_margin: initialRow.afc_margin },
            });
        } else if (type === 'apelacion') {
            setData({
                type: 'income',
                category: 'apelacion',
                club_id: targetClubId,
                amount: rateApelacion,
                concept: 'Pago por Recurso de Apelación de Partido / Tribunal',
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: null,
            });
        } else if (type === 'multa') {
            setData({
                type: 'income',
                category: 'multa',
                club_id: targetClubId,
                amount: '',
                concept: 'Pago por Multa / Sanción Disciplinaria AFC',
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: null,
            });
        } else if (type === 'egreso') {
            setData({
                type: 'expense',
                category: 'egreso',
                club_id: '',
                amount: '',
                concept: 'Pago de Gastos de Arbitraje / Insumos / Servicios',
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: null,
            });
        } else if (type === 'otro_ingreso') {
            setOtherIncomeCategory('donacion');
            setOtherIncomeEntity('');
            setData({
                type: 'income',
                category: 'otro_ingreso',
                club_id: '',
                amount: '',
                concept: 'Donación Institucional / Aporte Voluntario',
                period_month: '',
                player_name: '',
                payment_method: 'efectivo',
                reference_number: '',
                receipt_image: null,
                date: todayStr,
                notes: '',
                breakdown: { subcategory: 'donacion', entity: '' },
            });
        }
    };

    // Handle Period change for tribute status table
    const handleTributePeriodChange = (newPeriod: string) => {
        setTributePeriod(newPeriod);
        router.get(
            route('transactions.index'),
            { search, club_id: clubIdFilter, category: categoryFilter, type: typeFilter, tribute_period: newPeriod },
            { preserveState: true }
        );
    };

    // Update Inscription type
    const handleInscriptionTypeChange = (type: 'adulto' | 'infantil' | 'femenina') => {
        setInscriptionType(type);
        const labels: Record<string, string> = {
            adulto: 'Inscripción Adulto Jugador',
            infantil: 'Inscripción Infantil Jugador',
            femenina: 'Inscripción Femenina Jugadora',
        };

        const currentConcept = `${labels[type]} - ${data.player_name || 'Jugador'}`;

        setData({
            ...data,
            amount: rateInscripcionTotal,
            concept: currentConcept,
            breakdown: {
                tipo_inscripcion: labels[type],
                arfa_cost: 0,
                afc_margin: rateInscripcionTotal,
            },
        });
    };

    // Update Pass breakdown dynamically
    const handlePassCategoryChange = (cat: 'interno' | 'regional' | 'externo' | 'femenino') => {
        setPassCategory(cat);
        const isFem = cat === 'femenino';
        const tot = isFem ? ratePaseFemeninoTotal : ratePaseEstandarTotal;
        const arfa = isFem ? ratePaseFemeninoArfa : ratePaseEstandarArfa;
        const afc = tot - arfa;

        const labels: Record<string, string> = {
            interno: 'Pase Interno Jugador',
            regional: 'Pase Regional Jugador',
            externo: 'Pase Externo Jugador',
            femenino: 'Pase Femenino Jugadora',
        };

        const currentConcept = `${labels[cat]} - ${data.player_name || 'Jugador'}`;

        setData({
            ...data,
            amount: tot,
            concept: currentConcept,
            breakdown: {
                tipo_pase: labels[cat],
                arfa_cost: arfa,
                afc_margin: afc,
                origin_club: originClubName,
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('transactions.index'),
            { search, club_id: clubIdFilter, category: categoryFilter, type: typeFilter, tribute_period: tributePeriod, per_page: perPageFilter },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setClubIdFilter('');
        setCategoryFilter('');
        setTypeFilter('');
        setPerPageFilter(10);
        router.get(route('transactions.index'), { per_page: 10 });
    };

    const handleSubmitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('transactions.store'), {
            forceFormData: true,
            onSuccess: () => {
                setActiveModal(null);
            },
        });
    };

    const handleDelete = (tx: TransactionVoucher) => {
        setDeletingTx(tx);
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Caja & Tesorería AFC
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            Gestión financiera simplificada, cobros rápidos y emisión de comprobantes foliados multi-año
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('settings.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                            ⚙️ Configurar Tarifas
                        </Link>
                        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs">
                            Próximo Folio: <span className="text-emerald-400 font-mono font-black">{metrics.next_folio}</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Tesorería y Caja - Gestión Financiera AFC" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 space-y-6 sm:px-6 lg:px-8">
                    
                    {/* Top KPI Metrics Bar */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Ingresos</span>
                                <h4 className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">
                                    ${Math.round(metrics.total_income).toLocaleString('es-CL')}
                                </h4>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                                📈
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Egresos</span>
                                <h4 className="text-2xl font-black text-rose-600 tracking-tight mt-0.5">
                                    ${Math.round(metrics.total_expense).toLocaleString('es-CL')}
                                </h4>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold">
                                📉
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Saldo Disponible en Caja</span>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                                    ${Math.round(metrics.balance).toLocaleString('es-CL')}
                                </h4>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold">
                                💰
                            </span>
                        </div>
                    </div>

                    {/* Navigation Tabs Bar */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-2xl border shadow-2xs">
                        <div className="flex gap-2 py-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('historial')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                                    activeTab === 'historial'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span>💳 Registrar & Historial de Movimientos</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('tributos')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                                    activeTab === 'tributos'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span>📊 Control de Tributos por Club (Días Hábiles)</span>
                                {tribute_status && tribute_status.summary.overdue_count > 0 && (
                                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                                        {tribute_status.summary.overdue_count} Morosos
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: REGISTRAR & HISTORIAL */}
                    {activeTab === 'historial' && (
                        <div className="space-y-6">
                            {/* Quick Action Buttons Toolbar */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                                    Registrar Nuevo Comprobante / Trámite Rápido
                                </h3>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                                    <button
                                        type="button"
                                        onClick={() => openFormModal('tributo')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center transition hover:bg-emerald-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">🏛️</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Tributo</span>
                                        <span className="text-[10px] font-bold text-emerald-700 group-hover:text-emerald-100">${totalTributoCalc.toLocaleString('es-CL')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('fondo_solidario')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-center transition hover:bg-blue-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">🤝</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Fondo Solidario</span>
                                        <span className="text-[10px] font-bold text-blue-700 group-hover:text-blue-100">Variable</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('pase')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-center transition hover:bg-teal-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">⚽</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Pase / Trámite Jugador</span>
                                        <span className="text-[10px] font-bold text-teal-700 group-hover:text-teal-100">Códigos 1 al 7</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('inscripcion_campeonato')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-center transition hover:bg-purple-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">🏆</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Insc. Campeonato</span>
                                        <span className="text-[10px] font-bold text-purple-700 group-hover:text-purple-100">Variable</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('apelacion')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-center transition hover:bg-indigo-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">⚖️</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Apelación</span>
                                        <span className="text-[10px] font-bold text-indigo-700 group-hover:text-indigo-100">${rateApelacion.toLocaleString('es-CL')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('multa')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center transition hover:bg-amber-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">🚨</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Multa</span>
                                        <span className="text-[10px] font-bold text-amber-700 group-hover:text-amber-100">Variable</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('egreso')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center transition hover:bg-rose-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">💸</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Salida Caja</span>
                                        <span className="text-[10px] font-bold text-rose-700 group-hover:text-rose-100">Egreso</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openFormModal('otro_ingreso')}
                                        className="flex flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-center transition hover:bg-indigo-600 hover:text-white group"
                                    >
                                        <span className="text-xl mb-1">💎</span>
                                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white">Otros Ingresos</span>
                                        <span className="text-[10px] font-bold text-indigo-700 group-hover:text-indigo-100">Donación/Proyectos</span>
                                    </button>
                                </div>
                            </div>

                            {/* Filters & Search */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                                <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Buscar por N° Folio, concepto, jugador o comprobante..."
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            🔍
                                        </div>
                                    </div>

                                    <select
                                        value={clubIdFilter}
                                        onChange={(e) => setClubIdFilter(e.target.value)}
                                        className="rounded-xl border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700"
                                    >
                                        <option value="">Todos los Clubes</option>
                                        <option value="afc">🏛️ Arcas Directas (Asociación AFC)</option>
                                        {clubs.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="rounded-xl border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700"
                                    >
                                        <option value="">Todas las Categorías</option>
                                        <option value="tributo">Tributos Mensuales</option>
                                        <option value="fondo_solidario">Fondo Solidario</option>
                                        <option value="inscripcion">Inscripciones Jugadores</option>
                                        <option value="inscripcion_campeonato">Inscripción Campeonato</option>
                                        <option value="pase">Pases</option>
                                        <option value="apelacion">Apelaciones</option>
                                        <option value="multa">Multas</option>
                                        <option value="otro_ingreso">Otros Ingresos (Donaciones, Proyectos, etc.)</option>
                                        <option value="egreso">Egresos / Salidas de Caja</option>
                                    </select>

                                    <select
                                        value={perPageFilter}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPerPageFilter(val);
                                            router.get(
                                                route('transactions.index'),
                                                { search, club_id: clubIdFilter, category: categoryFilter, type: typeFilter, tribute_period: tributePeriod, per_page: val },
                                                { preserveState: true }
                                            );
                                        }}
                                        className="rounded-xl border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-700"
                                    >
                                        <option value="10">📄 10 por pág.</option>
                                        <option value="25">📄 25 por pág.</option>
                                        <option value="50">📄 50 por pág.</option>
                                        <option value="100">📄 100 por pág.</option>
                                    </select>

                                    <div className="flex gap-2">
                                        <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                                            Filtrar
                                        </button>
                                        {(search || clubIdFilter || categoryFilter || String(perPageFilter) !== '10') && (
                                            <button type="button" onClick={handleResetFilters} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Transactions Table */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                                {transactions.data.length > 0 ? (
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                        <th className="py-3 px-5">N° Folio</th>
                                                        <th className="py-3 px-4">Fecha</th>
                                                        <th className="py-3 px-4">Club / Destino</th>
                                                        <th className="py-3 px-4">Concepto / Observación</th>
                                                        <th className="py-3 px-4">Categoría</th>
                                                        <th className="py-3 px-4 text-right">Monto (CLP)</th>
                                                        <th className="py-3 px-5 text-right">Comprobante</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium">
                                                    {transactions.data.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="py-3.5 px-5 font-mono font-black text-emerald-700">
                                                                {tx.folio_number}
                                                            </td>

                                                            <td className="py-3.5 px-4 text-slate-700 text-[11px] font-bold">
                                                                📅 {formatDateChile(tx.date)}
                                                            </td>

                                                            <td className="py-3.5 px-4 font-bold text-slate-800">
                                                                {tx.club ? tx.club.name : '— General —'}
                                                            </td>

                                                            <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                                                                <p className="font-semibold text-xs truncate">{tx.concept}</p>
                                                                {tx.notes && (
                                                                    <p className="text-[10px] font-semibold text-slate-500 italic mt-0.5 truncate">
                                                                        Obs: {tx.notes}
                                                                    </p>
                                                                )}
                                                                {tx.player_name && (
                                                                    <span className="block text-[10px] font-semibold text-emerald-600">
                                                                        Jugador: {tx.player_name}
                                                                    </span>
                                                                )}
                                                                {tx.receipt_image_url && (
                                                                    <a
                                                                        href={tx.receipt_image_url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline mt-0.5"
                                                                    >
                                                                        <span>📄 Boleta Adjunta</span>
                                                                    </a>
                                                                )}
                                                            </td>

                                                            <td className="py-3.5 px-4">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                                                    categoryBadges[tx.category]?.class || 'bg-slate-100 text-slate-600 border-slate-200'
                                                                }`}>
                                                                    {categoryBadges[tx.category]?.label || tx.category}
                                                                </span>
                                                            </td>

                                                            <td className={`py-3.5 px-4 text-right font-black ${
                                                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                                            }`}>
                                                                {tx.type === 'income' ? '+' : '-'}${Math.round(Number(tx.amount)).toLocaleString('es-CL')}
                                                            </td>

                                                            <td className="py-3.5 px-5 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <a
                                                                        href={route('transactions.pdf', tx.id)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
                                                                        title="Abrir / Imprimir Comprobante PDF"
                                                                    >
                                                                        <span>🖨️ Imprimir PDF</span>
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(tx)}
                                                                        className="rounded-xl p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                                        title="Anular Comprobante"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Navigation Bar */}
                                        {transactions.links && transactions.links.length > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 rounded-b-2xl">
                                                <div className="text-xs font-semibold text-slate-500">
                                                    Mostrando <span className="font-bold text-slate-900">{transactions.from || 0}</span> a <span className="font-bold text-slate-900">{transactions.to || 0}</span> de <span className="font-bold text-slate-900">{transactions.total || 0}</span> comprobantes registrados
                                                </div>

                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {transactions.links.map((link, idx) => {
                                                        const cleanLabel = link.label
                                                            .replace('&laquo; Previous', '« Anterior')
                                                            .replace('Previous &laquo;', '« Anterior')
                                                            .replace('pagination.previous', '« Anterior')
                                                            .replace('Next &raquo;', 'Siguiente »')
                                                            .replace('&raquo; Next', 'Siguiente »')
                                                            .replace('pagination.next', 'Siguiente »');

                                                        if (!link.url) {
                                                            return (
                                                                <span
                                                                    key={idx}
                                                                    className="px-3 py-1.5 text-xs font-bold text-slate-400 rounded-xl bg-slate-100 opacity-60 cursor-not-allowed border border-slate-200/50"
                                                                    dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                                                />
                                                            );
                                                        }

                                                        return (
                                                            <a
                                                                key={idx}
                                                                href={link.url}
                                                                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                                                                    link.active
                                                                        ? 'bg-slate-900 text-white shadow-xs'
                                                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                                                }`}
                                                                dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <p className="text-base font-bold text-slate-700">No hay transacciones registradas</p>
                                        <p className="text-xs text-slate-500 mt-1">Haz clic en los botones superiores para registrar tu primer pago.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CONTROL DE TRIBUTOS POR CLUB (MULTI-AÑO & DÍAS HÁBILES) */}
                    {activeTab === 'tributos' && tribute_status && (
                        <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-2xs space-y-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Estado de Cumplimiento de Tributos Mensuales
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500">
                                        Límite en <span className="font-bold text-slate-800">Días Hábiles</span>: {tribute_status.due_date_formatted}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Multi-Year & Month Dynamic Controls */}
                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                        <span className="text-xs font-bold text-slate-500 pl-2">Temporada:</span>
                                        <select
                                            value={tributePeriod.split(' ')[0] || currentMonthName}
                                            onChange={(e) => {
                                                const yearPart = tributePeriod.split(' ')[1] || String(currentYear);
                                                handleTributePeriodChange(`${e.target.value} ${yearPart}`);
                                            }}
                                            className="rounded-lg border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-800"
                                        >
                                            {availableMonths.map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={tributePeriod.split(' ')[1] || String(currentYear)}
                                            onChange={(e) => {
                                                const monthPart = tributePeriod.split(' ')[0] || currentMonthName;
                                                handleTributePeriodChange(`${monthPart} ${e.target.value}`);
                                            }}
                                            className="rounded-lg border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-emerald-700"
                                        >
                                            {availableYears.map((y) => (
                                                <option key={y} value={y}>
                                                    Año {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-1.5 text-xs font-bold">
                                        <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-emerald-700 border border-emerald-200">
                                            🟢 {tribute_status.summary.paid_count} Al Día
                                        </span>
                                        <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-rose-700 border border-rose-200">
                                            🔴 {tribute_status.summary.overdue_count} Vencidos
                                        </span>
                                        <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-blue-700 border border-blue-200">
                                            🔵 {tribute_status.summary.pending_count} En Plazo
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tribute Status Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                            <th className="py-3 px-4">Club Deportivo</th>
                                            <th className="py-3 px-4">Período / Temporada</th>
                                            <th className="py-3 px-4">Límite Día Hábil</th>
                                            <th className="py-3 px-4">Estado</th>
                                            <th className="py-3 px-4">Fecha de Pago</th>
                                            <th className="py-3 px-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {tribute_status.clubs.map((c) => (
                                            <tr key={c.club_id} className="hover:bg-slate-50/80">
                                                <td className="py-3 px-4 font-extrabold text-slate-900">
                                                    {c.club_name}
                                                </td>

                                                <td className="py-3 px-4 text-slate-700 font-bold">
                                                    📅 {tribute_status.period_month}
                                                </td>

                                                <td className="py-3 px-4 text-slate-500 font-medium">
                                                    📌 {c.due_date}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                            c.status === 'paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : c.status === 'overdue'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}
                                                    >
                                                        {c.badge}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                                    {c.payment_date ? (
                                                        <span className="text-emerald-600">
                                                            {formatDateChile(c.payment_date)} ({c.folio_number})
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">— Sin registro —</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 text-right">
                                                    {c.status !== 'paid' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openFormModal('tributo', c.club_id)}
                                                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-2xs ${
                                                                c.status === 'overdue'
                                                                    ? 'bg-rose-600 hover:bg-rose-500'
                                                                    : 'bg-emerald-600 hover:bg-emerald-500'
                                                            }`}
                                                        >
                                                            💳 Cobrar Tributo AHORA
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-bold text-emerald-600">
                                                            ✅ Cumplido
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Alert Modal for Deleting Transactions */}
            {deletingTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-rose-100 space-y-4">
                        <div className="flex items-center gap-3.5 border-b border-rose-100 pb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl font-bold shrink-0">
                                🚨
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    ¿Anular Comprobante {deletingTx.folio_number}?
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Confirmación de eliminación de registro
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200 text-xs text-rose-900 space-y-2">
                            <p className="font-bold">
                                Estás a punto de anular el siguiente comprobante oficial:
                            </p>
                            <div className="bg-white p-3 rounded-xl border border-rose-200 text-slate-800 space-y-1 font-mono text-xs">
                                <p><strong>Folio:</strong> {deletingTx.folio_number}</p>
                                <p><strong>Concepto:</strong> {deletingTx.concept}</p>
                                <p><strong>Monto:</strong> ${Math.round(Number(deletingTx.amount)).toLocaleString('es-CL')} CLP</p>
                                {deletingTx.club && <p><strong>Club:</strong> {deletingTx.club.name}</p>}
                            </div>
                            <p className="font-semibold text-[11px] text-rose-700">
                                ⚠️ Esta acción anulará el registro de las arcas y recalculará los saldos disponibles. Esta operación no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingTx(null)}
                                className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const targetId = deletingTx.id;
                                    setDeletingTx(null);
                                    router.delete(route('transactions.destroy', targetId));
                                }}
                                className="rounded-xl px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
                            >
                                <span>🚨</span>
                                <span>Sí, Anular y Eliminar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Action Modal Forms */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                                    Correlativo Folio: {metrics.next_folio}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-900">
                                    {activeModal === 'tributo' && '🏛️ Cobro de Tributo Mensual'}
                                    {activeModal === 'fondo_solidario' && '🤝 Aporte a Fondo Solidario'}
                                    {activeModal === 'inscripcion_campeonato' && '🏆 Inscripción de Campeonato (Monto Variable)'}
                                    {activeModal === 'pase' && '⚽ Cobro de Pase / Trámite Jugador'}
                                    {activeModal === 'apelacion' && '⚖️ Cobro de Apelación'}
                                    {activeModal === 'multa' && '🚨 Cobro de Multa (Monto Variable)'}
                                    {activeModal === 'egreso' && '💸 Registrar Salida de Caja / Egreso'}
                                    {activeModal === 'otro_ingreso' && '➕ Registrar Otro Ingreso'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTransaction} className="space-y-4" encType="multipart/form-data">
                            {/* Date Picker & Club Selector */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        FECHA DE PAGO *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                        required
                                    />
                                </div>

                                {activeModal === 'otro_ingreso' || activeModal === 'egreso' ? (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            {activeModal === 'otro_ingreso' ? 'CLUB / DESTINO' : 'IMPUTACIÓN EGRESO'}
                                        </label>
                                        <select
                                            value={data.club_id}
                                            onChange={(e) => setData('club_id', e.target.value)}
                                            className="w-full rounded-xl border-indigo-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                        >
                                            <option value="">
                                                {activeModal === 'otro_ingreso'
                                                    ? 'Arcas Directas de la Asociación (AFC)'
                                                    : 'Gastos Generales de la Asociación (AFC)'}
                                            </option>
                                            {clubs.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            {activeModal === 'pase' ? 'CLUB COMPRADOR *' : 'CLUB *'}
                                        </label>
                                        <select
                                            value={data.club_id}
                                            onChange={(e) => setData('club_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 font-bold shadow-2xs"
                                            required
                                        >
                                            <option value="">-- Seleccionar Club --</option>
                                            {clubs.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Form Block for Inscripción Campeonato */}
                            {activeModal === 'inscripcion_campeonato' && (
                                <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-100 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1">
                                            CAMPEONATO / TORNEO *
                                        </label>
                                        <input
                                            type="text"
                                            value={championshipName}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setChampionshipName(val);
                                                setData('concept', `Inscripción de Campeonato - ${val}`);
                                            }}
                                            placeholder="Ej. Campeonato Apertura Serie Honor 2026"
                                            className="w-full rounded-xl border-purple-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1">
                                            MONTO ($ CLP) *
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="Ej. 100000"
                                            className="w-full rounded-xl border-purple-200 bg-white px-3.5 py-2 text-sm font-black text-slate-900"
                                            required
                                        />
                                        <p className="mt-1 text-xs font-semibold text-purple-700">
                                            Monto libre según bases del torneo. Formateado: ${Math.round(Number(data.amount || 0)).toLocaleString('es-CL')} CLP
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Form Block for Otros Ingresos (Donaciones, Proyectos, Finales, Auspicios) */}
                            {activeModal === 'otro_ingreso' && (
                                <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-200 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Classification Dropdown */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                                                TIPO DE INGRESO *
                                            </label>
                                            <select
                                                value={otherIncomeCategory}
                                                onChange={(e) => {
                                                    const val = e.target.value as any;
                                                    setOtherIncomeCategory(val);
                                                    const foundObj = (other_income_categories.length > 0 ? other_income_categories : defaultOtherIncomeCategories).find((c: any) => c.id === val);
                                                    const defaultConcept = foundObj ? foundObj.label : 'Ingreso Diversos AFC';
                                                    setData(prev => ({
                                                        ...prev,
                                                        concept: defaultConcept,
                                                        breakdown: { ...(prev.breakdown || {}), subcategory: val },
                                                    }));
                                                }}
                                                className="w-full rounded-xl border-indigo-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                                required
                                            >
                                                {(other_income_categories.length > 0 ? other_income_categories : defaultOtherIncomeCategories).map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Entity / Contributor Name */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                                                OTORGANTE / ENTIDAD *
                                            </label>
                                            <input
                                                type="text"
                                                value={otherIncomeEntity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setOtherIncomeEntity(val);
                                                    setData(prev => ({
                                                        ...prev,
                                                        player_name: val,
                                                        breakdown: { ...(prev.breakdown || {}), entity: val },
                                                    }));
                                                }}
                                                placeholder="Ej. Ilustre Municipalidad / Empresa Sponsor / Persona"
                                                className="w-full rounded-xl border-indigo-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Concept Detail */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                                            CONCEPTO DE INGRESO *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.concept}
                                            onChange={(e) => setData('concept', e.target.value)}
                                            placeholder="Ej. Subvención Municipal Deporte 2026 / Bordereaux Final Honor"
                                            className="w-full rounded-xl border-indigo-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                            required
                                        />
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-1">
                                            MONTO ($ CLP) *
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="Ej. 500000"
                                            className="w-full rounded-xl border-indigo-200 bg-white px-3.5 py-2 text-base font-black text-slate-900 shadow-2xs"
                                            required
                                        />
                                        <p className="mt-1 text-xs font-semibold text-indigo-700">
                                            Formateado: ${Math.round(Number(data.amount || 0)).toLocaleString('es-CL')} CLP
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Form Block for Egresos / Salidas de Caja (Viáticos, Compras, Servicios) */}
                            {activeModal === 'egreso' && (
                                <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-rose-950 mb-1">
                                                TIPO DE EGRESO *
                                            </label>
                                            <select
                                                value={expenseType}
                                                onChange={(e) => {
                                                    const val = e.target.value as any;
                                                    setExpenseType(val);
                                                    const foundObj = (expense_categories.length > 0 ? expense_categories : defaultExpenseCategories).find((c: any) => c.id === val);
                                                    const defaultConcept = foundObj ? foundObj.label : 'Egreso General AFC';
                                                    setData(prev => ({
                                                        ...prev,
                                                        concept: defaultConcept,
                                                        breakdown: { ...(prev.breakdown || {}), expense_type: val },
                                                    }));
                                                }}
                                                className="w-full rounded-xl border-rose-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                                required
                                            >
                                                {(expense_categories.length > 0 ? expense_categories : defaultExpenseCategories).map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-rose-950 mb-1">
                                                MONTO ($ CLP) *
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                placeholder="Ej. 25000"
                                                className="w-full rounded-xl border-rose-200 bg-white px-3.5 py-2 text-base font-black text-slate-900 shadow-2xs"
                                                required
                                            />
                                            <p className="mt-1 text-xs font-semibold text-rose-700">
                                                Formateado: ${Math.round(Number(data.amount || 0)).toLocaleString('es-CL')} CLP
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-rose-950 mb-1">
                                            CONCEPTO / MOTIVO DE EGRESO *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.concept}
                                            onChange={(e) => setData('concept', e.target.value)}
                                            placeholder="Ej. Viático de arbitraje Fecha 4 / Viático delegados torneo"
                                            className="w-full rounded-xl border-rose-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs"
                                            required
                                        />
                                    </div>

                                    {expenseType === 'viatico' && (
                                        <div className="rounded-xl bg-white p-3 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
                                            <span>ℹ️</span>
                                            <span>
                                                Para <strong>Viáticos</strong> no es obligatorio adjuntar foto de boleta. El sistema emitirá automáticamente el <strong>Comprobante Oficial en PDF</strong> con número de Folio y firma de Tesorería.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Multi-Item Builder for Fondo Solidario */}
                            {activeModal === 'fondo_solidario' && (
                                <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-200 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                                                <span>🤝</span>
                                                <span>Lista de Aportes al Fondo Solidario ({solidarityRows.length})</span>
                                            </h4>
                                            <p className="text-[11px] font-medium text-blue-700">
                                                Puedes ingresar 1 o más aportes con montos independientes en este comprobante
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newRow = {
                                                    id: Math.random().toString(36).substring(2, 9),
                                                    description: '',
                                                    amount: '',
                                                };
                                                syncSolidarityRowsToForm([...solidarityRows, newRow]);
                                            }}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-blue-800 transition whitespace-nowrap shrink-0 border border-blue-800 cursor-pointer"
                                        >
                                            <span className="text-sm font-black">+</span>
                                            <span>Agregar Otro Aporte</span>
                                        </button>
                                    </div>

                                    {/* List of Solidarity Rows */}
                                    <div className="space-y-3">
                                        {solidarityRows.map((row, index) => (
                                            <div key={row.id} className="rounded-xl bg-white p-3.5 border border-blue-200 shadow-2xs space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 border-b border-blue-50 pb-1.5">
                                                    <span>Aporte N° {index + 1}</span>
                                                    {solidarityRows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = solidarityRows.filter(r => r.id !== row.id);
                                                                syncSolidarityRowsToForm(updated);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 font-extrabold text-xs"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                                            Motivo / Detalle del Aporte *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={row.description}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = solidarityRows.map(r => r.id === row.id ? { ...r, description: val } : r);
                                                                syncSolidarityRowsToForm(updated);
                                                            }}
                                                            placeholder="Ej. Aporte por Emergencia Salud Jugador"
                                                            className="w-full rounded-lg border-blue-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                                            Monto ($ CLP) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={row.amount}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = solidarityRows.map(r => r.id === row.id ? { ...r, amount: val } : r);
                                                                syncSolidarityRowsToForm(updated);
                                                            }}
                                                            placeholder="Ej. 25000"
                                                            className="w-full rounded-lg border-blue-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-900"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Box for Fondo Solidario */}
                                    <div className="rounded-xl bg-white p-3.5 border border-blue-200 text-right flex items-center justify-between">
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                            Total Aporte Fondo Solidario
                                        </p>
                                        <p className="text-xl font-black text-blue-950 font-mono">
                                            ${Math.round(Number(data.amount || 0)).toLocaleString('es-CL')} CLP
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Player / Multi-Item Builder for Inscripciones and Pases */}
                            {(activeModal === 'pase' || activeModal === 'inscripcion') && (
                                <div className="rounded-2xl bg-teal-50/70 p-4 border border-teal-200 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
                                                <span>👥</span>
                                                <span>Lista de Jugadores en el Comprobante ({playerRows.length})</span>
                                            </h4>
                                            <p className="text-[11px] font-medium text-teal-700">
                                                Puedes registrar 1 o más jugadores en este mismo recibo oficial
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const defaultCode = activeModal === 'pase' ? '4' : '1';
                                                const info = arfaCodesMap[defaultCode];
                                                const newRow = {
                                                    id: Math.random().toString(36).substring(2, 9),
                                                    code: defaultCode,
                                                    type_label: info.label,
                                                    player_name: '',
                                                    player_rut: '',
                                                    amount: info.amount,
                                                    arfa_cost: info.arfa_cost,
                                                    afc_margin: info.afc_margin,
                                                    origin_club: '',
                                                };
                                                syncPlayerRowsToForm([...playerRows, newRow]);
                                            }}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-teal-900 transition whitespace-nowrap shrink-0 border border-teal-900 cursor-pointer"
                                        >
                                            <span className="text-sm font-black">+</span>
                                            <span>Agregar Otro Jugador</span>
                                        </button>
                                    </div>

                                    {/* List of Player Rows */}
                                    <div className="space-y-3">
                                        {playerRows.map((row, index) => (
                                            <div key={row.id} className="rounded-xl bg-white p-3.5 border border-teal-200 shadow-2xs space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 border-b border-teal-50 pb-1.5">
                                                    <span>Jugador N° {index + 1}</span>
                                                    {playerRows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = playerRows.filter(r => r.id !== row.id);
                                                                syncPlayerRowsToForm(updated);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 font-extrabold text-xs"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                    {/* Select Code */}
                                                    <div>
                                                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                                            Código & Tipo de Trámite *
                                                        </label>
                                                        <select
                                                            value={row.code}
                                                            onChange={(e) => {
                                                                const code = e.target.value;
                                                                const info = arfaCodesMap[code] || arfaCodesMap['4'];
                                                                const updated = playerRows.map(r => r.id === row.id ? {
                                                                    ...r,
                                                                    code,
                                                                    type_label: info.label,
                                                                    amount: info.amount,
                                                                    arfa_cost: info.arfa_cost,
                                                                    afc_margin: info.afc_margin,
                                                                } : r);
                                                                syncPlayerRowsToForm(updated);
                                                            }}
                                                            className="w-full rounded-lg border-teal-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                                        >
                                                                <option value="1">Código 1: Inscripción Adulto (${rateInscripcionTotal.toLocaleString('es-CL')})</option>
                                                                <option value="2">Código 2: Inscripción Infantil (${rateInscripcionTotal.toLocaleString('es-CL')})</option>
                                                                <option value="3">Código 3: Inscripción Femenina (${rateInscripcionTotal.toLocaleString('es-CL')})</option>
                                                                <option value="4">Código 4: Pase Interno (${ratePaseEstandarTotal.toLocaleString('es-CL')})</option>
                                                                <option value="5">Código 5: Pase Regional (${ratePaseEstandarTotal.toLocaleString('es-CL')})</option>
                                                                <option value="6">Código 6: Pase Externo (${ratePaseEstandarTotal.toLocaleString('es-CL')})</option>
                                                                <option value="7">Código 7: Pase Femenino (${ratePaseFemeninoTotal.toLocaleString('es-CL')})</option>
                                                            </select>
                                                    </div>

                                                    {/* RUT Input */}
                                                    <div>
                                                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                                            RUT Jugador(a) *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={row.player_rut}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = playerRows.map(r => r.id === row.id ? { ...r, player_rut: val } : r);
                                                                syncPlayerRowsToForm(updated);
                                                            }}
                                                            placeholder="Ej. 20.082.170-K"
                                                            className="w-full rounded-lg border-teal-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                                        />
                                                    </div>

                                                    {/* Name Input */}
                                                    <div>
                                                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                                            Nombre Jugador(a) *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={row.player_name}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const updated = playerRows.map(r => r.id === row.id ? { ...r, player_name: val } : r);
                                                                syncPlayerRowsToForm(updated);
                                                            }}
                                                            placeholder="Ej. Alfredo Riesco"
                                                            className="w-full rounded-lg border-teal-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Clean Total Box */}
                                    <div className="rounded-xl bg-white p-3.5 border border-teal-200 text-right flex items-center justify-between">
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                            Total Cancelado por el Club
                                        </p>
                                        <p className="text-xl font-black text-teal-950 font-mono">
                                            ${Math.round(Number(data.amount || 0)).toLocaleString('es-CL')} CLP
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Special Period Month & Year Selector for Tributo & Fondo Solidario */}
                            {(activeModal === 'tributo' || activeModal === 'fondo_solidario') && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Período / Mes Correspondiente
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={formMonth}
                                                onChange={(e) => {
                                                    const m = e.target.value;
                                                    setFormMonth(m);
                                                    setData('period_month', `${m} ${formYear}`);
                                                }}
                                                className="w-2/3 rounded-xl border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-900 font-bold"
                                            >
                                                {availableMonths.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={formYear}
                                                onChange={(e) => {
                                                    const y = Number(e.target.value);
                                                    setFormYear(y);
                                                    setData('period_month', `${formMonth} ${y}`);
                                                }}
                                                className="w-1/3 rounded-xl border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-900 font-black"
                                            >
                                                {availableYears.map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            {activeModal === 'tributo' ? 'Total Tributo Auto-Calculado' : 'Modalidad Fondo'}
                                        </label>
                                        <div className={`rounded-xl px-4 py-2.5 text-sm font-black border ${
                                            activeModal === 'tributo'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 text-base'
                                                : 'bg-blue-50 border-blue-200 text-blue-700'
                                        }`}>
                                            {activeModal === 'tributo'
                                                ? `$${totalTributoCalc.toLocaleString('es-CL')} CLP`
                                                : 'Monto Variable Libre'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Amount Field (For non-tributo, non-pase, non-inscripcion, non-inscripcion_campeonato, non-otro_ingreso, non-egreso payments) */}
                            {activeModal !== 'tributo' && activeModal !== 'pase' && activeModal !== 'inscripcion' && activeModal !== 'inscripcion_campeonato' && activeModal !== 'otro_ingreso' && activeModal !== 'egreso' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Monto Cancelado ($ CLP) *
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder={
                                            activeModal === 'fondo_solidario'
                                                ? 'Ej. 5000'
                                                : activeModal === 'multa'
                                                ? 'Ej. 20000'
                                                : '15000'
                                        }
                                        className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900"
                                        required
                                    />
                                    {data.amount && (
                                        <p className="mt-1 text-xs font-bold text-emerald-600">
                                            Monto en miles: ${Math.round(Number(data.amount)).toLocaleString('es-CL')} CLP
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Generic Concept Field only for modals without card concept or auto-generated concept */}
                            {activeModal !== 'otro_ingreso' && activeModal !== 'inscripcion_campeonato' && activeModal !== 'egreso' && activeModal !== 'pase' && activeModal !== 'tributo' && activeModal !== 'inscripcion' && activeModal !== 'fondo_solidario' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        DETALLE / MOTIVO DEL PAGO *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.concept}
                                        onChange={(e) => setData('concept', e.target.value)}
                                        placeholder={
                                            activeModal === 'multa'
                                                ? 'Ej. Multa por acumulación de tarjetas en Fecha 5'
                                                : 'Ej. Derecho de Apelación Tribunal'
                                        }
                                        className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900"
                                        required
                                    />
                                </div>
                            )}

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    FORMA DE PAGO *
                                </label>
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value as any)}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 font-bold"
                                >
                                    <option value="efectivo">Efectivo en Caja</option>
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="deposito">Depósito Bancario</option>
                                    <option value="cheque">Cheque Al Día</option>
                                </select>
                            </div>

                            {/* Field: Observaciones */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    OBSERVACIONES (OPCIONAL)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Ej. Entregado a tesorero / Aprobado directiva / N° Documento"
                                    className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* Optional Receipt Upload for Expenses & Viáticos */}
                            {activeModal === 'egreso' && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                                        <span>📷</span>
                                        <span>RESPALDO / FOTO DE BOLETA O FACTURA (OPCIONAL)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setData('receipt_image', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-rose-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-rose-500 cursor-pointer"
                                    />
                                    {errors.receipt_image && (
                                        <p className="text-xs font-bold text-rose-600">{errors.receipt_image}</p>
                                    )}
                                    <p className="text-[11px] font-medium text-rose-600">
                                        Opcional (formatos JPG, PNG, WEBP o PDF). Siempre se emitirá el Comprobante Oficial en PDF con Folio.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {processing ? 'Emitiendo...' : 'Emitir Comprobante Foliado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Printable Voucher Modal */}
            <PrintableVoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                transaction={selectedVoucher}
                institutional={institutional}
            />
        </AuthenticatedLayout>
    );
}
