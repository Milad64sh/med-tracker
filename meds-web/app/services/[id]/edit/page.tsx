'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { AppShell } from '@/app/components/AppShell';
import { BackButton } from '@/app/components/ui/BackButton';
import { InputField } from '@/app/components/forms/InputField';
import { fetcher } from '@/lib/api';
import { useAlert } from '@/app/AlertProvider';

const schema = z.object({
  name: z.string().min(1, 'Service name is required'),
});

type FormData = z.infer<typeof schema>;
type ShowServiceResponse = { data: { id: number; name: string } };

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {showAlert} = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const [loading, setLoading] = useState(true);

  // Load existing service
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const res = await fetcher<ShowServiceResponse>(`/api/services/${id}`);
        reset({ name: res.data?.name ?? '' });
      } catch (e: any) {
        showAlert({
          title: 'Failed to load service',
          message: e?.message || 'Something went wrong. Please try again.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset, showAlert]);

  const onSubmit = async (form: FormData) => {
    await fetcher(`/api/services/${id}`, {
      method: 'PUT',
      body: { name: form.name.trim() },
    });

    // Refresh services list
    queryClient.invalidateQueries({ queryKey: ['services'] });
      showAlert({
        title: 'Service Updated',
        message: 'The service has been updated successfully.',
        variant: 'success',
        onOk: () => {
          reset();
          router.back();
        },
      });
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
          <BackButton className="mb-4" />

          <h1 className="mb-4 text-2xl font-bold text-neutral-900">
            Edit Service
          </h1>

          <InputField
            control={control}
            errors={errors}
            name="name"
            label="Service Name"
            placeholder="e.g., 45 Culver Lane"
          />

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
