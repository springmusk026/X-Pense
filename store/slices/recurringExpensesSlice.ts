import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isBefore } from 'date-fns';
import { fetchExpenses } from './expensesSlice';
import { scheduleRecurringExpenseReminder, cancelRecurringExpenseReminders } from '../../utils/notifications';
import { calculateNextOccurrence } from '../../utils/recurringExpenses';
import {
  fetchRecurringExpensesFromDB,
  addRecurringExpenseToDB,
  updateRecurringExpenseInDB,
  deleteRecurringExpenseFromDB,
  generateExpensesForRecurringExpenseInDB
} from '../../database/recurringExpenses';
import { RecurringExpense } from '../../database/models';
import { db } from '../../database';
import { SQLiteTransaction } from '../../database/types';

interface RecurringExpensesState {
  items: RecurringExpense[]; loading: boolean; error: string | null;
}

const initialState: RecurringExpensesState = {
  items: [], loading: false, error: null,
};

export const fetchRecurringExpenses = createAsyncThunk(
  'recurringExpenses/fetchRecurringExpenses',
  async () => {
    return await fetchRecurringExpensesFromDB();
  }
);

export const addRecurringExpense = createAsyncThunk(
  'recurringExpenses/addRecurringExpense',
  async (expense: Omit<RecurringExpense, 'id' | 'last_generated'>) => {
    const newExpense = await addRecurringExpenseToDB(expense);

     // Schedule reminders for the next occurrence
    const nextDate = calculateNextOccurrence(newExpense.start_date,  newExpense.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly', newExpense.interval);
    await scheduleRecurringExpenseReminder(newExpense.id, newExpense.description, newExpense.amount, nextDate.toISOString());
    return newExpense
  }
);

export const updateRecurringExpense = createAsyncThunk(
  'recurringExpenses/updateRecurringExpense',
  async (expense: RecurringExpense) => {
      // Cancel existing reminders and schedule new ones
      await cancelRecurringExpenseReminders(expense.id);
      const nextDate = calculateNextOccurrence(expense.last_generated ?? new Date().toISOString(), expense.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly', expense.interval);

      await scheduleRecurringExpenseReminder(expense.id, expense.description, expense.amount, nextDate.toISOString());

      return await updateRecurringExpenseInDB(expense);
  }
);

export const deleteRecurringExpense = createAsyncThunk(
  'recurringExpenses/deleteRecurringExpense',
  async (id: number) => {
    await cancelRecurringExpenseReminders(id); // Cancel reminders
    return await deleteRecurringExpenseFromDB(id);
  }
);

export const generateRecurringExpenses = createAsyncThunk(
  'recurringExpenses/generateRecurringExpenses',
  async (_: any, { getState, dispatch }) => {
    const now = new Date();
    try {
      const recurringExpenses = await fetchRecurringExpensesFromDB();

      for (const recurring of recurringExpenses) {
        let nextDate = new Date(recurring.last_generated ?? recurring.start_date);
        const endDate = recurring.end_date ? new Date(recurring.end_date) : null;

        while (isBefore(nextDate, now)) {
          nextDate = calculateNextOccurrence(
            nextDate.toISOString(),
            recurring.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
            recurring.interval
          );

          if (endDate && isBefore(endDate, nextDate)) { break; }

          if (isBefore(nextDate, now)) {
            await generateExpensesForRecurringExpenseInDB(recurring, nextDate.toISOString());
          }
        }
      }
      await dispatch(fetchExpenses());
    } catch (error) {
      console.error('Error generating recurring expenses:', error);
      throw error;
    }
}
);

const recurringExpensesSlice = createSlice({
name: 'recurringExpenses',
initialState,
reducers: {},
extraReducers: (builder) => {
  builder
    .addCase(fetchRecurringExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchRecurringExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    })
    .addCase(fetchRecurringExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch recurring expenses';
    })
    .addCase(addRecurringExpense.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    })
    .addCase(updateRecurringExpense.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) { state.items[index] = action.payload; }
    })
    .addCase(deleteRecurringExpense.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    });
},
});

export default recurringExpensesSlice.reducer;
