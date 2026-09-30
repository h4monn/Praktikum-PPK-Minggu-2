'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import BudgetFormModal from './BudgetFormModal';
import { logout } from '@/app/auth/actions';

interface NavbarProps {
  userEmail?: string | null;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    startLogoutTransition(async () => {
      await logout();
    });
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              DUITku
            </span>
          </Link>

          {/* Right Section: Budget Trigger, User Email, Theme Toggle, & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {userEmail ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
                {/* Tombol Atur Anggaran (FR-10) */}
                <button
                  type="button"
                  onClick={() => setIsBudgetOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                  title="Atur Batas Anggaran Bulanan"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Anggaran</span>
                </button>

                <span className="hidden md:inline-block text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                  {userEmail}
                </span>

                {/* Form Logout dengan useTransition untuk umpan balik asinkron */}
                <form onSubmit={handleLogout}>
                  <button
                    type="submit"
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Keluar dari akun"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Keluar...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                          />
                        </svg>
                        <span className="hidden sm:inline">Keluar</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Pengaturan Anggaran Bulanan */}
      <BudgetFormModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />
    </>
  );
}
