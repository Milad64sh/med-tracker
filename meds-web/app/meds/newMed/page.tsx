'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { AppShell } from '@/app/components/AppShell';
import { BackButton } from '@/app/components/ui/BackButton';
import { InputField } from '@/app/components/forms/InputField';
import { fetcher } from '@/lib/api';
import { useClients } from '@/app/features/clients/queries';
import type { Client } from '@/app/features/dashboard/types';
import { formatUK } from '@/app/utils/formatUK';
import { useAlert } from '@/app/AlertProvider';

// ---- Zod schema ----
const schema = z.object({
  name: z.string().min(1, 'Medication name required'),
  strength: z.string().optional(),
  form: z.string().optional(),
  dose_per_admin: z.coerce.number().min(0.001, 'Dose per admin required'),
  admins_per_day: z.coerce.number().min(0.001, 'Admins per day required'),
  daily_use: z.coerce.number().min(0.001, 'Daily use required'),
  pack_size: z.coerce.number().min(1, 'Pack size must be at least 1'),
  packs_on_hand: z.coerce.number().min(0),
  loose_units: z.coerce.number().optional(),
  opening_units: z.coerce.number().min(0, 'Opening units required'),
  start_date: z.string().min(1, 'Start date required'),
});

type FormData = z.infer<typeof schema>;

// Helpers: API (YYYY-MM-DD)
const formatDateForApi = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NewMedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {showAlert} = useAlert();

const {
  control,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    start_date: formatDateForApi(new Date()),
  },
});


  const {
    data: clients = [],
    isLoading: loadingClients,
    isError,
    error,
  } = useClients();

  const clientOptions = React.useMemo(() => {
    const raw = Array.isArray(clients)
      ? clients
      : (clients as any)?.data ?? [];
    return (raw as Client[]).map((c) => {
      const initials = c.initials || '(no initials)';
      const dob =
        c.dob && typeof c.dob === 'string'
          ? c.dob.slice(0, 10)
          : 'Unknown DOB';
      const ukDob = formatUK(dob);
      const serviceName = c.service?.name || 'No Service';
      const label = `${initials} (${ukDob}, ${serviceName})`;
      return { label, value: String(c.id) };
    });
  }, [clients]);

  const [selectedClientId, setSelectedClientId] = React.useState<
    string | undefined
  >(undefined);

  const onSubmit = async (data: FormData) => {
    const idNum = Number(selectedClientId);
    if (!idNum) {
      // window.alert('Please select a client first');
      showAlert({
        title: 'Select Client',
        message: 'Please select a client first',
        variant: 'warning',
    });
      return;
    }

    await fetcher('/api/courses', {
      method: 'POST',
      body: { ...data, client_id: idNum },
    });

    // refresh meds list
    queryClient.invalidateQueries({ queryKey: ['courses'] });

    // window.alert('Medication added successfully');
    showAlert({
        title: 'Medication created',
        message: 'The new Medication has been added successfully.',
        variant: 'success',
        onOk: () => {
        reset();
        setSelectedClientId(undefined);
        router.back();
        },
      });

  };

  return (
    <AppShell>
      <div className="max-w-2xl">
        <BackButton className="mb-4" />

        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Add Medication
        </h1>

        {/* Client select */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Client
          </label>
          <select
            value={selectedClientId ?? ''}
            onChange={(e) =>
              setSelectedClientId(e.target.value || undefined)
            }
            disabled={
              loadingClients || isError || clientOptions.length === 0
            }
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          >
            <option value="">
              {loadingClients
                ? 'Loading clients…'
                : 'Select client…'}
            </option>
            {clientOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {loadingClients && (
            <p className="mt-1 text-xs text-neutral-500">
              Fetching clients…
            </p>
          )}

          {isError && (
            <p className="mt-1 text-xs text-red-600">
              Failed to load clients: {String(error?.message ?? '')}
            </p>
          )}

          {!loadingClients && !isError && clientOptions.length === 0 && (
            <p className="mt-1 text-xs text-neutral-500">
              No clients found.
            </p>
          )}

          {!!selectedClientId && (
            <p className="mt-1 text-[10px] text-neutral-500">
              Selected: {selectedClientId}
            </p>
          )}
        </div>

        {/* Medication fields */}
        <InputField
          control={control}
          errors={errors}
          name="name"
          label="Medication Name"
        />
        <InputField
          control={control}
          errors={errors}
          name="strength"
          label="Strength"
        />
        <InputField
          control={control}
          errors={errors}
          name="form"
          label="Form"
        />
        <InputField
          control={control}
          errors={errors}
          name="dose_per_admin"
          label="Dose per Admin"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="admins_per_day"
          label="Admins per Day"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="daily_use"
          label="Daily Use"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="pack_size"
          label="Pack Size"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="packs_on_hand"
          label="Packs on Hand"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="loose_units"
          label="Loose Units"
          type="number"
        />
        <InputField
          control={control}
          errors={errors}
          name="opening_units"
          label="Opening Units"
          type="number"
        />

        {/* Start date */}
        <Controller
          control={control}
          name="start_date"
          render={({ field }) => (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Start Date
              </label>
              <input
                {...field}
                type="date"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-600">
                  {String(errors.start_date.message)}
                </p>
              )}
            </div>
          )}
        />

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`mt-2 mb-8 w-full rounded-xl py-3 text-lg font-semibold text-white cursor-pointer ${
            isSubmitting
              ? 'bg-neutral-300'
              : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </AppShell>
  );
}
