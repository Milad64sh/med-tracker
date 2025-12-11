'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useRouter } from 'next/navigation';
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
  // opened_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Invalid date").optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewServicePage() {
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
      name: '',
    },
  });

  const onSubmit = async (form: FormData) => {
    const payload: any = { name: form.name.trim() };

    await fetcher('/api/services', { method: 'POST', body: payload });

    queryClient.invalidateQueries({ queryKey: ['services'] });

    showAlert({
      title: 'Service created',
      message: 'The new Service has been added successfully.',
      variant: 'success',
      onOk: () => {
        reset();
        router.back();
      },
    });
  };

  return (
    <AppShell>
      <div className="max-w-xl">
        <BackButton className="mb-4" />

        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Add Service
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
