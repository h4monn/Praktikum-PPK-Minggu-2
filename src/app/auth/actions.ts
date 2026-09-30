'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' };
  }

  // 1. Coba login dengan email dan kata sandi yang diinputkan
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  // 2. Jika email belum dikonfirmasi di Supabase
  if (signInError.message.toLowerCase().includes('email not confirmed')) {
    return {
      error: 'Email belum dikonfirmasi. Silakan matikan opsi "Confirm email" di Dashboard Supabase (Authentication -> Providers -> Email).',
    };
  }

  // 3. Pengecekan spesifik: Membedakan apakah email belum terdaftar ATAU kata sandi yang salah
  try {
    const { data: signUpCheck } = await supabase.auth.signUp({
      email,
      password: '___dummy_check_password_123456___',
    });

    // Jika user ada tetapi identities bernilai [], berarti email SUDAH terdaftar di Supabase -> Password-nya yang salah!
    if (signUpCheck?.user && signUpCheck.user.identities && signUpCheck.user.identities.length === 0) {
      return { error: 'Kata sandi salah.' };
    }

    // Jika identities tidak kosong, berarti email BELUM terdaftar sebelumnya
    if (signUpCheck?.user && signUpCheck.user.identities && signUpCheck.user.identities.length > 0) {
      // Sesi dummy langsung dibersihkan/dikeluarkan
      await supabase.auth.signOut();
      return { error: 'Email belum terdaftar.' };
    }
  } catch {
    // Abaikan jika terjadi galat saat pengecekan
  }

  // Fallback jika tidak terdeteksi via identities
  return { error: 'Email atau kata sandi tidak valid.' };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' };
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('user already exists')
    ) {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }
    return { error: error.message };
  }

  // Supabase mengembalikan identities = [] jika email sudah terdaftar sebelumnya
  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
