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
        // Validate required fields and image formats
        $request->validate([
            'title' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png'
        ]);

        // Array to store uploaded image paths
        $paths = [];

        // Upload images if present
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                // Store image in storage/app/public/gallery
                $paths[] = $img->store('gallery', 'public');
            }
        }

        // Create new gallery record
        Gallery::create([
            'title' => $request->title,
            'description' => $request->description,
            'images' => $paths,     // Stored as JSON
            'status' => $request->status,
            'created_by' => 1,      // Static user ID (can be replaced with auth user)
        ]);

        // Redirect back with success message
        return redirect()->back()->with('success', 'Gallery Created Successfully');
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
        // Find gallery by ID
        $gallery = Gallery::findOrFail($id);

        // Validate form data
        $request->validate([
            'title' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png',
        ]);

        // Get existing images from hidden input
        $paths = $request->input('existing_images', []);

        // Upload and append new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $paths[] = $img->store('gallery', 'public');
            }
        }

        // Update gallery record
        $gallery->update([
            'title' => $request->title,
            'description' => $request->description,
            'images' => $paths,     // Updated image list
            'status' => $request->status,
            'updated_by' => 1,      // Static user ID
        ]);

        // Redirect back with success message
        return redirect()->back()->with('success', 'Gallery Updated Successfully');
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
