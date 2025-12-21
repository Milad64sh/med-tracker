<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestockLog;
use Illuminate\Http\Request;

class RestockLogController extends Controller
{
public function index(Request $request)
{
    $q = RestockLog::query()
        ->with([
            'user:id,name,email',
            'course:id,name,strength,client_id',
            'client:id,initials',
        ])
        ->orderByDesc('created_at');

if ($request->filled('user_name')) {
    $name = mb_strtolower($request->input('user_name'));

    $q->whereHas('user', function ($uq) use ($name) {
        $uq->whereRaw('LOWER(name) LIKE ?', ['%' . $name . '%']);
    });
}

if ($request->filled('client_initials')) {
    $initials = mb_strtolower($request->input('client_initials'));

    $q->whereHas('client', function ($cq) use ($initials) {
        $cq->whereRaw('LOWER(initials) LIKE ?', ['%' . $initials . '%']);
    });
}


    // date range (created_at)
    if ($request->filled('date_from')) {
        $q->whereDate('created_at', '>=', $request->input('date_from'));
    }

    if ($request->filled('date_to')) {
        $q->whereDate('created_at', '<=', $request->input('date_to'));
    }

    return response()->json($q->paginate(25));
}

}
