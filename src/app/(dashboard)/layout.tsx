import React from 'react';
import Navbar from '@/components/Navbar';

// MOCKUP P2: Silakan ditimpa oleh Programmer 1
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
