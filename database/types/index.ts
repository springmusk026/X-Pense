export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface RecurringExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  monthlyBudget?: number;
  currency?: string;
  notificationsEnabled?: boolean;
}
