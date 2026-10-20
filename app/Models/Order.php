<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUS_PENDING_CONFIGURATION = 'pending_configuration';

    public const STATUS_CONTACTED = 'contacted';

    public const STATUS_CANCELLED = 'cancelled';

    public const PAYMENT_NOT_STARTED = 'not_started';

    public const PAYMENT_LABELS = [
        self::PAYMENT_NOT_STARTED => 'Non démarré',
    ];

    public const STATUS_LABELS = [
        self::STATUS_PENDING_CONFIGURATION => 'En attente de configuration',
        self::STATUS_CONTACTED => 'Client contacté',
        self::STATUS_CANCELLED => 'Annulée',
    ];

    protected $fillable = [
        'reference',
        'submission_key',
        'user_id',
        'contact_name',
        'email',
        'phone',
        'status',
        'payment_status',
        'currency',
        'subtotal_minor',
        'shipping_minor',
        'total_minor',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_minor' => 'integer',
            'shipping_minor' => 'integer',
            'total_minor' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function canTransitionTo(string $status): bool
    {
        return match ($this->status) {
            self::STATUS_PENDING_CONFIGURATION => in_array($status, [
                self::STATUS_CONTACTED,
                self::STATUS_CANCELLED,
            ], true),
            self::STATUS_CONTACTED => $status === self::STATUS_CANCELLED,
            default => false,
        };
    }
}
