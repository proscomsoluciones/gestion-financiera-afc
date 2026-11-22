<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ingresos y Egresos por Categoría - {{ $periodTitle }}</title>
    <style>
        @page { margin: 30px 40px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 10.5px; line-height: 1.4; }
        .section-title { padding: 6px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; }
        .section-income { background-color: #f0fdf4; border-left: 4px solid #047857; color: #047857; }
        .section-expense { background-color: #fef2f2; border-left: 4px solid #b91c1c; color: #b91c1c; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .data-table th { color: #ffffff; text-align: left; padding: 5px 8px; font-size: 9px; text-transform: uppercase; font-weight: bold; }
        .th-income th { background-color: #047857; }
        .th-expense th { background-color: #b91c1c; }
        .data-table td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        .data-table tr.total-row td { border-top: 1.5px solid #1e293b; border-bottom: none; font-weight: 900; background-color: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .income-text { color: #15803d; font-weight: bold; }
        .expense-text { color: #b91c1c; font-weight: bold; }
        .group-title { font-size: 10px; font-weight: 900; color: #0f172a; padding: 5px 8px; background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; margin-top: 10px; }
        .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        .detail-table td { padding: 3px 8px; border-bottom: 1px solid #f1f5f9; font-size: 9.5px; }
        .detail-table tr.subtotal td { font-weight: 900; border-top: 1px solid #94a3b8; border-bottom: none; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>

    <!-- ENCABEZADO INSTITUCIONAL -->
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
                    RUT: {{ $institutional['association_rut'] ?? '' }} • {{ $institutional['association_address'] ?? '' }}
                </p>
                <p style="font-size: 11px; color: #0f172a; margin: 3px 0 0 0; font-weight: 900; text-transform: uppercase;">
                    {{ $reportTitle }}
                </p>
                @if($categoria !== '')
                    <p style="font-size: 9.5px; color: #1e40af; margin: 2px 0 0 0; font-weight: bold;">
                        Categoría: {{ $categoria }}
                    </p>
                @endif
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">PERÍODO</span>
                    <span style="font-size: 10px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">{{ $periodTitle }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- RESUMEN -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 5px 0; margin-bottom: 10px;">
        <tr>
            @if($tipo !== 'egresos')
                <td style="background-color: #f0fdf4; border: 1.5px solid #10b981; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #047857; text-transform: uppercase; display: block;">INGRESOS TOTALES</span>
                    <span style="font-size: 12px; font-weight: 900; color: #059669; display: block; margin-top: 2px;">+${{ number_format($totalIncome, 0, ',', '.') }}</span>
                </td>
            @endif
            @if($tipo !== 'ingresos')
                <td style="background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #b91c1c; text-transform: uppercase; display: block;">EGRESOS TOTALES</span>
                    <span style="font-size: 12px; font-weight: 900; color: #dc2626; display: block; margin-top: 2px;">-${{ number_format($totalExpense, 0, ',', '.') }}</span>
                </td>
            @endif
            @if($tipo === 'ambos' && $categoria === '')
                <td style="background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: block;">SALDO DEL PERÍODO</span>
                    <span style="font-size: 12px; font-weight: 900; color: #1e40af; display: block; margin-top: 2px;">${{ number_format($netBalance, 0, ',', '.') }}</span>
                </td>
            @endif
        </tr>
    </table>

    @if($tipo !== 'egresos')
    <!-- RESUMEN DE INGRESOS POR CATEGORÍA -->
    <div class="section-title section-income">Ingresos por categoría</div>
    <table class="data-table">
        <thead class="th-income">
            <tr>
                <th style="width: 58%;">Categoría</th>
                <th style="width: 12%; text-align: center;">N° Mov.</th>
                <th style="width: 18%; text-align: right;">Total</th>
                <th style="width: 12%; text-align: right;">%</th>
            </tr>
        </thead>
        <tbody>
            @forelse($incomeGroups as $group)
                <tr>
                    <td>{{ $group['label'] }}</td>
                    <td class="text-center">{{ $group['count'] }}</td>
                    <td class="text-right income-text">${{ number_format($group['total'], 0, ',', '.') }}</td>
                    <td class="text-right">{{ $totalIncome > 0 ? number_format($group['total'] * 100 / $totalIncome, 1, ',', '.') : '0' }}%</td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center" style="color: #888; padding: 12px;">Sin ingresos en el período.</td></tr>
            @endforelse
            <tr class="total-row">
                <td>TOTAL INGRESOS</td>
                <td class="text-center">{{ $incomeGroups->sum('count') }}</td>
                <td class="text-right income-text">${{ number_format($totalIncome, 0, ',', '.') }}</td>
                <td class="text-right">100%</td>
            </tr>
        </tbody>
    </table>
    @endif

    @if($tipo !== 'ingresos')
    <!-- RESUMEN DE EGRESOS POR CATEGORÍA -->
    <div class="section-title section-expense">Egresos por categoría</div>
    <table class="data-table">
        <thead class="th-expense">
            <tr>
                <th style="width: 58%;">Categoría</th>
                <th style="width: 12%; text-align: center;">N° Mov.</th>
                <th style="width: 18%; text-align: right;">Total</th>
                <th style="width: 12%; text-align: right;">%</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenseGroups as $group)
                <tr>
                    <td>{{ $group['label'] }}</td>
                    <td class="text-center">{{ $group['count'] }}</td>
                    <td class="text-right expense-text">${{ number_format($group['total'], 0, ',', '.') }}</td>
                    <td class="text-right">{{ $totalExpense > 0 ? number_format($group['total'] * 100 / $totalExpense, 1, ',', '.') : '0' }}%</td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center" style="color: #888; padding: 12px;">Sin egresos en el período.</td></tr>
            @endforelse
            <tr class="total-row">
                <td>TOTAL EGRESOS</td>
                <td class="text-center">{{ $expenseGroups->sum('count') }}</td>
                <td class="text-right expense-text">${{ number_format($totalExpense, 0, ',', '.') }}</td>
                <td class="text-right">100%</td>
            </tr>
        </tbody>
    </table>
    @endif

    <!-- FIRMAS -->
    <div style="margin-top: 35px; width: 100%; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; text-align: center;">
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

    <!-- DETALLE DE INGRESOS -->
    @if($showDetail && $incomeGroups->isNotEmpty())
        <div class="page-break"></div>
        <div class="section-title section-income">Detalle de ingresos por categoría</div>
        @foreach($incomeGroups as $group)
            <div class="group-title">{{ $group['label'] }} ({{ $group['count'] }})</div>
            <table class="detail-table">
                @foreach($group['items'] as $tx)
                    <tr>
                        <td style="width: 12%;">{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                        <td style="width: 10%;">{{ $tx->folio_number ?? 'S/N' }}</td>
                        <td style="width: 60%;">{{ $tx->concept }}</td>
                        <td style="width: 18%;" class="text-right income-text">${{ number_format($tx->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr class="subtotal">
                    <td colspan="3">Subtotal {{ $group['label'] }}</td>
                    <td class="text-right income-text">${{ number_format($group['total'], 0, ',', '.') }}</td>
                </tr>
            </table>
        @endforeach
    @endif

    <!-- DETALLE DE EGRESOS -->
    @if($showDetail && $expenseGroups->isNotEmpty())
        <div class="page-break"></div>
        <div class="section-title section-expense">Detalle de egresos por categoría</div>
        @foreach($expenseGroups as $group)
            <div class="group-title">{{ $group['label'] }} ({{ $group['count'] }})</div>
            <table class="detail-table">
                @foreach($group['items'] as $tx)
                    <tr>
                        <td style="width: 12%;">{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                        <td style="width: 10%;">{{ $tx->folio_number ?? 'S/N' }}</td>
                        <td style="width: 60%;">{{ $tx->concept }}</td>
                        <td style="width: 18%;" class="text-right expense-text">${{ number_format($tx->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr class="subtotal">
                    <td colspan="3">Subtotal {{ $group['label'] }}</td>
                    <td class="text-right expense-text">${{ number_format($group['total'], 0, ',', '.') }}</td>
                </tr>
            </table>
        @endforeach
    @endif

</body>
</html>
