# PHP_Laravel12_Live_Search_With_Pagination_Using_React.JS


This project demonstrates a Laravel 12 + React.js application with live search and pagination functionality. It allows creating, editing, deleting, and listing products or gallery items with status, created_by, updated_by, and soft deletes.

All front-end operations are handled via React with Web routes, and the data is passed passed from Laravel Blade to React using window.galleriesData.

---


## Project Features

- Live search: Filter products by ID, Title, Description, Status (Active/Inactive).

- Pagination: Works dynamically with filtered results.

- CRUD operations: Add, edit, delete items using React components.

- Soft delete: Uses Laravel deleted_at column.

- No APIs: Data is passed from Laravel Blade to React using window.galleriesData.

- Multiple fields handled: Includes status, created_by, updated_by.

---


## Project Overview

- Laravel 12 backend for data handling and storage.
- React.js frontend integrated using **Vite**.
- Dynamic repeater for adding multiple images.
- Handles **Create**, **Edit**, and **Delete** operations.
- Images are stored in `storage/app/public/gallery` with proper `storage:link`.

---

## Project Structure

```
PHP_Laravel12_Live_Search_With_Pagination_Using_React.JS/
├── app/                                # Main application folder
│   ├── Http/
│   │   └── Controllers/
│   │       └── GalleryController.php   # Controller handling gallery CRUD operations
│   └── Models/
│       └── Gallery.php                 # Eloquent model for the galleries table
├── database/
│   └── migrations/
│       └── 2025_12_17_000000_create_galleries_table.php  # Migration file to create galleries table
├── public/
│   ├── storage/                        # Symbolic link (created by `php artisan storage:link`)
│   │   └── gallery/                    # Publicly accessible gallery images
│   
├── resources/
│   ├── js/
│   │   ├── app.js                       # React entry file that mounts GalleryForm.jsx
│   │   └── GalleryForm.jsx             # React component for gallery form and index (list)
│   └── views/
│       └── gallery.blade.php           # Blade template that mounts the React app
├── routes/
│   └── web.php                         # Routes file for web routes (gallery CRUD)
├── storage/
│   └── app/
│       └── public/
│           └── gallery/                # Uploaded gallery images are stored here
├── .env                                # Environment configuration file (DB, APP_URL, etc.)
├── README.md                           # Project documentation with setup instructions
└── vite.config.js                      # Vite configuration file for Laravel + React + Tailwind
```

---


## Installation & Setup

## Step 1: Create Laravel 12 Project

Run the following command to create the project:

```bash
composer create-project laravel/laravel PHP_Laravel12_Live_Search_With_Pagination_Using_React.JS "12.*"
```

---

## Step 2: Install Node & React dependencies

```bash
cd PHP_Laravel12_Live_Search_With_Pagination_Using_React.JS

npm install
npm run dev
npm install react react-dom
npm install -D @vitejs/plugin-react
```

---

## Step 3: Configure Vite for React

Make sure vite.config.js includes:

```
import { defineConfig } from 'vite';                   // Import Vite's defineConfig function
import laravel from 'laravel-vite-plugin';            // Import Laravel plugin for Vite
import react from '@vitejs/plugin-react';             // Import React plugin for Vite
import tailwindcss from '@tailwindcss/vite';          // Import TailwindCSS plugin for Vite

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],  // Entry points for CSS and JS
            refresh: true,                                            // Enable automatic refresh on changes
        }),
        react(),       // Enable React support
        tailwindcss(), // Enable TailwindCSS support
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'], // Ignore Laravel view cache files to avoid unnecessary reloads
        },
    },
});
```

---


## Step 4: Create React Entry File (app.js) 

File: resources/js/app.js

```
/**
 * Main JavaScript entry file for Laravel + React
 * Vite loads this file first
 */

// Import React component
import './GalleryForm.jsx';
```


---



## Step 5: Configure .env File

Open your .env file and configure your database connection:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=live_search_pagination
DB_USERNAME=root
DB_PASSWORD=
```

Make sure you create the database live_search_pagination in your MySQL before running migrations.

Run Migration:

```
php artisan migrate
```

This will create the database live_search_pagination.

---


## Step 6: Create Model & Migration (Gallery)

Run the following command to create the Gallery model along with its migration file:

```
php artisan make:model Gallery -m
```

This command will create:

app/Models/Gallery.php → Model

database/migrations/2025_12_17_000000_create_galleries_table.php → Migration


#### 6.1 Galleries Migration

Open database/migrations/2025_12_17_000000_create_galleries_table.php:

```
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    /**
     * Run the migrations.
     * This method is executed when running: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {

            // Primary key (auto-increment ID)
            $table->id();

            // Gallery title
            $table->string('title');

            // Optional description for gallery
            $table->text('description')->nullable();

            // Store multiple image paths as JSON array
            // Example: ["gallery/img1.jpg", "gallery/img2.jpg"]
            $table->json('images')->nullable();

            // Status flag (1 = Active, 0 = Inactive)
            $table->boolean('status')->default(1);

            // User ID who created the gallery
            $table->integer('created_by')->nullable();

            // User ID who last updated the gallery
            $table->integer('updated_by')->nullable();

            // Soft delete column (deleted_at)
            // Allows records to be "deleted" without removing from database
            $table->softDeletes();

            // created_at and updated_at timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     * This method is executed when running: php artisan migrate:rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
```

#### 6.2 Gallery Model

Open app/Models/Gallery.php and update it as follows:

```
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gallery extends Model
{
    // Enable soft delete functionality
    // This allows records to be "deleted" without permanently removing them
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     * These fields can be filled using create() or update() methods.
     */
    protected $fillable = [
        'title',        // Gallery title
        'description',  // Optional gallery description
        'images',       // JSON field storing multiple image paths
        'status',       // Active (1) or Inactive (0)
        'created_by',   // ID of user who created the record
        'updated_by'    // ID of user who last updated the record
    ];

    /**
     * The attributes that should be type-casted.
     * Automatically converts JSON 'images' field into PHP array.
     */
    protected $casts = [
        'images' => 'array',
    ];
}
```

Explanation:

$fillable → Allows mass assignment when using Gallery::create() or update()

$casts → Converts images JSON column into an array automatically


#### 6.3 Run Migration

After setting up the model and migration, run:

```
php artisan migrate
```

This will create the galleries table in the database.


---


## Step 7: Create Storage Symlink (Important)

Since gallery images are uploaded to:

storage/app/public/gallery

Laravel needs a symbolic link so the browser can access these files.

Run the following command:

```bash
php artisan storage:link
```

---


## Step 8: Create Controller

Generate the controller:

```
php artisan make:controller GalleryController
```

Update GalleryController.php as follows:

```
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

```

---


## Step 9: Add Routes

File: routes/web.php:

```
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
```

---


## Step 10: Create React Component

Create resources/js/GalleryForm.jsx:

This GalleryForm.jsx file contains two main React components:

GalleryForm – Handles creating and editing galleries, including title, description, status, and multiple images with a dynamic repeater. It also supports previewing existing images and removing them.

GalleryIndex – Displays the gallery list with live search, pagination, and add/edit/delete functionality. It manages the view switching between the list and form.

Finally, the app is rendered into the Blade template using createRoot, passing initial data from window.galleriesData.

```
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * GalleryForm Component
 * Used for both CREATE and EDIT gallery
 */
function GalleryForm({ gallery, onBack }) {

    // Form state management
    const [title, setTitle] = useState(gallery?.title ?? '');
    const [description, setDescription] = useState(gallery?.description ?? '');
    const [status, setStatus] = useState(gallery?.status ?? 1);

    /**
     * Images state
     * - existing images come from database
     * - new images are selected via file input
     */
    const [images, setImages] = useState(
        gallery?.images?.map(img => ({ type: 'existing', value: img })) 
        || [{ type: 'new', value: null }]
    );

    // Add a new empty image input field
    const addImage = () => setImages([...images, { type: 'new', value: null }]);

    // Remove image field by index
    const removeImage = (i) => setImages(images.filter((_, index) => index !== i));

    // Handle file selection for new image
    const handleNewFileChange = (e, index) => {
        const file = e.target.files[0];
        const updated = [...images];
        updated[index] = { type: 'new', value: file };
        setImages(updated);
    };

    return (
        <div>

            {/* Back button to return to gallery list */}
            <button className="btn btn-secondary mb-3" onClick={onBack}>
                ← Back to List
            </button>

            {/* Gallery Create / Update Form */}
            <form
                method="POST"
                action={gallery ? `/gallery/${gallery.id}/update` : '/gallery/store'}
                encType="multipart/form-data"
            >
                {/* CSRF Token for Laravel security */}
                <input
                    type="hidden"
                    name="_token"
                    value={document.querySelector('meta[name="csrf-token"]').content}
                />

                {/* Form Title */}
                <h3>{gallery ? 'Edit Gallery' : 'Create Gallery'}</h3>

                {/* Title Field */}
                <label className="form-label" htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    value={title}
                    placeholder="Enter title"
                    onChange={e => setTitle(e.target.value)}
                    className="form-control mb-3"
                />

                {/* Description Field */}
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={description}
                    placeholder="Enter description"
                    onChange={e => setDescription(e.target.value)}
                    className="form-control mb-3"
                ></textarea>

                {/* Images Repeater Section */}
                <label className="form-label">Images</label>
                {images.map((imgObj, index) => (
                    <div key={index} className="d-flex mb-2 align-items-center">

                        {/* File input for image upload */}
                        <input
                            type="file"
                            name="images[]"
                            className="form-control"
                            onChange={(e) => handleNewFileChange(e, index)}
                        />

                        {/* Preview existing image */}
                        {imgObj.type === 'existing' && (
                            <img
                                src={`/storage/${imgObj.value}`}
                                width="50"
                                className="ms-2"
                            />
                        )}

                        {/* Remove image button */}
                        <button
                            type="button"
                            className="btn btn-danger ms-2"
                            onClick={() => removeImage(index)}
                        >
                            Remove
                        </button>

                        {/* Hidden input to keep existing images on update */}
                        {imgObj.type === 'existing' && (
                            <input
                                type="hidden"
                                name="existing_images[]"
                                value={imgObj.value}
                            />
                        )}
                    </div>
                ))}

                {/* Add new image input */}
                <button
                    type="button"
                    className="btn btn-secondary mb-3"
                    onClick={addImage}
                >
                    + Add Image
                </button>

                <br />

                {/* Status Field */}
                <label className="form-label" htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={status}
                    className="form-control mb-3"
                    onChange={e => setStatus(e.target.value)}
                >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>

                {/* Submit Button */}
                <button className="btn btn-primary">
                    {gallery ? 'Update' : 'Save'}
                </button>
            </form>
        </div>
    );
}

/**
 * GalleryIndex Component
 * Displays gallery list and handles add/edit/delete
 */
function GalleryIndex({ galleries }) {

    /* ===============================
        STATES
    =============================== */

    // Original data
    const [list, setList] = useState(galleries);

    // Live search keyword
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 3; // records per page

    // Edit / Add mode
    const [editingGallery, setEditingGallery] = useState(null);
    const [addingGallery, setAddingGallery] = useState(false);

    /* ===============================
        LIVE SEARCH FILTER
    =============================== */

    const filteredList = list.filter(gallery =>
    // Search by ID (number match)
    gallery.id.toString().includes(search) ||

    // Search by title (case-insensitive)
    gallery.title.toLowerCase().includes(search.toLowerCase()) ||

    // Search by description (case-insensitive)
    (gallery.description ?? '').toLowerCase().includes(search.toLowerCase()) ||

    // Search by status (Active/Inactive)
    (gallery.status ? 'active' : 'inactive').includes(search.toLowerCase())
);

    /* ===============================
        PAGINATION LOGIC
    =============================== */

    const totalPages = Math.ceil(filteredList.length / perPage);

    const paginatedData = filteredList.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    /* ===============================
        DELETE HANDLER
    =============================== */

    const handleDelete = (id) => {
        if (!confirm('Are you sure to delete?')) return;

        setList(list.filter(g => g.id !== id));

        fetch(`/gallery/${id}/delete`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
    };

    /* ===============================
        VIEW SWITCH
    =============================== */

    if (addingGallery) {
        return <GalleryForm gallery={null} onBack={() => setAddingGallery(false)} />;
    }

    if (editingGallery) {
        return <GalleryForm gallery={editingGallery} onBack={() => setEditingGallery(null)} />;
    }

    /* ===============================
        UI
    =============================== */

    return (
        <div>

            <h2 className="mb-3">Gallery List</h2>

            {/* ADD BUTTON */}
            <button
                className="btn btn-primary mb-3"
                onClick={() => setAddingGallery(true)}
            >
                + Add Gallery
            </button>

            {/* LIVE SEARCH INPUT */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // reset page on search
                }}
            />

            {/* TABLE */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Images</th>
                        <th>Status</th>
                        <th width="160">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map(gallery => (
                            <tr key={gallery.id}>
                                <td>{gallery.id}</td>
                                <td>{gallery.title}</td>
                                <td>{gallery.description}</td>
                                <td>
                                    {gallery.images?.map((img, i) => (
                                        <img
                                            key={i}
                                            src={`/storage/${img}`}
                                            width="40"
                                            className="me-1"
                                        />
                                    ))}
                                </td>
                                <td>
                                    {gallery.status ? 'Active' : 'Inactive'}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => setEditingGallery(gallery)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(gallery.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center">

                <button
                    className="btn btn-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    ← Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className="btn btn-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next →
                </button>
            </div>

        </div>
    );
}


/**
 * Render React App
 */
createRoot(document.getElementById('app')).render(
    <GalleryIndex galleries={window.galleriesData} />
);
```

---


## Step 11: Create Blade Template

Create resources/views/gallery.blade.php:

```
<!DOCTYPE html>
<html>
<head>
    <title>React Live Search With Pagination</title>

    <!-- CSRF Token: Used for security in Laravel forms -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Vite React Refresh: Enables hot module replacement for React in Laravel -->
    @viteReactRefresh

    <!-- Include the React component for the gallery form and index -->
    @vite('resources/js/GalleryForm.jsx')

    <!-- Bootstrap CSS for styling the form and table -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container mt-4">
    <!-- This div is the mount point for the React app -->
    <div id="app"></div>
</div>

<script>
    // Pass all galleries data from Laravel to React for rendering the index table
    window.galleriesData = @json($galleries ?? []); 

    // Pass single gallery data for editing (if any) to React
    window.galleryData = @json($gallery ?? null);
</script>

</body>
</html>
```

---


## Step 12: Run the Application

#### 1) Start Laravel Server

```bash
php artisan serve
```
#### 2) Start Vite (Required for React)

```bash
npm run dev
```

#### 3) Open in Browser

Open the following URL:

```bash
http://127.0.0.1:8000/gallery
```

---


## Output

#### Create Gallery

<img width="1918" height="1030" alt="Screenshot 2025-12-18 183909" src="https://github.com/user-attachments/assets/2aeaccbb-38a5-48c3-95ec-3b0d6f54eb01" />

<img width="1919" height="1032" alt="Screenshot 2025-12-18 191721" src="https://github.com/user-attachments/assets/98a6e174-b130-4ee2-9b61-d0252e3b4875" />


#### Gallery List With Pagination (Index) 

<img width="1919" height="1028" alt="Screenshot 2025-12-18 184236" src="https://github.com/user-attachments/assets/80db1b2a-7550-4ead-865b-9cc8ccdbe055" />

<img width="1919" height="1027" alt="Screenshot 2025-12-18 184246" src="https://github.com/user-attachments/assets/b5b36323-8484-4c2e-9634-fac863c07e71" />


#### Edit Gallery

<img width="1919" height="1031" alt="Screenshot 2025-12-18 184004" src="https://github.com/user-attachments/assets/095ca9da-9cf2-467a-91ee-7b6c3cf6fd10" />

<img width="1919" height="1029" alt="Screenshot 2025-12-18 184028" src="https://github.com/user-attachments/assets/f0c8e04c-fc4b-4c23-87e7-3149381b53ad" />


#### Delete Gallery

<img width="1918" height="1033" alt="Screenshot 2025-12-18 184100" src="https://github.com/user-attachments/assets/d595fa45-9bca-43b9-adf5-015d3b42a34d" />

<img width="1919" height="1032" alt="Screenshot 2025-12-18 184110" src="https://github.com/user-attachments/assets/3fd2c760-b986-4087-a14b-d84bb4eb8b2e" />


#### Live Search

<img width="1919" height="1031" alt="Screenshot 2025-12-18 184212" src="https://github.com/user-attachments/assets/125ae0f5-093b-46d2-ba90-2f454045fc39" />


---


Your PHP_Laravel12_Live_Search_With_Pagination_Using_React.JS Project is Now Ready!

