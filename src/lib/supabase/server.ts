import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// MOCKUP P2: Dibuat khusus untuk pengujian Programmer 2.
// Programmer 1 silakan timpa file ini dengan @supabase/ssr asli Anda kelak.

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

  // MOCK AUTH: Memanipulasi fungsi getUser agar selalu mengembalikan dummy user
  // (Hal ini diperlukan karena kita belum punya form login yang berfungsi dan RLS bergantung pada auth.uid)
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  
  supabase.auth.getUser = async () => {
    return {
      data: {
        user: {
          id: '11111111-1111-1111-1111-111111111111',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'dummy@duitku.local'
        } as any
      },
      error: null
    };
  };

  return supabase;
};
