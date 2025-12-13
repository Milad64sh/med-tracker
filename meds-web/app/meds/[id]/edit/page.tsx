'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';
import type { Client } from '@/app/features/dashboard/types';
import { BackButton } from '@/app/components/ui/BackButton';
import { useAlert } from '@/app/AlertProvider';

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
  start_date: z.string().min(1, 'Start date required'), // "YYYY-MM-DD"
});

type FormData = z.infer<typeof schema>;

type CourseApi = {
  id: number;
  client_id?: number | null;
  name?: string | null;
  strength?: string | null;
  form?: string | null;
  dose_per_admin?: number | null;
  admins_per_day?: number | null;
  daily_use?: number | null;
  pack_size?: number | null;
  packs_on_hand?: number | null;
  loose_units?: number | null;
  opening_units?: number | null;
  start_date?: string | null;
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const {showAlert} =useAlert()

  const courseId = id ? Number(id) : NaN;

  const [course, setCourse] = useState<CourseApi | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined
  );

const {
  control,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm<FormData>({
  resolver: zodResolver(schema) as any,
  defaultValues: {
    name: '',
    strength: '',
    form: '',
    dose_per_admin: undefined,
    admins_per_day: undefined,
    daily_use: undefined,
    pack_size: undefined,
    packs_on_hand: undefined,
    loose_units: undefined,
    opening_units: undefined,
    start_date: '',
  },
});


  // =================== Load course ===================
  useEffect(() => {
    if (!id || !Number.isFinite(courseId)) {
      setLoadingCourse(false);
      setCourseError('Invalid course id in route.');
      return;
    }

    const load = async () => {
      try {
        setLoadingCourse(true);
        setCourseError(null);

        const res = await fetcher<any>(`/api/courses/${courseId}`);
        const c: CourseApi = (res as any)?.data ?? res;

        setCourse(c);

        reset({
          name: c.name ?? '',
          strength: c.strength ?? '',
          form: c.form ?? '',
          dose_per_admin:
            c.dose_per_admin !== null && c.dose_per_admin !== undefined
              ? Number(c.dose_per_admin)
              : (undefined as any),
          admins_per_day:
            c.admins_per_day !== null && c.admins_per_day !== undefined
              ? Number(c.admins_per_day)
              : (undefined as any),
          daily_use:
            c.daily_use !== null && c.daily_use !== undefined
              ? Number(c.daily_use)
              : (undefined as any),
          pack_size:
            c.pack_size !== null && c.pack_size !== undefined
              ? Number(c.pack_size)
              : (undefined as any),
          packs_on_hand:
            c.packs_on_hand !== null && c.packs_on_hand !== undefined
              ? Number(c.packs_on_hand)
              : (undefined as any),
          loose_units:
            c.loose_units !== null && c.loose_units !== undefined
              ? Number(c.loose_units)
              : (undefined as any),
          opening_units:
            c.opening_units !== null && c.opening_units !== undefined
              ? Number(c.opening_units)
              : (undefined as any),
          start_date: c.start_date ?? '',
        });

        if (c.client_id != null) {
          setSelectedClientId(String(c.client_id));
        }
      } catch (e: any) {
        console.error('Failed to load course', e);
        setCourseError('Failed to load medication details.');
      } finally {
        setLoadingCourse(false);
      }
    };

    load();
  }, [id, courseId, reset]);

  // =================== Load clients ===================
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        setClientsError(null);

        const res = await fetcher<any>('/api/clients');

        let rows: Client[] = [];
        if (Array.isArray(res)) {
          rows = res;
        } else if (Array.isArray(res.data)) {
          rows = res.data;
        } else if (Array.isArray(res.data?.data)) {
          rows = res.data.data;
        }

        setClients(rows);
      } catch (e: any) {
        console.error('Failed to load clients', e);
        setClientsError(e?.message || 'Failed to load clients.');
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  // Build client dropdown options
  const clientOptions = useMemo(() => {
    return clients.map((c: Client) => {
      const initials = c.initials || '(no initials)';
      const dob =
        c.dob && typeof c.dob === 'string'
          ? c.dob.slice(0, 10)
          : 'Unknown DOB';
      const serviceName = c.service?.name || 'No Service';
      const label = `${initials} (${dob}, ${serviceName})`;
      return { label, value: String(c.id) };
    });
  }, [clients]);

  // Early invalid ID
  if (!id || !Number.isFinite(courseId)) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <p className="text-sm font-medium text-red-600">
            Invalid course id in route. (Missing or not a number)
          </p>
        </div>
      </AppShell>
    );
  }

  // Loading state
  if (loadingCourse) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">
            Loading medication…
          </p>
        </div>
      </AppShell>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <p className="mb-3 text-sm text-red-600">
            {courseError || 'Failed to load medication details.'}
          </p>
          <button
            type="button"
            onClick={() => {
              // simple reload
              window.location.reload();
            }}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  // ================ SUBMIT HANDLER ==================
  const onSubmit = async (data: FormData) => {
    const idNum = Number(selectedClientId);
    if (!idNum) {
      // window.alert('Please select a client.');
      showAlert({
        title: 'Client not selected',
        message: 'The service has been updated successfully.',
        variant: 'warning',
      });
      return;
    }

    if (!Number.isFinite(courseId)) {
      window.alert('Invalid course id; cannot save.');
      return;
    }

    try {
      await fetcher(`/api/courses/${courseId}`, {
        method: 'PATCH',
        body: { ...data, client_id: idNum },
      });

      // window.alert('Medication updated successfully.');
      showAlert({
        title: 'Medication Updated',
        message: 'The medication has been updated successfully.',
        variant: 'success',
        onOk: () => {
          reset();
          router.back();
        },
      });

    } catch (e: any) {
      // console.error('Update course error', e);
      // window.alert(
      //   e?.message || 'Failed to update medication. Please try again.'
      // );
      showAlert({
          title: 'Failed to update medication',
          message: e?.message || 'Failed to update medication.. Please try again.',
          variant: 'error',
        });
    }
  };

  // ================ REUSABLE INPUT COMPONENT ==================
  const Input = ({
    name,
    label,
    type = 'text',
  }: {
    name: keyof FormData;
    label: string;
    type?: React.HTMLInputTypeAttribute;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {label}
          </label>
          <input
            onBlur={onBlur}
            onChange={(e) => onChange(e.target.value)}
            value={value === undefined || value === null ? '' : String(value)}
            type={type}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
          />
          {!!errors[name] && (
            <p className="mt-1 text-xs text-red-600">
              {errors[name]?.message as string}
            </p>
          )}
        </div>
      )}
    />
  );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4 md:px-0">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Edit Medication
        </h1>
        <BackButton className='mb-4'/>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-10 rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-sm"
        >
          {/* Client dropdown */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Client
            </label>
            <select
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
              value={selectedClientId ?? ''}
              onChange={(e) =>
                setSelectedClientId(e.target.value || undefined)
              }
              disabled={
                loadingClients || !!clientsError || clientOptions.length === 0
              }
            >
              <option value="">
                {loadingClients
                  ? 'Loading clients…'
                  : clientOptions.length === 0
                  ? 'No clients found'
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

            {clientsError && (
              <p className="mt-1 text-xs text-red-600">
                Failed to load clients: {clientsError}
              </p>
            )}
          </div>

          {/* Medication fields */}
          <Input name="name" label="Medication Name" />
          <Input name="strength" label="Strength" />
          <Input name="form" label="Form" />
          <Input name="dose_per_admin" label="Dose per Admin" type="number" />
          <Input name="admins_per_day" label="Admins per Day" type="number" />
          <Input name="daily_use" label="Daily Use" type="number" />
          <Input name="pack_size" label="Pack Size" type="number" />
          <Input
            name="packs_on_hand"
            label="Packs on Hand"
            type="number"
          />
          <Input name="loose_units" label="Loose Units" type="number" />
          <Input
            name="opening_units"
            label="Opening Units"
            type="number"
          />

          {/* Start date (simple date input instead of MedicationDateField) */}
          <Controller
            control={control}
            name="start_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Start Date
                </label>
                <input
                  type="date"
                  onBlur={onBlur}
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
                />
                {!!errors.start_date && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.start_date?.message as string}
                  </p>
                )}
              </div>
            )}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 w-full rounded-xl py-3 text-center text-sm font-semibold text-white ${
              isSubmitting
                ? 'cursor-not-allowed bg-neutral-300'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
