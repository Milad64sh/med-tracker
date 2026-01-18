<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InviteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RestockLogController;
use App\Http\Controllers\Api\AlertsController;
use App\Http\Controllers\Api\AuditLogController;

// AUTH (public)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Everything below requires a valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {

    // AUTH (private)
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::match(['put', 'patch'], '/auth/me', [AuthController::class, 'update']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ALERTS
    Route::post('/alerts/email-gp', [AlertsController::class, 'emailGp']);

    // CLIENTS
    Route::get('/clients/lookup', [ClientController::class, 'lookup']);
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::match(['put','patch'], '/clients/{client}', [ClientController::class, 'update']);

    // COURSES
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::match(['put', 'patch'], '/courses/{course}', [CourseController::class, 'update']);
    Route::patch('/courses/{course}/restock', [CourseController::class, 'restock']);
    Route::patch('/courses/{course}/adjust-stock', [CourseController::class, 'adjustStock']);


    // SERVICES (read-only)
    Route::get('/services/lookup', [ServiceController::class, 'lookup']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);

    // ALERT WORKFLOW
    Route::post('/alerts/{course}/acknowledge', [AlertsController::class, 'acknowledge']);
    Route::post('/alerts/{course}/snooze', [AlertsController::class, 'snooze']);
    Route::post('/alerts/{course}/unsnooze', [AlertsController::class, 'unsnooze']);

    // ADMIN
Route::middleware('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);

    // Admin can update name/email only (controller restricts)
    Route::patch('/users/{user}', [UserController::class, 'update']);
    // SERVICES (admin)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::match(['put','patch'], '/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);


    Route::middleware('owner')->group(function () {
        Route::post('/invites', [InviteController::class, 'store']);
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::patch('/users/{user}/admin', [UserController::class, 'setAdmin']);
    });
});

});

