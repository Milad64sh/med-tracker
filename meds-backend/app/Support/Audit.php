<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class Audit
{
    public static function log(
        ?int $actorUserId,
        string $action,
        string $entityType,
        int $entityId,
        array $metadata = [],
        ?Request $request = null
    ): void {
        AuditLog::create([
            'actor_user_id' => $actorUserId,
            'action'        => $action,
            'entity_type'   => $entityType,
            'entity_id'     => $entityId,
            'metadata'      => $metadata ?: null,
            'ip_address'    => $request?->ip(),
            'user_agent'    => $request?->userAgent(),
            'http_method'   => $request?->method(),
            'path'          => $request?->path(),
            'full_url'      => $request ? $request->fullUrl() : null,
        ]);
    }
}
