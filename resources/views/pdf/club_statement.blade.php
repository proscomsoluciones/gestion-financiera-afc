<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estado Financiero - {{ $statement['club']->name }}</title>
    <style>
        @page { margin: 30px 40px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #000; }
        .header h1 { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .header h2 { font-size: 14px; font-weight: bold; margin: 4px 0 0 0; color: #15803d; }
        .header p { font-size: 11px; margin: 3px 0 0 0; color: #555; }
        
        .summary-box { border: 1px solid #000; padding: 8px 12px; margin-bottom: 15px; background-color: #fafafa; }
        .summary-box table { width: 100%; border-collapse: collapse; }
        .summary-box td { text-align: center; font-size: 11px; font-weight: bold; }
        
        .category-summary { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .category-summary td { border: 1px solid #ddd; padding: 6px; text-align: center; background-color: #fcfcfc; }
        .category-summary .cat-title { font-size: 9px; text-transform: uppercase; color: #555; font-weight: bold; display: block; }
        .category-summary .cat-amount { font-size: 12px; font-weight: bold; color: #15803d; display: block; margin-top: 2px; }

        .section-title { background-color: #dbeafe; padding: 6px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #1e3a8a; color: #1e40af; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px; font-size: 9.5px; text-transform: uppercase; font-weight: bold; }
        .data-table td { padding: 5px 6px; border-bottom: 1px solid #eee; }
        .data-table tr:nth-child(even) { background-color: #fcfcfc; }
        .text-right { text-align: right; }
        .paid-badge { color: #15803d; font-weight: bold; }
        .overdue-badge { color: #b91c1c; font-weight: bold; }
        .pending-badge { color: #475569; font-weight: bold; }
        .total-row td { border-top: 2px solid #1e3a8a; border-bottom: 2px solid #1e3a8a; font-weight: bold; font-size: 11px; padding: 6px; background-color: #eff6ff; }
    </style>
</head>
<body>

    <!-- ENCABEZADO INSTITUCIONAL UNIFICADO AFC CON COLORES -->
    <table style="width: 100%; border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
        <tr>
            <td style="width: 60px; vertical-align: middle;">
                @if(!empty($institutional['logo_url']))
                    <img src="{{ $institutional['logo_url'] }}" style="max-width: 55px; max-height: 55px;">
                @else
                    <div style="width: 48px; height: 48px; background: #1e3a8a; color: #ffffff; font-weight: 900; font-size: 16px; text-align: center; line-height: 48px; border-radius: 8px;">
                        AFC
                    </div>
                @endif
            </td>
            <td style="vertical-align: middle; padding-left: 8px;">
                <h1 style="font-size: 15px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL AFC' }}
                </h1>
                <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0; font-weight: bold;">
                    RUT: {{ $institutional['association_rut'] ?? '65.123.456-K' }} • {{ $institutional['association_address'] ?? 'Región de Valparaíso, Chile' }}
                </p>
                <p style="font-size: 11px; color: #0f172a; margin: 3px 0 0 0; font-weight: 900; text-transform: uppercase;">
                    CARTOLA FINANCIERA Y ESTADO DE CUENTA: {{ strtoupper($statement['club']->name) }}
                </p>
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">PERÍODO AUDITADO</span>
                    <span style="font-size: 10px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">{{ $statement['period_title'] }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- BLOQUE DE RESUMEN CON COLORES -->
    <div style="margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0;">
            <tr>
                <td style="width: 33.3%; background-color: #f0fdf4; border: 1.5px solid #10b981; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #047857; text-transform: uppercase; display: block;">TOTAL CANCELADO CLUB</span>
                    <span style="font-size: 12px; font-weight: 900; color: #059669; display: block; margin-top: 2px;">+${{ number_format($statement['total_paid'], 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 33.3%; background-color: {{ $statement['pending_tributes_count'] > 0 ? '#fef2f2' : '#f0fdf4' }}; border: 1.5px solid {{ $statement['pending_tributes_count'] > 0 ? '#ef4444' : '#10b981' }}; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: {{ $statement['pending_tributes_count'] > 0 ? '#b91c1c' : '#047857' }}; text-transform: uppercase; display: block;">TRIBUTOS PENDIENTES</span>
                    <span style="font-size: 12px; font-weight: 900; color: {{ $statement['pending_tributes_count'] > 0 ? '#dc2626' : '#059669' }}; display: block; margin-top: 2px;">{{ $statement['pending_tributes_count'] }} Mes(es) (${{ number_format($statement['total_pending_amount'], 0, ',', '.') }})</span>
                </td>
                <td style="width: 33.3%; background-color: {{ $statement['is_up_to_date'] ? '#f0fdf4' : '#fef2f2' }}; border: 1.5px solid {{ $statement['is_up_to_date'] ? '#10b981' : '#ef4444' }}; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: {{ $statement['is_up_to_date'] ? '#047857' : '#b91c1c' }}; text-transform: uppercase; display: block;">ESTADO</span>
                    <span style="font-size: 12px; font-weight: 900; color: {{ $statement['is_up_to_date'] ? '#059669' : '#dc2626' }}; display: block; margin-top: 2px;">{{ $statement['is_up_to_date'] ? 'AL DÍA' : 'MOROSO / DEUDA' }}</span>
                </td>
            </tr>
        </table>
    </div>

    <!-- Desglose por Categoría de Pagos -->
    <table class="category-summary">
        <tr>
            <td>
                <span class="cat-title">Tributos Mensuales</span>
                <span class="cat-amount">${{ number_format($statement['totals_by_category']['tributo'], 0, ',', '.') }}</span>
            </td>
            <td>
                <span class="cat-title">Pases y Transferencias</span>
                <span class="cat-amount">${{ number_format($statement['totals_by_category']['pase'], 0, ',', '.') }}</span>
            </td>
            <td>
                <span class="cat-title">Inscripciones</span>
                <span class="cat-amount">${{ number_format($statement['totals_by_category']['inscripcion'], 0, ',', '.') }}</span>
            </td>
            <td>
                <span class="cat-title">Multas & Apelaciones</span>
                <span class="cat-amount">${{ number_format($statement['totals_by_category']['multas_apelaciones'], 0, ',', '.') }}</span>
            </td>
            <td>
    <div class="summary-cards font-mono">
        <div class="summary-card card-paid">
            <span class="card-title">TRIBUTOS PAGADOS</span>
            <span class="card-amount paid-text">${{ number_format($statement['total_paid_tributes_amount'], 0, ',', '.') }} CLP</span>
            <span class="card-detail">{{ $statement['paid_tributes_count'] }} de 12 meses cancelados</span>
        </div>
        <div class="summary-card card-pending">
            <span class="card-title">TRIBUTOS PENDIENTES</span>
            <span class="card-amount pending-text">${{ number_format($statement['total_pending_amount'], 0, ',', '.') }} CLP</span>
            <span class="card-detail">{{ $statement['pending_tributes_count'] }} de 12 meses pendientes</span>
        </div>
        <div class="summary-card card-total">
            <span class="card-title">TOTAL RECAUDADO CLUB</span>
            <span class="card-amount total-text">${{ number_format($statement['total_club_incomes_amount'], 0, ',', '.') }} CLP</span>
            <span class="card-detail">Incluye Pases y Derechos</span>
        </div>
    </div>

    <!-- 1. HISTORIAL DE TRIBUTOS MENSUALES -->
    <div class="section-title">
        1. HISTORIAL DE TRIBUTOS MENSUALES TEMPORADA {{ $year }}
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Mes</th>
                <th style="width: 35%;">Concepto / Detalle</th>
                <th style="width: 15%;">N° Folio</th>
                <th style="width: 15%;">Fecha Pago</th>
                <th style="width: 20%; text-align: right;">Monto ($ CLP)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($statement['tribute_history'] as $tribute)
                <tr>
                    <td><strong>{{ $tribute['month_name'] }} {{ $year }}</strong></td>
                    <td>Tributo Mensual Club</td>
                    <td>{{ $tribute['folio_number'] ?? '-' }}</td>
                    <td>{{ isset($tribute['payment_date']) && $tribute['payment_date'] ? \Carbon\Carbon::parse($tribute['payment_date'])->format('d/m/Y') : '-' }}</td>
                    <td class="text-right {{ $tribute['status'] === 'paid' ? 'paid-text' : ($tribute['status'] === 'exempt' ? 'text-slate-500' : 'pending-text') }}">
                        @if($tribute['status'] === 'paid')
                            ${{ number_format($tribute['amount'], 0, ',', '.') }}
                        @elseif($tribute['status'] === 'exempt')
                            <span style="color: #64748b; font-weight: bold;">Previo a Gestión (No Aplica)</span>
                        @else
                            ${{ number_format($tribute['amount'], 0, ',', '.') }} ({{ $tribute['status_label'] ?? 'Pendiente' }})
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- 2. DESGLOSE TRANSPARENTE DE PASES SI EXISTEN -->
    @if(count($statement['passes_list']) > 0)
        <div class="section-title">
            2. DETALLE DE PASES Y ARANCELES ARFA V REGIÓN vs RETENCIÓN ASOCIACIÓN (TOTAL: {{ $statement['passes_count'] ?? count($statement['passes_list']) }} PASES CURSADOS)
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 12%;">N° Folio</th>
                    <th style="width: 12%;">Fecha</th>
                    <th style="width: 40%;">Detalle / Jugador</th>
                    <th style="width: 12%; text-align: right;">Cobrado</th>
                    <th style="width: 12%; text-align: right;">ARFA V Región</th>
                    <th style="width: 12%; text-align: right;">Ganancia Asociación</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statement['passes_list'] as $pass)
                    <tr>
                        <td><strong>{{ $pass['folio_number'] }}</strong></td>
                        <td>{{ \Carbon\Carbon::parse($pass['date'])->format('d/m/Y') }}</td>
                        <td>{{ $pass['concept'] }}</td>
                        <td class="text-right paid-badge">${{ number_format($pass['total_amount'], 0, ',', '.') }}</td>
                        <td class="text-right" style="color: #b91c1c;">-${{ number_format($pass['arfa_cost'], 0, ',', '.') }}</td>
                        <td class="text-right" style="color: #15803d; font-weight: bold;">+${{ number_format($pass['afc_net'], 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="3" class="text-right">SUBTOTALES PASES Y TRANSFERENCIAS</td>
                    <td class="text-right paid-badge">${{ number_format($statement['totals_by_category']['pase'], 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #b91c1c;">-${{ number_format($statement['total_arfa_pases'], 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #15803d;">+${{ number_format($statement['total_afc_pases_net'], 0, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>
    @endif

    <!-- 3. DESGLOSE DE MULTAS Y APELACIONES SI EXISTEN -->
    @if(count($statement['penalties_list']) > 0)
        <div class="section-title">
            3. DETALLE DE MULTAS, SANCIONES Y APELACIONES DEL TRIBUNAL
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">N° Folio</th>
                    <th style="width: 15%;">Fecha</th>
                    <th style="width: 50%;">Detalle / Sanción o Apelación</th>
                    <th style="width: 20%; text-align: right;">Monto Cancelado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statement['penalties_list'] as $pen)
                    <tr>
                        <td><strong>{{ $pen->folio_number }}</strong></td>
                        <td>{{ \Carbon\Carbon::parse($pen->date)->format('d/m/Y') }}</td>
                        <td>{{ $pen->concept }}</td>
                        <td class="text-right paid-badge">${{ number_format($pen->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- 3.5. REGISTRO DE FONDO SOLIDARIO Y AUXILIOS MÉDICOS -->
    @if((isset($statement['solidarity_list']) && count($statement['solidarity_list']) > 0) || (isset($statement['solidarity_received_list']) && count($statement['solidarity_received_list']) > 0))
        <div class="section-title">
            REGISTRO DE FONDO SOLIDARIO Y AUXILIOS MÉDICOS
        </div>

        @if(isset($statement['solidarity_list']) && count($statement['solidarity_list']) > 0)
            <p style="font-size: 9px; font-weight: bold; color: #1e40af; margin: 4px 0;">Aportes Entregados por el Club al Fondo Solidario:</p>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">N° Folio</th>
                        <th style="width: 15%;">Fecha</th>
                        <th style="width: 50%;">Detalle / Campaña Solidaria</th>
                        <th style="width: 20%; text-align: right;">Monto Aportado</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statement['solidarity_list'] as $sol)
                        <tr>
                            <td><strong>{{ $sol->folio_number }}</strong></td>
                            <td>{{ \Carbon\Carbon::parse($sol->date)->format('d/m/Y') }}</td>
                            <td>{{ $sol->concept }}</td>
                            <td class="text-right paid-badge">${{ number_format($sol->amount, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        @if(isset($statement['solidarity_received_list']) && count($statement['solidarity_received_list']) > 0)
            <p style="font-size: 9px; font-weight: bold; color: #b91c1c; margin: 6px 0 4px 0;">Fondos de Auxilio Médico Recibidos por el Club (Beneficiario):</p>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">N° Folio</th>
                        <th style="width: 15%;">Fecha</th>
                        <th style="width: 50%;">Motivo / Caso de Auxilio</th>
                        <th style="width: 20%; text-align: right;">Monto Recibido</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statement['solidarity_received_list'] as $solRec)
                        <tr>
                            <td><strong>{{ $solRec->folio_number }}</strong></td>
                            <td>{{ \Carbon\Carbon::parse($solRec->date)->format('d/m/Y') }}</td>
                            <td>{{ $solRec->concept }}</td>
                            <td class="text-right" style="font-weight: bold; color: #b91c1c;">${{ number_format($solRec->amount, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endif

    <!-- 4. CARTOLA CONSOLIDADA COMPLETA -->
    <div class="section-title">
        4. CARTOLA HISTÓRICA CONSOLIDADA DE PAGOS REGISTRADOS
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">N° Folio</th>
                <th style="width: 15%;">Fecha</th>
                <th style="width: 20%;">Categoría</th>
                <th style="width: 35%;">Concepto / Detalle</th>
                <th style="width: 15%; text-align: right;">Monto Cancelado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($statement['transactions'] as $tx)
                <tr>
                    <td><strong>{{ $tx->folio_number }}</strong></td>
                    <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                    <td>{{ ucfirst($tx->category) }}</td>
                    <td>{{ $tx->concept }}</td>
                    <td class="text-right paid-badge">${{ number_format($tx->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 15px; color: #888;">
                        No se registraron pagos cancelados en el período consultado.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="4" class="text-right">TOTAL CANCELADO EN EL PERÍODO</td>
                <td class="text-right paid-badge">${{ number_format($statement['total_paid'], 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <!-- FIRMAS INSTITUCIONALES DIRECTIVA -->
    <div style="margin-top: 35px; width: 100%; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr>
                <td style="width: 33.3%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1.5px solid #1e3a8a; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="text-transform: uppercase; font-size: 9.5px; color: #0f172a;">{{ $institutional['treasurer_name'] ?? 'Juan Ramón Cornejo' }}</strong><br>
                    <span style="color: #64748b; font-size: 8.5px;">Tesorero General</span>
                </td>
                <td style="width: 33.3%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1.5px solid #1e3a8a; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="text-transform: uppercase; font-size: 9.5px; color: #0f172a;">{{ $institutional['president_name'] ?? 'Presidente General' }}</strong><br>
                    <span style="color: #64748b; font-size: 8.5px;">Presidente General</span>
                </td>
                <td style="width: 33.3%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1.5px solid #1e3a8a; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="text-transform: uppercase; font-size: 9.5px; color: #0f172a;">{{ $institutional['secretary_name'] ?? 'Secretario General' }}</strong><br>
                    <span style="color: #64748b; font-size: 8.5px;">Secretario General</span>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
