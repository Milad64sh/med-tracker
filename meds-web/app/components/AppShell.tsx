'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { fetcher } from '@/lib/api';

type AppShellProps = {
  children: React.ReactNode;
};
type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string | null;
  is_admin?: boolean;
};


const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/services', label: 'Services' },
  { href: '/meds', label: 'Medications' },
];

function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false); // user menu
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false); // mobile sidebar

  // Load current user for initials
  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => fetcher<User>('/api/auth/me'),
    retry: false,
  });

  const adminNavItems = [
  { href: '/owner/invites', label: 'Invite Users' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/restocks', label: 'Restock activity' },
  { href: '/admin/audit', label: 'Audit' },
];


  const initials = getInitials(user?.name ?? null);

const handleLogout = async () => {
  try {
    await fetcher('/api/auth/logout', { method: 'POST' });
  } catch {
  } finally {
    router.push('/login');
    router.refresh(); 
  }
};


  // Close menus when route changes
  React.useEffect(() => {
    setMenuOpen(false);
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-100 text-neutral-900">
      {/* Center the whole shell and cap width on desktop */}
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white/90 px-4 py-6 md:flex">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-neutral-900">Med Tracker</h1>
            <p className="text-xs text-neutral-500">Medication dashboard</p>
          </div>

          <nav className="space-y-1">
            {user?.is_admin && adminNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  type="button"
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium cursor-pointer ${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}

            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    type="button"
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium cursor-pointer ${
                      active
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 text-xs text-neutral-400">
            <p>© {new Date().getFullYear()} Med Tracker</p>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-screen flex-1 flex-col min-w-0 max-w-full">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-2 py-3 sm:px-3 md:px-6 lg:px-8">
            {/* Left side: mobile menu button + title */}
            <div className="flex items-center gap-2">
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white p-1.5 text-neutral-700 hover:bg-neutral-100 md:hidden cursor-pointer"
              >
                <span className="sr-only">Open navigation</span>
                <div className="flex flex-col gap-0.5">
                  <span className="h-0.5 w-5 rounded bg-neutral-700" />
                  <span className="h-0.5 w-4 rounded bg-neutral-700" />
                  <span className="h-0.5 w-5 rounded bg-neutral-700" />
                </div>
              </button>

              <span className="text-sm font-semibold md:hidden">Med Tracker</span>
            </div>

            <div className="flex-1" />

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-sm md:inline">Account</span>
                <span className="text-xs">{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-30 mt-2 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                  <Link href="/profile">
                    <button
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </button>
                  </Link>

                  <Link href="/settings">
                    <button
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                      onClick={() => setMenuOpen(false)}
                    >
                      Settings
                    </button>
                  </Link>

                  <div className="my-1 border-t border-neutral-200" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Mobile sidebar overlay */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/40 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              <div
                className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-neutral-200 bg-white px-4 py-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-base font-bold text-neutral-900">
                      Med Tracker
                    </h1>
                    <p className="text-xs text-neutral-500">
                      Medication dashboard
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <nav className="space-y-1">
                  {user?.is_admin && adminNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <button
                        type="button"
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium cursor-pointer ${
                          pathname === item.href || pathname?.startsWith(item.href + '/')
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    </Link>
                  ))}

                  {navItems.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname?.startsWith(item.href + '/');

                    return (
                      <Link key={item.href} href={item.href}>
                        <button
                          type="button"
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium cursor-pointer ${
                            active
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-700 hover:bg-neutral-100 '
                          }`}
                        >
                          {item.label}
                        </button>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Page body */}
          <main className="flex-1 w-full max-w-full px-2 py-4 sm:px-3 md:px-6 md:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
