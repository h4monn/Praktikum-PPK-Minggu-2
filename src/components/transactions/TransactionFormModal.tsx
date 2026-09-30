'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { addTransaction, updateTransaction } from '@/app/(dashboard)/transactions/actions';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
  onSuccess?: (message: string) => void;
}

// Rekomendasi kategori khas mahasiswa
const STUDENT_CATEGORIES: Record<TransactionType, string[]> = {
  expense: [
    'Makan & Minum',
    'Transportasi',
    'Kos & Hunian',
    'Kuliah & Buku',
    'Hiburan',
    'Belanja',
    'Kesehatan',
    'Lain-lain'
  ],
  income: [
    'Uang Saku',
    'Gaji Part-time',
    'Beasiswa',
    'Proyek Freelance',
    'Hadiah / Hadiah Lomba',
    'Lain-lain'
  ]
};

export default function TransactionFormModal({ isOpen, onClose, initialData, onSuccess }: TransactionFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialData;

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialData?.amount ? String(initialData.amount) : '');
  const [category, setCategory] = useState<string>(initialData?.category?.name || '');
  const [date, setDate] = useState<string>(
    initialData?.transaction_date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Reset form ketika modal dibuka / berganti data
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category?.name || '');
      setDate(initialData.transaction_date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Format rupiah live preview
  const formatRupiahPreview = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num) || num <= 0) return null;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }

    if (!category.trim()) {
      setError('Kategori transaksi wajib diisi.');
      return;
    }

    if (!date) {
      setError('Tanggal transaksi wajib dipilih.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('amount', String(numAmount));
    formData.append('category', category.trim());
    formData.append('date', date);
    formData.append('notes', notes.trim());

    startTransition(async () => {
      try {
        if (isEdit && initialData) {
          await updateTransaction(initialData.id, formData);
          if (onSuccess) onSuccess('Transaksi berhasil diperbarui!');
        } else {
          await addTransaction(formData);
          if (onSuccess) onSuccess('Transaksi baru berhasil ditambahkan!');
        }
        onClose();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat menyimpan transaksi.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? 'Perbarui data catatan finansial Anda' : 'Masukkan rincian pemasukan atau pengeluaran Anda'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Segmented Type Toggle (Pengeluaran vs Pemasukan) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>📉</span> Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>📈</span> Pemasukan
              </button>
            </div>
          </div>
          
          {/* Nominal Input with Live Preview */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              {formatRupiahPreview(amount) && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 animate-fadeIn">
                  {formatRupiahPreview(amount)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">
                Rp
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="1"
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Kategori Input & Quick Preset Chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Pilih di bawah atau ketik sendiri..."
            />
            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STUDENT_CATEGORIES[type].map((catName) => (
                <button
                  type="button"
                  key={catName}
                  onClick={() => setCategory(catName)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    category === catName
                      ? 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tanggal Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Tanggal Transaksi <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          {/* Catatan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Contoh: Makan siang nasi padang bareng teman sekelas"
            ></textarea>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
