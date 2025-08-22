<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentHistory extends Model
{
    protected $table = 'document_history';
    
    protected $fillable = [
        'document_id',
        'title',
        'content',
        'version',
        'updated_by',
        'change_summary',
    ];
    
    /**
     * Get the document this history belongs to.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
    
    /**
     * Get the user who made this change.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}