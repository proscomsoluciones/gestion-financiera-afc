<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado de Cumplimiento Financiero - {{ $club->name }}</title>
    <style>
        @page { margin: 30px 40px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.5; }
        
        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #047857; padding-bottom: 12px; }
        .header h1 { font-size: 18px; font-weight: bold; margin: 0; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; }
        .header h2 { font-size: 13px; font-weight: normal; margin: 4px 0 0 0; color: #333; }
        .header p { font-size: 10px; margin: 3px 0 0 0; color: #666; }
        
        .badge-box { text-align: center; margin: 25px 0; }
        .status-badge { display: inline-block; padding: 8px 24px; font-size: 14px; font-weight: bold; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .status-paid { background-color: #d1fae5; color: #065f46; border: 2px solid #10b981; }
        .status-pending { background-color: #fee2e2; color: #991b1b; border: 2px solid #ef4444; }

        .certificate-body { font-size: 12px; text-align: justify; margin-bottom: 30px; line-height: 1.8; }
        .certificate-body p { margin-bottom: 15px; }
        .highlight { font-weight: bold; color: #000; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 10px; }
        .data-table th { background-color: #047857; color: #ffffff; padding: 6px 8px; text-align: left; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        .data-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        
        .signatures-container { margin-top: 50px; width: 100%; }
        .signatures-table { width: 100%; border-collapse: collapse; text-align: center; }
        .signatures-table td { width: 50%; vertical-align: bottom; padding: 0 20px; }
        .line { border-top: 1.5px solid #047857; width: 80%; margin: 0 auto 5px auto; }
        .sig-title { font-weight: bold; font-size: 11px; text-transform: uppercase; margin: 0; }
        .sig-sub { font-size: 9px; color: #555; margin: 2px 0 0 0; }

        .watermark-date { text-align: right; font-size: 9px; color: #777; margin-top: 20px; font-style: italic; }
    </style>
</head>
<body>

    <!-- ENCABEZADO INSTITUCIONAL UNIFICADO AFC CON COLORES -->
    <table style="width: 100%; border-bottom: 3px solid #047857; padding-bottom: 10px; margin-bottom: 15px;">
        <tr>
            <td style="width: 60px; vertical-align: middle;">
                @if(!empty($institutional['logo_url']))
                    <img src="{{ $institutional['logo_url'] }}" style="max-width: 55px; max-height: 55px;">
                @else
                    <div style="width: 48px; height: 48px; background: #047857; color: #ffffff; font-weight: 900; font-size: 16px; text-align: center; line-height: 48px; border-radius: 8px;">
                        ⚽
                    </div>
                @endif
            </td>
            <td style="vertical-align: middle; padding-left: 8px;">
                <h1 style="font-size: 15px; font-weight: 900; color: #047857; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL CATEMU' }}
                </h1>
                <p style="font-size: 9px; color: #475569; margin: 2px 0 0 0; font-weight: bold;">
                    RUT: {{ $institutional['association_rut'] ?? '65.123.456-K' }} • {{ $institutional['association_address'] ?? 'Región de Valparaíso, Chile' }}
                </p>
                <p style="font-size: 11px; color: #0f172a; margin: 3px 0 0 0; font-weight: 900; text-transform: uppercase;">
                    CERTIFICADO DE CUMPLIMIENTO FINANCIERO
                </p>
            </td>
            <td style="width: 150px; text-align: right; vertical-align: middle;">
                <div style="background-color: #ecfdf5; border: 1.5px solid #047857; border-radius: 8px; padding: 5px 8px; text-align: center;">
                    <span style="font-size: 8px; font-weight: bold; color: #047857; text-transform: uppercase; display: block;">FECHA DE EMISIÓN</span>
                    <span style="font-size: 10px; font-weight: 900; color: #065f46; display: block; margin-top: 1px;">{{ date('d-m-Y') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <div class="badge-box">
        @if($statement['is_up_to_date'])
            <div class="status-badge status-paid">CLUB REGISTRA ESTADO AL DÍA</div>
        @else
            <div class="status-badge status-pending">CLUB REGISTRA OBLIGACIONES PENDIENTES</div>
        @endif
    </div>

    <div class="certificate-body">
        <p>
            La <strong>{{ $institutional['association_name'] ?? 'Asociación de Fútbol Catemu' }}</strong>, a través de su Secretaría de Tesorería General, certifica por medio del presente documento oficial que la institución deportiva denominada <span class="highlight">{{ strtoupper($club->name) }}</span>, ha sido evaluada financieramente para la temporada correspondiente al año <span class="highlight">{{ $year }}</span>.
        </p>

        @if($statement['is_up_to_date'])
            <p>
                A la fecha de emisión de este certificado, el club <span class="highlight">{{ strtoupper($club->name) }}</span> ha dado <span class="highlight">CUMPLIMIENTO TOTAL</span> al pago de sus tributos mensuales, cuotas institucionales y derechos reglamentarios. Por lo tanto, se encuentra en condición de <span class="highlight">ESTADO AL DÍA</span> con la Tesorería General, encontrándose plenamente habilitado para participar en competencias oficiales, votar en Asambleas de Presidentes y realizar trámites reglamentarios.
            </p>
        @else
            <p>
                A la fecha de emisión de este documento, el club <span class="highlight">{{ strtoupper($club->name) }}</span> registra un saldo pendiente de <span class="highlight">${{ number_format($statement['total_pending_amount'], 0, ',', '.') }} CLP</span> correspondiente a <span class="highlight">{{ $statement['pending_tributes_count'] }} período(s) de tributo mensual</span>. Se solicita regularizar dicha situación a la brevedad ante la Tesorería General.
            </p>
        @endif
    </div>

    <div style="font-weight: bold; text-transform: uppercase; font-size: 10px; margin-bottom: 6px; color: #047857;">
        Resumen de Obligaciones y Tributos - Temporada {{ $year }}
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Período</th>
                <th>Concepto / Obligación</th>
                <th class="text-right">Monto</th>
                <th class="text-right">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($statement['tribute_history'] as $tribute)
                <tr>
                    <td><strong>{{ $tribute['month_name'] }} {{ $year }}</strong></td>
                    <td>Tributo Mensual Club + Aporte Selección</td>
                    <td class="text-right">${{ number_format($tribute['amount'], 0, ',', '.') }}</td>
                    <td class="text-right">
                        @if($tribute['status'] === 'paid')
                            <span style="color: #059669; font-weight: bold;">PAGADO ({{ $tribute['folio_number'] }})</span>
                        @elseif($tribute['status'] === 'exempt')
                            <span style="color: #64748b; font-weight: bold;">PREVIO A GESTIÓN (NO APLICA)</span>
                        @elseif($tribute['status'] === 'overdue')
                            <span style="color: #dc2626; font-weight: bold;">MOROSO / VENCIDO</span>
                        @else
                            <span style="color: #2563eb; font-weight: bold;">POR VENCER (EN PLAZO)</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signatures-container">
        <table class="signatures-table">
            <tr>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['treasurer_name'] ?? 'Juan Ramón Cornejo' }}</p>
                    <p class="sig-sub">Tesorero</p>
                </td>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['president_name'] ?? 'Presidente General' }}</p>
                    <p class="sig-sub">Presidente</p>
                </td>
                <td style="width: 33.3%;">
                    <div class="line"></div>
                    <p class="sig-title">{{ $institutional['secretary_name'] ?? 'Secretario General' }}</p>
                    <p class="sig-sub">Secretario</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="watermark-date">
        Certificado emitido el {{ date('d/m/Y \a \l\a\s H:i') }} hrs • Documento Verificado por Sistema Contable.
    </div>

</body>
</html>
