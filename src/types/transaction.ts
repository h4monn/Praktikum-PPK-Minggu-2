export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface FinancialSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}
