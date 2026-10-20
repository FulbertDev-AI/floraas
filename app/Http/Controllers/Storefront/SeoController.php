<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Collection as ProductCollection;
use App\Models\Product;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /cart',
            'Disallow: /checkout',
            'Sitemap: '.$this->canonicalRoute('sitemap'),
        ]);

        return response($content."\n")
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function sitemap(): Response
    {
        $urls = [
            ['loc' => $this->canonicalRoute('home'), 'lastmod' => null],
            ['loc' => $this->canonicalRoute('shop.index'), 'lastmod' => null],
        ];

        Product::query()
            ->published()
            ->select(['slug', 'updated_at'])
            ->orderBy('slug')
            ->get()
            ->each(function (Product $product) use (&$urls): void {
                $urls[] = [
                    'loc' => $this->canonicalRoute('products.show', ['product' => $product->slug]),
                    'lastmod' => $product->updated_at?->toAtomString(),
                ];
            });

        Category::query()
            ->where('is_published', true)
            ->select(['slug', 'updated_at'])
            ->orderBy('slug')
            ->get()
            ->each(function (Category $category) use (&$urls): void {
                $urls[] = [
                    'loc' => $this->canonicalRoute('categories.show', ['category' => $category->slug]),
                    'lastmod' => $category->updated_at?->toAtomString(),
                ];
            });

        ProductCollection::query()
            ->where('is_published', true)
            ->select(['slug', 'updated_at'])
            ->orderBy('slug')
            ->get()
            ->each(function (ProductCollection $collection) use (&$urls): void {
                $urls[] = [
                    'loc' => $this->canonicalRoute('collections.show', ['collection' => $collection->slug]),
                    'lastmod' => $collection->updated_at?->toAtomString(),
                ];
            });

        return response($this->renderSitemap($urls))
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    /**
     * @param  list<array{loc: string, lastmod: ?string}>  $urls
     */
    private function renderSitemap(array $urls): string
    {
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($urls as $url) {
            $xml .= '<url><loc>'.htmlspecialchars($url['loc'], ENT_XML1 | ENT_QUOTES, 'UTF-8').'</loc>';

            if ($url['lastmod'] !== null) {
                $xml .= '<lastmod>'.htmlspecialchars($url['lastmod'], ENT_XML1 | ENT_QUOTES, 'UTF-8').'</lastmod>';
            }

            $xml .= '</url>';
        }

        return $xml.'</urlset>';
    }

    /**
     * @param  array<string, string>  $parameters
     */
    private function canonicalRoute(string $name, array $parameters = []): string
    {
        return rtrim((string) config('app.url'), '/').route($name, $parameters, false);
    }
}
