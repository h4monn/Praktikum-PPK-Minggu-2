'use client';

import React, { useState, useTransition } from 'react';
import { Transaction } from '@/types/transaction';
import { deleteTransaction } from '@/app/(dashboard)/transactions/actions';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSuccess?: (message: string) => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, transaction, onSuccess }: DeleteConfirmModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(year, month, day));
    }
    return dateStr;
  };

  function handleDelete() {
    if (!transaction) return;
    setError(null);

    startTransition(async () => {
      try {
        await deleteTransaction(transaction.id);
        if (onSuccess) onSuccess('Transaksi berhasil dihapus!');
        onClose();
      } catch (err: any) {
        setError(err.message || 'Gagal menghapus transaksi. Silakan coba lagi.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
        
        {/* Warning Icon */}
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
          🗑️
        </div>

        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Hapus Transaksi Ini?
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data transaksi yang dihapus tidak dapat dipulihkan kembali.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Detail Box Transaksi yang akan dihapus */}
        <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700/60 text-left">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{transaction.category?.icon || '📁'}</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {transaction.category?.name || 'Kategori'}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              transaction.type === 'income'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
            }`}>
              {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </div>

          <div className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
            {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between pt-2 border-t border-gray-200/60 dark:border-gray-600/60">
            <span>📅 {formatDate(transaction.transaction_date)}</span>
            {transaction.notes && (
              <span className="truncate max-w-[180px] italic">"{transaction.notes}"</span>
            )}
          </div>
        </div>
        
        {/* Tombol Konfirmasi */}
        <div className="flex justify-center gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 flex-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2.5 flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
