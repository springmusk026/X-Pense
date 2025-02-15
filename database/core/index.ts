import * as SQLite from 'expo-sqlite';
import { Expense, Category, Card, RecurringExpense, SplitExpense, DEFAULT_CATEGORIES } from '../models';

// Database instance
export let db: SQLite.SQLiteDatabase;

// Initialize database
export const initializeDatabase = async (clearData: boolean = false) => {
    db = await SQLite.openDatabaseAsync('expenses.db');

    if (clearData) {
        await db.withTransactionAsync(async () => {
            await db.execAsync('DROP TABLE IF EXISTS expenses');
            await db.execAsync('DROP TABLE IF EXISTS categories');
            await db.execAsync('DROP TABLE IF EXISTS cards');
            await db.execAsync('DROP TABLE IF EXISTS recurring_expenses');
            await db.execAsync('DROP TABLE IF EXISTS split_expenses');
        });
    }

    await db.withTransactionAsync(async () => {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                receipt_uri TEXT,
                card_id INTEGER,
                recurring_id INTEGER,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                budget REAL NOT NULL,
                color TEXT NOT NULL
            )
        `);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nickname TEXT NOT NULL,
                last_four TEXT NOT NULL,
                issuer TEXT NOT NULL,
                type TEXT NOT NULL,
                expiry TEXT NOT NULL,
                color TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS recurring_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                frequency TEXT NOT NULL,
                interval INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT,
                last_generated TEXT,
                card_id INTEGER,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS split_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expense_id INTEGER NOT NULL,
                participant_name TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (expense_id) REFERENCES expenses(id)
            )
        `);

        const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
        if (result?.count === 0) {
            for (const category of DEFAULT_CATEGORIES) {
                await db.runAsync(
                    'INSERT INTO categories (name, icon, budget, color) VALUES (?, ?, ?, ?)',
                    [category.name, category.icon, category.budget, category.color]
                );
            }
        }
    });

    return db;
};

export const getDatabase = () => {
    if (!db) {
        throw new Error("Database not initialized!");
    }
    return db;
};

