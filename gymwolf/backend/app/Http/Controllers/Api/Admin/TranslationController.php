<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class TranslationController extends Controller
{
    /**
     * Store or update a translation
     */
    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'translations' => 'required|array',
            'translations.en' => 'nullable|string',
            'translations.et' => 'nullable|string',
            'translations.lv' => 'nullable|string',
            'translations.lt' => 'nullable|string',
            'translations.fi' => 'nullable|string',
            'translations.sv' => 'nullable|string',
        ]);

        $key = $request->input('key');
        $translations = $request->input('translations');

        // Languages to update
        $languages = ['en', 'et', 'lv', 'lt', 'fi', 'sv'];

        foreach ($languages as $lang) {
            if (isset($translations[$lang])) {
                $this->updateTranslationFile($lang, $key, $translations[$lang]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Translation saved successfully'
        ]);
    }

    /**
     * Delete a translation
     */
    public function destroy($key)
    {
        $key = urldecode($key);
        
        // Languages to update
        $languages = ['en', 'et', 'lv', 'lt', 'fi', 'sv'];

        foreach ($languages as $lang) {
            $this->deleteFromTranslationFile($lang, $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'Translation deleted successfully'
        ]);
    }

    /**
     * Update a translation file
     */
    private function updateTranslationFile($lang, $key, $value)
    {
        $filePath = base_path("../frontend/messages/{$lang}.json");
        
        if (!File::exists($filePath)) {
            return;
        }

        $content = json_decode(File::get($filePath), true);
        
        // Split the key into parts
        $keys = explode('.', $key);
        
        // Navigate to the correct position in the array
        $current = &$content;
        foreach ($keys as $index => $k) {
            if ($index === count($keys) - 1) {
                // Last key, set the value
                $current[$k] = $value;
            } else {
                // Not the last key, navigate deeper
                if (!isset($current[$k])) {
                    $current[$k] = [];
                }
                $current = &$current[$k];
            }
        }

        // Save the updated content
        File::put($filePath, json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    /**
     * Delete from a translation file
     */
    private function deleteFromTranslationFile($lang, $key)
    {
        $filePath = base_path("../frontend/messages/{$lang}.json");
        
        if (!File::exists($filePath)) {
            return;
        }

        $content = json_decode(File::get($filePath), true);
        
        // Split the key into parts
        $keys = explode('.', $key);
        
        // Navigate to the correct position in the array
        $current = &$content;
        $parent = null;
        $lastKey = null;
        
        foreach ($keys as $index => $k) {
            if ($index === count($keys) - 1) {
                // Last key, delete it
                if (isset($current[$k])) {
                    unset($current[$k]);
                }
            } else {
                // Not the last key, navigate deeper
                if (!isset($current[$k])) {
                    return; // Key doesn't exist
                }
                $parent = &$current;
                $lastKey = $k;
                $current = &$current[$k];
            }
        }

        // Save the updated content
        File::put($filePath, json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}