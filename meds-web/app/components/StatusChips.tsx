'use client';

import React from 'react';

type Status = 'all' | 'critical' | 'low' | 'ok';

type Props = {
  value: Status;
  onChange: (v: Status) => void;
};

const labels: Status[] = ['all', 'critical', 'low', 'ok'];

export function StatusChips({ value, onChange }: Props) {
  return (
    <div className="mt-3 flex flex-wrap">
      {labels.map((lab) => {
        const active = value === lab;
        return (
          <button
            key={lab}
            type="button"
            onClick={() => onChange(lab)}
            aria-label={`Filter ${lab}`}
            className={`mb-2 mr-2 rounded-full border px-3 py-2 text-sm cursor-pointer ${
              active
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-300 text-neutral-800'
            }`}
          >
            {lab.charAt(0).toUpperCase() + lab.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
