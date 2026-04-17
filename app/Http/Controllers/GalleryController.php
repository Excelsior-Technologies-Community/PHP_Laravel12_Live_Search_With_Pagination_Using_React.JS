<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * Display all gallery records.
     * Data is passed to Blade, and React consumes it via window.galleriesData.
     */
    public function index()
    {
        // Fetch all galleries ordered by ID in ascending order
        $galleries = Gallery::orderBy('id', 'asc')->get();

        // Pass galleries data to Blade view
        return view('gallery', compact('galleries'));
    }

    /**
     * Store a new gallery record.
     * Handles form validation and multiple image uploads.
     */
    public function store(Request $request)
    {
        $paths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $paths[] = $img->store('gallery', 'public');
            }
        }

        $gallery = Gallery::create([
            'title' => $request->title,
            'description' => $request->description,
            'images' => $paths,
            'status' => $request->status,
            'created_by' => 1,
        ]);

        return response()->json($gallery);
    }



    /**
     * Fetch a single gallery record for editing.
     * Returns JSON response used by React.
     */
    public function edit($id)
    {
        // Find gallery by ID or throw 404 error
        $gallery = Gallery::findOrFail($id);

        // Return gallery data as JSON for React editing
        return response()->json($gallery);
    }

    /**
     * Update an existing gallery record.
     * Keeps existing images and appends new uploaded images.
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $images = $request->existing_images ?? [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $images[] = $file->store('gallery', 'public');
            }
        }

        $gallery->update([
            'title' => $request->title,
            'description' => $request->description,
            'images' => $images,
            'status' => $request->status,
        ]);

        return response()->json($gallery);
    }
    /**
     * Delete a gallery record.
     * Used by React via fetch API.
     */
    public function destroy($id)
    {
        // Find gallery by ID
        $gallery = Gallery::findOrFail($id);

        // Soft delete the gallery record
        $gallery->delete(); // Can also use status=0 if needed

        // Return JSON response for React
        return response()->json(['success' => true]);
    }
}
