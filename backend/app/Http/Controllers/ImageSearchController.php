<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ImageSearchController extends Controller
{
    private const PIXABAY_API_URL = 'https://pixabay.com/api/';
    private const CACHE_TTL = 600; // 10 minutes
    private const REQUEST_TIMEOUT = 5; // seconds

    /**
     * Search images from Pixabay API
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:20',
            'order' => 'sometimes|string|in:latest,popular',
            'safesearch' => 'sometimes|string|in:true,false,1,0',
        ]);

        $query = $validated['q'];
        $perPage = $validated['per_page'] ?? 20;
        $order = $validated['order'] ?? 'latest';
        // 文字列の"true"/"false"または"1"/"0"をbooleanに変換
        $safesearch = isset($validated['safesearch']) 
            ? in_array($validated['safesearch'], ['true', '1'], true)
            : false;

        // Create cache key
        $cacheKey = "pixabay_search:{$query}:{$perPage}:{$order}:" . ($safesearch ? '1' : '0');

        // Try to get from cache
        $cachedResult = Cache::get($cacheKey);
        if ($cachedResult !== null) {
            return response()->json($cachedResult);
        }

        // Get API key from config
        $apiKey = config('services.pixabay.key');
        if (!$apiKey) {
            return response()->json([
                'error' => 'Pixabay APIキーが設定されていません',
            ], 500);
        }

        try {
            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->get(self::PIXABAY_API_URL, [
                    'key' => $apiKey,
                    'q' => $query,
                    'image_type' => 'photo',
                    'per_page' => $perPage,
                    'order' => $order,
                    'safesearch' => $safesearch ? 'true' : 'false',
                ]);

            if (!$response->successful()) {
                Log::error('Pixabay API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'error' => '画像の取得に失敗しました',
                ], $response->status());
            }

            $data = $response->json();

            // Transform response to match frontend needs
            $result = [
                'total' => $data['total'] ?? 0,
                'totalHits' => $data['totalHits'] ?? 0,
                'hits' => array_map(function ($hit) {
                    return [
                        'id' => $hit['id'],
                        'pageURL' => $hit['pageURL'],
                        'type' => $hit['type'],
                        'tags' => $hit['tags'],
                        'previewURL' => $hit['previewURL'],
                        'previewWidth' => $hit['previewWidth'],
                        'previewHeight' => $hit['previewHeight'],
                        'webformatURL' => $hit['webformatURL'],
                        'webformatWidth' => $hit['webformatWidth'],
                        'webformatHeight' => $hit['webformatHeight'],
                        'largeImageURL' => $hit['largeImageURL'],
                        'imageWidth' => $hit['imageWidth'],
                        'imageHeight' => $hit['imageHeight'],
                        'imageSize' => $hit['imageSize'],
                        'views' => $hit['views'],
                        'downloads' => $hit['downloads'],
                        'collections' => $hit['collections'],
                        'likes' => $hit['likes'],
                        'comments' => $hit['comments'],
                        'user_id' => $hit['user_id'],
                        'user' => $hit['user'],
                        'userImageURL' => $hit['userImageURL'] ?? null,
                    ];
                }, $data['hits'] ?? []),
            ];

            // Cache the result
            Cache::put($cacheKey, $result, self::CACHE_TTL);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Pixabay API exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => '画像の取得中にエラーが発生しました',
            ], 500);
        }
    }
}

