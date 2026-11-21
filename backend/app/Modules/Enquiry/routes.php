<?php

use App\Modules\Enquiry\Http\Controllers\Admin\EnquiryAdminController;
use App\Modules\Enquiry\Http\Controllers\EnquiryController;
use Illuminate\Support\Facades\Route;

// Public: anti-spam rate limit per IP.
Route::post('enquiries', [EnquiryController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('enquiries.store');

// Admin "Queries" page.
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('enquiries', [EnquiryAdminController::class, 'index'])->name('admin.enquiries.index');
    Route::patch('enquiries/{id}', [EnquiryAdminController::class, 'update'])
        ->whereNumber('id')
        ->name('admin.enquiries.update');
});
