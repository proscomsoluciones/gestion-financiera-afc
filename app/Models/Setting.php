<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'label',
        'value',
        'group',
        'type',
        'description',
    ];

    /**
     * Get setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting value by key.
     */
    public static function set(string $key, mixed $value, string $label = '', string $group = 'tariffs'): self
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => (string) $value,
                'label' => $label ?: Str::title(str_replace('_', ' ', $key)),
                'group' => $group,
            ]
        );
    }

    /**
     * Get institutional identity data (Association name, RUT, Address, Treasurer Name, Logo).
     */
    public static function getInstitutionalData(): array
    {
        $logoPath = self::get('association_logo');
        $logoUrl = null;
        $logoBase64 = null;

        if (!empty($logoPath)) {
            $fullPath = public_path('storage/' . $logoPath);
            if (!file_exists($fullPath)) {
                $fullPath = storage_path('app/public/' . $logoPath);
            }

            if (file_exists($fullPath)) {
                $type = pathinfo($fullPath, PATHINFO_EXTENSION);
                if ($type === 'jpg') { $type = 'jpeg'; }
                $data = file_get_contents($fullPath);
                $logoBase64 = 'data:image/' . ($type === 'svg' ? 'svg+xml' : $type) . ';base64,' . base64_encode($data);
                $logoUrl = $logoBase64;
            } else {
                $logoUrl = asset('storage/' . $logoPath);
            }
        }

        return [
            'association_name' => self::get('association_name', 'ASOCIACIÓN DE FÚTBOL CATEMU'),
            'association_rut' => self::get('association_rut', '65.123.456-K'),
            'association_address' => self::get('association_address', 'Región de Valparaíso, Chile'),
            'treasurer_name' => self::get('treasurer_name', 'Juan Ramón Cornejo'),
            'president_name' => self::get('president_name', 'Presidente General'),
            'secretary_name' => self::get('secretary_name', 'Secretario General'),
            'logo_path' => $logoPath,
            'logo_url' => $logoUrl,
            'logo_base64' => $logoBase64,
        ];
    }

    /**
     * Get default AFC tariffs array with fallback values.
     */
    public static function getTariffs(): array
    {
        $defaultTariffs = [
            'rate_tributo_club' => [
                'label' => 'Tributo Mensual Club',
                'value' => 30000,
                'description' => 'Monto base del tributo mensual que cancela cada club',
            ],
            'rate_aporte_seleccion' => [
                'label' => 'Aporte Selección AFC',
                'value' => 10000,
                'description' => 'Monto destinado al fondo de la selección representativa',
            ],
            'rate_apelacion' => [
                'label' => 'Derecho de Apelación',
                'value' => 30000,
                'description' => 'Valor por presentación de recurso de apelación de tribunal',
            ],
            'rate_inscripcion_total' => [
                'label' => 'Cobro Inscripción Jugador AFC (Adulto/Infantil/Femenina)',
                'value' => 3000,
                'description' => 'Valor cobrado al club por inscripción de jugador (100% Arcas AFC)',
            ],
            'rate_inscripcion_arfa' => [
                'label' => 'Costo ARFA V Región Inscripción (Gratis)',
                'value' => 0,
                'description' => 'Arancel pagado a ARFA V Región por inscripción ($0 CLP)',
            ],
            'rate_pase_estandar_total' => [
                'label' => 'Cobro Pase Estándar AFC (Interno/Regional/Externo)',
                'value' => 22000,
                'description' => 'Valor total cobrado al club por pase de jugador adulto',
            ],
            'rate_pase_estandar_arfa' => [
                'label' => 'Costo ARFA V Región Pase Estándar',
                'value' => 17000,
                'description' => 'Arancel pagado a ARFA V Región por pase adulto',
            ],
            'rate_pase_femenino_total' => [
                'label' => 'Cobro Pase Femenino AFC',
                'value' => 17000,
                'description' => 'Valor total cobrado al club por pase femenino',
            ],
            'rate_pase_femenino_arfa' => [
                'label' => 'Costo ARFA V Región Pase Femenino',
                'value' => 12000,
                'description' => 'Arancel pagado a ARFA V Región por pase femenino',
            ],
        ];

        $results = [];

        foreach ($defaultTariffs as $key => $meta) {
            $setting = self::where('key', $key)->first();
            $results[$key] = [
                'key' => $key,
                'label' => $setting ? $setting->label : $meta['label'],
                'value' => $setting ? (float) $setting->value : (float) $meta['value'],
                'description' => $meta['description'],
            ];
        }

        return $results;
    }

    /**
     * Get configurable subcategories for Otros Ingresos.
     */
    public static function getOtherIncomeCategories(): array
    {
        $setting = self::where('key', 'other_income_categories')->first();
        if ($setting && !empty($setting->value)) {
            $decoded = json_decode($setting->value, true);
            if (is_array($decoded) && count($decoded) > 0) {
                return $decoded;
            }
        }

        return [
            ['id' => 'donacion', 'label' => '🎁 Donación / Aporte Voluntario'],
            ['id' => 'proyecto', 'label' => '🏛️ Proyecto / Subvención Municipal o FNDR'],
            ['id' => 'finales', 'label' => '🎟️ Recaudación Entradas / Final de Campeonato'],
            ['id' => 'sponsor', 'label' => '⭐ Sponsor / Auspicio Comercial'],
            ['id' => 'evento', 'label' => '🎟️ Venta de Bases / Evento / Beneficio'],
            ['id' => 'otro', 'label' => '💎 Otro Ingreso Extraordinario'],
        ];
    }

    /**
     * Get configurable categories for Egresos.
     */
    public static function getExpenseCategories(): array
    {
        $setting = self::where('key', 'expense_categories')->first();
        if ($setting && !empty($setting->value)) {
            $decoded = json_decode($setting->value, true);
            if (is_array($decoded) && count($decoded) > 0) {
                return $decoded;
            }
        }

        return [
            ['id' => 'viatico', 'label' => 'Viático / Asignación de Traslado / Árbitros'],
            ['id' => 'compra', 'label' => 'Compra de Insumos / Balones / Materiales'],
            ['id' => 'servicio', 'label' => 'Pago de Servicios / Honorarios / Gastos'],
            ['id' => 'otro', 'label' => 'Otro Egreso AFC'],
        ];
    }
}
