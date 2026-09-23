'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Transaction, TransactionType } from '@/types/transaction';

// Server Action untuk mengambil Ringkasan
export async function getDashboardSummary() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching summary:', error);
    throw new Error('Failed to fetch summary');
  }

  let totalIncome = 0;
  let totalExpense = 0;

  transactions?.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += Number(t.amount);
    } else if (t.type === 'expense') {
      totalExpense += Number(t.amount);
    }
  });

  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense
  };
}

// Server Action untuk mengambil daftar riwayat
export async function getTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }

  return data as Transaction[];
}

// Server Action untuk membuat transaksi baru
export async function addTransaction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const type = formData.get('type') as TransactionType;
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  if (!type || !amount || !category || !date) {
    throw new Error('Missing required fields');
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount,
      category,
      date,
      notes: notes || null
    });

  if (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction');
  }

  revalidatePath('/dashboard');
}

// Server Action untuk mengubah transaksi
export async function updateTransaction(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const type = formData.get('type') as TransactionType;
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  if (!type || !amount || !category || !date) {
    throw new Error('Missing required fields');
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      type,
      amount,
      category,
      date,
      notes: notes || null
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }

  revalidatePath('/dashboard');
}

// Server Action untuk menghapus transaksi
export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }

  revalidatePath('/dashboard');
}
