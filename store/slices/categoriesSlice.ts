import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../database';
import {Category} from '../../database/models'

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async () => {
        const result = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
        return result ?? [];
    }
);

export const updateCategoryBudget = createAsyncThunk(
  'categories/updateBudget',
  async ({ id, budget }: { id: number; budget: number }) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE categories SET budget = ? WHERE id = ?', [budget, id]);
    });
    return { id, budget };
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(updateCategoryBudget.fulfilled, (state, action) => {
        const index = state.items.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.items[index].budget = action.payload.budget;
        }
      });
  },
});

export default categoriesSlice.reducer;
