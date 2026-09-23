import React from 'react';
import { getDashboardSummary, getTransactions } from '../transactions/actions';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  // Panggil Server Actions untuk mengambil data
  // Jika auth error (misal belum login), secara ideal akan ditangkap oleh Error Boundary atau Middleware (tugas P1)
  const summary = await getDashboardSummary();
  const transactions = await getTransactions();

  return (
    <DashboardClient 
      summary={summary} 
      transactions={transactions} 
    />
  );
}
