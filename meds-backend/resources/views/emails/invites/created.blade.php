@component('mail::message')
# You’ve been invited

You have been invited to join **Med Tracker**.

@component('mail::button', ['url' => $inviteLink])
Accept invite
@endcomponent

@if($expiresAt)
This invite link expires on **{{ $expiresAt->timezone('Europe/London')->format('D j M Y, H:i') }}**.
@endif

If you weren’t expecting this email, you can ignore it.

Thanks,  
{{ config('app.name') }}
@endcomponent
