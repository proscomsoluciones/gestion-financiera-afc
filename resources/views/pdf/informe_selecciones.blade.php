<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Gastos de Selecciones</title>
    <style>
        @page { margin: 30px 40px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.4; }
        .section-title { padding: 7px 10px; font-size: 10.5px; font-weight: bold; text-transform: uppercase; margin-top: 18px; margin-bottom: 8px; border-radius: 4px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px 8px; font-size: 9.5px; text-transform: uppercase; font-weight: bold; }
        .data-table td { padding: 6px 8px; border-bottom: 1px solid #eee; }
        .data-table tr:nth-child(even) { background-color: #fcfcfc; }
        .text-right { text-align: right; }
        .expense-text { color: #b91c1c; font-weight: bold; }
        .note-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 9.5px; color: #334155; margin-bottom: 15px; line-height: 1.6; }
        .note-box strong { color: #0f172a; }
    </style>
</head>
<body>

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
                    INFORME DE GASTOS DE SELECCIONES
                </p>
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">PERÍODO</span>
                    <span style="font-size: 10px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">{{ $periodTitle }}</span>
                </div>
            </td>
        </tr>
    </table>

    <p style="font-size: 10px; color: #475569; margin: 0 0 15px 0;">
        Este documento resume todo el dinero gastado en las Selecciones Representativas de la Asociación (equipo Adulto y equipo Sub 17) durante el período indicado.
    </p>

    <div style="margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0;">
            <tr>
                <td style="width: 50%; background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #b91c1c; text-transform: uppercase; display: block;">TOTAL GASTADO EN SELECCIONES</span>
                    <span style="font-size: 15px; font-weight: 900; color: #dc2626; display: block; margin-top: 2px;">${{ number_format($totalExpense, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 50%; background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: block;">CANTIDAD DE PAGOS REALIZADOS</span>
                    <span style="font-size: 15px; font-weight: 900; color: #1e40af; display: block; margin-top: 2px;">{{ $groupedExpenses->flatten(1)->count() }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title" style="background-color: #dbeafe; border-left: 4px solid #1e3a8a; color: #1e40af;">
        ¿En qué se gastó? Resumen por Selección
    </div>

    <div class="note-box">
        <strong>Cómo leer este resumen:</strong> cada pago fue clasificado según a qué equipo pertenece, buscando palabras como "Adulta" o "Sub 17" en su descripción.
        Cuando un gasto corresponde a un Amistoso o Partido de las Selecciones (por ejemplo, el arriendo de la cancha o el pago del árbitro) y no se especificó a qué equipo pertenece,
        se clasificó como <strong>"Gastos Generales de Jornada de Selecciones"</strong>. Este informe <strong>no incluye</strong> partidos de la Liguilla ni de otros torneos entre clubes,
        ya que corresponden a los clubes y no a las Selecciones Representativas de la Asociación.
    </div>

    <table class="data-table" style="margin-bottom: 20px;">
        <thead>
            <tr>
                <th style="width: 34%;">Selección</th>
                <th style="width: 12%; text-align: center;">N° Pagos</th>
                <th style="width: 20%; text-align: right;">Total Gastado</th>
                <th style="width: 34%;">Proporción del Gasto Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($groupedExpenses as $teamName => $teamExpenses)
                @php
                    $teamTotal = $teamExpenses->sum('amount');
                    $pct = $totalExpense > 0 ? round(($teamTotal / $totalExpense) * 100) : 0;
                    $style = $teamStyles[$teamName] ?? ['color' => '#334155', 'bg' => '#f8fafc', 'border' => '#94a3b8'];
                @endphp
                <tr>
                    <td style="font-weight: bold; color: {{ $style['color'] }};">{{ $teamName }}</td>
                    <td style="text-align: center;">{{ $teamExpenses->count() }}</td>
                    <td class="text-right expense-text">${{ number_format($teamTotal, 0, ',', '.') }}</td>
                    <td>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: {{ max($pct, 2) }}%; background-color: {{ $style['border'] }}; height: 12px; border-radius: 3px; padding: 0;"></td>
                                <td style="width: {{ 100 - max($pct, 2) }}%; padding: 0 0 0 6px; font-size: 9.5px; font-weight: bold; color: #475569;">{{ $pct }}%</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            @endforeach
            <tr style="background-color: #1e3a8a; font-weight: 900;">
                <td style="padding: 8px; color: #ffffff;">TOTAL GENERAL</td>
                <td style="text-align: center; padding: 8px; color: #ffffff;">{{ $groupedExpenses->flatten(1)->count() }}</td>
                <td class="text-right" style="padding: 8px; color: #ffffff;">${{ number_format($totalExpense, 0, ',', '.') }}</td>
                <td style="padding: 8px; color: #ffffff;">100%</td>
            </tr>
        </tbody>
    </table>

    @forelse($groupedExpenses as $teamName => $teamExpenses)
        @php
            $style = $teamStyles[$teamName] ?? ['color' => '#334155', 'bg' => '#f8fafc', 'border' => '#94a3b8'];
        @endphp
        <div class="section-title" style="background-color: {{ $style['bg'] }}; border-left: 4px solid {{ $style['border'] }}; color: {{ $style['color'] }}; page-break-before: auto;">
            Detalle: {{ $teamName }} — {{ $teamExpenses->count() }} {{ $teamExpenses->count() === 1 ? 'pago' : 'pagos' }}
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Folio</th>
                    <th style="width: 12%;">Fecha</th>
                    <th style="width: 56%;">¿Para qué fue este gasto?</th>
                    <th style="width: 20%; text-align: right;">Monto</th>
                </tr>
            </thead>
            <tbody>
                @foreach($teamExpenses as $tx)
                    <tr>
                        <td class="font-mono font-bold">{{ $tx->folio_number ?? 'S/N' }}</td>
                        <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                        <td>{{ $tx->concept }}</td>
                        <td class="text-right expense-text">${{ number_format($tx->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr style="background-color: {{ $style['bg'] }}; font-weight: 900;">
                    <td colspan="3" style="text-align: right; padding: 8px; color: {{ $style['color'] }};">Subtotal {{ $teamName }}:</td>
                    <td class="text-right" style="padding: 8px; color: {{ $style['color'] }};">${{ number_format($teamExpenses->sum('amount'), 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    @empty
        <div class="section-title" style="background-color: #dbeafe; border-left: 4px solid #1e3a8a; color: #1e40af;">Detalle de Gastos</div>
        <p style="text-align: center; padding: 20px; color: #888;">No se registraron gastos de selecciones en este período.</p>
    @endforelse

    <table class="data-table" style="margin-top: 10px;">
        <tbody>
            <tr style="background-color: #1e3a8a; font-weight: 900;">
                <td style="text-align: right; padding: 10px; color: #ffffff; font-size: 12px;">TOTAL GENERAL GASTADO EN SELECCIONES:</td>
                <td class="text-right" style="padding: 10px; color: #ffffff; width: 20%; font-size: 12px;">${{ number_format($totalExpense, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 40px; width: 100%; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px;">
            <tr>
                <td style="width: 33.3%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1.5px solid #1e3a8a; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="text-transform: uppercase; font-size: 9.5px; color: #0f172a;">{{ $institutional['treasurer_name'] ?? 'Tesorero General' }}</strong><br>
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
