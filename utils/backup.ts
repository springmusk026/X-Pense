import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { db } from '../database';

interface BackupData {
    version: string;
    timestamp: string;
    data: {
        expenses: any[];
        categories: any[];
        cards: any[];
        recurringExpenses: any[];
        splitExpenses: any[];
    };
}

export const createBackup = async (): Promise<boolean> => {
    try {
        const backup: BackupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                expenses: [],
                categories: [],
                cards: [],
                recurringExpenses: [],
                splitExpenses: [],
            },
        };

        // Get all data from tables using the new API
        backup.data.expenses = await db.getAllAsync('SELECT * FROM expenses');
        backup.data.categories = await db.getAllAsync('SELECT * FROM categories');
        backup.data.cards = await db.getAllAsync('SELECT * FROM cards');
        backup.data.recurringExpenses = await db.getAllAsync('SELECT * FROM recurring_expenses');
        backup.data.splitExpenses = await db.getAllAsync('SELECT * FROM split_expenses');

        const backupString = JSON.stringify(backup, null, 2);

        if (Platform.OS === 'web') {
            // For web, create a downloadable file
            const blob = new Blob([backupString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-tracker-backup-${backup.timestamp.split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // For mobile, save to file and share
            const fileUri = `${FileSystem.documentDirectory}expense-tracker-backup-${backup.timestamp.split('T')[0]
                }.json`;

            await FileSystem.writeAsStringAsync(fileUri, backupString, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export Backup',
                });
            }
        }

        return true;
    } catch (error) {
        console.error('Error creating backup:', error);
        throw error;
    }
};

export const restoreBackup = async (backupData: string): Promise<boolean> => {
    try {
        const backup: BackupData = JSON.parse(backupData);

        // Validate backup format
        if (!backup.version || !backup.timestamp || !backup.data) {
            throw new Error('Invalid backup format');
        }

        await db.withTransactionAsync(async () => {
            // Clear existing data
            await db.runAsync('DELETE FROM expenses');
            await db.runAsync('DELETE FROM categories');
            await db.runAsync('DELETE FROM cards');
            await db.runAsync('DELETE FROM recurring_expenses');
            await db.runAsync('DELETE FROM split_expenses');

            // Restore categories first (due to foreign key constraints)
            for (const category of backup.data.categories) {
                await db.runAsync(
                    'INSERT INTO categories (id, name, icon, budget, color) VALUES (?, ?, ?, ?, ?)',
                    [category.id, category.name, category.icon, category.budget, category.color]
                );
            }

            // Restore cards
            for (const card of backup.data.cards) {
                await db.runAsync(
                    'INSERT INTO cards (id, nickname, last_four, issuer, type, expiry, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        card.id,
                        card.nickname,
                        card.last_four,
                        card.issuer,
                        card.type,
                        card.expiry,
                        card.color,
                        card.created_at,
                    ]
                );
            }

            // Restore recurring expenses
            for (const recurring of backup.data.recurringExpenses) {
                await db.runAsync(
                    `INSERT INTO recurring_expenses (
              id, amount, category, description, frequency, interval,
              start_date, end_date, last_generated, card_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        recurring.id,
                        recurring.amount,
                        recurring.category,
                        recurring.description,
                        recurring.frequency,
                        recurring.interval,
                        recurring.start_date,
                        recurring.end_date,
                        recurring.last_generated,
                        recurring.card_id,
                        recurring.created_at,
                    ]
                );
            }

            // Restore split expenses
            for (const split of backup.data.splitExpenses) {
                await db.runAsync(
                    `INSERT INTO split_expenses (
              id, expense_id, participant_name, amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        split.id,
                        split.expense_id,
                        split.participant_name,
                        split.amount,
                        split.status,
                        split.created_at
                    ]
                )
            }

            // Restore expenses
            for (const expense of backup.data.expenses) {
                await db.runAsync(
                    `INSERT INTO expenses (
              id, amount, category, description, date,
              receipt_uri, card_id, recurring_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        expense.id,
                        expense.amount,
                        expense.category,
                        expense.description,
                        expense.date,
                        expense.receipt_uri,
                        expense.card_id,
                        expense.recurring_id,
                        expense.created_at,
                    ]
                );
            }
        });

        return true;
    } catch (error) {
        console.error('Error restoring backup:', error);
        throw error;
    }
};
