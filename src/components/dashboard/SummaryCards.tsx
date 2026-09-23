import React from 'react';
import { FinancialSummary } from '@/types/transaction';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Saldo Saat Ini</h3>
        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
          {formatRupiah(summary.balance)}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pemasukan</h3>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatRupiah(summary.totalIncome)}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran</h3>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {formatRupiah(summary.totalExpense)}
        </p>
      </div>
    </div>
  );
}
