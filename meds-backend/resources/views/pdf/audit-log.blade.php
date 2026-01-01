
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
    .muted { color: #666; }
    .header { margin-bottom: 14px; }
    .title { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
    .row { margin: 0 0 3px; }
    .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th, td { border-bottom: 1px solid #eee; padding: 6px 4px; vertical-align: top; }
    th { text-align: left; color: #666; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <p class="title">Audit Log Entry</p>

    <p class="row"><span class="muted">Generated:</span> {{ $generated_at }}</p>
    <p class="row"><span class="muted">Log ID:</span> #{{ $log->id }}</p>

    <p class="row">
      <span class="muted">Action:</span> {{ $log->action }}
      &nbsp; • &nbsp;
      <span class="muted">Time:</span> {{ \Carbon\Carbon::parse($log->created_at)->timezone('Europe/London')->format('d M Y, H:i') }}
    </p>

    <p class="row">
      <span class="muted">Actor:</span> {{ $log->actor?->name ?? 'System' }}
        @if(!empty($log->actor?->email))
          ({{ $log->actor?->email }})
        @endif
    </p>

    <p class="row">
      <span class="muted">Entity:</span>
      {{ class_basename($log->entity_type) }} #{{ $log->entity_id }}
      @if(!empty($display['title']))
        &nbsp; • &nbsp; {{ $display['title'] }}
      @endif
    </p>
  </div>

  <div class="box">
    <p style="margin:0; font-weight:700;">Details</p>

    @if(count($changes))
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Field</th>
            <th style="width: 35%;">From</th>
            <th style="width: 35%;">To</th>
          </tr>
        </thead>
        <tbody>
          @foreach($changes as $c)
            <tr>
              <td>{{ $c['label'] }}</td>
              <td>{{ $c['from'] }}</td>
              <td>{{ $c['to'] }}</td>
            </tr>
          @endforeach
        </tbody>
      </table>
    @else
      <p class="muted" style="margin:6px 0 0;">No additional details recorded.</p>
    @endif
  </div>
</body>
</html>
