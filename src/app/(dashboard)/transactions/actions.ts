'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Transaction, TransactionType, MonthlyBudget } from '@/types/transaction';

// Server Action untuk mengambil Ringkasan
export async function getDashboardSummary() {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(id, name, type)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }

  return data as Transaction[];
}

// Server Action untuk membuat transaksi baru
export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
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

  // Find or create category
  let category_id;
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .eq('name', category)
    .eq('type', type)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .limit(1);

  if (existingCats && existingCats.length > 0) {
    category_id = existingCats[0].id;
  } else {
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category,
        type
      })
      .select('id')
      .single();
    
    if (catError) {
      console.error('Error creating category:', catError);
      throw new Error('Failed to create category');
    }
    category_id = newCat.id;
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount,
      category_id,
      transaction_date: date,
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
  const supabase = await createClient();
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

  // Find or create category
  let category_id;
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .eq('name', category)
    .eq('type', type)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .limit(1);

  if (existingCats && existingCats.length > 0) {
    category_id = existingCats[0].id;
  } else {
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category,
        type
      })
      .select('id')
      .single();
    
    if (catError) {
      console.error('Error creating category:', catError);
      throw new Error('Failed to create category');
    }
    category_id = newCat.id;
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      type,
      amount,
      category_id,
      transaction_date: date,
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
  const supabase = await createClient();
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

// Server Action untuk mengambil Anggaran Bulanan aktif
export async function getCurrentBudget(monthYear?: string): Promise<MonthlyBudget | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const targetMonth = monthYear || new Date().toISOString().slice(0, 7);

  const { data, error } = await supabase
    .from('monthly_budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', targetMonth)
    .maybeSingle();

  if (error) {
    console.error('Error fetching budget:', error);
    return null;
  }

  return data as MonthlyBudget | null;
}

// Server Action untuk menambah atau memperbarui Anggaran Bulanan
export async function upsertBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const amount = Number(formData.get('amount'));
  const month_year = (formData.get('month_year') as string) || new Date().toISOString().slice(0, 7);

  if (isNaN(amount) || amount < 0) {
    throw new Error('Nominal anggaran harus berupa angka positif.');
  }

  const { error } = await supabase
    .from('monthly_budgets')
    .upsert(
      {
        user_id: user.id,
        month_year,
        amount,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,month_year' }
    );

  if (error) {
    console.error('Error saving budget:', error);
    throw new Error('Gagal menyimpan anggaran bulanan: ' + error.message);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

