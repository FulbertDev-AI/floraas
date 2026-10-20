<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CollectionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StoreSettingsController;
use App\Http\Controllers\Storefront\AccountController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CatalogController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/', [HomeController::class, '__invoke'])->name('home');
Route::get('/shop', [CatalogController::class, 'index'])->name('shop.index');
Route::get('/categories/{category:slug}', [CatalogController::class, 'category'])
    ->name('categories.show');
Route::get('/collections/{collection:slug}', [CatalogController::class, 'collection'])
    ->name('collections.show');
Route::get('/products/{product:slug}', [CatalogController::class, 'show'])
    ->name('products.show');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/confirmation', [CheckoutController::class, 'confirmation'])->name('checkout.confirmation');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{product}', [CartController::class, 'update'])
    ->whereNumber('product')
    ->name('cart.items.update');
Route::delete('/cart/items/{product}', [CartController::class, 'destroy'])
    ->whereNumber('product')
    ->name('cart.items.destroy');

Route::prefix('account')->name('account.')->middleware('auth')->group(function (): void {
    Route::get('/', [AccountController::class, 'index'])->name('index');
    Route::get('/orders/{order}', [AccountController::class, 'show'])
        ->whereNumber('order')
        ->name('orders.show');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function (): void {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::resource('products', ProductController::class)->except('show');
    Route::resource('categories', CategoryController::class)->except('show');
    Route::resource('collections', CollectionController::class)->except('show');
    Route::get('/settings', [StoreSettingsController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [StoreSettingsController::class, 'update'])->name('settings.update');
});
