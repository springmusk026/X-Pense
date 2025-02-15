import { db } from './core';
import { RecurringExpense } from './models';

export const fetchRecurringExpensesFromDB = async (): Promise<RecurringExpense[]> => {
    const result = await db.getAllAsync<RecurringExpense>('SELECT * FROM recurring_expenses ORDER BY created_at DESC');
    return result ?? [];
};

export const addRecurringExpenseToDB = async (
    expense: Omit<RecurringExpense, 'id' | 'last_generated'>
): Promise<RecurringExpense> => {
    const result = await db.runAsync(
        `INSERT INTO recurring_expenses (
            amount, category, description, frequency, interval,
            start_date, end_date, last_generated, card_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            expense.amount,
            expense.category,
            expense.description,
            expense.frequency,
            expense.interval,
            expense.start_date,
            expense.end_date ?? null,
            expense.start_date, // Initial last_generated is start_date
            expense.card_id ?? null,
        ]
    );
      const newExpense = {
        ...expense,
        id: result.lastInsertRowId,
        last_generated: expense.start_date,
    };
    return newExpense
};

export const updateRecurringExpenseInDB = async (
    { id, ...expense }: RecurringExpense
): Promise<RecurringExpense> => {
    await db.runAsync(
        `UPDATE recurring_expenses SET
            amount = ?, category = ?, description = ?, frequency = ?,
            interval = ?, start_date = ?, end_date = ?, card_id = ?
        WHERE id = ?`,
        [
            expense.amount,
            expense.category,
            expense.description,
            expense.frequency,
            expense.interval,
            expense.start_date,
            expense.end_date ?? null,
            expense.card_id ?? null,
            id,
        ]
    );

    return { id, ...expense };
};

export const deleteRecurringExpenseFromDB = async (id: number): Promise<number> => {
    await db.runAsync('DELETE FROM recurring_expenses WHERE id = ?', [id]);
    return id;
};

export const generateExpensesForRecurringExpenseInDB = async (
    recurring: RecurringExpense,
    nextDate: string
): Promise<void> => {
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            `INSERT INTO expenses (
                amount, category, description, date,
                card_id, recurring_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                recurring.amount,
                recurring.category,
                recurring.description,
                nextDate,
                recurring.card_id ?? null,
                recurring.id
            ]
        );

        // Update last_generated timestamp with optimistic locking
        const updateResult = await db.runAsync(
            'UPDATE recurring_expenses SET last_generated = ? WHERE id = ? AND last_generated = ?',
            [nextDate, recurring.id, recurring.last_generated ?? new Date().toISOString()]
        );

        if (updateResult.changes === 0) {
            throw new Error('Concurrent update detected');
        }
    });
};
