import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../database';
import { scheduleBudgetAlert } from '../../utils/notifications';
import { Expense } from '../../database/models';

interface ExpensesState {
  items: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    const result = await db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');
    return result ?? [];
  }
);

export const addExpense = createAsyncThunk(
    'expenses/addExpense',
    async (expense: Omit<Expense, 'id'>) => {
        let newExpense: Expense | undefined;

        await db.withTransactionAsync(async () => {
            // Get up-to-date category budget and total spending
            const categoryInfoResult = await db.getFirstAsync<{ budget: number; spent: number }>(
                `SELECT c.budget, COALESCE(SUM(e.amount), 0) as spent
        FROM categories c
        LEFT JOIN expenses e ON e.category = c.name AND strftime('%Y-%m', e.date) = strftime('%Y-%m', 'now')
        WHERE c.name = ?
        GROUP BY c.name, c.budget`,
                [expense.category]
            );

            const categoryInfo = categoryInfoResult ?? { budget: 0, spent: 0 };
            const currentSpent = categoryInfo.spent;
            const budget = categoryInfo.budget;

            // Insert the new expense
            const insertResult = await db.runAsync(
                'INSERT INTO expenses (amount, category, description, date, receipt_uri, card_id, recurring_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    expense.amount,
                    expense.category,
                    expense.description,
                    expense.date,
                    expense.receipt_uri ?? null,
                    expense.card_id ?? null,
                    expense.recurring_id ?? null,
                ]
            );

            // Calculate new total with the added expense
            if (budget > 0) {
                const newTotal = currentSpent + expense.amount;
                const currentPercentage = (currentSpent / budget) * 100;
                const newPercentage = (newTotal / budget) * 100;

                // Schedule alerts only when crossing thresholds
                if (newPercentage >= 80 && currentPercentage < 80) {
                    await scheduleBudgetAlert(expense.category, newTotal, budget, 80);
                }
                if (newPercentage >= 90 && currentPercentage < 90) {
                    await scheduleBudgetAlert(expense.category, newTotal, budget, 90);
                }
                if (newPercentage >= 100 && currentPercentage < 100) {
                    await scheduleBudgetAlert(expense.category, newTotal, budget, 100);
                }
            }

            newExpense = { ...expense, id: insertResult.lastInsertRowId! };
        });
        if (!newExpense) {
            throw new Error("Failed to add expense");
        }
        return newExpense;
    }
);

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch expenses';
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            });
    },
});

export default expensesSlice.reducer;
