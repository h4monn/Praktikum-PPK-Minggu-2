'use client';

import React, { useTransition } from 'react';
import { deleteTransaction } from '@/app/(dashboard)/transactions/actions';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export default function DeleteConfirmModal({ isOpen, onClose, transactionId }: DeleteConfirmModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !transactionId) return null;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTransaction(transactionId as string);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus transaksi.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 dark:text-red-400 text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Hapus Transaksi?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 flex-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 flex-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
