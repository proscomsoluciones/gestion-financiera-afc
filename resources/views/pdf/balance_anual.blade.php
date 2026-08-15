<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Balance Anual - {{ $year }}</title>
    <style>
        @page { margin: 25px 30px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 10px; line-height: 1.3; }
        .header { text-align: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #000; }
        .header h1 { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 12px; font-weight: normal; margin: 3px 0 0 0; color: #333; }
        .header p { font-size: 10px; margin: 3px 0 0 0; color: #555; }
        
        .summary-box { border: 1px solid #000; padding: 8px; margin-bottom: 15px; background-color: #fafafa; }
        .summary-box table { width: 100%; border-collapse: collapse; }
        .summary-box td { text-align: center; font-size: 11px; font-weight: bold; }
        
        .section-title { background-color: #dbeafe; padding: 6px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #1e3a8a; color: #1e40af; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .data-table th { background-color: #1e3a8a; color: #ffffff; text-align: left; padding: 6px; font-size: 9px; text-transform: uppercase; font-weight: bold; }
        .data-table td { padding: 5px 6px; border-bottom: 1px solid #eee; }
        .data-table tr:nth-child(even) { background-color: #fcfcfc; }
        .total-row td { border-top: 2px solid #1e3a8a; border-bottom: 2px solid #1e3a8a; font-weight: bold; font-size: 10px; padding: 6px; background-color: #eff6ff; }
        
        .text-right { text-align: right; }
        .income-text { color: #15803d; font-weight: bold; }
        .expense-text { color: #b91c1c; font-weight: bold; }
        .page-break { page-break-before: always; }
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
                        ⚽
                    </div>
                @endif
            </td>
            <td style="vertical-align: middle; padding-left: 8px;">
                <h1 style="font-size: 15px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL CATEMU' }}
                </h1>
                <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0; font-weight: bold;">
                    RUT: {{ $institutional['association_rut'] ?? '65.123.456-K' }} • {{ $institutional['association_address'] ?? 'Región de Valparaíso, Chile' }}
                </p>
                <p style="font-size: 11px; color: #0f172a; margin: 3px 0 0 0; font-weight: 900; text-transform: uppercase;">
                    BALANCE GENERAL Y CONSOLIDADO DE GESTIÓN ANUAL
                </p>
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #1e40af; text-transform: uppercase; display: block;">TEMPORADA</span>
                    <span style="font-size: 11px; font-weight: 900; color: #1e3a8a; display: block; margin-top: 1px;">AÑO {{ $year }}</span>
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
                    <span style="font-size: 12px; font-weight: 900; color: #059669; display: block; margin-top: 2px;">+${{ number_format($totalIncomeYear, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 33.3%; background-color: #fef2f2; border: 1.5px solid #ef4444; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #b91c1c; text-transform: uppercase; display: block;">EGRESOS TOTALES</span>
                    <span style="font-size: 12px; font-weight: 900; color: #dc2626; display: block; margin-top: 2px;">-${{ number_format($totalExpenseYear, 0, ',', '.') }} CLP</span>
                </td>
                <td style="width: 33.3%; background-color: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 8px; text-align: center;">
                    <span style="font-size: 8.5px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: block;">SALDO ACUMULADO</span>
                    <span style="font-size: 12px; font-weight: 900; color: #1e40af; display: block; margin-top: 2px;">${{ number_format($netBalanceYear, 0, ',', '.') }} CLP</span>
                </td>
            </tr>
        </table>
    </div>

    <!-- 1. RESUMEN EJECUTIVO MES A MES -->
    <div class="section-title">
        1. RESUMEN DE FLUJO DE CAJA MENSUAL
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25%;">Mes</th>
                <th style="width: 25%; text-align: right;">Ingresos ($)</th>
                <th style="width: 25%; text-align: right;">Egresos ($)</th>
                <th style="width: 25%; text-align: right;">Saldo Acumulado ($)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($annualBalance as $row)
                <tr>
                    <td><strong>{{ $row['month_name'] }}</strong></td>
                    <td class="text-right income-text">+${{ number_format($row['income'], 0, ',', '.') }}</td>
                    <td class="text-right expense-text">-${{ number_format($row['expense'], 0, ',', '.') }}</td>
                    <td class="text-right font-bold">${{ number_format($row['accumulated'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td>TOTAL ANUAL {{ $year }}</td>
                <td class="text-right income-text">+${{ number_format($totalIncomeYear, 0, ',', '.') }}</td>
                <td class="text-right expense-text">-${{ number_format($totalExpenseYear, 0, ',', '.') }}</td>
                <td class="text-right">${{ number_format($netBalanceYear, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <!-- 2. BALANCE DETALLADO POR CATEGORÍAS -->
    <div class="section-title" style="margin-top: 20px;">
        2. DETALLE DE INGRESOS Y EGRESOS POR CATEGORÍA Y MES
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 16%;">Mes</th>
                <th style="width: 14%; text-align: right;">Tributos</th>
                <th style="width: 14%; text-align: right;">Pases</th>
                <th style="width: 14%; text-align: right;">Inscrip.</th>
                <th style="width: 14%; text-align: right;">Multas/Apel.</th>
                <th style="width: 14%; text-align: right;">Otros Ing.</th>
                <th style="width: 14%; text-align: right;">Egresos</th>
            </tr>
        </thead>
        <tbody>
            @foreach($annualBalance as $row)
                <tr>
                    <td><strong>{{ $row['month_name'] }}</strong></td>
                    <td class="text-right income-text">${{ number_format($row['categories']['tributo'], 0, ',', '.') }}</td>
                    <td class="text-right income-text">${{ number_format($row['categories']['pase'], 0, ',', '.') }}</td>
                    <td class="text-right income-text">${{ number_format($row['categories']['inscripcion'], 0, ',', '.') }}</td>
                    <td class="text-right income-text">${{ number_format($row['categories']['multa_apelacion'], 0, ',', '.') }}</td>
                    <td class="text-right income-text">${{ number_format($row['categories']['otros_ingresos'], 0, ',', '.') }}</td>
                    <td class="text-right expense-text">-${{ number_format($row['categories']['egresos'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- FIRMAS INSTITUCIONALES Y COMISIÓN REVISORA DE CUENTAS -->
    <div style="margin-top: 35px; width: 100%; page-break-inside: avoid;">
        <div class="section-title" style="margin-bottom: 25px;">
            3. FIRMAS DE APROBACIÓN Y AUDITORÍA DE ASAMBLEA
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 25px;">
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

        <div style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 9px; margin-bottom: 15px; color: #444;">
            COMISIÓN REVISORA DE CUENTAS DE LA ASAMBLEA DE DELEGADOS
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr>
                <td style="width: 33%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="font-size: 9px;">1° Revisor de Cuentas</strong><br>
                    <span style="color: #666; font-size: 8px;">Delegado Asamblea</span>
                </td>
                <td style="width: 33%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="font-size: 9px;">2° Revisor de Cuentas</strong><br>
                    <span style="color: #666; font-size: 8px;">Delegado Asamblea</span>
                </td>
                <td style="width: 33%; padding: 0 10px; vertical-align: bottom;">
                    <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px auto;"></div>
                    <strong style="font-size: 9px;">3° Revisor de Cuentas</strong><br>
                    <span style="color: #666; font-size: 8px;">Delegado Asamblea</span>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
