import { STORAGE_KEYS } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to extract table name from SQL query
export const getTableName = (sql: string): string | undefined => {
  const fromMatch = sql.match(/from\s+(\w+)/i);
  const intoMatch = sql.match(/into\s+(\w+)/i);
  const tableMatch = fromMatch || intoMatch;
  return tableMatch?.[1].toLowerCase();
};

// Date formatting helpers
export const formatDate = (date: string, format: string): string => {
  const d = new Date(date);
  switch (format) {
    case '%Y-%m':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    case '%Y-%m-%d':
      return d.toISOString().split('T')[0];
    default:
      return date;
  }
};

export const strftime = (format: string, date: string): string => {
  return formatDate(date, format);
};

// SQL function implementations
export const coalesce = (...args: any[]): any => {
  for (const arg of args) {
    if (arg !== null && arg !== undefined) {
      return arg;
    }
  }
  return null;
};

// Sorting helper
export const applySorting = (items: Record<string, any>[], orderBy: string): Record<string, any>[] => {
  const [field, direction = 'ASC'] = orderBy.trim().split(/\s+/);
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    const multiplier = direction.toUpperCase() === 'DESC' ? -1 : 1;
    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
};

// ID generation helper
export const getNextId = async (table: string): Promise<number> => {
  try {
    const currentCounters = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ID);
    const counters = currentCounters ? JSON.parse(currentCounters) : {};
    const nextId = (counters[table] || 0) + 1;
    counters[table] = nextId;
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ID, JSON.stringify(counters));
    return nextId;
  } catch (error) {
    console.error('Error generating ID:', error);
    throw error;
  }
};

// Complex SELECT query handler
export const handleComplexSelect = async (sql: string, args: any[] = [], items: any[]): Promise<any[]> => {
  const sqlLower = sql.toLowerCase();
  
  // Handle JOIN operations
  if (sqlLower.includes('join')) {
    const joinMatches = sql.matchAll(/join\s+(\w+)\s+on\s+([\w.]+)\s*=\s*([\w.]+)/gi);
    for (const match of joinMatches) {
      const [_, joinTable, leftKey, rightKey] = match;
      const [leftTable, leftField] = leftKey.split('.');
      const [rightTable, rightField] = rightKey.split('.');
      
      const joinStorageKey = Object.entries(STORAGE_KEYS).find(([key, value]) => 
        value.toLowerCase().includes(joinTable.toLowerCase()))?.[1];
      if (!joinStorageKey) continue;
      
      const joinData = await AsyncStorage.getItem(joinStorageKey);
      const joinItems = joinData ? JSON.parse(joinData) : [];
      
      // Perform JOIN operation
      items = items.map((item: Record<string, any>) => {
        const joinItem = joinItems.find((ji: Record<string, any>) => ji[rightField] === item[leftField]);
        return { ...item, ...joinItem };
      });
    }
  }
  
  // Handle GROUP BY operations
  if (sqlLower.includes('group by')) {
    const groupByMatch = sql.match(/group by\s+([\w.]+)/i);
    if (groupByMatch) {
      const groupByField = groupByMatch[1];
      const groups = new Map();
      
      items.forEach((item: Record<string, any>) => {
        const key = item[groupByField];
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(item);
      });
      
      // Handle aggregate functions
      const aggregates = sqlLower.match(/(?:sum|count|avg|max|min)\s*\(([\w.*]+)\)/g) || [];
      return Array.from(groups.entries()).map(([key, group]) => {
        const result: Record<string, any> = { [groupByField]: key };
        aggregates.forEach(agg => {
          const [func, field] = agg.match(/(\w+)\s*\(([\w.*]+)\)/)?.slice(1) || [];
          const values = group.map((item: Record<string, any>) => Number(item[field]) || 0);
          switch (func.toLowerCase()) {
            case 'sum':
              result[agg] = values.reduce((a: number, b: number) => a + b, 0);
              break;
            case 'count':
              result[agg] = values.length;
              break;
            case 'avg':
              result[agg] = values.reduce((a: number, b: number) => a + b, 0) / values.length;
              break;
            case 'max':
              result[agg] = Math.max(...values);
              break;
            case 'min':
              result[agg] = Math.min(...values);
              break;
          }
        });
        return result;
      });
    }
  }
  
  return items;
};
