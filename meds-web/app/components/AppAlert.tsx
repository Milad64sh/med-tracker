'use client';

import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export type AppAlertProps = {
  open: boolean;
  title?: string;
  message: string;
  variant?: AlertVariant;
  onOk?: () => void;
  onClose: () => void;
};

function variantStyles(variant: AlertVariant) {
  switch (variant) {
    case 'success':
      return {
        icon: CheckCircleIcon,
        wrapper: 'border-emerald-200 bg-emerald-50',
        title: 'text-emerald-900',
        message: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    case 'error':
      return {
        icon: ExclamationTriangleIcon,
        wrapper: 'border-red-200 bg-red-50',
        title: 'text-red-900',
        message: 'text-red-800',
        badge: 'bg-red-100 text-red-800',
      };
    case 'warning':
      return {
        icon: ExclamationTriangleIcon,
        wrapper: 'border-amber-200 bg-amber-50',
        title: 'text-amber-900',
        message: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-800',
      };
    case 'info':
    default:
      return {
        icon: InformationCircleIcon,
        wrapper: 'border-sky-200 bg-sky-50',
        title: 'text-sky-900',
        message: 'text-sky-800',
        badge: 'bg-sky-100 text-sky-800',
      };
  }
}

export function AppAlert({
  open,
  title,
  message,
  variant = 'info',
  onOk,
  onClose,
}: AppAlertProps) {
  if (!open) return null;

  const styles = variantStyles(variant);
  const Icon = styles.icon;

  const handleOk = () => {
    onOk?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-xl border shadow-lg ${styles.wrapper} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4">
          <div className="mt-0.5">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${styles.badge}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <div className="flex-1">
            {title && (
              <h2 className={`text-base font-semibold ${styles.title}`}>
                {title}
              </h2>
            )}
            <p className={`mt-1 text-sm leading-relaxed ${styles.message}`}>
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex rounded-md p-1.5 text-sm text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Close alert"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Footer buttons */}
        <div className="mt-4 flex justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOk}
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
