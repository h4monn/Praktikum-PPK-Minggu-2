import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Membaca file .env secara langsung
const envFile = fs.readFileSync(".env", "utf8");
const getEnv = (key) => envFile.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const key = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

console.log("\n==============================================");
console.log("🔍 Memeriksa Konektivitas Database Supabase");
console.log("==============================================");
console.log("📌 Target URL :", url);
console.log("🔑 Key Type   :", key?.startsWith("sb_publishable_") ? "Publishable Key (New Format)" : "API Key");

if (!url || !key) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum ditemukan di .env\n");
  process.exit(1);
}

try {
  const supabase = createClient(url, key);
  const { error, status } = await supabase.from("_connection_test").select("*").limit(1);

  if (error?.code === "PGRST205" || status === 200) {
    console.log("✅ STATUS     : TERHUBUNG KE SUPABASE DENGAN SUKSES!");
    console.log("📋 Keterangan : Respons diterima dari PostgREST & PostgreSQL (Kode: PGRST205 / Table Not Found).");
    console.log("💡 Analisis   : Karena Anda belum membuat tabel, error 'table not found' membuktikan bahwa:");
    console.log("               1. URL proyek Supabase valid.");
    console.log("               2. Publishable Key lolos otentikasi API Gateway.");
    console.log("               3. PostgreSQL siap dan schema cache aktif merespons query.");
  } else if (status === 401) {
    console.error("❌ STATUS     : GAGAL (401 Unauthorized). Kunci API atau URL tidak valid.");
    console.error("   Pesan      :", error?.message);
  } else {
    console.error(`⚠️ STATUS     : ${status} - ${error?.message}`);
  }
} catch (err) {
  console.error("❌ Gagal menghubungi server Supabase:", err.message);
}
console.log("==============================================\n");
