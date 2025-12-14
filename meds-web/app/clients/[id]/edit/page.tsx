'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';
import { DobField } from '@/app/components/forms/DobField';
import { InputField } from '@/app/components/forms/InputField';
import { BackButton } from '../../../components/ui/BackButton';
import { useAlert } from '@/app/AlertProvider';

// ---- Schema ----
const schema = z.object({
  initials: z.string().min(1, 'Initials are required'),
  dob: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      'Use YYYY-MM-DD format'
    ),
  service_id: z.number().int().optional(),
  gp_email: z
    .union([z.string().email('Invalid GP email'), z.literal('')])
    .optional(),
});

type FormData = z.infer<typeof schema>;

// Matches your ClientResource shape including gp_email
type ShowClientResponse = {
  data: {
    id: number;
    initials: string;
    dob: string | null;
    gp_email: string | null;
    service: { id: number | null; name?: string | null } | null;
  };
};

type ServiceRow = { id: number; name: string };

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      dob: '',
      service_id: undefined,
      gp_email: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [svcLoading, setSvcLoading] = useState(true);

  const svcOptions = services.map((s) => ({
    label: s.name,
    value: String(s.id),
  }));

  // ---- Load services for dropdown ----
  useEffect(() => {
    (async () => {
      try {
        setSvcLoading(true);
        const sres = await fetcher<ServiceRow[]>('/api/services/lookup');
        
        setServices(sres);
      } catch (e: any) {
        console.warn('Failed to load services:', e?.message);
        setServices([]);
      } finally {
        setSvcLoading(false);
      }
    })();
  }, []);

  // ---- Load client + prefill ----
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const res = await fetcher<ShowClientResponse>(`/api/clients/${id}`);
        reset({
          initials: res.data?.initials ?? '',
          dob: res.data?.dob ?? '',
          service_id: res.data?.service?.id ?? undefined,
          gp_email: res.data?.gp_email ?? '',
        });
      } catch (e: any) {
        showAlert({
          title: 'Update failed',
          message: e?.message || 'Failed to load client. Please try again.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset, showAlert]);

  const onSubmit = async (form: FormData) => {
    try {
      const gpEmail = form.gp_email?.trim() || null;

      await fetcher(`/api/clients/${id}`, {
        method: 'PUT',
        body: {
          initials: form.initials.trim(),
          dob: form.dob || null,
          service_id: form.service_id ?? null,
          gp_email: gpEmail,
        },
      });

      // refresh clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });

        showAlert({
        title: 'Client updated',
        message: 'Client details have been updated successfully.',
        variant: 'success',
        onOk: () => {
          router.back();
        },
      });
    } catch (e: any) {
      showAlert({
      title: 'Update failed',
      message: e?.message || 'Failed to update client. Please try again.',
      variant: 'error',
    });
    }
  };

  return (
    <AppShell>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">Loading…</p>
        </div>
      ) : (
        <div className="max-w-xl">
          <h1 className="mb-4 text-2xl font-bold text-neutral-900">
            Edit Client
          </h1>

          <BackButton className='mb-4'/>
          {/* Initials */}
          <InputField
            control={control}
            errors={errors}
            name="initials"
            label="Initials"
            placeholder="e.g., JS"
          />

          {/* GP Email */}
          <InputField
            control={control}
            errors={errors}
            name="gp_email"
            label="GP Email (optional)"
            placeholder="e.g., gp@example.com"
            type="email"
          />

          {/* DOB */}
          <DobField control={control} errors={errors} />

          {/* Service */}
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Service (optional)
            </label>

            {svcLoading ? (
              <div className="flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-neutral-700" />
                <span className="ml-2 text-neutral-600">
                  Loading services…
                </span>
              </div>
            ) : (
              <Controller
                control={control}
                name="service_id"
                render={({ field: { onChange, value } }) => (
                  <select
                    value={value != null ? String(value) : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChange(v ? Number(v) : undefined);
                    }}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
                  >
                    <option value="">— Select a service —</option>
                    {svcOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}

            {!!errors.service_id && (
              <p className="mt-1 text-xs text-red-600">
                {String(errors.service_id.message)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`mt-2 w-full rounded-xl py-3 text-lg font-semibold text-white cursor-pointer ${
              isSubmitting
                ? 'bg-neutral-300'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </AppShell>
  );
}
