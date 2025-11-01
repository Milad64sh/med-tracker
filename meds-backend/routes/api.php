<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;
use App\Models\Client;
use App\Models\MedicationCourse;

Route::get('/ping', fn () => ['ok' => true]);
Route::post('/clients',[ClientController::class,'store']);
Route::post('/courses',[CourseController::class,'store']);

Route::get('/clients/{client}', fn (Client $client) => $client->load('courses'));
Route::get('/courses/{course}', fn (MedicationCourse $course) => $course->load('client','schedules'));