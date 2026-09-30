import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!match) return null;
  let val = match[1].trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  }
  return val;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const dbUrl = getEnv('DATABASE_URL');

const sql = postgres(dbUrl, { ssl: 'require' });
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  try {
    const email = 'mahasiswa@duitku.com';
    const password = 'password123';

    // 1. Bersihkan user lama jika id-nya custom
    await sql`DELETE FROM auth.identities WHERE email = ${email} OR user_id = '22222222-2222-2222-2222-222222222222'`;
    await sql`DELETE FROM auth.users WHERE email = ${email} OR id = '22222222-2222-2222-2222-222222222222'`;

    // 2. Generate UUID standar
    const [{ new_id: userId }] = await sql`SELECT gen_random_uuid() as new_id`;
    console.log('Generated User ID:', userId);

    const meta = {
      sub: userId,
      email: email,
      email_verified: true,
      phone_verified: false
    };

    // 3. Masukkan ke auth.users
    await sql`
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        ${userId},
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        ${email},
        crypt(${password}, gen_salt('bf')),
        now(),
        now(),
        now(),
        ${sql.json({ provider: 'email', providers: ['email'] })},
        ${sql.json(meta)},
        now(),
        now(),
        '', '', '', ''
      );
    `;

    // 4. Masukkan ke auth.identities
    const [{ ident_id: identityId }] = await sql`SELECT gen_random_uuid() as ident_id`;
    await sql`
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        ${identityId},
        ${userId},
        ${sql.json(meta)},
        'email',
        ${userId},
        now(),
        now(),
        now()
      );
    `;

    // 5. Pastikan public.profiles terisi
    await sql`
      INSERT INTO public.profiles (id, full_name)
      VALUES (${userId}, 'Mahasiswa Duitku')
      ON CONFLICT (id) DO UPDATE SET full_name = 'Mahasiswa Duitku';
    `;

    // 6. Siapkan transaksi contoh agar dashboard langsung berisi data
    const [incomeCat] = await sql`
      INSERT INTO public.categories (user_id, name, type)
      VALUES (${userId}, 'Uang Saku / Beasiswa', 'income')
      RETURNING id;
    `;
    
    const [rentCat] = await sql`
      INSERT INTO public.categories (user_id, name, type)
      VALUES (${userId}, 'Sewa Kos / Asrama', 'expense')
      RETURNING id;
    `;

    const [foodCat] = await sql`
      INSERT INTO public.categories (user_id, name, type)
      VALUES (${userId}, 'Makanan & Minuman', 'expense')
      RETURNING id;
    `;

    await sql`
      INSERT INTO public.transactions (user_id, category_id, type, amount, transaction_date, notes) VALUES
      (${userId}, ${incomeCat.id}, 'income', 3500000, current_date - interval '3 days', 'Transferan Uang Saku Bulanan'),
      (${userId}, ${rentCat.id}, 'expense', 1200000, current_date - interval '2 days', 'Pembayaran Uang Kos Bulan Ini'),
      (${userId}, ${foodCat.id}, 'expense', 45000, current_date, 'Makan siang kantin kampus');
    `;

    const currentMonth = new Date().toISOString().slice(0, 7);
    await sql`
      INSERT INTO public.monthly_budgets (user_id, month_year, amount)
      VALUES (${userId}, ${currentMonth}, 2000000)
      ON CONFLICT (user_id, month_year) DO UPDATE SET amount = 2000000;
    `;

    console.log('✅ Akun & Data Berhasil Disisipkan ke PostgreSQL!');

    // 7. Tes login dengan Supabase Client
    console.log('Menguji login via Supabase client...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login test error:', error.message);
    } else {
      console.log('🎉 LOGIN TEST 100% SUKSES!');
      console.log('User Session Valid:', data.session ? 'YES' : 'NO');
      console.log('User Email:', data.user.email);
    }
  } catch (err) {
    console.error('Error setup:', err);
  } finally {
    await sql.end();
  }
}

setup();
