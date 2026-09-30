-- ==========================================
-- DDL FOR PROFILES, CATEGORIES, AND TRANSACTIONS
-- ==========================================

-- 1. Create table `profiles`
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    theme_preference TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Menyimpan data profil pengguna yang melengkapi auth.users.';

-- 2. Create table `categories`
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- if null, it's a default/system category
    name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.categories IS 'Menyimpan kategori sistem dan kategori kustom pengguna untuk transaksi.';

-- 3. Create table `transactions`
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.transactions IS 'Menyimpan riwayat transaksi (pemasukan/pengeluaran) pengguna.';

-- 4. Create table `monthly_budgets`
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month_year)
);
COMMENT ON TABLE public.monthly_budgets IS 'Menyimpan anggaran pengeluaran bulanan pengguna.';

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for `profiles`
-- Users can view and update their own profile.
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy for `categories`
-- Users can view system categories (user_id IS NULL) and their own categories.
CREATE POLICY "Users can view system and own categories" 
ON public.categories FOR SELECT 
TO authenticated 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can insert, update, delete their own categories.
CREATE POLICY "Users can manage own categories" 
ON public.categories FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy for `transactions`
-- Users can manage their own transactions.
CREATE POLICY "Users can manage own transactions" 
ON public.transactions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy for `monthly_budgets`
CREATE POLICY "Users can manage own budgets" 
ON public.monthly_budgets FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updated_at in transactions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_monthly_budgets_updated_at ON public.monthly_budgets;
CREATE TRIGGER set_monthly_budgets_updated_at
  BEFORE UPDATE ON public.monthly_budgets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ==========================================
-- DUMMY DATA FOR TESTING
-- ==========================================

-- Agar kita dapat mengetes tanpa harus membuat user melalui UI Auth,
-- Kita akan menyisipkan dummy user ke dalam `auth.users` dan menghubungkannya dengan transaksi.
-- HARAP DIPERHATIKAN: Ini hanya untuk testing!
DO $$
DECLARE
    dummy_user_id UUID := '11111111-1111-1111-1111-111111111111';
    cat_income_id UUID := gen_random_uuid();
    cat_expense_id UUID := gen_random_uuid();
BEGIN
    -- Masukkan dummy user jika belum ada
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = dummy_user_id) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at, raw_user_meta_data) 
        VALUES (
            dummy_user_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'dummy@duitku.local', 
            crypt('password123', gen_salt('bf')),
            now(), 
            now(),
            '{"full_name": "Dummy User"}'::jsonb
        );
    END IF;

    -- Hapus data lama (jika ada) untuk memastikan idempotency
    DELETE FROM public.transactions WHERE user_id = dummy_user_id;
    DELETE FROM public.categories WHERE user_id = dummy_user_id;
    -- Profile created automatically by trigger if user was just created. If it already existed, we don't need to do anything.
    -- But let's ensure profile exists just in case.
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = dummy_user_id) THEN
        INSERT INTO public.profiles (id, full_name) VALUES (dummy_user_id, 'Dummy User');
    END IF;

    -- Create custom categories for dummy user
    INSERT INTO public.categories (id, user_id, name, type) VALUES 
    (cat_income_id, dummy_user_id, 'Gaji/Uang Saku', 'income'),
    (cat_expense_id, dummy_user_id, 'Makanan & Minuman', 'expense');

    -- Insert dummy default categories (system categories) if they don't exist
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Lain-lain' AND type = 'income' AND user_id IS NULL) THEN
        INSERT INTO public.categories (user_id, name, type) VALUES (NULL, 'Lain-lain', 'income');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Transportasi' AND type = 'expense' AND user_id IS NULL) THEN
        INSERT INTO public.categories (user_id, name, type) VALUES (NULL, 'Transportasi', 'expense');
    END IF;

    -- Masukkan data transaksi dummy untuk dashboard
    INSERT INTO public.transactions (user_id, category_id, type, amount, transaction_date, notes) VALUES
    (dummy_user_id, cat_income_id, 'income', 5000000, current_date - interval '10 days', 'Uang saku bulanan dari ortu'),
    (dummy_user_id, cat_expense_id, 'expense', 1500000, current_date - interval '9 days', 'Bayar kos bulan ini'),
    (dummy_user_id, cat_expense_id, 'expense', 50000, current_date - interval '5 days', 'Makan siang ayam geprek');

END $$;
