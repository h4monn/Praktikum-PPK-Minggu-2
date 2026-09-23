'use client';

import React, { useState } from 'react';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Keuangan</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola arus kas pribadi Anda dengan mudah.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Tambah Transaksi
        </button>
      </div>

      <SummaryCards summary={summary} />
      
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Riwayat Transaksi</h2>
        <TransactionList 
          transactions={transactions} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <TransactionFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={selectedTransaction} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        transactionId={selectedTransaction?.id || null} 
      />
    </div>
  );
}
