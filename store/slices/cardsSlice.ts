import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../database';

interface Card {
  id: number;
  nickname: string;
  last_four: string;
  issuer: string;
  type: 'credit' | 'debit';
  expiry: string;
  color: string;
}

interface CardsState {
  items: Card[];
  loading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async () => {
    return new Promise<Card[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards ORDER BY created_at DESC',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
);

export const addCard = createAsyncThunk(
  'cards/addCard',
  async (card: Omit<Card, 'id'>) => {
    return new Promise<Card>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO cards (nickname, last_four, issuer, type, expiry, color) VALUES (?, ?, ?, ?, ?, ?)',
          [card.nickname, card.last_four, card.issuer, card.type, card.expiry, card.color],
          (_, { insertId }) => {
            resolve({ ...card, id: insertId });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
);

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ id, ...card }: Card) => {
    return new Promise<Card>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE cards SET nickname = ?, last_four = ?, issuer = ?, type = ?, expiry = ?, color = ? WHERE id = ?',
          [card.nickname, card.last_four, card.issuer, card.type, card.expiry, card.color, id],
          () => {
            resolve({ id, ...card });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cards';
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        const index = state.items.findIndex(card => card.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default cardsSlice.reducer;