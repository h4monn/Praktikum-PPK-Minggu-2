import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        connected: false,
        message: "Environment variables NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum ditemukan di .env",
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Melakukan query ke dummy table untuk menguji handshake ke PostgreSQL
    const { error, status } = await supabase.from("_connection_test").select("*").limit(1);

    // Analisis respons:
    // - PGRST205 (HTTP 404): PostgREST berhasil otentikasi key dan terhubung ke PostgreSQL, hanya saja tabel belum dibuat.
    // - 200 OK: Tabel ada dan berhasil di-query.
    // - 401 Unauthorized: Key salah / tidak valid.
    const isConnected = error?.code === "PGRST205" || status === 200;

    return NextResponse.json({
      connected: isConnected,
      status,
      code: error?.code ?? "SUCCESS",
      message: isConnected
        ? "Database Supabase TERHUBUNG dengan sukses! (Kondisi schema cache siap, belum ada tabel dibuat)"
        : error?.message,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return NextResponse.json(
      {
        connected: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
