// Base model interface
export interface BaseModel {
  id: number;
}

// Data models
export interface Expense extends BaseModel {
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_uri?: string;
  card_id?: number;
  recurring_id?: number; // Add recurring_id here as well
  created_at?: string;
}

export interface Category extends BaseModel {
  name: string;
  icon: string;
  budget: number;
  color: string;
}

export interface Card extends BaseModel {
  nickname: string;
  last_four: string;
  issuer: string;
  type: string;
  expiry: string;
  color: string;
  created_at?: string;
}

export interface RecurringExpense extends BaseModel {
  amount: number;
  category: string;
  description: string;
  frequency: string;
  interval: number;
  start_date: string;
  end_date?: string;
  last_generated?: string;
  card_id?: number;
  created_at?: string;
}

export interface SplitExpense extends BaseModel {
  expense_id: number;
  participant_name: string;
  amount: number;
  status: string;
  created_at?: string;
}

export type DataModel = Expense | Category | Card | RecurringExpense | SplitExpense;

export interface CategoryData {
  name: string;
  icon: string;
  color: string;
  budget: number;
}

export const DEFAULT_CATEGORIES: CategoryData[] = [
  { name: 'Food', icon: 'food', color: '#FF6B6B', budget: 0 },
  { name: 'Transport', icon: 'car', color: '#4ECDC4', budget: 0 },
  { name: 'Shopping', icon: 'shopping', color: '#45B7D1', budget: 0 },
  { name: 'Bills', icon: 'file-document', color: '#96CEB4', budget: 0 },
  { name: 'Entertainment', icon: 'gamepad-variant', color: '#D4A5A5', budget: 0 },
  { name: 'Health', icon: 'medical-bag', color: '#9B6B6C', budget: 0 },
  { name: 'Travel', icon: 'airplane', color: '#CEE5D0', budget: 0 },
  { name: 'Other', icon: 'dots-horizontal', color: '#B5B5B5', budget: 0 },
];
