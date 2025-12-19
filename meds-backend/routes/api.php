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
    // USER
    Route::get('/users', [UserController::class, 'index']);
    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index']);
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

    // SERVICES (read-only)
    Route::get('/services/lookup', [ServiceController::class, 'lookup']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);

    // ADMIN-ONLY
    Route::middleware('admin')->group(function () {
        // invites
        Route::post('/invites', [InviteController::class, 'store']);
        // services write
        Route::post('/services', [ServiceController::class, 'store']);
        Route::match(['put', 'patch'], '/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        // destructive
        Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/restock-logs', [RestockLogController::class, 'index']);

        Route::post('/users', [UserController::class, 'store']);           // optional
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::patch('/users/{user}/admin', [UserController::class, 'setAdmin']);
    });
});
