'use client';

import React from 'react';
import Link from 'next/link';

type ChipColor = 'emerald' | 'sky' | 'violet' | 'amber';

type AddItem = {
  key: string;
  label: string;
  href?: string; // Next.js wants string routes
  onPress?: () => void;
  color?: ChipColor;
  accessibilityLabel?: string;
};

type Props = {
  items: AddItem[];
  className?: string;
};

const palette: Record<
  ChipColor,
  { border: string; bg: string; text: string }
> = {
  emerald: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  sky: {
    border: 'border-sky-400',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
  },
  violet: {
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
    amber: {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
};

export function AddChips({ items, className = '' }: Props) {
  return (
    <div className={`flex flex-wrap mt-3 ${className}`}>
      {items.map(({ key, label, href, onPress, color = 'emerald', accessibilityLabel }) => {
        const c = palette[color];

        // CHIP UI (used in both button and Link)
        const chip = (
          <button
            type="button"
            onClick={onPress}
            aria-label={accessibilityLabel ?? label}
            className={`
              px-3 py-2 mr-2 mb-2 rounded-full border ${c.border} ${c.bg}
              active:opacity-80 flex items-center cursor-pointer
            `}
          >
            <span className={`${c.text} font-medium`}>{label}</span>
          </button>
        );

        // If href provided, wrap chip in a Next.js Link
        if (href) {
          return (
            <Link key={key} href={href} className="mr-2 mb-2 block">
              {chip}
            </Link>
          );
        }

        // No href → just return the button
        return React.cloneElement(chip, { key });
      })}
    </div>
  );
}
