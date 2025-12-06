// app/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top nav */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              MT
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Med Tracker
              </p>
              <p className="text-xs text-neutral-500">
                Medication management dashboard
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="#features"
              className="hidden text-neutral-700 hover:text-neutral-900 sm:inline"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hidden text-neutral-700 hover:text-neutral-900 sm:inline"
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:py-16 lg:px-8">
        {/* Left column */}
        <section className="w-full max-w-xl">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            Designed for supported living & residential services
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            Stay ahead of medication
            <span className="block text-emerald-600">
              before it becomes urgent.
            </span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Med Tracker helps teams keep on top of repeat prescriptions,
            stock levels and urgent alerts across multiple services — so you
            can spend less time on spreadsheets and more time supporting
            people.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Sign in to dashboard
            </Link>
            <p className="text-xs text-neutral-500">
              Secure access for authorised staff only.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-neutral-700 sm:text-sm">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <p className="text-xs font-semibold text-emerald-700">
                Live medication alerts
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-900 sm:text-xs">
                See critical, low and OK stock at a glance so you know what
                needs ordering today.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
              <p className="text-xs font-semibold text-neutral-800">
                Multi-service overview
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-neutral-700 sm:text-xs">
                Track medications per client and service, all from a single
                dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Right column – simple fake dashboard preview */}
        <section
          aria-label="Dashboard preview"
          className="relative w-full max-w-xl rounded-3xl border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm lg:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900">
              Medication Dashboard
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Example view
            </span>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
              <p className="text-[11px] font-medium text-red-700">
                Critical
              </p>
              <p className="mt-1 text-lg font-semibold text-red-700">3</p>
              <p className="mt-0.5 text-[10px] text-red-600">
                Less than 2 days
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <p className="text-[11px] font-medium text-amber-700">Low</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">5</p>
              <p className="mt-0.5 text-[10px] text-amber-600">
                3–7 days remaining
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <p className="text-[11px] font-medium text-emerald-700">OK</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">18</p>
              <p className="mt-0.5 text-[10px] text-emerald-700">
                More than 8 days
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-[11px] font-medium text-neutral-700">
                Pending orders
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-800">4</p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                Awaiting delivery
              </p>
            </div>
          </div>

          {/* Alerts list */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-neutral-800">
              Urgent alerts
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                <div>
                  <p className="font-medium text-red-800">
                    JR • Risperidone
                  </p>
                  <p className="mt-0.5 text-[11px] text-red-700">
                    0 units remaining — runout today
                  </p>
                </div>
                <span className="mt-0.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Critical
                </span>
              </div>
              <div className="flex items-start justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                <div>
                  <p className="font-medium text-amber-800">
                    AT • Sertraline
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    3 days remaining — reorder soon
                  </p>
                </div>
                <span className="mt-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Low
                </span>
              </div>
            </div>
          </div>

          {/* Footer line */}
          <p className="mt-4 text-[11px] text-neutral-500">
            Real dashboard includes live data, services and secure GP contact
            details.
          </p>
        </section>
      </main>

      {/* Simple features section */}
      <section
        id="features"
        className="border-t border-neutral-200 bg-white py-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Built around real-world medication workflows
          </h2>
          <div className="grid gap-4 text-sm text-neutral-700 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">
                Client-centred view
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Each client shows their medications, services and GP email in
                one place, so staff can quickly see what needs to be ordered.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">
                Clear stock calculations
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Pack sizes, loose units and opening balance combine to show
                days remaining — no more guessing from blister packs.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">
                Simple team access
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Staff sign in securely and only see what they need, helping
                services stay organised and compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-neutral-200 bg-neutral-50 py-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            How Med Tracker fits into your day
          </h2>
          <ol className="grid gap-4 text-sm text-neutral-700 md:grid-cols-3">
            <li className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Step 1
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                Check today&apos;s alerts
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Open the dashboard to see which medications are critical, low
                or OK across all services.
              </p>
            </li>
            <li className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Step 2
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                Restock and update
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Record new packs, adjust loose units and log opening balances
                so the system can recalculate days remaining.
              </p>
            </li>
            <li className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Step 3
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                Stay ahead of orders
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Use the alerts and pending order view to keep repeat
                prescriptions on track for each person you support.
              </p>
            </li>
          </ol>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">
              Med Tracker is a working internal tool. For access, use your
              staff login details.
            </p>
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-neutral-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Med Tracker</p>
          <p>For internal use by authorised staff only.</p>
        </div>
      </footer>
    </div>
  );
}
