<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;
use App\Models\Client;
use App\Models\MedicationCourse;


Route::post('/clients',[ClientController::class,'store']);

Route::get('/clients/{client}', fn (Client $client) => $client->load('courses'));
Route::get('/services', [ServiceController::class, 'index']); // list services (for dropdowns)
Route::get('/clients',  [ClientController::class, 'index']);  // list clients (with service)
Route::get('/clients/{client}', [ClientController::class, 'show']); // view single client


Route::post('/courses',[CourseController::class,'store']);
Route::get('/courses/{course}', fn (MedicationCourse $course) => $course->load('client','schedules'));