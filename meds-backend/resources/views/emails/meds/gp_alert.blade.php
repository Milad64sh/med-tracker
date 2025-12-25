@component('mail::message')
# Repeat Prescription Request – Medication Running Low

Dear GP Practice,

This is an automated notification from Kind2U Living regarding one of the individuals we support.

**Client initials/name:** {{ $data['client_name'] }}
**Date of birth:** {{ $data['dob'] }}

@if(!empty($data['service_name']))
**Service:** {{ $data['service_name'] }}
@endif

The following medication(s) are running low and may require a repeat prescription:

@component('mail::table')
| Medication | Status | Units remaining | Run-out date |
|:--|:--|--:|:--|
@foreach($data['medications'] as $m)
| {{ $m['medication'] ?? '—' }} | {{ $m['status'] ?? '—' }} | {{ $m['units_remaining'] ?? '—' }} | {{ $m['runout_date'] ?? '—' }} |
@endforeach
@endcomponent

Kind regards,  
Kind2U Living Team
@endcomponent
