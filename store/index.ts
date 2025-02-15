import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './slices/expensesSlice';
import cardsReducer from './slices/cardsSlice';
import categoriesReducer from './slices/categoriesSlice';
import recurringExpensesReducer from './slices/recurringExpensesSlice';
import splitExpensesReducer from './slices/splitExpensesSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    cards: cardsReducer,
    categories: categoriesReducer,
    recurringExpenses: recurringExpensesReducer,
    splitExpenses: splitExpensesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;