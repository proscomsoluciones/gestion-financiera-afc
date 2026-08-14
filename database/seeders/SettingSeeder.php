<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'rate_tributo_club',
                'label' => 'Tributo Mensual Club',
                'value' => '30000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_aporte_seleccion',
                'label' => 'Aporte Fondo Selección AFC',
                'value' => '10000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_apelacion',
                'label' => 'Derecho de Apelación',
                'value' => '30000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_inscripcion_total',
                'label' => 'Cobro Inscripción Jugador AFC',
                'value' => '5000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_inscripcion_arfa',
                'label' => 'Costo ARFA V Región Inscripción',
                'value' => '0',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_pase_estandar_total',
                'label' => 'Cobro Pase Estándar AFC',
                'value' => '22000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_pase_estandar_arfa',
                'label' => 'Costo ARFA V Región Pase Estándar',
                'value' => '17000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_pase_femenino_total',
                'label' => 'Cobro Pase Femenino AFC',
                'value' => '17000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
            [
                'key' => 'rate_pase_femenino_arfa',
                'label' => 'Costo ARFA V Región Pase Femenino',
                'value' => '12000',
                'group' => 'tariffs',
                'type' => 'number',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
