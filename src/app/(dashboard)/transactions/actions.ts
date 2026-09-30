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

// Helper untuk menentukan icon kategori mahasiswa secara otomatis
function getCategoryIcon(name: string, type: TransactionType): string {
  const lower = name.toLowerCase();
  if (lower.includes('makan') || lower.includes('minum') || lower.includes('food') || lower.includes('kopi')) return '🍔';
  if (lower.includes('transport') || lower.includes('bensin') || lower.includes('ojek') || lower.includes('bus') || lower.includes('kereta')) return '🚗';
  if (lower.includes('kos') || lower.includes('sewa') || lower.includes('kost') || lower.includes('kontrakan')) return '🏠';
  if (lower.includes('kuliah') || lower.includes('buku') || lower.includes('spp') || lower.includes('ukt') || lower.includes('fotokopi') || lower.includes('alat tulis')) return '📚';
  if (lower.includes('belanja') || lower.includes('pasar') || lower.includes('swalayan')) return '🛒';
  if (lower.includes('hiburan') || lower.includes('game') || lower.includes('nonton') || lower.includes('liburan') || lower.includes('staycation')) return '🎮';
  if (lower.includes('sehat') || lower.includes('obat') || lower.includes('dokter') || lower.includes('klinik')) return '💊';
  if (lower.includes('gaji') || lower.includes('upah')) return '💰';
  if (lower.includes('uang saku') || lower.includes('saku') || lower.includes('transferan') || lower.includes('ortu')) return '💵';
  if (lower.includes('beasiswa')) return '🎓';
  if (lower.includes('freelance') || lower.includes('proyek') || lower.includes('project')) return '💻';
  if (lower.includes('hadiah') || lower.includes('bonus') || lower.includes('thr')) return '🎁';
  return type === 'income' ? '📈' : '📉';
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
  const categoryRaw = formData.get('category') as string;
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  const category = categoryRaw?.trim();

  if (!type || !amount || !category || !date) {
    throw new Error('Semua data bertanda bintang wajib diisi');
  }

  if (amount <= 0 || isNaN(amount)) {
    throw new Error('Nominal transaksi harus lebih besar dari 0');
  }

  // Cari atau buat kategori
  let category_id;
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', category)
    .eq('type', type)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .limit(1);

  if (existingCats && existingCats.length > 0) {
    category_id = existingCats[0].id;
  } else {
    const icon = getCategoryIcon(category, type);
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
      throw new Error('Gagal membuat kategori baru');
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
      notes: notes?.trim() || null
    });

  if (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Gagal menambahkan transaksi');
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
  const categoryRaw = formData.get('category') as string;
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  const category = categoryRaw?.trim();

  if (!type || !amount || !category || !date) {
    throw new Error('Semua data bertanda bintang wajib diisi');
  }

  if (amount <= 0 || isNaN(amount)) {
    throw new Error('Nominal transaksi harus lebih besar dari 0');
  }

  // Cari atau buat kategori
  let category_id;
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', category)
    .eq('type', type)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .limit(1);

  if (existingCats && existingCats.length > 0) {
    category_id = existingCats[0].id;
  } else {
    const icon = getCategoryIcon(category, type);
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
      throw new Error('Gagal membuat kategori baru');
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
      notes: notes?.trim() || null
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Gagal memperbarui transaksi');
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
    throw new Error('Gagal menghapus transaksi');
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

