<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Models\Client;
use App\Models\MedicationCourse;

// CLIENT
Route::post('/clients',[ClientController::class,'store']);

Route::get('/clients',  [ClientController::class, 'index']);  // list clients (with service)
Route::get('/clients/{client}', [ClientController::class, 'show']); // view single client
Route::get('/clients/lookup', [ClientController::class, 'lookup']);


// SERVICES
Route::get('/services', [ServiceController::class, 'index']); // list services (for dropdowns)

// COURSE
Route::post('/courses',[CourseController::class,'store']);
Route::get('/courses/{course}', fn (MedicationCourse $course) => $course->load('client','schedules'));

// DASHBOARD
Route::get('/dashboard', [DashboardController::class, 'index']);