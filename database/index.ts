import * as SQLite from 'expo-sqlite';
import { SQLiteTransaction, SQLiteResult } from './types';
import { initializeDatabase as initDB, getDatabase } from './core';

let initialized = false;

type TransactionCallback<T> = (tx: SQLiteTransaction) => Promise<T> | T;

export const initializeDatabase = async (clearData: boolean = false) => {
  if (!initialized || clearData) {
    await initDB(clearData);
    initialized = !clearData;
  }
  return getDatabase();
};

export const resetDatabase = async () => {
  return initializeDatabase(true);
};

export const db = {
  // Legacy methods for backward compatibility
  transaction: async <T>(callback: TransactionCallback<T>): Promise<T> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }

    return new Promise<T>((resolve, reject) => {
      database!.withTransactionAsync(async () => {
        try {
          const tx: SQLiteTransaction = {
            executeSql: async (sql: string, args?: any[], success?: (tx: SQLiteTransaction, result: SQLiteResult) => void, error?: (tx: SQLiteTransaction, error: Error) => boolean | void) => {
              try {
                const res = await database!.runAsync(sql, args || []);
                success?.({} as SQLiteTransaction, res as any);
              } catch (e: any) {
                error?.({} as SQLiteTransaction, e);
              }
            },
          };
          const result = await callback(tx);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  readTransaction: async <T>(callback: TransactionCallback<T>): Promise<T> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }

    return new Promise<T>((resolve, reject) => {
      database!.withTransactionAsync(async () => {
        try {
          const tx: SQLiteTransaction = {
            executeSql: async (sql: string, args?: any[], success?: (tx: SQLiteTransaction, result: SQLiteResult) => void, error?: (tx: SQLiteTransaction, error: Error) => boolean | void) => {
              try {
                const res = await database!.runAsync(sql, args || []);
                success?.({} as SQLiteTransaction, res as any);
              } catch (e: any) {
                error?.({} as SQLiteTransaction, e);
              }
            },
          };
          const result = await callback(tx);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  batchTransaction: async (statements: { sql: string; args?: any[] }[]): Promise<void> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    await database!.withTransactionAsync(async () => {
      for (const { sql, args } of statements) {
        await database!.runAsync(sql, args || []);
      }
    });
  },

  // New async methods
  execAsync: async (sql: string) => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return database.execAsync(sql);
  },

  runAsync: async (sql: string, params?: SQLite.SQLiteBindParams | SQLite.SQLiteBindValue[]) => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return database.runAsync(sql, params || []);
  },

  getAllAsync: async <T>(sql: string, params?: SQLite.SQLiteBindParams | SQLite.SQLiteBindValue[]): Promise<T[]> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return database.getAllAsync<T>(sql, params || []);
  },

  getFirstAsync: async <T>(sql: string, params?: SQLite.SQLiteBindParams | SQLite.SQLiteBindValue[]): Promise<T | null> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return database.getFirstAsync<T>(sql, params || []);
  },

  withTransactionAsync: async (callback: () => Promise<void>): Promise<void> => {
    const database = getDatabase();
    if (!database) {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return database.withTransactionAsync(callback);
  }
};

export * from './models';
export * from './types';
