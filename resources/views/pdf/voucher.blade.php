<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante {{ $transaction->folio_number }} - {{ $institutional['association_name'] ?? 'Asociación de Fútbol Catemu' }}</title>
    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #000000;
            line-height: 1.3;
            background-color: #ffffff;
            margin: 0;
            padding: 10px;
        }

        /* Ink Saving Eco Border Outline Box */
        .voucher-border {
            border: 2px solid #000000;
            padding: 15px;
            border-radius: 4px;
            background-color: #ffffff;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }

        .logo-box {
            width: 48px;
            height: 48px;
            border: 2px solid #000000;
            color: #000000;
            font-weight: 900;
            font-size: 16px;
            text-align: center;
            line-height: 46px;
            border-radius: 6px;
            display: inline-block;
            overflow: hidden;
            background-color: #ffffff;
        }

        .logo-img {
            max-width: 48px;
            max-height: 48px;
            object-fit: contain;
        }

        .title-area {
            vertical-align: middle;
            padding-left: 10px;
        }

        .title-main {
            font-size: 15px;
            font-weight: 900;
            color: #000000;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -0.2px;
        }

        .title-sub {
            font-size: 9px;
            font-weight: 800;
            color: #000000;
            margin: 2px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .legal-text {
            font-size: 9px;
            color: #222222;
            margin-top: 2px;
            font-weight: 600;
        }

        .rut-text {
            font-size: 9px;
            color: #444444;
            margin-top: 1px;
        }

        /* Date & Folio Box */
        .folio-box {
            border: 2px solid #000000;
            background-color: #ffffff;
            border-radius: 4px;
            padding: 6px 10px;
            text-align: center;
        }

        .date-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .date-grid th {
            font-size: 7px;
            font-weight: 900;
            text-transform: uppercase;
            border: 1px solid #000000;
            padding: 2px;
            text-align: center;
            background-color: #f5f5f5;
        }

        .date-grid td {
            font-size: 11px;
            font-weight: 900;
            border: 1px solid #000000;
            padding: 2px;
            text-align: center;
            font-family: monospace;
        }

        .folio-label {
            font-size: 8px;
            font-weight: 900;
            color: #000000;
            text-transform: uppercase;
        }

        .folio-number {
            font-size: 16px;
            font-weight: 900;
            color: #000000;
            font-family: monospace;
        }

        /* Form Lines Style matching paper voucher */
        .field-row {
            margin-bottom: 8px;
            width: 100%;
        }

        .field-label {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            display: inline-block;
            width: 130px;
        }

        .field-line {
            border-bottom: 1px solid #000000;
            font-size: 12px;
            font-weight: 900;
            color: #000000;
            padding-bottom: 2px;
        }

        .words-box {
            border-bottom: 1px solid #000000;
            font-size: 11px;
            font-weight: 900;
            color: #000000;
            text-transform: uppercase;
            padding-bottom: 2px;
            margin-bottom: 10px;
        }

        /* Items POR: Table */
        .por-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 12px;
            border: 1px solid #000000;
        }

        .por-table th {
            border-bottom: 2px solid #000000;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 6px;
            text-align: left;
            background-color: #f9f9f9;
        }

        .por-table td {
            border-bottom: 1px solid #e0e0e0;
            font-size: 10px;
            font-weight: 700;
            padding: 6px;
        }

        /* Stamp Area */
        .stamp-box {
            border: 2px dashed #000000;
            border-radius: 6px;
            padding: 6px 12px;
            text-align: center;
            display: inline-block;
            margin-top: 6px;
        }

        .stamp-title {
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stamp-subtitle {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            margin-top: 1px;
        }

        /* Total Box */
        .total-container {
            border: 2px solid #000000;
            padding: 8px 12px;
            border-radius: 4px;
            text-align: right;
            margin-top: 10px;
            margin-bottom: 15px;
        }

        .total-amount-text {
            font-size: 20px;
            font-weight: 900;
            font-family: monospace;
        }

        /* Signatures Footer */
        .signatures-table {
            width: 100%;
            margin-top: 25px;
        }

        .signature-cell {
            width: 45%;
            text-align: center;
            vertical-align: bottom;
        }

        .signature-line {
            border-top: 1px solid #000000;
            margin-bottom: 4px;
            height: 40px;
        }

        .signature-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .signature-sub {
            font-size: 8px;
            color: #333333;
        }
    </style>
</head>
<body>
    <div class="voucher-border">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td style="width: 65%;">
                    <table>
                        <tr>
                            <td style="vertical-align: top;">
                                @if(!empty($institutional['logo_path']) && file_exists(storage_path('app/public/' . $institutional['logo_path'])))
                                    <img src="{{ storage_path('app/public/' . $institutional['logo_path']) }}" class="logo-img" alt="Logo">
                                @else
                                    <div class="logo-box">⚽</div>
                                @endif
                            </td>
                            <td class="title-area">
                                <h1 class="title-main">{{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL CATEMU' }}</h1>
                                <p class="legal-text">Fundado: 14 de Marzo de 1954 • Pers. Jurídica N° 2827 - Catemu</p>
                                <p class="title-sub">
                                    COMPROBANTE DE {{ $transaction->type === 'income' ? 'INGRESO EN CAJA' : 'EGRESO / SALIDA' }} - TRÁMITES Y OTROS
                                </p>
                                <p class="rut-text">
                                    RUT: {{ $institutional['association_rut'] ?? '65.123.456-K' }} • {{ $institutional['association_address'] ?? 'Región de Valparaíso, Chile' }}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="width: 35%; text-align: right; vertical-align: top;">
                    @php
                        $dateObj = \Carbon\Carbon::parse($transaction->date);
                    @endphp
                    <div class="folio-box">
                        <table class="date-grid">
                            <tr>
                                <th>DÍA</th>
                                <th>MES</th>
                                <th>AÑO</th>
                            </tr>
                            <tr>
                                <td>{{ $dateObj->format('d') }}</td>
                                <td>{{ $dateObj->format('m') }}</td>
                                <td>{{ $dateObj->format('y') }}</td>
                            </tr>
                        </table>
                        <div class="folio-label">N° FOLIO</div>
                        <div class="folio-number">{{ $transaction->folio_number ?? 'S/N' }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Main Form Fields -->
        <table style="width: 100%; margin-bottom: 8px;">
            <tr>
                <td style="width: 120px; font-weight: 900; font-size: 10px; text-transform: uppercase;">
                    RECIBIDO DE:
                </td>
                <td class="field-line">
                    {{ $transaction->club ? $transaction->club->name : ($transaction->player_name ?? '— General / Sin Club —') }}
                </td>
            </tr>
        </table>

        <table style="width: 100%; margin-bottom: 12px;">
            <tr>
                <td style="width: 150px; font-weight: 900; font-size: 10px; text-transform: uppercase;">
                    LA SUMA DE (en letras):
                </td>
                <td class="words-box">
                    {{ $amountInWords ?? 'SON: PESOS CLP' }}
                </td>
            </tr>
        </table>

        <!-- POR: Items Table -->
        <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; margin-bottom: 2px;">
            POR CONCEPTO DE:
        </div>

        <table class="por-table">
            <thead>
                <tr>
                    <th style="width: 70%;">DETALLE / CONCEPTO / JUGADOR / RUT</th>
                    <th style="width: 30%; text-align: right;">VALOR (CLP)</th>
                </tr>
            </thead>
            <tbody>
                @if(!empty($transaction->breakdown['items']) && is_array($transaction->breakdown['items']))
                    @foreach($transaction->breakdown['items'] as $item)
                        <tr>
                            <td>
                                <strong>{{ $item['type_label'] ?? 'Trámite ARFA V Región' }}</strong>
                                @if(!empty($item['player_name']))
                                    — <strong>{{ $item['player_name'] }}</strong>
                                @endif
                                @if(!empty($item['player_rut']))
                                    <br><span style="font-size: 9px; color: #333333; font-weight: bold;">RUT: {{ $item['player_rut'] }}</span>
                                @endif
                            </td>
                            <td style="text-align: right; font-weight: 900; font-size: 11px;">
                                ${{ number_format($item['amount'] ?? 0, 0, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td>
                            <strong>{{ trim(preg_replace('/\s*\(Procedencia:.*?\)/i', '', $transaction->concept)) }}</strong>
                            @if($transaction->player_name)
                                <br><span style="font-size: 9px; font-weight: bold; color: #333333;">Jugador(a): {{ $transaction->player_name }}</span>
                            @endif
                            @if($transaction->period_month)
                                <br><span style="font-size: 9px; font-weight: bold; color: #333333;">Período: {{ $transaction->period_month }}</span>
                            @endif
                            @if($transaction->notes)
                                <br><span style="font-size: 9px; font-style: italic; color: #555555;">Obs: {{ $transaction->notes }}</span>
                            @endif
                        </td>
                        <td style="text-align: right; font-weight: 900; font-size: 11px;">
                            ${{ number_format($transaction->amount, 0, ',', '.') }}
                        </td>
                    </tr>
                @endif

                @if($transaction->category === 'tributo')
                    <tr>
                        <td style="padding-left: 15px; font-size: 9px;">• Tributo Mensual Institucional Club</td>
                        <td style="text-align: right; font-size: 9px;">
                            ${{ number_format($transaction->breakdown['tributo_club'] ?? 30000, 0, ',', '.') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-left: 15px; font-size: 9px;">• Aporte Fondo Selección</td>
                        <td style="text-align: right; font-size: 9px;">
                            ${{ number_format($transaction->breakdown['aporte_seleccion'] ?? 10000, 0, ',', '.') }}
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Cancellation Stamp & Total -->
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%; vertical-align: middle;">
                    <div class="stamp-box">
                        <div class="stamp-title">{{ $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL CATEMU' }}</div>
                        <div class="stamp-subtitle">CANCELADO TESORERÍA</div>
                    </div>
                </td>
                <td style="width: 50%; vertical-align: middle; text-align: right;">
                    <div class="total-container">
                        <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; display: block;">TOTAL CANCELADO</span>
                        <span class="total-amount-text">${{ number_format($transaction->amount, 0, ',', '.') }}.-</span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Payment Method Row -->
        <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; margin-top: 5px;">
            FORMA DE PAGO:
            <span style="border: 1px solid #000; padding: 2px 6px; margin-left: 5px; font-weight: 900;">
                {{ match($transaction->payment_method) {
                    'efectivo' => 'EFECTIVO',
                    'transferencia' => 'TRANSFERENCIA BANCARIA',
                    'deposito' => 'DEPÓSITO BANCARIO',
                    'cheque' => 'CHEQUE',
                    default => strtoupper($transaction->payment_method),
                } }}
            </span>
            @if($transaction->reference_number)
                <span style="margin-left: 10px;">N° REF/TRANS: <strong>{{ $transaction->reference_number }}</strong></span>
            @endif
        </div>

        <!-- Dual Signatures Footer -->
        <table class="signatures-table">
            <tr>
                <td class="signature-cell">
                    <div class="signature-line"></div>
                    <div class="signature-title">V° B° TESORERO</div>
                    <div class="signature-sub">Tesorero(a): {{ $institutional['treasurer_name'] ?? ($transaction->user ? $transaction->user->name : 'Juan Ramón Cornejo') }}</div>
                </td>
                <td style="width: 10%;"></td>
                <td class="signature-cell">
                    <div class="signature-line"></div>
                    <div class="signature-title">RECIBÍ CONFORME</div>
                    <div class="signature-sub">Firma y RUT Entregado / Club</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
