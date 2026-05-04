<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index()
    {
        $galleries = Gallery::orderBy('id', 'desc')->get();
        return view('gallery', compact('galleries'));
    }

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

    public function edit($id)
    {
        $gallery = Gallery::findOrFail($id);
        return response()->json($gallery);
    }

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

    public function toggleStatus($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->update(['status' => !$gallery->status]);

        return response()->json(['success' => true, 'status' => $gallery->status]);
    }

    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->delete();

        return response()->json(['success' => true]);
    }

    public function bulkDelete(Request $request)
    {
        Gallery::whereIn('id', $request->ids)->delete();

        return response()->json(['success' => true]);
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        $results = Gallery::where('title', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($results);
    }
}