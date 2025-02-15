import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../database';
import { SplitExpense } from '../../database/models';

interface SplitExpensesState {
    items: SplitExpense[];
    loading: boolean;
    error: string | null;
}

const initialState: SplitExpensesState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchSplitExpenses = createAsyncThunk(
    'splitExpenses/fetchSplitExpenses',
    async () => {
        const result = await db.getAllAsync<SplitExpense>('SELECT * FROM split_expenses ORDER BY created_at DESC');
        return result ?? [];
    }
);

export const addSplitExpense = createAsyncThunk(
  'splitExpenses/addSplitExpense',
  async (splits: Omit<SplitExpense, 'id' | 'created_at'>[]) => {
    let newSplits: SplitExpense[] = [];
    await db.withTransactionAsync(async () => {
      const placeholders = splits.map(() => '(?, ?, ?, ?)').join(',');
      const values = splits.flatMap(split => [
        split.expense_id,
        split.participant_name,
        split.amount,
        split.status,
      ]);

      const result = await db.runAsync(
        `INSERT INTO split_expenses (expense_id, participant_name, amount, status) VALUES ${placeholders}`,
        values
      );

      // Fetch the newly inserted split expenses to get their IDs and created_at timestamps.  Return all from this expense.
      newSplits = await db.getAllAsync<SplitExpense>(
        'SELECT * FROM split_expenses WHERE expense_id = ?',
        [splits[0].expense_id]
      );
    });
    return newSplits;
  }
);

export const updateSplitExpenseStatus = createAsyncThunk(
    'splitExpenses/updateStatus',
    async ({ id, status }: { id: number; status: 'pending' | 'paid' }) => {
        await db.runAsync('UPDATE split_expenses SET status = ? WHERE id = ?', [status, id]);
        return { id, status };
    }
);

const splitExpensesSlice = createSlice({
    name: 'splitExpenses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSplitExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSplitExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSplitExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch split expenses';
            })
            .addCase(addSplitExpense.fulfilled, (state, action) => {
                state.items.push(...action.payload);
            })
            .addCase(updateSplitExpenseStatus.fulfilled, (state, action) => {
                const split = state.items.find(item => item.id === action.payload.id);
                if (split) {
                    split.status = action.payload.status as 'pending' | 'paid';
                }
            });
    },
});

export default splitExpensesSlice.reducer;
