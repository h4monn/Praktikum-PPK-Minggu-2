-- ==========================================
-- DDL TRANSACTIONS TABLE
-- ==========================================

-- 1. Create table `transactions`
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy for Data Isolation
-- Pengguna hanya dapat melihat, menambah, mengubah, dan menghapus transaksi mereka sendiri.
CREATE POLICY "User dapat mengelola transaksinya sendiri"
ON public.transactions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- DUMMY DATA FOR TESTING
-- ==========================================

-- Agar kita dapat mengetes tanpa harus membuat user melalui UI Auth,
-- Kita akan menyisipkan dummy user ke dalam `auth.users` dan menghubungkannya dengan transaksi.
-- HARAP DIPERHATIKAN: Ini hanya untuk testing!
DO $$
DECLARE
    dummy_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Masukkan dummy user jika belum ada
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = dummy_user_id) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at) 
        VALUES (
            dummy_user_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'dummy@duitku.local', 
            crypt('password123', gen_salt('bf')),
            now(), 
            now()
        );
    END IF;

    -- Hapus data lama (jika ada) untuk memastikan idempotency
    DELETE FROM public.transactions WHERE user_id = dummy_user_id;

    -- Masukkan data transaksi dummy untuk dashboard
    INSERT INTO public.transactions (user_id, type, amount, category, date, notes) VALUES
    (dummy_user_id, 'income', 5000000, 'Uang Saku', current_date - interval '10 days', 'Uang saku bulanan dari ortu'),
    (dummy_user_id, 'expense', 1500000, 'Kos', current_date - interval '9 days', 'Bayar kos bulan ini'),
    (dummy_user_id, 'expense', 50000, 'Makan', current_date - interval '5 days', 'Makan siang ayam geprek'),
    (dummy_user_id, 'expense', 100000, 'Transport', current_date - interval '2 days', 'Isi bensin motor'),
    (dummy_user_id, 'income', 300000, 'Proyek', current_date - interval '1 days', 'Fee desain logo teman'),
    (dummy_user_id, 'expense', 75000, 'Hiburan', current_date, 'Nonton bioskop');

END $$;
