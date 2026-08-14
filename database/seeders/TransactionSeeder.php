<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clean transactions table cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Transaction::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $admin = User::where('email', 'jcornejo@proscom.cl')->first() ?? User::first();
        $userId = $admin ? $admin->id : 1;
        $clubs = Club::all();

        if ($clubs->isEmpty()) {
            return;
        }

        $months = [
            ['num' => '01', 'name' => 'Enero', 'year' => '2026', 'days' => 31],
            ['num' => '02', 'name' => 'Febrero', 'year' => '2026', 'days' => 28],
            ['num' => '03', 'name' => 'Marzo', 'year' => '2026', 'days' => 31],
            ['num' => '04', 'name' => 'Abril', 'year' => '2026', 'days' => 30],
            ['num' => '05', 'name' => 'Mayo', 'year' => '2026', 'days' => 31],
            ['num' => '06', 'name' => 'Junio', 'year' => '2026', 'days' => 30],
            ['num' => '07', 'name' => 'Julio', 'year' => '2026', 'days' => 31],
            ['num' => '08', 'name' => 'Agosto', 'year' => '2026', 'days' => 13],
        ];

        $playerNames = [
            'Esteban Paredes', 'Matías Fernández', 'Gonzalo Tapia', 'Alexis Sánchez', 'Arturo Vidal',
            'Claudio Bravo', 'Gary Medel', 'Charles Aránguiz', 'Eduardo Vargas', 'Mauricio Isla',
            'Marcelo Díaz', 'Jean Beausejour', 'Jorge Valdivia', 'Humberto Suazo', 'Jaime Valdés',
            'Lucas Barrios', 'Diego Valdés', 'Ben Brereton', 'Marcelino Núñez', 'Alexander Aravena',
            'Dario Osorio', 'Lucas Assadi', 'Brayan Cortés', 'Gabriel Suazo', 'Erick Pulgar',
            'Valentín Castellanos', 'Ignacio Saavedra', 'Vicente Pizarro', 'Jeyson Rojas', 'Bruno Barticciotto'
        ];

        $paymentMethods = ['efectivo', 'transferencia', 'deposito'];
        $transactions = [];

        foreach ($months as $mIdx => $m) {
            $monthTitle = "{$m['name']} {$m['year']}";
            $daysMax = $m['days'];

            // 1. TRIBUTOS MENSUALES POR CLUB ($40.000: $30k Tributo + $10k Selección)
            foreach ($clubs as $cIdx => $club) {
                // In August, leave 2 clubs unpaid/overdue for realistic status check
                if ($m['num'] === '08' && ($cIdx === 3 || $cIdx === 5)) {
                    continue;
                }

                $payDay = sprintf('%02d', min($daysMax, rand(2, 10)));
                $dateStr = "2026-{$m['num']}-{$payDay}";
                $method = $paymentMethods[rand(0, 2)];

                $transactions[] = [
                    'type' => 'income',
                    'category' => 'tributo',
                    'club_id' => $club->id,
                    'amount' => 40000,
                    'breakdown' => ['tributo_club' => 30000, 'aporte_seleccion' => 10000],
                    'concept' => "Pago Tributo Mensual Club (\$30.000) + Aporte Selección (\$10.000)",
                    'period_month' => $monthTitle,
                    'payment_method' => $method,
                    'date' => $dateStr,
                    'notes' => "Pago mensual correspondente a {$monthTitle}",
                ];
            }

            // 2. INSCRIPCIONES DE CAMPEONATO (Marzo: Torneo Apertura, Julio: Torneo Clausura)
            if ($m['num'] === '03' || $m['num'] === '07') {
                $torneo = $m['num'] === '03' ? 'Campeonato Apertura 2026' : 'Campeonato Clausura 2026';
                foreach ($clubs as $club) {
                    $payDay = sprintf('%02d', rand(5, 15));
                    $transactions[] = [
                        'type' => 'income',
                        'category' => 'inscripcion_campeonato',
                        'club_id' => $club->id,
                        'amount' => 100000,
                        'concept' => "Inscripción de Campeonato - {$torneo}",
                        'period_month' => $monthTitle,
                        'payment_method' => 'transferencia',
                        'date' => "2026-{$m['num']}-{$payDay}",
                        'notes' => "Cuota de inscripción oficial {$torneo}",
                    ];
                }
            }

            // 3. PASES Y RETENCIONES ARFA / AFC (3 a 5 pases por mes)
            $passCount = rand(3, 5);
            for ($i = 0; $i < $passCount; $i++) {
                $pClub = $clubs->random();
                $origClub = $clubs->where('id', '!=', $pClub->id)->random();
                $playerName = $playerNames[array_rand($playerNames)];
                $pDay = sprintf('%02d', rand(1, $daysMax));
                $passTypeRand = rand(1, 4);

                if ($passTypeRand === 4) { // Pase Femenino
                    $tot = 17000;
                    $arfa = 12000;
                    $afc = 5000;
                    $lbl = 'Pase Femenino Jugadora';
                } else { // Estándar (Interno/Regional/Externo)
                    $tot = 22000;
                    $arfa = 17000;
                    $afc = 5000;
                    $lbl = $passTypeRand === 1 ? 'Pase Interno Jugador' : ($passTypeRand === 2 ? 'Pase Regional Jugador' : 'Pase Externo Jugador');
                }

                $transactions[] = [
                    'type' => 'income',
                    'category' => 'pase',
                    'club_id' => $pClub->id,
                    'amount' => $tot,
                    'player_name' => $playerName,
                    'breakdown' => [
                        'tipo_pase' => $lbl,
                        'arfa_cost' => $arfa,
                        'afc_margin' => $afc,
                        'origin_club' => $origClub->name
                    ],
                    'concept' => "{$lbl} - {$playerName}",
                    'period_month' => $monthTitle,
                    'payment_method' => $paymentMethods[rand(0, 2)],
                    'date' => "2026-{$m['num']}-{$pDay}",
                    'notes' => "Tramitación de pase reglamentada ARFA",
                ];
            }

            // 3.5. PASES MULTI-JUGADOR (Lote de 4 a 6 jugadores en un solo comprobante)
            if ($m['num'] === '02' || $m['num'] === '03' || $m['num'] === '05' || $m['num'] === '07' || $m['num'] === '08') {
                $batchClub = $clubs->random();
                $playersInBatchCount = rand(4, 6);
                $batchItems = [];
                $batchNames = [];
                $totalBatchAmount = 0;
                $pDayBatch = sprintf('%02d', rand(10, min(25, $daysMax)));

                for ($k = 0; $k < $playersInBatchCount; $k++) {
                    $pName = $playerNames[array_rand($playerNames)];
                    $pRut = rand(12, 22) . '.' . sprintf('%03d', rand(100, 999)) . '.' . sprintf('%03d', rand(100, 999)) . '-' . rand(0, 9);
                    $pType = rand(1, 4);

                    if ($pType === 4) {
                        $pTot = 17000;
                        $pArfa = 12000;
                        $pAfc = 5000;
                        $pLbl = 'Pase Femenino Jugadora';
                    } else {
                        $pTot = 22000;
                        $pArfa = 17000;
                        $pAfc = 5000;
                        $pLbl = $pType === 1 ? 'Pase Interno Jugador' : ($pType === 2 ? 'Pase Regional Jugador' : 'Pase Externo Jugador');
                    }

                    $totalBatchAmount += $pTot;
                    $batchNames[] = $pName;
                    $batchItems[] = [
                        'type_label' => $pLbl,
                        'player_name' => $pName,
                        'player_rut' => $pRut,
                        'amount' => $pTot,
                        'arfa_cost' => $pArfa,
                        'afc_margin' => $pAfc,
                    ];
                }

                $joinedNames = implode(', ', $batchNames);

                $transactions[] = [
                    'type' => 'income',
                    'category' => 'pase',
                    'club_id' => $batchClub->id,
                    'amount' => $totalBatchAmount,
                    'player_name' => $joinedNames,
                    'breakdown' => [
                        'items' => $batchItems,
                        'arfa_cost' => array_sum(array_column($batchItems, 'arfa_cost')),
                        'afc_margin' => array_sum(array_column($batchItems, 'afc_margin')),
                    ],
                    'concept' => "Tramitación ({$playersInBatchCount} Jugadores: {$joinedNames})",
                    'period_month' => $monthTitle,
                    'payment_method' => 'transferencia',
                    'date' => "2026-{$m['num']}-{$pDayBatch}",
                    'notes' => "Tramitación en lote de {$playersInBatchCount} pases de jugadores",
                ];
            }

            // 4. INSCRIPCIONES INDIVIDUALES DE JUGADORES (4 a 6 inscripciones por mes)
            $inscCount = rand(4, 6);
            for ($i = 0; $i < $inscCount; $i++) {
                $iClub = $clubs->random();
                $pName = $playerNames[array_rand($playerNames)];
                $pDay = sprintf('%02d', rand(1, $daysMax));

                $transactions[] = [
                    'type' => 'income',
                    'category' => 'inscripcion',
                    'club_id' => $iClub->id,
                    'amount' => 5000,
                    'player_name' => $pName,
                    'breakdown' => ['tipo_inscripcion' => 'Inscripción Jugador', 'arfa_cost' => 0, 'afc_margin' => 5000],
                    'concept' => "Inscripción Jugador - {$pName}",
                    'period_month' => $monthTitle,
                    'payment_method' => 'efectivo',
                    'date' => "2026-{$m['num']}-{$pDay}",
                    'notes' => "Inscripción en sistema local de la asociación",
                ];
            }

            // 5. MULTAS Y SANCIONES
            if ($mIdx % 2 === 0) {
                $mClub = $clubs->random();
                $pDay2 = sprintf('%02d', rand(10, $daysMax));
                $transactions[] = [
                    'type' => 'income',
                    'category' => 'multa',
                    'club_id' => $mClub->id,
                    'amount' => 25000,
                    'concept' => "Pago por Multa / Sanción Disciplinaria Tribunal de Penas",
                    'period_month' => $monthTitle,
                    'payment_method' => 'transferencia',
                    'date' => "2026-{$m['num']}-{$pDay2}",
                    'notes' => "Fallo de tribunal por no presentación de turno",
                ];
            }

            // 6. EGRESOS / SALIDAS DE CAJA ORDINARIAS
            $expenseItems = [
                ['amount' => 120000, 'concept' => 'Pago Honorarios Árbitros - Jornada Fines de Semana', 'notes' => 'Recibo de honorarios colegio de árbitros'],
                ['amount' => 85000, 'concept' => 'Compra de Balones Oficiales y Equipamiento Deportivo', 'notes' => 'Factura N° ' . rand(1000, 9999) . ' Deportes Penal'],
                ['amount' => 45000, 'concept' => 'Gastos de Colación y Traslado Selección Adulta', 'notes' => 'Rendición de gastos de viático selección'],
                ['amount' => 60000, 'concept' => 'Mantenimiento e Insumos Marcaje de Cancha Sede', 'notes' => 'Compra de cal y herramientas de marcaje'],
            ];

            $expensesInMonth = array_slice($expenseItems, 0, rand(2, 3));
            foreach ($expensesInMonth as $exp) {
                $eDay = sprintf('%02d', rand(5, $daysMax));
                $transactions[] = [
                    'type' => 'expense',
                    'category' => 'egreso',
                    'club_id' => null,
                    'amount' => $exp['amount'],
                    'concept' => $exp['concept'],
                    'period_month' => $monthTitle,
                    'payment_method' => 'efectivo',
                    'date' => "2026-{$m['num']}-{$eDay}",
                    'notes' => $exp['notes'],
                ];
            }

            // 7. OTROS INGRESOS EXTRAORDINARIOS
            if ($m['num'] === '05') {
                $transactions[] = [
                    'type' => 'income',
                    'category' => 'otro_ingreso',
                    'club_id' => null,
                    'amount' => 1500000,
                    'concept' => 'Subvención Municipal Anual para Fomento del Deporte Local',
                    'period_month' => $monthTitle,
                    'payment_method' => 'transferencia',
                    'date' => "2026-05-15",
                    'notes' => 'Aporte otorgado por Ilustre Municipalidad de Catemu',
                    'breakdown' => ['subcategory' => 'proyecto', 'entity' => 'Ilustre Municipalidad'],
                ];
            }
        }

        // ----------------------------------------------------------------------
        // 8. FONDOS SOLIDARIOS REALISTAS (RECAUDACIONES Y ENTREGAS PAREADAS)
        // ----------------------------------------------------------------------

        // CAMPAÑA 1: Marzo 2026 - Auxilio Médico Operación Jugador Carlos Tapia (CD Santa Rosa)
        $beneficiaryClub1 = $clubs->firstWhere('name', 'CD Santa Rosa') ?? $clubs[0];
        $contributingClubs1 = $clubs->where('id', '!=', $beneficiaryClub1->id)->take(6);
        $totalCollected1 = 0;

        foreach ($contributingClubs1 as $idx => $cClub) {
            $dayStr = sprintf('%02d', $idx + 3);
            $amt = 25000;
            $totalCollected1 += $amt;

            $transactions[] = [
                'type' => 'income',
                'category' => 'fondo_solidario',
                'club_id' => $cClub->id,
                'amount' => $amt,
                'concept' => "Colecta Fondo Solidario - Auxilio Médico Operación Carlos Tapia ({$beneficiaryClub1->name})",
                'period_month' => 'Marzo 2026',
                'payment_method' => 'efectivo',
                'date' => "2026-03-{$dayStr}",
                'notes' => "Aporte voluntario club {$cClub->name} para fondo de salud de deportista",
            ];
        }

        // Entrega / Desembolso de Campaña 1 al beneficiario
        $transactions[] = [
            'type' => 'expense',
            'category' => 'fondo_solidario',
            'club_id' => $beneficiaryClub1->id,
            'amount' => $totalCollected1, // $150.000
            'concept' => "Entrega de Fondo Solidario a {$beneficiaryClub1->name} por Auxilio Médico / Operación Jugador Carlos Tapia",
            'period_month' => 'Marzo 2026',
            'payment_method' => 'transferencia',
            'date' => "2026-03-15",
            'notes' => "Monto recaudado entregado íntegramente a directiva de {$beneficiaryClub1->name}. Comprobante bancario N° 98214",
        ];


        // CAMPAÑA 2: Junio 2026 - Asistencia Médica Lesión Grave Jugador Matías Sepúlveda (CD Arcoíris)
        $beneficiaryClub2 = $clubs->firstWhere('name', 'CD Arcoíris') ?? $clubs[1];
        $contributingClubs2 = $clubs->where('id', '!=', $beneficiaryClub2->id)->take(8);
        $totalCollected2 = 0;

        foreach ($contributingClubs2 as $idx => $cClub) {
            $dayStr = sprintf('%02d', $idx + 2);
            $amt = 20000;
            $totalCollected2 += $amt;

            $transactions[] = [
                'type' => 'income',
                'category' => 'fondo_solidario',
                'club_id' => $cClub->id,
                'amount' => $amt,
                'concept' => "Aporte Fondo Solidario - Lesión Jugador Matías Sepúlveda ({$beneficiaryClub2->name})",
                'period_month' => 'Junio 2026',
                'payment_method' => 'transferencia',
                'date' => "2026-06-{$dayStr}",
                'notes' => "Aporte club {$cClub->name} fondo de auxilio médico",
            ];
        }

        // Entrega / Desembolso de Campaña 2 al beneficiario
        $transactions[] = [
            'type' => 'expense',
            'category' => 'fondo_solidario',
            'club_id' => $beneficiaryClub2->id,
            'amount' => $totalCollected2, // $160.000
            'concept' => "Entrega de Fondo Solidario a {$beneficiaryClub2->name} por Asistencia Médica Lesión Jugador Matías Sepúlveda",
            'period_month' => 'Junio 2026',
            'payment_method' => 'efectivo',
            'date' => "2026-06-12",
            'notes' => "Entrega en efectivo realizada en reunión de delegados a la directiva de {$beneficiaryClub2->name}. Recibo firmado",
        ];


        // CAMPAÑA 3: Agosto 2026 - Colecta Emergencia Salud Jugador Rodrigo Morales (CD Peñarol Reinoso)
        $beneficiaryClub3 = $clubs->firstWhere('name', 'CD Peñarol Reinoso') ?? $clubs[2];
        $contributingClubs3 = $clubs->where('id', '!=', $beneficiaryClub3->id)->take(5);
        $totalCollected3 = 0;

        foreach ($contributingClubs3 as $idx => $cClub) {
            $dayStr = sprintf('%02d', $idx + 1);
            $amt = 30000;
            $totalCollected3 += $amt;

            $transactions[] = [
                'type' => 'income',
                'category' => 'fondo_solidario',
                'club_id' => $cClub->id,
                'amount' => $amt,
                'concept' => "Fondo Solidario Salud - Emergencia Médica Jugador Rodrigo Morales ({$beneficiaryClub3->name})",
                'period_month' => 'Agosto 2026',
                'payment_method' => 'deposito',
                'date' => "2026-08-{$dayStr}",
                'notes' => "Aporte extraordinario de auxilio medico club {$cClub->name}",
            ];
        }

        // Entrega / Desembolso de Campaña 3 al beneficiario
        $transactions[] = [
            'type' => 'expense',
            'category' => 'fondo_solidario',
            'club_id' => $beneficiaryClub3->id,
            'amount' => $totalCollected3, // $150.000
            'concept' => "Entrega de Fondo Solidario a {$beneficiaryClub3->name} por Emergencia de Salud Jugador Rodrigo Morales",
            'period_month' => 'Agosto 2026',
            'payment_method' => 'transferencia',
            'date' => "2026-08-10",
            'notes' => "Transferencia bancaria directa a la cuenta corriente del club beneficiario. Folio rendido y cerrado",
        ];

        // Sort chronologically by date
        usort($transactions, function ($a, $b) {
            return strcmp($a['date'], $b['date']);
        });

        // Insert chronologically generating sequential folios (FOL-00001, FOL-00002, ...)
        foreach ($transactions as $t) {
            $t['user_id'] = $userId;
            $t['folio_number'] = Transaction::generateNextFolio();
            Transaction::create($t);
        }

        $this->command->info('✅ TransactionSeeder completado con éxito: Se cargaron transacciones completas de Enero a Agosto 2026 incluyendo 3 Campañas de Fondo Solidario (Recaudación + Entregas rendidas).');
    }
}
