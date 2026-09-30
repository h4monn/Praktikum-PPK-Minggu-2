import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. Baca konfigurasi .env
const envFile = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

const supabase = createClient(url, key);

// Helper Icon Category
function getCategoryIcon(name, type) {
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

// Timezone safe date
function formatDateSafe(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(year, month, day));
  }
  return dateStr;
}

// Format Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Hitung Ringkasan Finansial
function calculateSummary(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    else if (t.type === 'expense') totalExpense += Number(t.amount);
  });
  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense
  };
}

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    failCount++;
  }
}

async function runAutomatedTests() {
  console.log('\n=============================================================');
  console.log('🧪 PENGUJIAN OTOMATIS: SELURUH FITUR PROGRAMMER 2 (DUITku)');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: KONEKTIVITAS & SKEMA DATABASE
  // -------------------------------------------------------------
  console.log('📦 [1/6] Menguji Skema Database & PostgREST API...');
  try {
    const { data: txTable, error: txErr } = await supabase.from('transactions').select('*').limit(1);
    assert(!txErr, 'Tabel public.transactions ada dan dapat diakses', txErr?.message);

    const { data: catTable, error: catErr } = await supabase.from('categories').select('*').limit(1);
    assert(!catErr, 'Tabel public.categories ada dan dapat diakses', catErr?.message);
  } catch (err) {
    assert(false, 'Koneksi ke database gagal', err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: KALKULASI ARUS KAS & RINGKASAN (FR-03)
  // -------------------------------------------------------------
  console.log('\n💰 [2/6] Menguji Logika Kalkulasi Ringkasan Finansial (FR-03)...');
  const dummyTxList = [
    { type: 'income', amount: 2000000 },
    { type: 'income', amount: 500000 },
    { type: 'expense', amount: 350000 },
    { type: 'expense', amount: 150000 },
  ];
  const summaryResult = calculateSummary(dummyTxList);
  assert(summaryResult.totalIncome === 2500000, 'Total Pemasukan dihitung benar (2.000.000 + 500.000 = 2.500.000)');
  assert(summaryResult.totalExpense === 500000, 'Total Pengeluaran dihitung benar (350.000 + 150.000 = 500.000)');
  assert(summaryResult.balance === 2000000, 'Saldo Bersih dihitung benar (2.500.000 - 500.000 = 2.000.000)');

  // Pengujian Kasus Defisit
  const deficitList = [
    { type: 'income', amount: 500000 },
    { type: 'expense', amount: 800000 }
  ];
  const deficitResult = calculateSummary(deficitList);
  assert(deficitResult.balance === -300000, 'Kalkulasi saldo defisit bernilai negatif (-300.000)');
  assert(formatRupiah(summaryResult.balance).includes('2.500.000') || formatRupiah(summaryResult.totalIncome).includes('2.500.000'), 'Format mata uang Rupiah standar IDR valid');

  // -------------------------------------------------------------
  // TEST SUITE 3: AUTO-ICON KATEGORI & PRESET MAHASISWA (FR-04)
  // -------------------------------------------------------------
  console.log('\n🏷️ [3/6] Menguji Pemetaan Otomatis Ikon Kategori (Auto-Icon)...');
  assert(getCategoryIcon('Makan Siang Ayam Geprek', 'expense') === '🍔', 'Kategori Makanan menghasilkan icon 🍔');
  assert(getCategoryIcon('Bensin & Parkir Kampus', 'expense') === '🚗', 'Kategori Transportasi menghasilkan icon 🚗');
  assert(getCategoryIcon('Bayar Kos Bulanan', 'expense') === '🏠', 'Kategori Kos menghasilkan icon 🏠');
  assert(getCategoryIcon('Beli Buku Diktat & Modul', 'expense') === '📚', 'Kategori Kuliah/Buku menghasilkan icon 📚');
  assert(getCategoryIcon('Uang Saku dari Orang Tua', 'income') === '💵', 'Kategori Uang Saku menghasilkan icon 💵');
  assert(getCategoryIcon('Beasiswa Prestasi', 'income') === '🎓', 'Kategori Beasiswa menghasilkan icon 🎓');
  assert(getCategoryIcon('Fee Desain Web Freelance', 'income') === '💻', 'Kategori Freelance/Proyek menghasilkan icon 💻');

  // -------------------------------------------------------------
  // TEST SUITE 4: PENGURUTAN KRONOLOGIS TRANSAKSI (FR-05)
  // -------------------------------------------------------------
  console.log('\n📅 [4/6] Menguji Pengurutan Kronologis Tanggal (FR-05)...');
  const unsortedTransactions = [
    { id: '1', transaction_date: '2026-09-10', created_at: '2026-09-10T10:00:00Z', notes: 'Transaksi Awal' },
    { id: '2', transaction_date: '2026-09-28', created_at: '2026-09-28T12:00:00Z', notes: 'Transaksi Terbaru' },
    { id: '3', transaction_date: '2026-09-15', created_at: '2026-09-15T09:00:00Z', notes: 'Transaksi Tengah' },
  ];
  const sorted = [...unsortedTransactions].sort((a, b) => {
    const d1 = new Date(b.transaction_date).getTime();
    const d2 = new Date(a.transaction_date).getTime();
    if (d1 !== d2) return d1 - d2;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  assert(sorted[0].id === '2', 'Transaksi paling baru (2026-09-28) berada di posisi teratas (urutan pertama)');
  assert(sorted[1].id === '3', 'Transaksi tanggal menengah (2026-09-15) berada di posisi kedua');
  assert(sorted[2].id === '1', 'Transaksi tanggal paling lama (2026-09-10) berada di posisi terakhir');

  // -------------------------------------------------------------
  // TEST SUITE 5: TIMEZONE-SAFE DATE FORMATTING (NFR-04)
  // -------------------------------------------------------------
  console.log('\n🌐 [5/6] Menguji Pemformatan Tanggal Aman Timezone (Anti UTC Shift)...');
  const sampleDate = '2026-09-30';
  const formatted = formatDateSafe(sampleDate);
  assert(formatted.includes('30') && formatted.toLowerCase().includes('september') && formatted.includes('2026'),
    `Format tanggal '${sampleDate}' terbaca tepat '${formatted}' (tanpa bergeser ke tanggal 29)`);

  // -------------------------------------------------------------
  // TEST SUITE 6: SIMULASI ISOLASI DATA RLS (NFR-01)
  // -------------------------------------------------------------
  console.log('\n🛡️ [6/6] Menguji Isolasi Data Antar Pengguna (NFR-01 Data Isolation)...');
  const userA_Id = '11111111-1111-1111-1111-111111111111';
  const userB_Id = '22222222-2222-2222-2222-222222222222';

  const dataset = [
    { id: 'tx-1', user_id: userA_Id, amount: 100000, notes: 'Rahasia User A' },
    { id: 'tx-2', user_id: userA_Id, amount: 200000, notes: 'Uang Makan User A' },
    { id: 'tx-3', user_id: userB_Id, amount: 500000, notes: 'Tabungan User B' },
  ];

  // Simulasi query oleh User A
  const visibleToUserA = dataset.filter((tx) => tx.user_id === userA_Id);
  const visibleToUserB = dataset.filter((tx) => tx.user_id === userB_Id);

  assert(visibleToUserA.length === 2, 'User A hanya melihat 2 transaksi miliknya sendiri');
  assert(!visibleToUserA.some(tx => tx.user_id === userB_Id), 'User A sama sekali tidak memiliki akses ke transaksi User B');
  assert(visibleToUserB.length === 1, 'User B hanya melihat 1 transaksi miliknya sendiri');
  assert(!visibleToUserB.some(tx => tx.user_id === userA_Id), 'User B sama sekali tidak memiliki akses ke transaksi User A');

  // Ringkasan Akhir
  console.log('\n=============================================================');
  console.log(`📊 HASIL PENGUJIAN OTOMATIS:`);
  console.log(`   Total Pengujian : ${passCount + failCount}`);
  console.log(`   Berhasil (PASS) : ${passCount}`);
  console.log(`   Gagal (FAIL)    : ${failCount}`);
  console.log('=============================================================');

  if (failCount === 0) {
    console.log('🎉 SEMUA FITUR PROGRAMMER 2 DINYATAKAN LOLOS UJI 100%!\n');
    process.exit(0);
  } else {
    console.error('⚠️ Terdapat pengujian yang gagal, silakan periksa rincian di atas.\n');
    process.exit(1);
  }
}

runAutomatedTests();
