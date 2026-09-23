import React from 'react';

// MOCKUP P2: Silakan ditimpa oleh Programmer 1
export default function Navbar() {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="font-bold text-lg hidden sm:block text-gray-900 dark:text-white">
            DUITku
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            dummy@duitku.local
          </span>
          {/* ThemeToggle Mockup */}
          <button className="p-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md">
            🌙
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
