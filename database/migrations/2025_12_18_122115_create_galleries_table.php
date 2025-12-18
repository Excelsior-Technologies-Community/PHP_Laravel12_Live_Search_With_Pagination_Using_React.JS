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
