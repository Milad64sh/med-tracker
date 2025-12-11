'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppAlert } from './components/AppAlert';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

type AlertState = {
  title?: string;
  message: string;
  variant?: AlertVariant;
  onOk?: () => void;
};

type AlertContextValue = {
  showAlert: (options: AlertState) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((options: AlertState) => {
    setAlert(options);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Allow ESC key to close
  useEffect(() => {
    if (!alert) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideAlert();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [alert, hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AppAlert
        open={!!alert}
        title={alert?.title}
        message={alert?.message ?? ''}
        variant={alert?.variant ?? 'info'}
        onOk={alert?.onOk}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}
