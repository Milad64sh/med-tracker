'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';
import type { MedicationCourse } from '@/app/features/courses/types';
import type { Client } from '@/app/features/dashboard/types';
import { BackButton } from '@/app/components/ui/BackButton';
import { useAlert } from '@/app/AlertProvider';

type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

export default function AdjustStockPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const [courses, setCourses] = useState<CourseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // filters / selection
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  // form fields
  const [adjustmentDate, setAdjustmentDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // absolute adjustment inputs (either total OR packs+loose)
  const [totalUnits, setTotalUnits] = useState('');
  const [packsOnHand, setPacksOnHand] = useState('');
  const [looseUnits, setLooseUnits] = useState('');

  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper: parse numeric input, return undefined if empty
  const parseNumberOrUndefined = (val: string): number | undefined =>
    val.trim() === '' ? undefined : Number(val);

  // 1) Load courses from backend (same approach as RestockPage)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetcher<any>('/api/courses');

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
        showAlert({
          title: 'Failed to load medication',
          message: e?.message || 'Something went wrong. Please try again.',
          variant: 'error',
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [showAlert]);

  // Build unique client list from courses (same as RestockPage)
  const clientOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();

    for (const c of courses) {
      const client = c.client;
      if (!client?.id) continue;

      const id = String(client.id);
      const labelParts = [client.initials || `Client #${id}`];

      const serviceName = (client as any)?.service?.name;
      if (serviceName) labelParts.push(serviceName);

      map.set(id, { id, label: labelParts.join(' • ') });
    }

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  // Filter courses by selected client
  const filteredCourses = useMemo(() => {
    if (!selectedClientId) return courses;
    return courses.filter((c) => String(c.client?.id ?? '') === selectedClientId);
  }, [courses, selectedClientId]);

  // Selected course object
  const selectedCourse = useMemo(() => {
    if (!selectedId) return null;
    return filteredCourses.find((c) => String(c.id) === selectedId) ?? null;
  }, [selectedId, filteredCourses]);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);

    // reset selection + form when client changes
    setSelectedId(undefined);
    setShowForm(false);

    // reset fields
    setTotalUnits('');
    setPacksOnHand('');
    setLooseUnits('');
    setReason('');

    // reset date to today
    const d = new Date();
    setAdjustmentDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    );
  };

  const handleSelectCourse = (value?: string) => {
    setSelectedId(value);
    setShowForm(false);

    const d = new Date();
    setAdjustmentDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    );

    // prefill form with current values (nice UX)
    const course = filteredCourses.find((c) => String(c.id) === value);
    if (!course) return;

    setTotalUnits('');
    setPacksOnHand(course.packs_on_hand != null ? String(course.packs_on_hand) : '0');
    setLooseUnits(course.loose_units != null ? String(course.loose_units) : '0');
    setReason('');
  };

  const options = filteredCourses.map((c) => ({
    label: c.name ?? `Course #${c.id}`,
    value: String(c.id),
  }));

  const validateNonNegativeNumberStrings = (vals: string[]) => {
    for (const v of vals) {
      if (v.trim() === '') continue;
      const num = Number(v);
      if (Number.isNaN(num) || num < 0) return false;
    }
    return true;
  };

  const handleSaveAdjustment = async () => {
    if (!selectedCourse) return;

    if (!reason.trim()) {
      showAlert({
        title: 'Reason required',
        message: 'Please add a reason (e.g. stocktake correction, returned from holiday).',
        variant: 'warning',
      });
      return;
    }

    // Validate numeric inputs
    const okNumbers = validateNonNegativeNumberStrings([totalUnits, packsOnHand, looseUnits]);
    if (!okNumbers) {
      showAlert({
        title: 'Number required',
        message: 'Please enter only non-negative numbers.',
        variant: 'warning',
      });
      return;
    }

    // Must provide either total_units OR (packs/loose)
    const hasTotal = totalUnits.trim() !== '';
    const hasParts = packsOnHand.trim() !== '' || looseUnits.trim() !== '';

    if (!hasTotal && !hasParts) {
      showAlert({
        title: 'Stock value required',
        message: 'Enter either Total units OR Packs/Loose units.',
        variant: 'warning',
      });
      return;
    }

    const payload: any = {
      reason: reason.trim(),
      adjustment_date: adjustmentDate || null,
    };

    if (hasTotal) {
      payload.total_units = parseNumberOrUndefined(totalUnits);
    } else {
      payload.packs_on_hand = parseNumberOrUndefined(packsOnHand) ?? 0;
      payload.loose_units = parseNumberOrUndefined(looseUnits) ?? 0;
    }

    try {
      setSaving(true);

      await fetcher(`/api/courses/${selectedCourse.id}/adjust-stock`, {
        method: 'PATCH',
        body: payload,
      });

      showAlert({
        title: 'Stock adjusted',
        message: 'Medication stock was updated to match the real count.',
        variant: 'success',
      });

      // refresh dashboard + courses
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['courses'] });

      // refresh local courses list (re-fetch to stay accurate)
      try {
        const res = await fetcher<any>('/api/courses');
        let rows: CourseWithRelations[] = [];
        if (Array.isArray(res)) rows = res;
        else if (Array.isArray(res.data)) rows = res.data;
        else if (Array.isArray(res.data?.data)) rows = res.data.data;
        setCourses(rows);
      } catch {
        // ignore — not critical
      }

      setShowForm(false);
    } catch (e: any) {
      console.warn('Failed to adjust stock', e?.message);
      showAlert({
        title: 'Failed to adjust stock',
        message: e?.message || 'Failed to update medication stock.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="mb-1 text-2xl font-bold text-neutral-900">Adjust Stock</h1>
        <p className="mb-4 text-sm text-neutral-600">
          Use this when the cupboard count doesn’t match the system (stocktake / correction).
        </p>

        <BackButton className="mb-4" />

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
          <label className="mb-1 block text-sm text-neutral-700">Medication</label>
          <select
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            value={selectedId ?? ''}
            onChange={(e) => handleSelectCourse(e.target.value || undefined)}
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
                {showForm ? 'Hide adjustment' : 'Adjust'}
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
            Select a medication above to view details and adjust stock.
          </p>
        )}

        {/* Adjust form */}
        {selectedCourse && showForm && (
          <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-base font-semibold text-neutral-900">
              Adjust stock for {selectedCourse.name ?? `Course #${selectedCourse.id}`}
            </p>

            {/* Reason */}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-neutral-700">Reason (required)</label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Stocktake correction / returned from holiday / spillage"
              />
            </div>

            {/* Method note */}
            <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-900">Choose one method</p>
              <p className="mt-1 text-xs text-neutral-600">
                Enter <span className="font-medium">Total units</span> OR enter{' '}
                <span className="font-medium">Packs + Loose units</span>. If Total units is filled, it will be used.
              </p>
            </div>

            {/* Total units */}
            <div className="mb-3">
              <label className="mb-1 block text-sm text-neutral-700">Total units (optional)</label>
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                inputMode="numeric"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                placeholder="e.g. 14"
              />
              <p className="mt-1 text-xs text-neutral-500">
                If you fill this, Packs/Loose below will be ignored.
              </p>
            </div>

            {/* Packs + loose */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-neutral-700">Packs on hand</label>
                <input
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                  inputMode="numeric"
                  value={packsOnHand}
                  onChange={(e) => setPacksOnHand(e.target.value)}
                  placeholder="e.g. 0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-neutral-700">Loose units</label>
                <input
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                  inputMode="numeric"
                  value={looseUnits}
                  onChange={(e) => setLooseUnits(e.target.value)}
                  placeholder="e.g. 14"
                />
              </div>
            </div>

            {/* Adjustment date */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-neutral-700">Adjustment date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Used as the new baseline date for recalculating runout/half dates.
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAdjustment}
              className={`flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white cursor-pointer ${
                saving ? 'bg-neutral-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {saving ? 'Saving…' : 'Save adjustment'}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
