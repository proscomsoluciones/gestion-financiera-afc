<?php

use App\Http\Controllers\ClubController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('clubs', ClubController::class)
        ->middlewareFor(['index', 'show'], 'permission:clubs.view')
        ->middlewareFor(['create', 'store', 'edit', 'update', 'destroy'], 'permission:clubs.manage');

    Route::get('/transactions/{transaction}/pdf', [TransactionController::class, 'downloadPdf'])
        ->name('transactions.pdf')
        ->middleware('permission:transactions.view');

    Route::resource('transactions', TransactionController::class)
        ->middlewareFor(['index', 'show'], 'permission:transactions.view')
        ->middlewareFor(['create', 'store', 'edit', 'update', 'destroy'], 'permission:transactions.manage');

    // Executive Financial Reports Routes
    Route::middleware('permission:reports.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/libro-respaldos-pdf', [ReportController::class, 'downloadLibroRespaldosPdf'])->name('reports.libro-respaldos-pdf');
        Route::get('/reports/monthly-pdf', [ReportController::class, 'downloadMonthlyPdf'])->name('reports.monthly-pdf');
        Route::get('/reports/annual-balance-pdf', [ReportController::class, 'downloadAnnualBalancePdf'])->name('reports.annual-balance-pdf');
        Route::get('/reports/club-statement-pdf/{club}', [ReportController::class, 'downloadClubStatementPdf'])->name('reports.club-statement-pdf');
        Route::get('/reports/club-certificate-pdf/{club}', [ReportController::class, 'downloadClubCertificatePdf'])->name('reports.club-certificate-pdf');
        Route::get('/reports/arfa-rendicion-pdf', [ReportController::class, 'downloadArfaRendicionPdf'])->name('reports.arfa-rendicion-pdf');
        Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');
    });

    Route::middleware('permission:settings.manage')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    });

    Route::middleware('permission:users.manage')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/auth.php';
