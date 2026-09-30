'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, FinancialSummary } from '@/types/transaction';
import SummaryCards from './SummaryCards';
import TransactionList from './TransactionList';
import TransactionFormModal from '../transactions/TransactionFormModal';
import DeleteConfirmModal from '../transactions/DeleteConfirmModal';

interface DashboardClientProps {
  summary: FinancialSummary;
  transactions: Transaction[];
}

export default function DashboardClient({ summary, transactions }: DashboardClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // State Filter & Search
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Toast Notifikasi
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAdd = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Filter & Search Logic
  const filteredTransactions = transactions.filter((t) => {
    // 1. Filter tipe
    if (filterType !== 'all' && t.type !== filterType) {
      return false;
    }
    // 2. Search query (kategori & catatan)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchCat = t.category?.name?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchCat && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  const hasActiveFilter = filterType !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Notifikasi Dinamis */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-200' 
            : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-800 dark:text-red-200'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-semibold">{toast.message}</p>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Dashboard & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Dashboard Finansial
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pantau arus kas mahasiswa Anda secara real-time dan teratur.
          </p>
        </div>
        <button 
          type="button"
          onClick={handleAdd}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none font-bold">+</span>
          <span>Catat Transaksi</span>
        </button>
      </div>

      {/* 3 Kartu Ringkasan (FR-03) */}
      <SummaryCards summary={summary} />
      
      {/* Area Riwayat Transaksi (FR-05) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Riwayat Transaksi
              </h2>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold px-2.5 py-0.5 rounded-full">
                {filteredTransactions.length} dari {transactions.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Daftar seluruh mutasi keuangan pribadi yang tercatat.
            </p>
          </div>

          {/* Baris Pencarian & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Input Pencarian */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="w-full sm:w-48 pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Filter Tipe */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="all">Semua Jenis</option>
              <option value="income">📈 Hanya Pemasukan</option>
              <option value="expense">📉 Hanya Pengeluaran</option>
            </select>

            {/* Reset Button jika filter aktif */}
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1 py-1"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
        
        {/* Komponen Tabel / Card List Transaksi */}
        <TransactionList 
          transactions={filteredTransactions} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          hasActiveFilter={hasActiveFilter}
        />
      </div>

      {/* Modal Form Tambah & Ubah Transaksi */}
      <TransactionFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={selectedTransaction} 
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Modal Konfirmasi Hapus Transaksi */}
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        transaction={selectedTransaction} 
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
}
