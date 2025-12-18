<!DOCTYPE html>
<html>
<head>
    <title>React Repeater Form</title>

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
