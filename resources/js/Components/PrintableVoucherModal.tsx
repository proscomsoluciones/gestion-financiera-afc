import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export interface TransactionVoucher {
    id: number;
    folio_number: string | null;
    type: 'income' | 'expense';
    category: string;
    club_id?: number | string | null;
    amount: number;
    concept: string;
    period_month?: string;
    player_name?: string;
    payment_method: string;
    reference_number?: string;
    receipt_image?: string;
    receipt_image_url?: string;
    date: string;
    notes?: string;
    breakdown?: Record<string, any>;
    club?: {
        id: number;
        name: string;
        short_name?: string;
        crest_url?: string;
    };
    user?: {
        name: string;
        email: string;
    };
}

export interface InstitutionalData {
    association_name: string;
    association_rut: string;
    association_address: string;
    treasurer_name: string;
    logo_path?: string;
    logo_url?: string;
}

interface PrintableVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionVoucher | null;
    institutional?: InstitutionalData;
}

export default function PrintableVoucherModal({
    isOpen,
    onClose,
    transaction,
    institutional,
}: PrintableVoucherModalProps) {
    if (!transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    const categoryLabels: Record<string, string> = {
        tributo: 'Pago de Tributo Mensual',
        fondo_solidario: 'Aporte a Fondo Solidario Clubes',
        inscripcion: 'Inscripción de Jugador',
        inscripcion_campeonato: 'Inscripción de Campeonato',
        pase: 'Pago de Pase / Transferencia',
        apelacion: 'Pago de Apelación',
        multa: 'Pago de Multa / Sanción',
        otro_ingreso: 'Otro Ingreso',
        egreso: 'Egreso / Salida de Caja',
    };

    const paymentMethodLabels: Record<string, string> = {
        efectivo: 'Efectivo en Caja',
        transferencia: 'Transferencia Bancaria',
        deposito: 'Depósito Bancario',
        cheque: 'Cheque Al Día',
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex min-h-full items-center justify-center text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all border border-slate-100">
                                {/* Print Actions Header */}
                                <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                            Comprobante Foliado Generado (Modo Ahorro de Tinta 🍃)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={route('transactions.pdf', transaction.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                                        >
                                            📄 Abrir PDF Oficial
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handlePrint}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                                        >
                                            🖨️ Imprimir Recibo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>

                                {/* Printable Document Area (Ink-Saving Optimized) */}
                                <div id="printable-voucher" className="p-8 space-y-6 bg-white print:p-0">
                                    {/* Document Header (Ink Saving Outline Logo & Border) */}
                                    <div className="flex items-start justify-between border-b-2 border-black pb-6">
                                        <div className="flex items-center gap-4">
                                            {institutional?.logo_url ? (
                                                <img
                                                    src={institutional.logo_url}
                                                    alt="Logo Institucional"
                                                    className="h-14 w-14 object-contain rounded-xl border-2 border-black bg-white p-1"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-white text-black font-black text-xl">
                                                    ⚽
                                                </div>
                                            )}
                                            <div>
                                                <h1 className="text-xl font-black text-black tracking-tight uppercase">
                                                    {institutional?.association_name || 'ASOCIACIÓN DE FÚTBOL CATEMU'}
                                                </h1>
                                                <p className="text-xs font-black uppercase tracking-wider text-black">
                                                    Comprobante Oficial de {transaction.type === 'income' ? 'Ingreso en Caja' : 'Egreso / Salida'}
                                                </p>
                                                <p className="text-[11px] text-slate-600 font-medium">
                                                    RUT: {institutional?.association_rut || '65.123.456-K'} • {institutional?.association_address || 'Región de Valparaíso, Chile'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="inline-block rounded-xl bg-white px-4 py-2 border-2 border-black text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black">
                                                    N° Folio Correlativo
                                                </p>
                                                <p className="text-2xl font-black tracking-tight text-black font-mono">
                                                    {transaction.folio_number}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-xs font-bold text-black">
                                                Fecha: <span>{transaction.date}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recipient & Payment Type (Eco Ink Saving Border) */}
                                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-white p-4 border border-black text-sm">
                                        <div>
                                            <p className="text-xs font-black text-black uppercase tracking-wider">
                                                {transaction.type === 'income' ? 'Club / Pagador' : 'Beneficiario / Destino'}
                                            </p>
                                            <p className="text-base font-black text-black mt-0.5">
                                                {transaction.club ? transaction.club.name : '— General / Sin Club —'}
                                            </p>
                                            {transaction.player_name && (
                                                <p className="text-xs font-bold text-black mt-1">
                                                    ⚽ Jugador: {transaction.player_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-black text-black uppercase tracking-wider">
                                                Tipo de Trámite / Categoría
                                            </p>
                                            <p className="text-sm font-black text-black mt-0.5">
                                                {categoryLabels[transaction.category] || transaction.category}
                                            </p>
                                            {transaction.period_month && (
                                                <p className="text-xs font-bold text-black mt-1">
                                                    Período: {transaction.period_month}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Concept Description */}
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-black mb-1">
                                            Concepto del Pago
                                        </p>
                                        <p className="text-sm font-bold text-black bg-white p-3 rounded-xl border border-black">
                                            {transaction.concept}
                                        </p>
                                    </div>

                                    {/* Notes / Observaciones section */}
                                    {transaction.notes && (
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-black mb-1">
                                                Observaciones / Notas Adicionales
                                            </p>
                                            <p className="text-xs font-semibold text-black bg-white p-3 rounded-xl border border-black italic">
                                                Obs: {transaction.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Multi-Player / Multi-Item Breakdown Table if present */}
                                    {Array.isArray(transaction.breakdown?.items) && transaction.breakdown.items.length > 0 && (
                                        <div className="overflow-hidden rounded-xl border border-black text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-white font-black uppercase text-black border-b border-black">
                                                    <tr>
                                                        <th className="py-2.5 px-3">N°</th>
                                                        <th className="py-2.5 px-3">Código & Trámite ARFA</th>
                                                        <th className="py-2.5 px-3">Jugador / RUT</th>
                                                        <th className="py-2.5 px-3 text-right">Monto (CLP)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 font-semibold">
                                                    {transaction.breakdown.items.map((item: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td className="py-2 px-3 text-black font-bold">{idx + 1}</td>
                                                            <td className="py-2 px-3 text-black font-bold">{item.type_label || 'Trámite ARFA'}</td>
                                                            <td className="py-2 px-3 text-black">
                                                                {item.player_name ? <strong>{item.player_name}</strong> : '—'}
                                                                {item.player_rut && <span className="block text-[10px] text-slate-600 font-bold">RUT: {item.player_rut}</span>}
                                                            </td>
                                                            <td className="py-2 px-3 text-right font-black text-black">
                                                                ${Math.round(Number(item.amount || 0)).toLocaleString('es-CL')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Detailed Breakdown Table if Tributo */}
                                    {transaction.category === 'tributo' && (
                                        <div className="overflow-hidden rounded-xl border border-black text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-white font-black uppercase text-black border-b border-black">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Ítem / Desglose Tributario</th>
                                                        <th className="py-2.5 px-3 text-right">Monto (CLP)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 font-semibold">
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Tributo Mensual Institucional Club</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">
                                                            ${Math.round(transaction.breakdown?.tributo_club ?? 30000).toLocaleString('es-CL')}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Aporte Fondo Selección</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">
                                                            ${Math.round(transaction.breakdown?.aporte_seleccion ?? 10000).toLocaleString('es-CL')}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Detailed Breakdown Table if Inscripción Jugador */}
                                    {transaction.category === 'inscripcion' && (
                                        <div className="overflow-hidden rounded-xl border border-black text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-white font-black uppercase text-black border-b border-black">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Ítem / Desglose de Inscripción</th>
                                                        <th className="py-2.5 px-3 text-right">Monto (CLP)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 font-semibold">
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Arancel Oficial ARFA V Región (Gratis)</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">$0</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Fondo / Arcas de la Asociación (100%)</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">
                                                            ${Math.round(transaction.amount).toLocaleString('es-CL')}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Detailed Breakdown Table if Pase */}
                                    {transaction.category === 'pase' && (
                                        <div className="overflow-hidden rounded-xl border border-black text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-white font-black uppercase text-black border-b border-black">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Ítem / Desglose Distribución del Pase</th>
                                                        <th className="py-2.5 px-3 text-right">Monto (CLP)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 font-semibold">
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Arancel Oficial ARFA V Región</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">
                                                            ${Math.round(transaction.breakdown?.arfa_cost ?? 17000).toLocaleString('es-CL')}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-black">Fondo / Arcas de la Asociación</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-black">
                                                            ${Math.round(transaction.breakdown?.afc_margin ?? 5000).toLocaleString('es-CL')}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Attached Receipt Image Section if Expense */}
                                    {transaction.receipt_image_url && (
                                        <div className="rounded-xl border border-black bg-white p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                                                    <span>📄</span>
                                                    <span>Boleta / Respaldo Digital Adjunto</span>
                                                </p>
                                                <a
                                                    href={transaction.receipt_image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="no-print inline-flex items-center gap-1 text-xs font-bold text-black underline"
                                                >
                                                    <span>🔍 Ver Completa</span>
                                                    <span>↗</span>
                                                </a>
                                            </div>

                                            {transaction.receipt_image_url.endsWith('.pdf') ? (
                                                <div className="p-3 bg-white rounded-xl border border-black text-xs font-bold text-black">
                                                    📎 Documento PDF Adjunto ({transaction.receipt_image_url.split('/').pop()})
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden rounded-xl border border-black bg-white max-h-48 flex justify-center items-center">
                                                    <img
                                                        src={transaction.receipt_image_url}
                                                        alt="Respaldo de Boleta"
                                                        className="max-h-48 object-contain w-auto"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Payment Method & Total Box (Eco Ink Saving Outline Box) */}
                                    <div className="flex items-center justify-between rounded-xl bg-white border-2 border-black p-5 text-black">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-black">
                                                Forma de Pago
                                            </p>
                                            <p className="text-sm font-extrabold uppercase mt-0.5 text-black">
                                                {paymentMethodLabels[transaction.payment_method] || transaction.payment_method}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-black uppercase tracking-wider text-black">
                                                Total Cancelado (CLP)
                                            </p>
                                            <p className="text-3xl font-black text-black tracking-tight">
                                                ${Math.round(Number(transaction.amount)).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Signature Lines */}
                                    <div className="pt-8 flex justify-between items-end border-t border-black text-center">
                                        <div className="w-5/12">
                                            <div className="border-b border-black mb-2 h-10" />
                                            <p className="text-xs font-black text-black">Firma Entregado / Club</p>
                                            <p className="text-[10px] text-slate-600 font-semibold">Nombre y RUT Responsable</p>
                                        </div>

                                        <div className="w-5/12">
                                            <div className="border-b border-black mb-2 h-10" />
                                            <p className="text-xs font-black text-black">Tesorería General</p>
                                            <p className="text-[10px] font-black text-black">Tesorero(a): {institutional?.treasurer_name || (transaction.user ? transaction.user.name : 'Juan Ramón Cornejo')}</p>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
