<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Planilla de Control de Pases - {{ $periodTitle }}</title>
    <style>
        @page { margin: 25px 30px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 10px; line-height: 1.3; }
        
        .section-title { background-color: #dbeafe; padding: 6px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #1e3a8a; color: #1e40af; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9.5px; }
        .data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px; font-weight: bold; text-transform: uppercase; font-size: 8.5px; }
        .data-table td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        
        .total-row td { border-top: 2px solid #1e3a8a; border-bottom: 2px solid #1e3a8a; font-weight: bold; font-size: 10px; padding: 7px 6px; background-color: #eff6ff; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .signatures-container { margin-top: 40px; width: 100%; }
        .signatures-table { width: 100%; border-collapse: collapse; text-align: center; }
        .signatures-table td { width: 50%; vertical-align: bottom; padding: 0 20px; }
        .line { border-top: 1.5px solid #1e3a8a; width: 85%; margin: 0 auto 4px auto; }
        .sig-title { font-weight: bold; font-size: 10px; text-transform: uppercase; margin: 0; color: #0f172a; }
        .sig-sub { font-size: 9px; color: #64748b; margin: 2px 0 0 0; }
    </style>
</head>
<body>

    <!-- ENCABEZADO INSTITUCIONAL UNIFICADO CON COLORES -->
    <table style="width: 100%; border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
        <tr>
            <td style="width: 60px; vertical-align: middle;">
                @if(!empty($institutional['logo_url']))
                    <img src="{{ $institutional['logo_url'] }}" style="max-width: 55px; max-height: 55px;">
                @else
                    <div style="width: 48px; height: 48px; background: #1e3a8a; color: #ffffff; font-weight: 900; font-size: 16px; text-align: center; line-height: 48px; border-radius: 8px;">
                        ⚽
                    </div>
                @endif
            </td>
            <td style="vertical-align: middle; padding-left: 8px;">
                <h1 style="font-size: 15px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL' }}
                </h1>
                <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0; font-weight: bold;">
                    RUT: {{ $institutional['association_rut'] ?? '65.123.456-K' }} • {{ $institutional['association_address'] ?? 'Región de Valparaíso, Chile' }}
                </p>
                <p style="font-size: 11px; color: #0f172a; margin: 3px 0 0 0; font-weight: 900; text-transform: uppercase;">
                    PLANILLA DE CONTROL DE PASES Y RETENCIÓN
                </p>
            </td>
            <td style="width: 160px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">PERÍODO AUDITADO</span>
                    <span style="font-size: 10px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">{{ $periodTitle }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- BLOQUE DE TARJETAS DE RESUMEN CON COLORES -->
    <div style="margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0;">
            <tr>
                <td style="width: 25%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 7px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block;">TRÁMITES TOTALES</span>
                    <span style="font-size: 11.5px; font-weight: 900; color: #0f172a; display: block; margin-top: 2px;">{{ $totalPassesCount ?? count($passes) }} Pases</span>
                </td>
                <td style="width: 25%; background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 7px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: block;">TOTAL COBRADO CLUBES</span>
                    <span style="font-size: 11.5px; font-weight: 900; color: #1e40af; display: block; margin-top: 2px;">${{ number_format($totalAmount, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 25%; background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 7px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #b91c1c; text-transform: uppercase; display: block;">A PAGAR ARFA V REGIÓN</span>
                    <span style="font-size: 11.5px; font-weight: 900; color: #dc2626; display: block; margin-top: 2px;">${{ number_format($totalArfa, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 25%; background-color: #f0fdf4; border: 1.5px solid #10b981; border-radius: 6px; padding: 7px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #047857; text-transform: uppercase; display: block;">GANANCIA NETA RETENIDA</span>
                    <span style="font-size: 11.5px; font-weight: 900; color: #059669; display: block; margin-top: 2px;">+${{ number_format($totalAfcNet, 0, ',', '.') }} CLP</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">
        Detalle de Pases: Cobro a Clubes, Arancel ARFA y Diferencia Retenida
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;">Folio</th>
                <th style="width: 11%;">Fecha</th>
                <th style="width: 22%;">Club Solicitante</th>
                <th style="width: 27%;">Detalle / Jugador</th>
                <th style="width: 10%; text-align: right;">Total Cobrado</th>
                <th style="width: 10%; text-align: right;">Costo ARFA</th>
                <th style="width: 10%; text-align: right;">Diferencia Retenida</th>
            </tr>
        </thead>
        <tbody>
            @forelse($passes as $pass)
                @php
                    $arfaCost = isset($pass->breakdown['arfa_cost']) ? (float)$pass->breakdown['arfa_cost'] : (str_contains(strtolower($pass->concept), 'femenino') ? 12000 : 17000);
                    $afcNet = max(0, (float)$pass->amount - $arfaCost);
                    $cleanConcept = trim(preg_replace('/\s*\(Procedencia:.*?\)/i', '', $pass->concept));
                @endphp
                <tr>
                    <td><strong>{{ $pass->folio_number }}</strong></td>
                    <td>{{ \Carbon\Carbon::parse($pass->date)->format('d-m-Y') }}</td>
                    <td>{{ $pass->club ? $pass->club->name : 'N/A' }}</td>
                    <td>{{ $cleanConcept }}</td>
                    <td class="text-right" style="font-weight: bold; color: #1e40af;">
                        ${{ number_format($pass->amount, 0, ',', '.') }}
                    </td>
                    <td class="text-right" style="color: #dc2626; font-weight: bold;">
                        ${{ number_format($arfaCost, 0, ',', '.') }}
                    </td>
                    <td class="text-right" style="color: #059669; font-weight: bold;">
                        +${{ number_format($afcNet, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colSpan="7" class="text-center" style="padding: 15px; color: #64748b;">
                        No se registran trámites de pases en este período.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colSpan="4" class="text-right">TOTALES ACUMULADOS DEL PERÍODO:</td>
                <td class="text-right" style="color: #1e40af;">
                    ${{ number_format($totalAmount, 0, ',', '.') }}
                </td>
                <td class="text-right" style="color: #dc2626;">
                    ${{ number_format($totalArfa, 0, ',', '.') }}
                </td>
                <td class="text-right" style="color: #059669; font-size: 10.5px;">
                    +${{ number_format($totalAfcNet, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="signatures-container">
        <table class="signatures-table">
            <tr>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['treasurer_name'] ?? 'Juan Ramón Cornejo' }}</p>
                    <p class="sig-sub">Tesorero General</p>
                </td>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['president_name'] ?? 'Presidente General' }}</p>
                    <p class="sig-sub">Presidente General</p>
                </td>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['secretary_name'] ?? 'Secretario General' }}</p>
                    <p class="sig-sub">Secretario General</p>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
