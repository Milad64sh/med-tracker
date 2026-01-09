'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { AppShell } from '../../components/AppShell';
import { fetcher } from '@/lib/api';
import { useServices } from '@/app/features/services/queries';
import { DobField } from '@/app/components/forms/DobField';
import { InputField } from '@/app/components/forms/InputField';
import { useAlert } from '@/app/AlertProvider';

// ---- Zod schema ----
const schema = z.object({
  initials: z.string().min(1, 'Initials required'),
  client_name: z
    .string()
    .max(255, 'Max 255 characters')
    .optional(),
  dob: z
    .string()
    .min(1, 'Date of birth required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  gp_email: z
    .string()
    .email('Invalid GP email')
    .or(z.literal(''))
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewClientPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      initials: '',
      client_name: '',
      dob: '',
      gp_email: '',
    },
  });

  const {
    data: services = [],
    isLoading: loadingServices,
    isError,
    error,
  } = useServices();

  const serviceOptions = React.useMemo(
    () =>
      services.map((s: any) => ({
        label: s.name,
        value: String(s.id),
      })),
    [services]
  );

  const [selectedServiceId, setSelectedServiceId] = React.useState<
    string | undefined
  >(undefined);
  const [serviceTouched, setServiceTouched] = React.useState(false);






  // ---- Submit handler ----

  const onSubmit = async (form: FormData) => {
    const serviceIdNum = Number(selectedServiceId);
    if (!serviceIdNum) {
      setServiceTouched(true);
        showAlert({
        title: 'Service required',
        message: 'Please select a service before creating a client.',
        variant: 'warning',
      });
      return;
    }

    const gpEmail = form.gp_email?.trim() || null;
    const clientName = form.client_name?.trim() || null;

    const payload = {
      initials: form.initials.trim(),
      client_name: clientName,
      dob: form.dob, // already YYYY-MM-DD from <input type="date">
      gp_email: gpEmail,
      service_id: serviceIdNum,
    };

    try {
      await fetcher('/api/clients', { method: 'POST', body: payload });

      showAlert({
        title: 'Client created',
        message: 'The new client has been added successfully.',
        variant: 'success',
        onOk: () => {
          reset();
          setSelectedServiceId(undefined);
          router.back();
        },
      });
    } catch (e: any) {
      showAlert({
        title: 'Failed to create client',
        message: e?.message || 'Something went wrong. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <AppShell>
      <div className="max-w-xl">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Add Client
        </h1>

        {/* Service selection */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Service
          </label>
          <select
            value={selectedServiceId ?? ''}
            onChange={(e) => {
              const v = e.target.value || undefined;
              setSelectedServiceId(v);
              if (!serviceTouched) setServiceTouched(true);
            }}
            disabled={
              loadingServices || isError || serviceOptions.length === 0
            }
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          >
            <option value="">
              {loadingServices
                ? 'Loading services…'
                : 'Select service…'}
            </option>
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {loadingServices && (
            <p className="mt-1 text-xs text-neutral-500">
              Fetching services…
            </p>
          )}

          {isError && (
            <p className="mt-1 text-xs text-red-600">
              Failed to load services: {String(error?.message ?? '')}
            </p>
          )}

          {!loadingServices && !isError && serviceOptions.length === 0 && (
            <p className="mt-1 text-xs text-neutral-500">
              No services found.
            </p>
          )}

          {serviceTouched && !selectedServiceId && (
            <p className="mt-1 text-xs text-red-600">
              Please select a service
            </p>
          )}

          {!!selectedServiceId && (
            <p className="mt-1 text-[10px] text-neutral-500">
              Selected ID: {selectedServiceId}
            </p>
          )}
        </div>

        {/* Client fields */}
        <InputField
        control={control}
        errors={errors}
        name="initials"
        label="Initials"
        placeholder="e.g., JS"
        />
        <InputField
          control={control}
          errors={errors}
          name="client_name"
          label="Client name (optional)"
          placeholder="e.g., John Smith"
        />

        <DobField control={control} errors={errors} />


        {/* GP Email (optional) */}
        <InputField
        control={control}
        errors={errors}
        name="gp_email"
        label="GP Email (optional)"
        placeholder="e.g., gp@example.com"
        type="email"
        />


        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`mt-2 mb-8 w-full rounded-xl py-3 text-lg font-semibold text-white cursor-pointer ${
            isSubmitting ? 'bg-neutral-300' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </AppShell>
  );
}
