@component('mail::message')
# Repeat Prescription Request – Medication Running Low

Dear GP Practice,

This is an automated notification from Kind2U Living regarding one of the individuals we support.

**Client initials:** {{ $data['client_initials'] }}  
**Date of birth:** {{ $data['dob'] }}

**Medication:** {{ $data['medication'] }}

We wish to inform you that the above medication is running low and will require a repeat prescription.

@if(!empty($data['units_remaining']))
**Estimated tablets remaining:** {{ $data['units_remaining'] }}
@endif

@if(!empty($data['runout_date']))
**Estimated run-out date:** {{ $data['runout_date'] }}
@endif

We would be grateful if you could arrange a repeat prescription at your earliest convenience.  
If any further information is required, please contact us.

Kind regards,  
Kind2U Living Team
@endcomponent
