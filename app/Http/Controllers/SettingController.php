<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display settings page.
     */
    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'tariffs' => Setting::getTariffs(),
            'institutional' => Setting::getInstitutionalData(),
            'other_income_categories' => Setting::getOtherIncomeCategories(),
            'expense_categories' => Setting::getExpenseCategories(),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    /**
     * Update settings in storage.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'association_name' => 'nullable|string|max:255',
            'association_rut' => 'nullable|string|max:100',
            'association_address' => 'nullable|string|max:255',
            'treasurer_name' => 'nullable|string|max:255',
            'president_name' => 'nullable|string|max:255',
            'secretary_name' => 'nullable|string|max:255',
            'start_tribute_month' => 'nullable|integer|min:1|max:12',
            'association_logo' => 'nullable|image|max:5120',

            'rate_tributo_club' => 'required|numeric|min:0',
            'rate_aporte_seleccion' => 'required|numeric|min:0',
            'rate_apelacion' => 'required|numeric|min:0',
            'rate_inscripcion_total' => 'required|numeric|min:0',
            'rate_inscripcion_arfa' => 'required|numeric|min:0',
            'rate_pase_estandar_total' => 'required|numeric|min:0',
            'rate_pase_estandar_arfa' => 'required|numeric|min:0',
            'rate_pase_femenino_total' => 'required|numeric|min:0',
            'rate_pase_femenino_arfa' => 'required|numeric|min:0',
        ]);

        // Save Institutional Text Fields
        $institutionalKeys = ['association_name', 'association_rut', 'association_address', 'treasurer_name', 'president_name', 'secretary_name', 'start_tribute_month'];
        foreach ($institutionalKeys as $key) {
            if ($request->has($key)) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => (string) $request->input($key, ''),
                        'label' => ucfirst(str_replace('_', ' ', $key)),
                        'group' => 'institutional',
                        'type' => 'text',
                    ]
                );
            }
        }

        // Save Logo File if uploaded
        if ($request->hasFile('association_logo')) {
            $path = $request->file('association_logo')->store('logos', 'public');
            Setting::updateOrCreate(
                ['key' => 'association_logo'],
                [
                    'value' => $path,
                    'label' => 'Logo Institucional de la Asociación',
                    'group' => 'institutional',
                    'type' => 'image',
                ]
            );
        }

        // Save Tariff numeric fields
        $tariffKeys = [
            'rate_tributo_club', 'rate_aporte_seleccion', 'rate_apelacion',
            'rate_inscripcion_total', 'rate_inscripcion_arfa',
            'rate_pase_estandar_total', 'rate_pase_estandar_arfa',
            'rate_pase_femenino_total', 'rate_pase_femenino_arfa',
        ];

        foreach ($tariffKeys as $key) {
            if (isset($validated[$key])) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => (string) $validated[$key],
                        'label' => ucfirst(str_replace('_', ' ', $key)),
                        'group' => 'tariffs',
                        'type' => 'number',
                    ]
                );
            }
        }

        // Save Other Income Categories
        if ($request->has('other_income_categories')) {
            $categoriesArray = $request->input('other_income_categories');
            if (is_array($categoriesArray)) {
                Setting::updateOrCreate(
                    ['key' => 'other_income_categories'],
                    [
                        'value' => json_encode($categoriesArray),
                        'label' => 'Categorías para Otros Ingresos',
                        'group' => 'categories',
                        'type' => 'json',
                    ]
                );
            }
        }

        // Save Expense Categories
        if ($request->has('expense_categories')) {
            $expenseCatArray = $request->input('expense_categories');
            if (is_array($expenseCatArray)) {
                Setting::updateOrCreate(
                    ['key' => 'expense_categories'],
                    [
                        'value' => json_encode($expenseCatArray),
                        'label' => 'Categorías para Egresos',
                        'group' => 'categories',
                        'type' => 'json',
                    ]
                );
            }
        }

        return redirect()->route('settings.index')->with('success', 'Los datos institucionales, tarifas y categorías han sido actualizados correctamente.');
    }
}
