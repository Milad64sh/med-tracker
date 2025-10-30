<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CourseController;

Route::get('/ping', fn () => ['ok' => true]);
Route::post('/clients',[ClientController::class,'store']);
Route::post('/courses',[CourseController::class,'store']);

