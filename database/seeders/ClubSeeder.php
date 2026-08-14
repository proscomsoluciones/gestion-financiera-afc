<?php

namespace Database\Seeders;

use App\Models\Club;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clubs = [
            [
                'name' => 'Club Deportivo Huracán',
                'short_name' => 'Huracán',
                'president_name' => 'Roberto Gómez',
                'secretary_name' => 'Carlos Silva',
                'treasurer_name' => 'Jorge Mendoza',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Estrella del Sur',
                'short_name' => 'Estrella del Sur',
                'president_name' => 'Manuel Fuentes',
                'secretary_name' => 'Ricardo Palma',
                'treasurer_name' => 'Patricio Soto',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Juventud Unida',
                'short_name' => 'Juventud Unida',
                'president_name' => 'Hernán Araya',
                'secretary_name' => 'Gabriel Rojas',
                'treasurer_name' => 'Esteban Morales',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Real San Martín',
                'short_name' => 'Real San Martín',
                'president_name' => 'Fernando Castro',
                'secretary_name' => 'Víctor Hugo',
                'treasurer_name' => 'Mauricio Vera',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Unión Esperanza',
                'short_name' => 'Unión Esperanza',
                'president_name' => 'Alejandro Torres',
                'secretary_name' => 'Gonzalo Bravo',
                'treasurer_name' => 'José Luis Parra',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Lord Cochrane',
                'short_name' => 'Lord Cochrane',
                'president_name' => 'Rodrigo Sepúlveda',
                'secretary_name' => 'Sebastián Reyes',
                'treasurer_name' => 'Claudio Lagos',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Marítimo',
                'short_name' => 'Marítimo',
                'president_name' => 'Oscar Godoy',
                'secretary_name' => 'Marcelo Espinoza',
                'treasurer_name' => 'Héctor Carrasco',
                'is_active' => true,
            ],
            [
                'name' => 'Club Deportivo Villa Real',
                'short_name' => 'Villa Real',
                'president_name' => 'Raúl Olivares',
                'secretary_name' => 'Alfonso Pizarro',
                'treasurer_name' => 'Mario Valenzuela',
                'is_active' => true,
            ],
        ];

        foreach ($clubs as $c) {
            Club::updateOrCreate(
                ['slug' => Str::slug($c['name'])],
                [
                    'name' => $c['name'],
                    'short_name' => $c['short_name'],
                    'president_name' => $c['president_name'],
                    'secretary_name' => $c['secretary_name'],
                    'treasurer_name' => $c['treasurer_name'],
                    'is_active' => $c['is_active'],
                ]
            );
        }
    }
}
