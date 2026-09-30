'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getCurrentBudget, upsertBudget } from '@/app/(dashboard)/transactions/actions';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function BudgetFormModal({ isOpen, onClose, onSuccess }: BudgetFormModalProps) {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // Format: 'YYYY-MM'
  const [monthYear, setMonthYear] = useState<string>(currentMonthStr);
  const [amount, setAmount] = useState<string>('');
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Ambil data anggaran yang sudah tersimpan untuk bulan yang dipilih
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingExisting(true);
    setError(null);

    getCurrentBudget(monthYear)
      .then((data) => {
        if (isMounted) {
          if (data && data.amount) {
            setAmount(String(data.amount));
          } else {
            setAmount('');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching budget:', err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingExisting(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, monthYear]);

  if (!isOpen) return null;

  const formatRupiah = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Nominal anggaran harus berupa angka 0 atau lebih besar.');
      return;
    }

    const formData = new FormData();
    formData.append('amount', String(numAmount));
    formData.append('month_year', monthYear);

    startTransition(async () => {
      try {
        await upsertBudget(formData);
        if (onSuccess) {
          onSuccess(`Anggaran untuk bulan ${monthYear} berhasil disimpan!`);
        }
        onClose();
      } catch (err: any) {
        setError(err.message || 'Gagal menyimpan anggaran bulanan.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Atur Anggaran Bulanan
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tentukan target batas pengeluaran bulanan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Input Bulan & Tahun */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Bulan & Tahun Anggaran
            </label>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Input Nominal Target */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Nominal Anggaran (Rp)
              </label>
              {loadingExisting && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Memuat data...
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="Contoh: 1500000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Format: <span className="font-bold">{formatRupiah(amount)}</span>
            </p>
          </div>

          <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
            💡 <span className="font-medium">Tips Mahasiswa:</span> Menetapkan batas anggaran membantu mengontrol pengeluaran harian dan mencegah defisit di akhir bulan.
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || loadingExisting}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Anggaran'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
