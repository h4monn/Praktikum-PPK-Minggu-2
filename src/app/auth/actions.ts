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

  if (
    signInError.message.toLowerCase().includes('invalid login credentials') ||
    signInError.message.toLowerCase().includes('invalid_grant')
  ) {
    return { error: 'Email atau kata sandi salah.' };
  }

  return { error: signInError.message || 'Email atau kata sandi tidak valid.' };
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
