<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;

// AUTH
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::match(['put', 'patch'], '/auth/me', [AuthController::class, 'update']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/alerts/email-gp', [DashboardController::class, 'emailGp']);
});

// CLIENT
Route::post('/clients',[ClientController::class,'store']);

Route::get('/clients',  [ClientController::class, 'index']);
Route::get('/clients/lookup', [ClientController::class, 'lookup']); // <-- move this up
Route::get('/clients/{client}', [ClientController::class, 'show']);
Route::match(['put','patch'], '/clients/{client}', [ClientController::class, 'update']);
Route::delete('/clients/{client}', [ClientController::class, 'destroy']); 



// SERVICES

Route::get('/services/lookup', [ServiceController::class, 'lookup']);

Route::get('/services', [ServiceController::class, 'index']);
Route::post('/services', [ServiceController::class, 'store']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::match(['put', 'patch'], '/services/{service}', [ServiceController::class, 'update']);
Route::delete('/services/{service}', [ServiceController::class, 'destroy']);



// COURSE

Route::get('/courses', [CourseController::class, 'index']);
Route::post('/courses', [CourseController::class, 'store']);
Route::get('/courses/{course}', [CourseController::class, 'show']);
Route::match(['put', 'patch'], '/courses/{course}', [CourseController::class, 'update']); // 👈 NEW
Route::delete('/courses/{course}', [CourseController::class, 'destroy']);



// DASHBOARD
Route::get('/dashboard', [DashboardController::class, 'index']);

// RESTOCK

Route::patch('/courses/{course}/restock', [CourseController::class, 'restock']);