<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'content',
        'version',
        'updated_by',
    ];
    
    /**
     * Get the user who last updated the document.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    
    /**
     * Get the document's history.
     */
    public function history(): HasMany
    {
        return $this->hasMany(DocumentHistory::class)->orderBy('created_at', 'desc');
    }
    
    /**
     * Create a history record before updating
     */
    public function saveToHistory($changeSummary = null)
    {
        DocumentHistory::create([
            'document_id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'version' => $this->version,
            'updated_by' => $this->updated_by,
            'change_summary' => $changeSummary,
        ]);
    }
    
    /**
     * Update document with new version
     */
    public function updateWithVersion($data, $userId, $changeSummary = null)
    {
        // Save current version to history
        $this->saveToHistory($changeSummary);
        
        // Increment version
        $currentVersion = $this->version;
        $versionParts = explode('.', $currentVersion);
        $versionParts[1] = (int)$versionParts[1] + 1;
        $newVersion = implode('.', $versionParts);
        
        // Update document
        $this->update([
            'title' => $data['title'] ?? $this->title,
            'content' => $data['content'],
            'version' => $newVersion,
            'updated_by' => $userId,
        ]);
        
        return $this;
    }
}