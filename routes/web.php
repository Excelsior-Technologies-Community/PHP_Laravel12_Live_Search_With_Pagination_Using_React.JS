<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GalleryController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');
Route::post('/gallery/store', [GalleryController::class, 'store'])->name('gallery.store');
Route::get('/gallery/{id}/edit', [GalleryController::class, 'edit'])->name('gallery.edit');
Route::post('/gallery/{id}/update', [GalleryController::class, 'update'])->name('gallery.update');
Route::post('/gallery/{id}/delete', [GalleryController::class, 'destroy'])->name('gallery.destroy');

Route::post('/gallery/{id}/toggle', [GalleryController::class, 'toggleStatus'])->name('gallery.toggle');
Route::post('/gallery/bulk-delete', [GalleryController::class, 'bulkDelete'])->name('gallery.bulk_delete');
Route::get('/gallery/live-search', [GalleryController::class, 'search'])->name('gallery.search');