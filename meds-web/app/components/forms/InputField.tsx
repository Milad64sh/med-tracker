'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Controller } from 'react-hook-form';

type InputFieldProps = {
  control: any;
  errors: any;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  control,
  errors,
  name,
  label,
  type = 'text',
  placeholder,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {label}
          </label>

          <input
            {...field}
            type={type}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            placeholder={placeholder}
          />

          {errors[name] && (
            <p className="mt-1 text-xs text-red-600">
              {String(errors[name]?.message)}
            </p>
          )}
        </div>
      )}
    />
  );
};
