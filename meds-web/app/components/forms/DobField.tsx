'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Controller } from 'react-hook-form';

type DobFieldProps = {
  control: any;
  errors: any;
};

export const DobField: React.FC<DobFieldProps> = ({ control, errors }) => {
  return (
    <Controller
      control={control}
      name="dob"
      render={({ field }) => (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Date of Birth
          </label>

          <input
            {...field}
            type="date"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          />

          {!!errors.dob && (
            <p className="mt-1 text-xs text-red-600">
              {String(errors.dob.message)}
            </p>
          )}
        </div>
      )}
    />
  );
};
