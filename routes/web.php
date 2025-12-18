<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GalleryController;


Route::get('/', function () {
    return view('welcome');
});


// Gallery index (list)
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

// Store new gallery
Route::post('/gallery/store', [GalleryController::class, 'store'])->name('gallery.store');

// Edit gallery (return JSON for React)
Route::get('/gallery/{id}/edit', [GalleryController::class, 'edit'])->name('gallery.edit');

// Update gallery
Route::post('/gallery/{id}/update', [GalleryController::class, 'update'])->name('gallery.update');

// Delete gallery (AJAX)
Route::post('/gallery/{id}/delete', [GalleryController::class, 'destroy'])->name('gallery.destroy');
