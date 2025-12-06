'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Props = {
  label?: string;
  className?: string;
};

export const BackButton: React.FC<Props> = ({
  label = 'Back',
  className = '',
}) => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`
        inline-flex items-center gap-2 rounded-lg border border-neutral-300 
        px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100
        transition cursor-pointer ${className}
      `}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
};
