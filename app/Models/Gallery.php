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
