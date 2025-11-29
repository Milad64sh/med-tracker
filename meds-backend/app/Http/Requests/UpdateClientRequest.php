<?php
// app/Http/Requests/UpdateClientRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'initials'   => ['required','string','max:50'],
            'dob'        => ['nullable','date'],
            'service_id' => ['nullable','integer','exists:services,id'],
            'gp_email' => ['nullable', 'email', 'max:255'],
        ];
    }
}
