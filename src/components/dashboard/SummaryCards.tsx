'use client';

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

  const isSurplus = summary.balance > 0;
  const isDeficit = summary.balance < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* 1. KARTU SALDO BERSIH */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold">
              💳
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saldo Saat Ini
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Pemasukan - Pengeluaran
              </p>
            </div>
          </div>

          {/* Badge Status Saldo */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDeficit 
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              : isSurplus
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isDeficit ? 'Defisit' : isSurplus ? 'Surplus' : 'Seimbang'}
          </span>
        </div>

        <p className={`text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 ${
          summary.balance >= 0 
            ? 'text-gray-900 dark:text-white' 
            : 'text-rose-600 dark:text-rose-400'
        }`}>
          {formatRupiah(summary.balance)}
        </p>

        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Arus kas bersih aktif</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Dompet Utama</span>
        </div>
      </div>
      
      {/* 2. KARTU TOTAL PEMASUKAN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
              📈
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Pemasukan
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Akumulasi dana masuk
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Inflow
          </span>
        </div>

        <p className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
          +{formatRupiah(summary.totalIncome)}
        </p>

        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Uang saku, gaji, beasiswa</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aktif</span>
        </div>
      </div>
      
      {/* 3. KARTU TOTAL PENGELUARAN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg font-bold">
              📉
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Pengeluaran
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Akumulasi dana keluar
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            Outflow
          </span>
        </div>

        <p className="text-2xl lg:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight mt-1">
          -{formatRupiah(summary.totalExpense)}
        </p>

        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Makan, kos, transport, dll.</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">Tercatat</span>
        </div>
      </div>

    </div>
  );
}
