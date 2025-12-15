'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';
import type { MedicationCourse } from '@/app/features/courses/types';
import type { Client } from '@/app/features/dashboard/types';
import { BackButton } from '@/app/components/ui/BackButton';
import { useAlert } from '@/app/AlertProvider';

type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

export default function RestockPage() {
  const [courses, setCourses] = useState<CourseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const {showAlert} = useAlert();

  // ID of the currently selected course
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // Show/hide the restock form
  const [showForm, setShowForm] = useState(false);

  // Restock form fields
  const [packSize, setPackSize] = useState('');
  const [packsOnHand, setPacksOnHand] = useState('');
  const [looseUnits, setLooseUnits] = useState('');
  const [openingUnits, setOpeningUnits] = useState('');
  const [saving, setSaving] = useState(false);

  // 1) Load courses from backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetcher<any>('/api/courses');
        console.log(
          'RESTOCK /api/courses response:',
          JSON.stringify(res, null, 2)
        );

        let rows: CourseWithRelations[] = [];

        if (Array.isArray(res)) {
          rows = res;
        } else if (Array.isArray(res.data)) {
          rows = res.data;
        } else if (Array.isArray(res.data?.data)) {
          rows = res.data.data;
        }

        setCourses(rows);
      } catch (e: any) {
        console.warn('Failed to load courses', e?.message);
        if (typeof window !== 'undefined') {
            showAlert({
              title: 'Failed to load medication',
              message: e?.message || 'Something went wrong. Please try again.',
              variant: 'error',
            });
        }
        setCourses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [showAlert]);

    // Build unique client list from courses
  const clientOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();

    for (const c of courses) {
      const client = c.client;
      if (!client?.id) continue;

      const id = String(client.id);
      const labelParts = [client.initials || `Client #${id}`];

      // include service name if present
      const serviceName = (client as any)?.service?.name;
      if (serviceName) labelParts.push(serviceName);

      map.set(id, { id, label: labelParts.join(' • ') });
    }

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  // Filter courses by selected client (if any)
  const filteredCourses = useMemo(() => {
    if (!selectedClientId) return courses;
    return courses.filter((c) => String(c.client?.id ?? '') === selectedClientId);
  }, [courses, selectedClientId]);


  // 2) The selected course object
  const selectedCourse = useMemo(() => {
    if (!selectedId) return null;
    return filteredCourses.find((c) => String(c.id) === selectedId) ?? null;
  }, [selectedId, filteredCourses]);


  // Helper: parse numeric input, return undefined if empty
  const parseNumberOrUndefined = (val: string): number | undefined =>
    val.trim() === '' ? undefined : Number(val);

    const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);

    // reset medication selection + form when client changes
    setSelectedId(undefined);
    setShowForm(false);

    // reset form fields
    setPackSize('');
    setPacksOnHand('');
    setLooseUnits('');
    setOpeningUnits('');
  };


  // 3) When user selects a course from dropdown
  const handleSelectCourse = (value?: string) => {
    setSelectedId(value);
    setShowForm(false);

    const course = filteredCourses.find((c) => String(c.id) === value);
    if (!course) return;

    setPackSize(course.pack_size != null ? String(course.pack_size) : '');
    setPacksOnHand(course.packs_on_hand != null ? String(course.packs_on_hand) : '');
    setLooseUnits(course.loose_units != null ? String(course.loose_units) : '');
    setOpeningUnits(course.opening_units != null ? String(course.opening_units) : '');
  };


  // 4) Handle restock save
  const handleSaveRestock = async () => {
    if (!selectedCourse) return;

    const id = selectedCourse.id;

    const payload: Partial<
      Pick<
        MedicationCourse,
        'pack_size' | 'packs_on_hand' | 'loose_units' | 'opening_units'
      >
    > = {
      pack_size: parseNumberOrUndefined(packSize),
      packs_on_hand: parseNumberOrUndefined(packsOnHand),
      loose_units: parseNumberOrUndefined(looseUnits),
      opening_units: parseNumberOrUndefined(openingUnits),
    };

    const invalid = Object.values(payload).some((v) => {
      if (v === undefined || v === null) return false;
      return Number.isNaN(v) || v < 0;
    });

    if (invalid) {
      if (typeof window !== 'undefined') {
        showAlert({
          title: 'Number required',
          message: 'Please enter only non-negative numbers.',
          variant: 'warning',
        });
      }
      return;
    }

    try {
      setSaving(true);

      await fetcher(`/api/courses/${id}/restock`, {
        method: 'PATCH',
        body: payload,
      });

      if (typeof window !== 'undefined') {
        window.alert('Medication stock updated successfully.');
        showAlert({
          title: 'Medication Restocked',
          message: 'Medication stock updated successfully.',
          variant: 'success',
        });
        
      }

      // update local list
      setCourses((prev) =>
        prev.map((c) =>
          c.id === id ? ({ ...c, ...payload } as CourseWithRelations) : c
        )
      );

      // close the restock panel
      setShowForm(false);
    } catch (e: any) {
      console.warn('Failed to restock', e?.message);
      if (typeof window !== 'undefined') {
        showAlert({
          title: 'Failed to restock',
          message: e?.message || 'Failed to restock medication.',
          variant: 'error',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Options for select dropdown
  const options = filteredCourses.map((c) => ({
    label: c.name ?? `Course #${c.id}`,
    value: String(c.id),
  }));


  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">Loading medications…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-2 py-4 sm:px-4 md:px-0">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Restock Medication
        </h1>

        <BackButton className='mb-4'/>

                {/* Client select dropdown */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-neutral-700">Client</label>
          <select
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            value={selectedClientId}
            onChange={(e) => handleSelectClient(e.target.value)}
            disabled={clientOptions.length === 0}
          >
            <option value="">
              {clientOptions.length === 0 ? 'No clients found' : 'All clients'}
            </option>
            {clientOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">
            Select a client to filter the medication list.
          </p>
        </div>

        {/* Medication select dropdown */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-neutral-700">
            Medication
          </label>
          <select
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            value={selectedId ?? ''}
            onChange={(e) =>
              handleSelectCourse(e.target.value || undefined)
            }
            disabled={filteredCourses.length === 0}
          >
              <option value="" disabled>
                {filteredCourses.length === 0
                  ? selectedClientId
                    ? 'No medications for this client'
                    : 'No medications found'
                  : 'Select a medication…'}
              </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selected medication card */}
        {selectedCourse ? (
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {selectedCourse.name ?? `Course #${selectedCourse.id}`}
                </p>
                {selectedCourse.client && (
                  <p className="mt-1 text-xs text-neutral-600">
                    {selectedCourse.client.initials}
                    {selectedCourse.client.service?.name
                      ? ` • ${selectedCourse.client.service.name}`
                      : ''}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                {showForm ? 'Hide restock' : 'Restock'}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-neutral-600 sm:grid-cols-4">
              <div>
                <p className="font-medium text-neutral-800">Pack size</p>
                <p>{selectedCourse.pack_size ?? '—'}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-800">Packs on hand</p>
                <p>{selectedCourse.packs_on_hand ?? '—'}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-800">Loose units</p>
                <p>{selectedCourse.loose_units ?? '—'}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-800">Opening units</p>
                <p>{selectedCourse.opening_units ?? '—'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            Select a medication above to view details and restock.
          </p>
        )}

        {/* Restock form, only visible when user clicked "Restock" */}
        {selectedCourse && showForm && (
          <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-base font-semibold text-neutral-900">
              Update stock for{' '}
              {selectedCourse.name ?? `Course #${selectedCourse.id}`}
            </p>

            {/* Pack size */}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-neutral-700">
                Pack size
              </label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                inputMode="numeric"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. 28"
              />
            </div>

            {/* Packs on hand */}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-neutral-700">
                Packs on hand
              </label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                inputMode="numeric"
                value={packsOnHand}
                onChange={(e) => setPacksOnHand(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>

            {/* Loose units */}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-neutral-700">
                Loose units
              </label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                inputMode="numeric"
                value={looseUnits}
                onChange={(e) => setLooseUnits(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>

            {/* Opening units */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-neutral-700">
                Opening units (total)
              </label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                inputMode="numeric"
                value={openingUnits}
                onChange={(e) => setOpeningUnits(e.target.value)}
                placeholder="Optional – if you use it"
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveRestock}
              className={`flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white cursor-pointer ${
                saving
                  ? 'bg-neutral-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving ? 'Saving…' : 'Save restock'}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
