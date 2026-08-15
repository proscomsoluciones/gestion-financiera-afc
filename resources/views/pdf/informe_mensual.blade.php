<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe Financiero - {{ $periodTitle }}</title>
    <style>
        @page { margin: 30px 40px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
        .header h1 { font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 13px; font-weight: normal; margin: 4px 0 0 0; color: #333; }
        .header p { font-size: 11px; margin: 4px 0 0 0; color: #555; }
        .summary-box { border: 1px solid #000; padding: 10px; margin-bottom: 20px; background-color: #fafafa; }
        .summary-box table { width: 100%; border-collapse: collapse; }
        .summary-box td { text-align: center; font-size: 12px; font-weight: bold; }
        .section-title { background-color: #dbeafe; padding: 6px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #1e3a8a; color: #1e40af; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px 8px; font-size: 9.5px; text-transform: uppercase; font-weight: bold; }
        .data-table td { padding: 6px 8px; border-bottom: 1px solid #eee; }
        .data-table tr:nth-child(even) { background-color: #fcfcfc; }
        .text-right { text-align: right; }
        .income-text { color: #15803d; font-weight: bold; }
        .expense-text { color: #b91c1c; font-weight: bold; }
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
                    INFORME MENSUAL DE CAJA & LIBRO CONTABLE
                </p>
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">PERÍODO AUDITADO</span>
                    <span style="font-size: 10px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">{{ $periodTitle }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- BLOQUE DE RESUMEN CON COLORES -->
    <div style="margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0;">
            <tr>
                <td style="width: 33.3%; background-color: #f0fdf4; border: 1.5px solid #10b981; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #047857; text-transform: uppercase; display: block;">INGRESOS TOTALES</span>
                    <span style="font-size: 12px; font-weight: 900; color: #059669; display: block; margin-top: 2px;">+${{ number_format($totalIncome, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 33.3%; background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #b91c1c; text-transform: uppercase; display: block;">EGRESOS TOTALES</span>
                    <span style="font-size: 12px; font-weight: 900; color: #dc2626; display: block; margin-top: 2px;">-${{ number_format($totalExpense, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 33.3%; background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: block;">SALDO FINAL PERÍODO</span>
                    <span style="font-size: 12px; font-weight: 900; color: #1e40af; display: block; margin-top: 2px;">${{ number_format($netBalance ?? 0, 0, ',', '.') }} CLP</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">
        MOVIMIENTOS DE CAJA REGISTRADOS EN EL PERÍODO
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;">Folio</th>
                <th style="width: 12%;">Fecha</th>
                <th style="width: 25%;">Entidad / Club</th>
                <th style="width: 38%;">Concepto / Detalle</th>
                <th style="width: 15%; text-align: right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $tx)
                <tr>
                    <td class="font-mono text-center font-bold">{{ $tx->folio_number ?? 'S/N' }}</td>
                    <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                    <td>{{ $tx->club ? $tx->club->name : 'Asociación (General)' }}</td>
                    <td>{{ $tx->concept }}</td>
                    <td class="text-right {{ $tx->type === 'income' ? 'income-text' : 'expense-text' }}">
                        {{ $tx->type === 'income' ? '+' : '-' }}${{ number_format($tx->amount, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #888;">
                        No se registraron movimientos en este período.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FIRMAS INSTITUCIONALES DIRECTIVA -->
    <div style="margin-top: 40px; width: 100%; page-break-inside: avoid;">
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
