'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  hasActiveFilter?: boolean;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  hasActiveFilter = false
}: TransactionListProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Timezone-safe local date formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(new Date(year, month, day));
    }
    return dateStr;
  };

  // State Kosong (Empty State)
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
          {hasActiveFilter ? '🔍' : '📝'}
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {hasActiveFilter ? 'Tidak Ada Hasil Transaksi' : 'Belum Ada Transaksi'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {hasActiveFilter
            ? 'Coba sesuaikan kata kunci pencarian atau ubah filter jenis transaksi Anda.'
            : 'Mulai kelola keuangan Anda dengan mencatat pemasukan atau pengeluaran pertama hari ini.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      {/* 1. TAMPILAN MOBILE (Card List - untuk layar ponsel < 640px) */}
      <div className="block sm:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl p-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  {tx.category?.icon || (tx.type === 'income' ? '💰' : '🛒')}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {tx.category?.name || 'Umum'}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(tx.transaction_date)}
                  </span>
                </div>
              </div>

              {/* Nominal */}
              <div className="text-right">
                <div className={`text-base font-bold ${
                  tx.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                  tx.type === 'income'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}>
                  {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
            </div>

            {/* Catatan jika ada */}
            {tx.notes && (
              <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg mb-3 italic">
                "{tx.notes}"
              </p>
            )}

            {/* Tombol Aksi Mobile */}
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
              <button 
                type="button"
                onClick={() => onEdit(tx)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
              >
                ✏️ Edit
              </button>
              <button 
                type="button"
                onClick={() => onDelete(tx)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center gap-1"
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. TAMPILAN DESKTOP (Tabel Klasik - untuk layar tablet/desktop >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4">Tanggal</th>
              <th scope="col" className="px-6 py-4">Kategori</th>
              <th scope="col" className="px-6 py-4">Catatan</th>
              <th scope="col" className="px-6 py-4">Nominal</th>
              <th scope="col" className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                  {formatDate(tx.transaction_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <span>{tx.category?.icon || (tx.type === 'income' ? '📈' : '📉')}</span>
                    <span>{tx.category?.name || 'Uncategorized'}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {tx.notes || '-'}
                </td>
                <td className={`px-6 py-4 font-bold whitespace-nowrap ${
                  tx.type === 'income' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  <span className="text-xs font-semibold mr-0.5">
                    {tx.type === 'income' ? '+' : '-'}
                  </span>
                  {formatRupiah(tx.amount)}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => onEdit(tx)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDelete(tx)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
