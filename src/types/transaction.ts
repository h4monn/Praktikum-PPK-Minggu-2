/**
 * Types representing the transaction features and database models
 */

export type TransactionType = 'income' | 'expense';

// Represents a category in the database
export interface Category {
  id: string;
  user_id: string | null; // null for system/default categories
  name: string;
  type: TransactionType;
  icon: string | null;
  created_at: string;
}

// Represents a user profile in the database
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_preference: string;
  created_at: string;
  updated_at: string;
}

// Represents a transaction in the database
export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined relation property (optional, populated if queried with joined table)
  category?: Category;
}

export interface FinancialSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}
